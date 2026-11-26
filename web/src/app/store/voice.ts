// The microphone: the browser's speech recogniser, and following along when the teacher reads the script aloud.
import { toast } from "sonner"
import { hideRecap, setBoardHeading, updateDots, updateProgress } from "./board.ts"
import { get, set } from "./core.ts"
import { finished, loadScript, needsReload, pause, stepCore } from "./playback.ts"
import { rt } from "./runtime.ts"
import { WhisperRecognizer } from "../whisper/recognizer.ts"
import { ON_DEVICE, recognizerFor, voiceBlurb, type RecognizerClass } from "./speech.ts"
import { flushPending, setLive, voicePhrase } from "./talk.ts"
import type { AppData } from "./types.ts"

/** Settings → Live voice shows this log, to work out why the microphone isn't working */
function logVoice(msg: string) {
  set((s) => ({ voice: { ...s.voice, log: s.voice.log.concat(new Date().toTimeString().slice(0, 8) + "  " + msg).slice(-40) } }))
}
const setVoice = (patch: Partial<AppData["voice"]>) => set((s) => ({ voice: { ...s.voice, ...patch } }))
function normWord(w: string) { return String(w).toLowerCase().replace(/[^a-z0-9']/g, "").replace(/'s$/, "").replace(/'/g, "") }
function sameWord(a: string, b: string) {
  if (!a || !b) return false
  if (a === b) return true
  const st = (x: string) => x.replace(/(es|s)$/, "")
  if (st(a) === st(b)) return true
  return a.length >= 4 && b.length >= 4 && (a.indexOf(b) === 0 || b.indexOf(a) === 0)
}

// ---------- follow-along: match what's spoken to the loaded script ----------
function followTo(n: number) {
  while (rt.idx < n && rt.idx < rt.words.length) stepCore()
  updateDots(); updateProgress()
  if (rt.idx >= rt.words.length) { finished(); toast("That's the end of the script.") }
}
function followWord(w: string) {
  const f = rt.follow
  if (!w || rt.idx >= rt.words.length) return
  // short words (the, a, of) only match right next to where we are, so they can't cause jumps
  const win = w.length <= 3 ? 2 : 8, lim = Math.min(rt.words.length, rt.idx + win)
  for (let p = rt.idx; p < lim; p++) if (sameWord(w, normWord(rt.words[p]))) { f.miss = []; followTo(p + 1); return }
  // lost our place (skipped a sentence, ad-libbed)? re-sync on two words in a row
  f.miss.push(w)
  if (f.miss.length > 4) f.miss.shift()
  if (f.miss.length >= 2) {
    const a = f.miss[f.miss.length - 2], lim2 = Math.min(rt.words.length - 1, rt.idx + 40)
    for (let p = rt.idx; p < lim2; p++) {
      if (sameWord(a, normWord(rt.words[p])) && sameWord(w, normWord(rt.words[p + 1]))) { f.miss = []; followTo(p + 2); return }
    }
  }
}

// ---------- the recogniser ----------
function makeRecognizer(Rec: RecognizerClass) {
  const r = new Rec()
  r.continuous = true; r.interimResults = true; r.lang = "en-US"
  if (r instanceof WhisperRecognizer) r.accurate = get().prefs.accurateVoice
  r.onstatus = (msg) => {
    logVoice(msg); setVoice({ status: msg })
    if (get().talk) setLive(msg)
  }
  r.onstart = () => logVoice(r instanceof WhisperRecognizer ? "on-device recognizer (Whisper) started" : "recognizer started")
  r.onaudiostart = () => {
    logVoice("audio capture started"); setVoice({ status: "Listening. Say a few sentences out loud." })
    if (get().talk) { setLive("Listening… start talking."); set({ talkBig: "Listening…" }) }
  }
  r.onspeechstart = () => logVoice("speech detected")
  r.onresult = (e) => {
    let interim = ""
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const t = e.results[i][0].transcript, fin = e.results[i].isFinal
      if (fin) logVoice('final: "' + t.trim() + '"')
      if (rt.follow.on) {
        // use words as they're heard (not just after pauses); hold back the last interim word, it may still change
        const ws = t.split(/\s+/).map(normWord).filter(Boolean), done = rt.follow.processed[i] || 0
        const upto = fin ? ws.length : Math.max(done, ws.length - 1)
        for (let k = done; k < upto; k++) followWord(ws[k])
        rt.follow.processed[i] = Math.max(done, upto)
      } else if (fin) voicePhrase(t)
      if (!fin) interim += t
    }
    setVoice({ interim: interim ? "hearing: " + interim : "" })
    if (get().talk && interim) setLive("Hearing: " + interim)
  }
  r.onerror = (e) => {
    logVoice("error: " + e.error + (e.message ? " (" + e.message + ")" : ""))
    if (e.error === "no-speech" || e.error === "aborted") return
    // Brave, Opera and other Chromium browsers have the recogniser but not Google's service behind it: listen on the device instead
    if (e.error === "network" && ON_DEVICE && !(r instanceof WhisperRecognizer)) {
      logVoice("Chrome's speech service isn't reachable; switching to on-device recognition")
      rt.nativeFailed = true; rt.recognition = null
      try { r.abort() } catch { /* already stopped */ }
      startRecognizer()
      return
    }
    stopListening(e.error === "not-allowed" || e.error === "service-not-allowed"
      ? "Speech recognition was blocked. Allow the microphone for this site (the icon at the left of the address bar), then try again."
      : e.error === "audio-capture" ? "No microphone audio. On a Mac, check System Settings → Privacy & Security → Microphone."
      : e.error === "network" ? "Couldn't reach Chrome's speech service. Brave, Opera and some other Chromium browsers don't include it. Use Google Chrome."
      : e.error === "whisper" ? "The speech model couldn't start" + (e.message ? " (" + e.message + ")" : "") + ". Check the internet connection the first time, then try again."
      : "Voice stopped (" + e.error + ").")
  }
  r.onend = () => {
    logVoice("recognizer ended"); setVoice({ interim: "" })
    if (!get().listening || rt.recognition !== r) return
    const now = Date.now()
    rt.restarts = rt.restarts.filter((t) => now - t < 10000); rt.restarts.push(now)
    if (rt.restarts.length > 6) { stopListening("Voice kept stopping right after starting. Open “Voice diagnostics” to see why."); return }
    clearTimeout(rt.restartTimer)
    rt.restartTimer = setTimeout(() => { if (get().listening) { logVoice("restarting"); startRecognizer() } }, 350)
  }
  return r
}
function startRecognizer() {
  const Rec = recognizerFor(get().prefs, rt.nativeFailed)
  if (!Rec) return
  rt.follow.processed = {}
  rt.recognition = makeRecognizer(Rec)
  try { rt.recognition.start() } catch (err) {
    const name = (err as Error).name
    logVoice("start() threw: " + name); stopListening("Couldn't start speech recognition (" + name + ").")
  }
}
export function startListening() {
  if (!recognizerFor(get().prefs, rt.nativeFailed)) return
  pause(); rt.restarts = []
  set({ listening: true })
  rt.follow.on = !get().talk && !!(get().prefs.follow && get().script.trim())
  rt.follow.miss = []
  if (rt.follow.on) { if (needsReload() || rt.idx >= rt.words.length) loadScript(); hideRecap() }
  if (!get().talk) {
    set({ start: { ...get().start, mode: rt.follow.on ? "reading" : "listening" }, heading: { ...get().heading, tag: "Live", color: "var(--live)" } })
  }
  setVoice({ status: "Asking for the microphone…" })
  logVoice("requesting microphone; secure: " + window.isSecureContext + "; framed: " + (window.top !== window.self))
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { startRecognizer(); return }
  navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    logVoice("microphone granted")
    stream.getTracks().forEach((t) => t.stop())
    if (get().listening) { setVoice({ status: "Starting…" }); startRecognizer() }
  }).catch((err: Error) => {
    logVoice("getUserMedia failed: " + err.name)
    stopListening(err.name === "NotAllowedError" ? "Microphone access was blocked. Allow the microphone for this site (the icon at the left of the address bar), then try again."
      : err.name === "NotFoundError" ? "No microphone found." : "Couldn't open the microphone (" + err.name + ").")
  })
}
export function stopListening(msg?: string) {
  set({ listening: false }); clearTimeout(rt.restartTimer)
  flushPending()
  const r = rt.recognition
  rt.recognition = null
  if (r) { try { r.abort() } catch { /* already stopped */ } }
  setVoice({ interim: "", status: msg || voiceBlurb(get().prefs) })
  if (msg) logVoice("stopped: " + msg)
  rt.follow.on = false
  if (get().talk) {
    set({ talkBig: "Tap the microphone to talk" })
    setLive(msg ? msg + " You can type sentences below instead." : "Microphone off. Press the microphone to talk again, or type below.", !!msg)
    return
  }
  setBoardHeading()
  if (msg) toast(/blocked/i.test(msg) ? "The microphone is blocked" : "Voice stopped", { description: "Settings → Live voice explains why." })
}
/** "Read it aloud" on the board: follow along the script */
export function readAloud() { set((s) => ({ prefs: { ...s.prefs, follow: true } })); startListening() }
export const voiceButton = () => (get().listening ? stopListening() : startListening())
