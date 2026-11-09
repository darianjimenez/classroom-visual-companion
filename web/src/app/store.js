// App state and behaviour. Ported from the original single-file app: same functions, same rules,
// but instead of writing to the page they update this store and React draws it.
import { create } from "zustand"
import { toast } from "sonner"
import "../engine/scene-engine.js"
import "../engine/lessons.js"

export const E = window.SceneEngine
export const LESSONS = window.LESSONS || []

export const SUBJECTS = ["Science", "History", "Math", "Reading", "Health", "My lessons"]
export const SUBJECT_COLORS = {
  Science: "var(--sub-science)", History: "var(--sub-history)", Math: "var(--sub-math)",
  Reading: "var(--sub-reading)", Health: "var(--sub-health)", "My lessons": "var(--sub-mine)",
}
const EXTRA_DEFAULTS = { animal: "🐾", switch: "🔘", soil: "🟫", friction: "🌀", weather: "⛅", game: "🎲", sport: "⚽", smile: "😊", dance: "💃", mud: "🟤" }
// notices about the lesson list and the side panels appear on that side of the screen; board notices stay centred under the board
const NEAR_LIST = { position: "bottom-right" }
const KEYS = { extra: "cvc-extra-words-v4", mine: "cvc-my-lessons-v1", prefs: "cvc-prefs-v2", oldPrefs: "cvc-prefs-v1", help: "cvc-help-seen-v1" }
export const PACES = [{ wpm: 100, label: "Slow" }, { wpm: 130, label: "Normal" }, { wpm: 170, label: "Fast" }]

function load(key, fallback) {
  try { const raw = localStorage.getItem(key); if (raw) { const v = JSON.parse(raw); if (v && typeof v === "object") return v } } catch (e) {}
  return fallback
}
function save(key, val) { try { localStorage.setItem(key, JSON.stringify(val)) } catch (e) {} }

const DEFAULT_PREFS = { speed: 130, pauseEach: false, drawMode: "new", calm: false, labels: true, tickerOn: true, unsure: false, autoRecap: true, follow: true }
function loadPrefs() {
  const p = load(KEYS.prefs, null)
  if (p) return { ...DEFAULT_PREFS, ...p }
  // settings saved by the previous version of the app
  const o = load(KEYS.oldPrefs, {})
  const m = { ...DEFAULT_PREFS }
  if ("speedSlider" in o) m.speed = +o.speedSlider || 130
  if ("pauseEach" in o) m.pauseEach = !!o.pauseEach
  if ("drawMode" in o) m.drawMode = o.drawMode
  if ("calmToggle" in o) m.calm = !!o.calmToggle
  if ("labelsToggle" in o) m.labels = !!o.labelsToggle
  if ("tickerToggle" in o) m.tickerOn = !!o.tickerToggle
  if ("unsureToggle" in o) m.unsure = !!o.unsureToggle
  if ("recapToggle" in o) m.autoRecap = !!o.recapToggle
  if ("followToggle" in o) m.follow = !!o.followToggle
  return m
}

const SR = window.SpeechRecognition || window.webkitSpeechRecognition
const DEFAULT_VOICE = "Works best in Google Chrome, which sends the audio to Google's speech service to turn it into text."

// ---------- text helpers ----------
export function splitSentences(text) {
  const m = String(text).replace(/\s+/g, " ").trim().match(/[^.!?]+[.!?]+["')\]]*|[^.!?]+$/g) || []
  return m.map((s) => s.trim()).filter(Boolean)
}
function sentenceCaption(t) { return t.split(/\s+/).length <= 16 ? t.replace(/[.!?;:,]+$/, "") : null }
export function plural(n, one, many) { return n + " " + (n === 1 ? one : many) }
function isNarrow() { return window.matchMedia("(max-width: 960px)").matches }
function scrollToBoard() { if (isNarrow()) document.getElementById("board")?.scrollIntoView({ behavior: "smooth", block: "start" }) }

// Things that change many times a second, or that React never draws, live here rather than in the store.
const rt = {
  sentences: [], words: [], wordMap: [], idx: 0, timer: null, scriptText: "", loaded: false,
  cache: {}, skipped: {}, shownKeys: {}, recent: [], frameCount: 0, active: null,
  settleTimer: null, recapTimer: null, popTimes: [],
  liveQueue: [], liveTimer: null, lastLiveAt: 0, voiceSeq: 0,
  transcript: [], talkCtx: { words: [], subject: null },
  aiPlan: null, sample: null, planning: null,
  recognition: null, restarts: [], restartTimer: null,
  follow: { on: false, processed: {}, miss: [] },
}
let iconCache = {}

export const useApp = create((set, get) => {
  // ---------- which scenes are in use ----------
  const aiActive = () => !!(get().ai.useAi && rt.aiPlan && rt.aiPlan.script === rt.scriptText)
  const curLesson = () => { const s = get(); return allLessons().find((L) => L.id === s.lessonId) || null }
  const curatedActive = () => { const L = curLesson(); return !!(L && L.plan && L.text.trim() === rt.scriptText) }
  const allLessons = () => LESSONS.concat(get().mine)

  function sceneForText(text, planItem) {
    // a sentence that names a whole topic gets its labelled diagram, even in tuned lessons
    let sc = planItem && planItem.diagram ? null : E.diagramScene(text)
    if (sc) return sc
    if (planItem) {
      sc = E.sceneFromAI(planItem, text, get().extra)
      if (sc && sc.show && !planItem.caption) { const c = sentenceCaption(text); if (c) sc.caption = c }
    }
    return sc || E.analyze(text, get().extra)
  }
  function sceneFor(si) {
    const mode = aiActive() ? "ai" : curatedActive() ? "cur" : "rule"
    const key = si + ":" + mode
    if (!(key in rt.cache)) {
      const text = rt.sentences[si].text
      let item = null
      if (mode === "ai") item = rt.aiPlan.scenes[si]
      else if (mode === "cur") item = curLesson().plan[si + 1]
      rt.cache[key] = sceneForText(text, item)
    }
    return rt.cache[key]
  }
  function lessonIcons(L) {
    if (iconCache[L.id]) return iconCache[L.id]
    const seen = {}, out = []
    splitSentences(L.text).forEach((s, i) => {
      if (out.length >= 3) return
      const sc = sceneForText(s, L.plan ? L.plan[i + 1] : null)
      if (!sc.show) return
      E.sceneIcons(sc).forEach((k) => { if (out.length < 3 && !seen[k]) { seen[k] = 1; out.push(k) } })
    })
    iconCache[L.id] = out
    return out
  }

  function updateSource() {
    const s = get(), txt = s.script.trim(), L = curLesson()
    let source = { kind: "rule", msg: "Pictures come from the built-in reader" }
    if (s.ai.useAi && rt.aiPlan && rt.aiPlan.script === txt) source = { kind: "ai", msg: "Pictures come from Claude's plan" }
    else if (L && L.subject !== "My lessons" && L.text.trim() === txt) source = { kind: "cur", msg: "Pictures are tuned for this lesson" }
    const n = txt ? txt.split(/\s+/).length : 0
    set({ source, wordCount: { words: n, sentences: splitSentences(txt).length } })
  }
  function renderUnsure() {
    const seen = {}, words = []
    get().script.split(/\s+/).forEach((t) => {
      const w = E.normalize(t)
      if (w && !seen[w] && E.isUnsure(w, get().extra)) { seen[w] = true; words.push(w) }
    })
    set({ unsureWords: words.slice(0, 40) })
  }

  // ---------- board heading and start card ----------
  function talkHeading() {
    const n = get().frames.length
    set({ heading: { tag: "Just talk", color: "var(--live)", title: n ? plural(n, "picture so far", "pictures so far") : "Live slideshow" } })
  }
  function setBoardHeading() {
    if (get().talk) { talkHeading(); return }
    const txt = get().script.trim(), L = curLesson()
    if (L && L.text.trim() === txt) set({ heading: { tag: L.subject, color: SUBJECT_COLORS[L.subject] || "var(--sub-mine)", title: L.title } })
    else set({ heading: { tag: "Your script", color: "var(--sub-mine)", title: txt ? "Custom lesson" : "No lesson yet" } })
    renderStart()
  }
  function renderStart() {
    if (get().listening || get().talk) return
    const txt = get().script.trim(), L0 = curLesson()
    const L = L0 && L0.text.trim() === txt ? L0 : null
    const n = splitSentences(txt).length
    set({
      start: {
        mode: "ready", icons: L ? lessonIcons(L) : [],
        title: L ? L.title : txt ? "Your script" : "Nothing to show yet",
        meta: !txt ? "Choose a lesson, or start a new one." : [L && L.subject !== "My lessons" ? L.subject : "", L && L.grade ? L.grade : "", plural(n, "sentence", "sentences")].filter(Boolean).join(" · "),
        hasScript: !!txt,
      },
    })
  }

  // ---------- frames ----------
  const newOnly = () => get().prefs.calm || get().prefs.drawMode === "new"
  const sceneSig = (sc) => E.sceneKeys(sc).join("|")
  // Teachers repeat themselves: the same picture twice in a row, or a diagram that was up in the last 20 scenes, adds nothing.
  function isRepeat(sc) {
    const sig = sceneSig(sc), r = rt.recent
    return sc.diagram ? r.slice(-20).indexOf(sig) >= 0 : r.length > 0 && r[r.length - 1] === sig
  }
  const shouldSkip = (sc) => isRepeat(sc) || (newOnly() && E.sceneKeys(sc).every((k) => rt.shownKeys[k]))
  const makeFrame = (n, sc, si) => ({ n, scene: sc, si, svg: E.renderScene(sc), done: false })

  function startFrame(id, sc, si) {
    hideRecap()
    rt.frameCount++
    const rec = makeFrame(rt.frameCount, sc, si)
    E.sceneKeys(sc).forEach((k) => { rt.shownKeys[k] = true })
    rt.recent.push(sceneSig(sc))
    if (rt.recent.length > 20) rt.recent.shift()
    rt.popTimes.push(Date.now())
    rt.active = { id, n: rec.n }
    clearTimeout(rt.settleTimer)
    set((s) => ({ frames: s.frames.concat(rec), stage: "hero", viewing: rec.n, heroMode: "enter", activeN: rec.n, revealAt: -1 }))
    updatePace()
  }
  function renderHero(n, live) {
    clearTimeout(rt.settleTimer)
    const frames = get().frames
    const last = frames.length ? frames[frames.length - 1].n : null
    set({ stage: "hero", viewing: n, heroMode: live ? "enter" : n !== last ? "history" : "" })
  }
  function revealTo(k) { if (rt.active) set({ revealAt: k }) }
  function finishActive() {
    if (!rt.active) return
    const n = rt.active.n
    rt.active = null
    set((s) => ({ revealAt: Infinity, activeN: null, frames: s.frames.map((f) => (f.n === n ? { ...f, done: true } : f)) }))
    clearTimeout(rt.settleTimer)
    rt.settleTimer = setTimeout(() => set({ heroMode: "settled" }), get().prefs.calm ? 12000 : 8000)
    updateDots()
  }
  function showEmpty() { set({ stage: "empty" }) }
  function clearBoard() {
    clearTimeout(rt.settleTimer); clearTimeout(rt.recapTimer)
    rt.active = null; rt.frameCount = 0
    rt.shownKeys = {}; rt.skipped = {}; rt.popTimes = []; rt.recent = []
    clearTimeout(rt.liveTimer); rt.liveQueue = []; rt.lastLiveAt = 0
    set({ frames: [], viewing: null, activeN: null, revealAt: Infinity, heroMode: "", recapOpen: false })
    showEmpty()
    updatePace()
  }
  function updatePace() {
    const now = Date.now()
    rt.popTimes = rt.popTimes.filter((t) => now - t < 60000)
    set({ paceStat: rt.popTimes.length })
  }
  setInterval(updatePace, 3000)

  // ---------- recap ----------
  function showRecap() {
    if (!get().frames.length) { toast("No scenes yet. Press play first."); return }
    finishActive()
    const talked = get().boardIsTalk && !get().talk
    set({ recapOpen: true, stage: "recap", recap: { title: talked ? "Your slideshow" : "The storyboard", restartLabel: talked ? "Talk again" : "Start over", canSave: talked && get().lastTalk.length > 0 } })
  }
  function hideRecap() {
    clearTimeout(rt.recapTimer)
    if (!get().recapOpen) return
    set({ recapOpen: false })
    if (get().frames.length) set({ stage: "hero" })
    else showEmpty()
  }

  // ---------- ticker ----------
  function tick(raw, hit) {
    set((s) => {
      const t = s.ticker.concat({ t: raw, hit: !!hit, unsure: E.isUnsure(raw, s.extra), id: ++tickSeq })
      return { ticker: t.slice(-18) }
    })
  }
  let tickSeq = 0

  // ---------- dots and progress ----------
  function updateDots() {
    const cur = rt.idx < rt.words.length ? rt.wordMap[rt.idx].s : rt.sentences.length
    const started = rt.idx > 0 ? rt.wordMap[rt.idx - 1].s : -1
    const frames = get().frames
    set({
      dots: rt.sentences.map((_, i) => ({
        done: i < cur,
        current: rt.idx > 0 && i === started && !(rt.wordMap[rt.idx - 1] && rt.wordMap[rt.idx - 1].last),
        hasScene: frames.some((r) => r.si === i),
      })),
    })
  }
  function updateProgress() {
    if (!rt.words.length) { set({ count: null, progress: "" }); return }
    const cur = rt.idx > 0 ? rt.wordMap[rt.idx - 1].s + 1 : 1
    const done = rt.idx >= rt.words.length
    const s = rt.idx < rt.words.length ? rt.wordMap[rt.idx].s + 1 : rt.sentences.length
    set({
      count: rt.idx === 0 ? null : { cur, total: rt.sentences.length, done },
      progress: done ? "Finished: " + plural(get().frames.length, "scene", "scenes") + ". Press Start over or pick another lesson."
        : "Sentence " + s + " of " + rt.sentences.length + " · word " + rt.idx + " of " + rt.words.length,
    })
  }

  // ---------- playback ----------
  function loadScript() {
    const text = get().script
    rt.scriptText = text.trim()
    rt.sentences = splitSentences(text).map((t) => ({ text: t, tokens: t.split(" ") }))
    rt.words = []; rt.wordMap = []
    rt.sentences.forEach((s, si) => s.tokens.forEach((tok, k) => { rt.words.push(tok); rt.wordMap.push({ s: si, k, last: k === s.tokens.length - 1 }) }))
    rt.idx = 0; rt.cache = {}; rt.loaded = true
    set({ boardIsTalk: false, ticker: [] })
    clearBoard()
    updateDots(); updateProgress(); setBoardHeading(); renderUnsure()
  }
  const needsReload = () => !rt.loaded || rt.scriptText !== get().script.trim()
  function advanceScene(si, k, last) {
    if (rt.active && rt.active.id !== si) finishActive()
    const sc = sceneFor(si)
    if (!sc.show || rt.skipped[si]) return
    if (!rt.active) {
      if (k < E.firstAt(sc) && !last) return
      if (shouldSkip(sc)) { rt.skipped[si] = true; return }
      startFrame(si, sc, si)
    }
    revealTo(last ? Infinity : k)
    if (last) finishActive()
  }
  function stepCore() {
    const raw = rt.words[rt.idx], m = rt.wordMap[rt.idx]
    rt.idx++
    const sc = sceneFor(m.s)
    tick(raw, E.highlightAts(sc)[m.k])
    advanceScene(m.s, m.k, m.last)
    return m
  }
  function finished() {
    finishActive(); pause(); updateDots(); updateProgress()
    if (get().prefs.autoRecap && get().frames.length > 1) {
      clearTimeout(rt.recapTimer)
      rt.recapTimer = setTimeout(() => { if (!get().playing && rt.idx >= rt.words.length) showRecap() }, 2200)
    }
  }
  function onTimer() {
    if (rt.idx >= rt.words.length) { finished(); return }
    const m = stepCore()
    updateDots(); updateProgress()
    if (rt.idx >= rt.words.length) { finished(); return }
    if (m.last && get().prefs.pauseEach) pause()
  }
  function play() {
    if (get().talk) exitTalk(false)
    if (needsReload() || rt.idx >= rt.words.length) loadScript()
    if (!rt.words.length) { toast("Pick a lesson or write a script first."); return }
    hideRecap()
    const frames = get().frames
    if (get().viewing && frames.length && get().viewing !== frames[frames.length - 1].n) renderHero(frames[frames.length - 1].n, false)
    set({ playing: true })
    clearInterval(rt.timer)
    rt.timer = setInterval(onTimer, 60000 / get().prefs.speed)
  }
  function pause() { clearInterval(rt.timer); if (get().playing) set({ playing: false }) }
  function resetPlayback() { pause(); rt.loaded = false; loadScript() }
  const indexOfViewing = () => get().frames.findIndex((f) => f.n === get().viewing)
  function nextSentence() {
    // looking back at an older scene? step forward through history first
    const frames = get().frames
    if (!get().playing && get().viewing && frames.length) {
      const i = indexOfViewing()
      if (i >= 0 && i < frames.length - 1) { hideRecap(); renderHero(frames[i + 1].n, false); return }
    }
    if (get().talk) return
    if (needsReload()) loadScript()
    if (!rt.words.length) { toast("Pick a lesson or write a script first."); return }
    if (rt.idx >= rt.words.length) { toast("That's the end of the lesson. Press R to see every scene."); return }
    hideRecap()
    const s = rt.wordMap[rt.idx].s
    while (rt.idx < rt.words.length && rt.wordMap[rt.idx].s === s) stepCore()
    updateDots(); updateProgress()
    if (rt.idx >= rt.words.length) finished()
  }
  function prevScene() {
    const frames = get().frames
    if (!frames.length) return
    finishActive(); hideRecap()
    const i = indexOfViewing()
    if (i > 0) renderHero(frames[i - 1].n, false)
    else if (i === -1) renderHero(frames[frames.length - 1].n, false)
  }
  function refreshFrames() {
    rt.cache = {}; iconCache = {}
    set((s) => ({ omVersion: s.omVersion + 1 }))
    if (!get().frames.length) return
    finishActive()
    set((s) => ({
      frames: s.frames.map((f) => {
        const sc = f.si >= 0 && rt.loaded && rt.sentences[f.si] ? sceneFor(f.si) : f.scene
        const scene = sc && sc.show ? sc : f.scene
        return { ...f, scene, svg: E.renderScene(scene) }
      }),
    }))
  }

  // ---------- just talk: no script; each idea spoken (or typed) becomes a picture ----------
  const setLive = (msg, miss) => set({ live: { msg, miss: !!miss } })
  function liveHold() { return get().prefs.calm ? 5000 : 3000 }
  function showLiveScene(sc) {
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
    showLiveScene(rt.liveQueue.shift())
    if (rt.liveQueue.length) rt.liveTimer = setTimeout(pumpLive, liveHold())
  }
  // finishing: anything still waiting goes straight into the slideshow
  function flushLive() { clearTimeout(rt.liveTimer); while (rt.liveQueue.length) showLiveScene(rt.liveQueue.shift()) }
  function phraseScene(text) {
    if (get().talk) rt.transcript.push(text)
    const words = text.split(/\s+/).filter(Boolean), sc = E.analyze(text, get().extra, rt.talkCtx), hl = E.highlightAts(sc)
    words.forEach((w, k) => tick(w, hl[k]))
    rt.talkCtx.words = rt.talkCtx.words.concat(words.map(E.normalize)).slice(-60)
    if (!sc.show) return "none"
    if (sc.subjects && sc.subjects.length) rt.talkCtx.subject = sc.subjects[0]
    const q = rt.liveQueue
    if (shouldSkip(sc) || (q.length && sceneSig(q[q.length - 1]) === sceneSig(sc))) return "same"
    if (!get().talk) set({ heading: { tag: "Live", color: "var(--live)", title: "Listening…" } })
    q.push(sc)
    if (q.length > 3) q.splice(0, q.length - 3)
    pumpLive()
    return "shown"
  }
  // One phrase from the speech recogniser (everything said before a pause). Long ones are split into ideas,
  // and recent words plus the last subject go along so "it" and "they" and the lesson's topic carry over.
  function voicePhrase(text) {
    text = String(text).trim()
    if (!text) return
    let made = 0, same = 0
    E.splitSpoken(text).forEach((part) => { const r = phraseScene(part); if (r === "shown") made++; else if (r === "same") same++ })
    if (!get().talk) return
    const heard = "“" + (text.length > 90 ? text.slice(0, 88) + "…" : text) + "”"
    if (made) setLive(heard + (made > 1 ? " · " + made + " pictures" : ""))
    else if (same) setLive(heard + " · same idea, the picture stays")
    else setLive(heard + " · no picture. Try naming something, like “volcano” or “plant”.", true)
  }
  function enterTalk() {
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
  function exitTalk(showSlides) {
    if (!get().talk) return
    if (get().listening) stopListening()
    flushLive()
    set({ talk: false, lastTalk: rt.transcript.slice() })
    if (!get().frames.length) { set({ boardIsTalk: false }); clearBoard(); setBoardHeading(); return }
    const n = get().frames.length
    set({ heading: { tag: "Your talk", color: "var(--live)", title: plural(n, "picture", "pictures") } })
    if (showSlides) showRecap()
  }
  function micToggle() {
    if (get().listening) { stopListening(); return }
    if (get().talk || !get().prefs.follow || !get().script.trim()) enterTalk()
    else if (SR) startListening()
  }

  // ---------- voice ----------
  function logVoice(msg) {
    set((s) => ({ voice: { ...s.voice, log: s.voice.log.concat(new Date().toTimeString().slice(0, 8) + "  " + msg).slice(-40) } }))
  }
  const setVoice = (patch) => set((s) => ({ voice: { ...s.voice, ...patch } }))
  function normWord(w) { return String(w).toLowerCase().replace(/[^a-z0-9']/g, "").replace(/'s$/, "").replace(/'/g, "") }
  function sameWord(a, b) {
    if (!a || !b) return false
    if (a === b) return true
    const st = (x) => x.replace(/(es|s)$/, "")
    if (st(a) === st(b)) return true
    return a.length >= 4 && b.length >= 4 && (a.indexOf(b) === 0 || b.indexOf(a) === 0)
  }
  // ---- follow-along: match what's spoken to the loaded script ----
  function followTo(n) {
    while (rt.idx < n && rt.idx < rt.words.length) stepCore()
    updateDots(); updateProgress()
    if (rt.idx >= rt.words.length) { finished(); toast("That's the end of the script.") }
  }
  function followWord(w) {
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
  function makeRecognizer() {
    const r = new SR()
    r.continuous = true; r.interimResults = true; r.lang = "en-US"
    r.onstart = () => logVoice("recognizer started")
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
      stopListening(e.error === "not-allowed" || e.error === "service-not-allowed"
        ? "Speech recognition was blocked. Allow the microphone for this site (the icon at the left of the address bar), then try again."
        : e.error === "audio-capture" ? "No microphone audio. On a Mac, check System Settings → Privacy & Security → Microphone."
        : e.error === "network" ? "Couldn't reach Chrome's speech service. Brave, Opera and some other Chromium browsers don't include it. Use Google Chrome."
        : "Voice stopped (" + e.error + ").")
    }
    r.onend = () => {
      logVoice("recognizer ended"); setVoice({ interim: "" })
      if (!get().listening) return
      const now = Date.now()
      rt.restarts = rt.restarts.filter((t) => now - t < 10000); rt.restarts.push(now)
      if (rt.restarts.length > 6) { stopListening("Voice kept stopping right after starting. Open “Voice diagnostics” to see why."); return }
      clearTimeout(rt.restartTimer)
      rt.restartTimer = setTimeout(() => { if (get().listening) { logVoice("restarting"); startRecognizer() } }, 350)
    }
    return r
  }
  function startRecognizer() {
    rt.follow.processed = {}
    rt.recognition = makeRecognizer()
    try { rt.recognition.start() } catch (err) { logVoice("start() threw: " + err.name); stopListening("Couldn't start speech recognition (" + err.name + ").") }
  }
  function startListening() {
    if (!SR) return
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
    }).catch((err) => {
      logVoice("getUserMedia failed: " + err.name)
      stopListening(err.name === "NotAllowedError" ? "Microphone access was blocked. Allow the microphone for this site (the icon at the left of the address bar), then try again."
        : err.name === "NotFoundError" ? "No microphone found." : "Couldn't open the microphone (" + err.name + ").")
    })
  }
  function stopListening(msg) {
    set({ listening: false }); clearTimeout(rt.restartTimer)
    if (rt.recognition) { try { rt.recognition.abort() } catch (e) {} }
    setVoice({ interim: "", status: msg || DEFAULT_VOICE })
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

  // ---------- full screen (Safari on older iPads only has the prefixed calls; iPhones have none) ----------
  const fsElement = () => document.fullscreenElement || document.webkitFullscreenElement || null
  function toggleFullscreen() {
    const board = document.getElementById("board")
    if (fsElement()) {
      const exit = document.exitFullscreen || document.webkitExitFullscreen, done = exit ? exit.call(document) : null
      if (done && done.catch) done.catch(() => {})
      return
    }
    const req = board && (board.requestFullscreen || board.webkitRequestFullscreen)
    if (!req) { toast("Full screen isn't available on this device."); return }
    const p = req.call(board)
    if (p && p.catch) p.catch(() => toast("Full screen isn't available here."))
  }
  const syncFullscreen = () => set({ fullscreen: !!fsElement() && fsElement().id === "board" })
  document.addEventListener("fullscreenchange", syncFullscreen)
  document.addEventListener("webkitfullscreenchange", syncFullscreen)

  // ---------- lessons ----------
  function selectLesson(L, quiet) {
    set({ lessonId: L.id, script: L.text })
    if (quiet) { loadScript(); updateSource(); return }
    resetPlayback(); renderUnsure(); setBoardHeading(); updateSource()
    toast("Ready: “" + L.title + "”", NEAR_LIST)
    scrollToBoard()
  }

  // ---------- word pictures ----------
  function setWordPicture(w, val) {
    const extra = { ...get().extra }
    if (val == null) delete extra[w]; else extra[w] = val
    set({ extra, wordDialog: { ...get().wordDialog, open: false } })
    save(KEYS.extra, extra)
    refreshFrames(); renderUnsure()
    toast(val == null ? "“" + w + "” is back to automatic" : val === "-" ? "No picture for “" + w + "”" : "Saved a picture for “" + w + "”")
  }

  // ---------- Claude planning (only where the page can reach Claude) ----------
  const setAi = (patch) => set((s) => ({ ai: { ...s.ai, ...patch } }))
  function initSample() {
    if (!window.claude || typeof window.claude.use !== "function") return
    window.claude.use("sample").then((sample) => { if (sample) { rt.sample = sample; setAi({ available: true }) } }).catch(() => {})
  }

  return {
    // data
    mine: load(KEYS.mine, []), extra: load(KEYS.extra, { ...EXTRA_DEFAULTS }),
    lessonId: null, filter: "All", query: "", script: "", saveTitle: "",
    // board
    heading: { tag: "Lesson", color: "var(--sub-mine)", title: "" }, start: { mode: "ready", icons: [], title: "", meta: "", hasScript: false },
    stage: "empty", frames: [], viewing: null, activeN: null, revealAt: Infinity, heroMode: "",
    recapOpen: false, recap: { title: "The storyboard", restartLabel: "Start over", canSave: false },
    ticker: [], dots: [], count: null, progress: "", paceStat: 0, fullscreen: false, omVersion: 0,
    playing: false, listening: false, talk: false, boardIsTalk: false, lastTalk: [],
    live: { msg: "", miss: false }, talkBig: "Start talking",
    source: { kind: "rule", msg: "" }, wordCount: { words: 0, sentences: 0 }, unsureWords: [],
    prefs: loadPrefs(),
    voice: { supported: !!SR, status: SR ? DEFAULT_VOICE : "Live voice isn't supported in this browser. Try Google Chrome on a computer.", interim: "", log: [] },
    ai: { available: false, status: "", planning: false, useAi: true },
    // panels and dialogs
    panel: null, guideOpen: !load(KEYS.help, null), commandOpen: false,
    wordDialog: { open: false, word: "", now: null, overridden: false },

    actions: {
      init() {
        if (LESSONS[0]) selectLesson(LESSONS[0], true)
        setBoardHeading(); renderUnsure(); updateSource(); updatePace()
        initSample()
        // bundled OpenMoji pictures: fetched once (then cached offline), swapped in without disturbing the lesson
        fetch(import.meta.env.BASE_URL + "openmoji-bundle.json").then((r) => (r.ok ? r.json() : null)).then((o) => { if (o) { E.setOpenMoji(o); refreshFrames() } }).catch(() => {})
      },
      lessonIcons,
      allLessons,
      selectLesson: (L) => selectLesson(L),
      setFilter: (filter) => set({ filter }),
      setQuery: (query) => set({ query }),
      deleteLesson(L) {
        const mine = get().mine.filter((x) => x.id !== L.id)
        set({ mine })
        save(KEYS.mine, mine)
        if (get().lessonId === L.id) set({ lessonId: null })
        setBoardHeading()
        toast("Deleted “" + L.title + "”", NEAR_LIST)
      },
      newLesson() {
        const txt = get().script.trim(), L = curLesson()
        // a library or saved lesson is safe to clear; unsaved writing is kept
        if (!txt || (L && L.text.trim() === txt)) {
          set({ lessonId: null, script: "", saveTitle: "" })
          resetPlayback(); setBoardHeading(); updateSource(); renderUnsure()
        }
        if (get().talk) exitTalk(false)
        set({ panel: "script" })
      },
      setScript(script) {
        set({ script })
        pause()
        setBoardHeading(); updateSource(); renderUnsure()
        if (rt.aiPlan && rt.aiPlan.script !== script.trim()) setAi({ status: "The script changed since Claude's plan. Plan again to use it." })
      },
      setSaveTitle: (saveTitle) => set({ saveTitle }),
      saveLesson() {
        const text = get().script.trim()
        if (!text) { toast("Write a script first."); return }
        const title = get().saveTitle.trim() || text.split(/\s+/).slice(0, 5).join(" ") + "…"
        const L = { id: "my-" + Date.now(), subject: "My lessons", grade: "", title, text, plan: {} }
        const mine = [L].concat(get().mine)
        set({ mine, lessonId: L.id, saveTitle: "", query: "", filter: "My lessons" })
        save(KEYS.mine, mine)
        setBoardHeading(); updateSource()
        toast("Saved “" + title + "”", NEAR_LIST)
      },

      // playback
      play, pause, nextSentence, prevScene,
      togglePlay: () => (get().playing ? pause() : play()),
      start() {
        if (!get().script.trim()) { set({ panel: null }); document.getElementById("lesson-search")?.focus(); return }
        play()
      },
      restart() {
        if (get().talk) {
          clearBoard(); rt.transcript = []; rt.talkCtx = { words: [], subject: null }; set({ ticker: [] }); talkHeading()
          setLive(get().listening ? "Listening… start talking." : "Cleared. Talk or type to begin again.")
          return
        }
        resetPlayback(); rt.follow.miss = []
      },
      viewFrame(n) { finishActive(); hideRecap(); renderHero(n, false) },
      viewSentence(i) { const rec = get().frames.find((r) => r.si === i); if (rec) { finishActive(); hideRecap(); renderHero(rec.n, false) } },
      toggleRecap: () => (get().recapOpen ? hideRecap() : showRecap()),
      hideRecap,
      recapRestart() { if (get().boardIsTalk && !get().talk) enterTalk(); else resetPlayback() },
      recapSave() {
        const sents = get().lastTalk.map((t) => { t = t.trim(); t = t.charAt(0).toUpperCase() + t.slice(1); return /[.!?]$/.test(t) ? t : t + "." })
        set({ lessonId: null, script: sents.join(" "), panel: "script" })
        setBoardHeading(); updateSource(); renderUnsure()
        toast("Your talk is now a script", { ...NEAR_LIST, description: "Add a title and press Save." })
      },
      toggleFullscreen,

      // talk and voice
      enterTalk, exitTalk, micToggle,
      readAloud() { set((s) => ({ prefs: { ...s.prefs, follow: true } })); startListening() },
      voiceButton: () => (get().listening ? stopListening() : startListening()),
      talkOrb() {
        if (!SR) { setLive("Live voice doesn't work in this browser (try Google Chrome). Type sentences below instead.", true); return }
        micToggle()
      },
      sayTyped(t) { t = String(t).trim(); if (!t || !get().talk) return; splitSentences(t).forEach(voicePhrase) },
      sayExample: (t) => voicePhrase(t),
      finishTalk() {
        if (!get().frames.length) { exitTalk(false); toast("No pictures yet, so there's no slideshow."); return }
        exitTalk(true)
      },

      // settings
      setPref(key, value) {
        set((s) => ({ prefs: { ...s.prefs, [key]: value } }))
        if (key === "speed" && get().playing) { clearInterval(rt.timer); rt.timer = setInterval(onTimer, 60000 / value) }
      },

      // pictures
      showDiagram(key, title) {
        const sc = E.diagramScene(title, key)
        if (!sc) return
        sc.highlight = []; sc.caption = title
        pause(); finishActive(); hideRecap()
        startFrame("d" + ++rt.voiceSeq, sc, -1)
        revealTo(Infinity); finishActive()
        if (get().talk) talkHeading()
        set({ panel: null, commandOpen: false })
        scrollToBoard()
      },
      openWord(raw) {
        const w = E.normalize(raw)
        if (!w || w.length < 2) return
        const extra = get().extra, v = extra[w], c = E.lookup(w, extra)
        let now
        if (v === "-") now = { kind: "off", text: "No picture (you turned it off)" }
        else if (c && c.icon) now = { kind: "icon", icon: c.icon, text: "Shows a drawing" }
        else if (c && c.emoji) now = { kind: "emoji", emoji: c.emoji, text: "Shows an emoji" }
        else if (E.isUnsure(w, extra)) now = { kind: "unsure", text: "Could mean different things here, so nothing shows" }
        else now = { kind: "none", text: "No picture yet" }
        set({ wordDialog: { open: true, word: w, now, overridden: v != null } })
      },
      closeWord: () => set((s) => ({ wordDialog: { ...s.wordDialog, open: false } })),
      setWordPicture,
      addWord(word, emoji) {
        const w = String(word).trim().toLowerCase().replace(/[^a-z]/g, ""), em = String(emoji).trim()
        if (!w || !em) return false
        const extra = { ...get().extra, [w]: em }
        set({ extra }); save(KEYS.extra, extra); refreshFrames()
        return true
      },
      removeWord(w) { const extra = { ...get().extra }; delete extra[w]; set({ extra }); save(KEYS.extra, extra); refreshFrames() },
      resetWords() { const extra = { ...EXTRA_DEFAULTS }; set({ extra }); save(KEYS.extra, extra); refreshFrames() },

      // Claude
      setUseAi(useAi) { rt.cache = {}; setAi({ useAi }); updateSource() },
      planWithClaude() {
        if (!rt.sample || rt.planning) return
        const text = get().script.trim(), sents = splitSentences(text)
        if (!sents.length) { setAi({ status: "Write a script first." }); return }
        if (sents.length > 60) { setAi({ status: "That's a long script. Plan up to 60 sentences at a time." }); return }
        const ctl = new AbortController()
        rt.planning = ctl
        setAi({ planning: true, status: "Claude is reading the lesson and planning each scene…" })
        rt.sample.json(E.buildPlanPrompt(sents, Object.keys(get().extra)), { modelTier: "default", signal: ctl.signal }).then((result) => {
          if (!Array.isArray(result)) throw { code: "invalid_json" }
          const scenes = sents.map(() => null)
          result.forEach((o) => { const i = (o && +o.i) - 1; if (i >= 0 && i < sents.length) scenes[i] = o })
          rt.aiPlan = { script: text, scenes }
          setAi({ useAi: true })
          const shown = scenes.filter((o) => o && o.show !== false).length
          resetPlayback(); updateSource()
          setAi({ status: "Claude planned " + shown + " scenes for " + sents.length + " sentences. Press Play." })
        }).catch((e) => {
          const code = e && e.code
          if (code === "cancelled") return
          if (["not_granted", "sampling_disabled", "not_declared", "capability_disabled", "capability_removed"].indexOf(code) >= 0) { setAi({ available: false }); return }
          setAi({
            status: {
              rate_limited: "Too many requests right now. Try again in a little while.",
              session_expired: "Your Claude session expired. Sign in again, then retry.",
              invalid_json: "Claude's plan came back in a format I couldn't read. Try again.",
              refused: "Claude declined to plan this script. Try rewording it.",
              empty_completion: "Claude returned nothing for this script. Try a shorter lesson.",
              prompt_too_large: "That script is too long to plan in one go. Try a shorter section.",
            }[code] || "Something went wrong reaching Claude. Try again.",
          })
        }).then(() => { setAi({ planning: false }); rt.planning = null })
      },

      // panels and dialogs
      openPanel: (panel) => set((s) => ({ panel: s.panel === panel ? null : panel })),
      closePanel: () => set({ panel: null }),
      showLessons() { set({ panel: null }); if (get().talk) exitTalk(false) },
      openGuide: () => set({ guideOpen: true }),
      closeGuide() { set({ guideOpen: false }); save(KEYS.help, { seen: true }) },
      setCommandOpen: (commandOpen) => set({ commandOpen }),
      tryWay(how) {
        set({ guideOpen: false }); save(KEYS.help, { seen: true })
        if (how === "talk") { enterTalk(); return }
        if (get().talk) exitTalk(false)
        if (!get().script.trim() && LESSONS[0]) selectLesson(LESSONS[0], true)
        if (how === "play") { resetPlayback(); play() }
        else if (how === "step") { resetPlayback(); nextSentence() }
        else if (how === "read") {
          if (!SR) { toast("Reading aloud needs Google Chrome or Microsoft Edge."); return }
          set((s) => ({ prefs: { ...s.prefs, follow: true } })); resetPlayback(); startListening()
        }
        scrollToBoard()
      },
    },
  }
})

// remember the teacher's settings on this device
useApp.subscribe((s, prev) => { if (s.prefs !== prev.prefs) save(KEYS.prefs, s.prefs) })
