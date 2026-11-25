// The board: its heading and start card, scenes as they go up, the storyboard, the spoken-word line and the progress dots.
import { toast } from "sonner"
import { E, SUBJECT_COLORS, get, set } from "./core.ts"
import { rt } from "./runtime.ts"
import { curLesson, lessonIcons, sceneFor } from "./scenes.ts"
import { plural, splitSentences } from "./text.ts"
import type { Frame, Scene } from "./types.ts"

// ---------- heading and start card ----------
export function talkHeading() {
  const n = get().frames.length
  set({ heading: { tag: "Just talk", color: "var(--live)", title: n ? plural(n, "scene so far", "scenes so far") : "Live slideshow" } })
}
export function setBoardHeading() {
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

// ---------- scenes ----------
const newOnly = () => get().prefs.calm || get().prefs.drawMode === "new"
export const sceneSig = (sc: Scene) => E.sceneKeys(sc).join("|")
// Teachers repeat themselves: the same picture twice in a row, or a diagram that was up in the last 20 scenes, adds nothing.
function isRepeat(sc: Scene) {
  const sig = sceneSig(sc), r = rt.recent
  return sc.diagram ? r.slice(-20).indexOf(sig) >= 0 : r.length > 0 && r[r.length - 1] === sig
}
export const shouldSkip = (sc: Scene) => isRepeat(sc) || (newOnly() && E.sceneKeys(sc).every((k) => rt.shownKeys[k]))
// A sentence whose pictures are all on the board already can still say something new ("Metals tend to lose electrons"
// after the electron picture): then its key point goes up in words, so the idea isn't skipped.
export function wordsInstead(text: string, live?: boolean): Scene | null {
  const w = E.wordScene(text, live ? { live: true } : undefined)
  if (!w.show || shouldSkip(w)) return null
  const fresh = E.sceneWords(w).filter((k) => !rt.shownWords[k])
  return fresh.length >= (live || get().prefs.calm ? 2 : 1) ? w : null
}
const makeFrame = (n: number, sc: Scene, si: number): Frame => ({ n, scene: sc, si, svg: E.renderScene(sc), done: false })

/** a new scene goes up; it draws in as its words are said, until finishActive */
export function startFrame(id: number | string, sc: Scene, si: number) {
  hideRecap()
  rt.frameCount++
  const rec = makeFrame(rt.frameCount, sc, si)
  E.sceneKeys(sc).forEach((k) => { rt.shownKeys[k] = true })
  E.sceneWords(sc).forEach((w) => { rt.shownWords[w] = true })
  rt.recent.push(sceneSig(sc))
  if (rt.recent.length > 20) rt.recent.shift()
  rt.popTimes.push(Date.now())
  rt.active = { id, n: rec.n }
  clearTimeout(rt.settleTimer)
  set((s) => ({ frames: s.frames.concat(rec), stage: "hero", viewing: rec.n, heroMode: "enter", activeN: rec.n, revealAt: -1 }))
  updatePace()
}
export function renderHero(n: number, live: boolean) {
  clearTimeout(rt.settleTimer)
  const frames = get().frames
  const last = frames.length ? frames[frames.length - 1].n : null
  set({ stage: "hero", viewing: n, heroMode: live ? "enter" : n !== last ? "history" : "" })
}
export function revealTo(k: number) { if (rt.active) set({ revealAt: k }) }
export function finishActive() {
  if (!rt.active) return
  const n = rt.active.n
  rt.active = null
  set((s) => ({ revealAt: Infinity, activeN: null, frames: s.frames.map((f) => (f.n === n ? { ...f, done: true } : f)) }))
  clearTimeout(rt.settleTimer)
  rt.settleTimer = setTimeout(() => set({ heroMode: "settled" }), get().prefs.calm ? 12000 : 8000)
  updateDots()
}
function showEmpty() { set({ stage: "empty" }) }
export function clearBoard() {
  clearTimeout(rt.settleTimer); clearTimeout(rt.recapTimer)
  rt.active = null; rt.frameCount = 0
  rt.shownKeys = {}; rt.skipped = {}; rt.popTimes = []; rt.recent = []; rt.shownWords = {}; rt.wordsFor = {}
  clearTimeout(rt.liveTimer); rt.liveQueue = []; rt.lastLiveAt = 0
  clearTimeout(rt.pendingTimer); rt.pending = ""
  set({ frames: [], viewing: null, activeN: null, revealAt: Infinity, heroMode: "", recapOpen: false })
  showEmpty()
  updatePace()
}
/** pictures in the last minute, for the Settings panel */
export function updatePace() {
  const now = Date.now()
  rt.popTimes = rt.popTimes.filter((t) => now - t < 60000)
  set({ paceStat: rt.popTimes.length })
}
/** pictures changed (more arrived, or the teacher picked their own): draw the board's scenes again */
export function refreshFrames() {
  rt.cache = {}; rt.icons = {}
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
export function viewFrame(n: number) { finishActive(); hideRecap(); renderHero(n, false) }
export function viewSentence(i: number) { const rec = get().frames.find((r) => r.si === i); if (rec) { finishActive(); hideRecap(); renderHero(rec.n, false) } }

// ---------- the storyboard ----------
export function showRecap() {
  if (!get().frames.length) { toast("No scenes yet. Press play first."); return }
  finishActive()
  const talked = get().boardIsTalk && !get().talk
  set({ recapOpen: true, stage: "recap", recap: { title: talked ? "Your slideshow" : "The storyboard", restartLabel: talked ? "Talk again" : "Start over", canSave: talked && get().lastTalk.length > 0 } })
}
export function hideRecap() {
  clearTimeout(rt.recapTimer)
  if (!get().recapOpen) return
  set({ recapOpen: false })
  if (get().frames.length) set({ stage: "hero" })
  else showEmpty()
}
export const toggleRecap = () => (get().recapOpen ? hideRecap() : showRecap())

// ---------- the spoken-word line ----------
let tickSeq = 0
export function tick(raw: string, hit?: boolean) {
  set((s) => {
    const t = s.ticker.concat({ t: raw, hit: !!hit, unsure: E.isUnsure(raw, s.extra), id: ++tickSeq })
    return { ticker: t.slice(-18) }
  })
}

// ---------- dots and progress ----------
export function updateDots() {
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
export function updateProgress() {
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
