// Just talk: no script. Each idea spoken (or typed) becomes a picture, and at the end there is a slideshow.
import { toast } from "sonner"
import { clearBoard, finishActive, hideRecap, revealTo, sceneSig, setBoardHeading, shouldSkip, showRecap, startFrame, talkHeading, tick, wordsInstead } from "./board.ts"
import { E, get, set } from "./core.ts"
import { pause, resetPlayback } from "./playback.ts"
import { rt } from "./runtime.ts"
import { SR } from "./speech.ts"
import { plural, scrollToBoard, splitSentences } from "./text.ts"
import type { Scene } from "./types.ts"
import { startListening, stopListening } from "./voice.ts"

/** the status line under the board in Just talk; miss marks it as a problem */
export const setLive = (msg: string, miss?: boolean) => set({ live: { msg, miss: !!miss } })
const liveHold = () => (get().prefs.calm ? 5000 : 3000)
function showLiveScene(sc: Scene) {
  finishActive()
  startFrame("v" + ++rt.voiceSeq, sc, -1)
  revealTo(Infinity); finishActive()
  rt.lastLiveAt = Date.now()
  if (get().talk) { set({ boardIsTalk: true }); talkHeading() }
}
// Live pictures each get a few seconds on screen, so students have time to look. Ones that arrive faster wait their turn;
// if several pile up, the newest few are kept.
function pumpLive() {
  clearTimeout(rt.liveTimer)
  if (!rt.liveQueue.length) return
  const wait = rt.lastLiveAt + liveHold() - Date.now()
  if (wait > 0) { rt.liveTimer = setTimeout(pumpLive, wait); return }
  showLiveScene(rt.liveQueue.shift()!)
  if (rt.liveQueue.length) rt.liveTimer = setTimeout(pumpLive, liveHold())
}
// finishing: anything still waiting goes straight into the slideshow
function flushLive() { clearTimeout(rt.liveTimer); while (rt.liveQueue.length) showLiveScene(rt.liveQueue.shift()!) }
// next: the words said just after this phrase. Live talk waits for them, so "it" and "they", and what a word means, can settle.
function phraseScene(text: string, next: string[]): "none" | "same" | "words" | "shown" {
  if (get().talk) rt.transcript.push(text)
  const words = text.split(/\s+/).filter(Boolean)
  let sc = E.analyze(text, get().extra, { words: rt.talkCtx.words, subject: rt.talkCtx.subject, next: next || [] })
  if (!sc.show) sc = E.wordScene(text, { live: true })
  const hl = E.highlightAts(sc)
  words.forEach((w, k) => tick(w, hl[k]))
  rt.talkCtx.words = rt.talkCtx.words.concat(words.map(E.normalize)).slice(-100)
  if (!sc.show) return "none"
  if (sc.subjects && sc.subjects.length) rt.talkCtx.subject = sc.subjects[0]
  const q = rt.liveQueue
  if (shouldSkip(sc) || (q.length && sceneSig(q[q.length - 1]) === sceneSig(sc))) {
    const w = sc.words ? null : wordsInstead(text, true)
    if (!w || (q.length && sceneSig(q[q.length - 1]) === sceneSig(w))) return "same"
    sc = w
  }
  if (!get().talk) set({ heading: { tag: "Live", color: "var(--live)", title: "Listening…" } })
  q.push(sc)
  // too many waiting: the oldest word card goes first, then the oldest picture
  while (q.length > 3) { const i = q.findIndex((x, k) => x.words && k < q.length - 1); q.splice(i >= 0 ? i : 0, 1) }
  pumpLive()
  return sc.words ? "words" : "shown"
}
// One phrase becomes pictures. Long ones are split into ideas; recent words, the last subject and the words that
// follow go along, so "it", "they" and the lesson's topic carry over.
function drawPhrase(raw: string, nextText: string) {
  const text = String(raw).trim()
  if (!text) return
  let made = 0, words = 0, same = 0
  const parts = E.splitSpoken(text)
  parts.forEach((part, k) => {
    const next = parts.slice(k + 1).concat(nextText || "").join(" ").split(/\s+/).filter(Boolean).slice(0, 24).map(E.normalize)
    const r = phraseScene(part, next)
    if (r === "shown") made++; else if (r === "words") words++; else if (r === "same") same++
  })
  if (!get().talk) return
  const heard = "“" + (text.length > 90 ? text.slice(0, 88) + "…" : text) + "”"
  if (made && words) setLive(heard + " · " + (made + words) + " scenes")
  else if (made) setLive(heard + (made > 1 ? " · " + made + " pictures" : ""))
  else if (words) setLive(heard + " · no picture for this, so the key words are shown")
  else if (same) setLive(heard + " · same idea, the picture stays")
  else setLive(heard + " · no picture. Try naming something, like “volcano” or “plant”.", true)
}
// The recogniser sends a phrase whenever the speaker pauses. Each one waits a moment before it is drawn: if the pause split
// one idea ("we're learning about American" … "football"), the two halves are joined; otherwise the next phrase becomes
// context for this one. A little later on screen, but far fewer wrong pictures.
const LOOKAHEAD_MS = 1200
export function voicePhrase(raw: string) {
  let text = String(raw).trim()
  if (!text) return
  clearTimeout(rt.pendingTimer)
  if (rt.pending && E.dangling(rt.pending)) text = rt.pending + " " + text
  else if (rt.pending) drawPhrase(rt.pending, text)
  rt.pending = text
  rt.pendingTimer = setTimeout(flushPending, LOOKAHEAD_MS)
}
export function flushPending() {
  clearTimeout(rt.pendingTimer)
  const t = rt.pending
  rt.pending = ""
  if (t) drawPhrase(t, "")
}

export function enterTalk() {
  if (get().talk) { if (SR && !get().listening) startListening(); return }
  pause(); hideRecap()
  if (get().listening) stopListening()
  rt.loaded = false; rt.transcript = []; rt.talkCtx = { words: [], subject: null }
  set({ talk: true, boardIsTalk: true, ticker: [], dots: [], count: null, panel: null })
  clearBoard()
  talkHeading()
  set({ talkBig: SR ? "Start talking" : "Type to begin" })
  if (SR) { setLive("Starting the microphone…"); startListening() }
  else setLive("Live voice doesn't work in this browser (try Google Chrome). You can type sentences below instead.", true)
  scrollToBoard()
}
export function exitTalk(showSlides?: boolean) {
  if (!get().talk) return
  if (get().listening) stopListening()
  flushPending(); flushLive()
  set({ talk: false, lastTalk: rt.transcript.slice() })
  if (!get().frames.length) { set({ boardIsTalk: false }); clearBoard(); setBoardHeading(); return }
  const n = get().frames.length
  set({ heading: { tag: "Your talk", color: "var(--live)", title: plural(n, "scene", "scenes") } })
  if (showSlides) showRecap()
}
export function micToggle() {
  if (get().listening) { stopListening(); return }
  if (get().talk || !get().prefs.follow || !get().script.trim()) enterTalk()
  else if (SR) startListening()
}
export function talkOrb() {
  if (!SR) { setLive("Live voice doesn't work in this browser (try Google Chrome). Type sentences below instead.", true); return }
  micToggle()
}
// typed sentences are complete already, so they're drawn straight away, each with the next one as context
export function sayTyped(raw: string) {
  const t = String(raw).trim(); if (!t || !get().talk) return
  flushPending()
  const ss = splitSentences(t)
  ss.forEach((x, k) => drawPhrase(x, ss[k + 1] || ""))
}
export function sayExample(t: string) { flushPending(); drawPhrase(t, "") }
export function finishTalk() {
  flushPending(); flushLive()
  if (!get().frames.length) { exitTalk(false); toast("No pictures yet, so there's no slideshow."); return }
  exitTalk(true)
}
/** the storyboard's restart button: talk again after a talk, otherwise play the lesson from the start */
export function recapRestart() { if (get().boardIsTalk && !get().talk) enterTalk(); else resetPlayback() }
