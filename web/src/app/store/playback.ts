// Playing a lesson: at the reading pace, one sentence at a time, or back through the scenes already shown.
import { toast } from "sonner"
import {
  clearBoard, finishActive, hideRecap, renderHero, revealTo, setBoardHeading, shouldSkip, showRecap, startFrame,
  talkHeading, tick, updateDots, updateProgress, wordsInstead,
} from "./board.ts"
import { E, get, set } from "./core.ts"
import { rt } from "./runtime.ts"
import { renderUnsure, sceneFor } from "./scenes.ts"
import { exitTalk, setLive } from "./talk.ts"
import { splitSentences } from "./text.ts"

/** the script, split into sentences and words, and a clean board */
export function loadScript() {
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
export const needsReload = () => !rt.loaded || rt.scriptText !== get().script.trim()
// word k of sentence si has just been said
function advanceScene(si: number, k: number, last: boolean) {
  if (rt.active && rt.active.id !== si) finishActive()
  let sc = sceneFor(si)
  if (!sc.show || rt.skipped[si]) return
  if (!rt.active) {
    if (k < E.firstAt(sc) && !last) return
    if (shouldSkip(sc)) {
      const w = wordsInstead(rt.sentences[si].text)
      if (!w) { rt.skipped[si] = true; return }
      sc = rt.wordsFor[si] = w
    }
    startFrame(si, sc, si)
  }
  revealTo(last ? Infinity : k)
  if (last) finishActive()
}
/** the next word */
export function stepCore() {
  const raw = rt.words[rt.idx], m = rt.wordMap[rt.idx]
  rt.idx++
  const sc = sceneFor(m.s)
  tick(raw, E.highlightAts(sc)[m.k])
  advanceScene(m.s, m.k, m.last)
  return m
}
export function finished() {
  finishActive(); pause(); updateDots(); updateProgress()
  if (get().prefs.autoRecap && get().frames.length > 1) {
    clearTimeout(rt.recapTimer)
    rt.recapTimer = setTimeout(() => { if (!get().playing && rt.idx >= rt.words.length) showRecap() }, 2200)
  }
}
export function onTimer() {
  if (rt.idx >= rt.words.length) { finished(); return }
  const m = stepCore()
  updateDots(); updateProgress()
  if (rt.idx >= rt.words.length) { finished(); return }
  if (m.last && get().prefs.pauseEach) pause()
}
export function play() {
  if (get().talk) exitTalk(false)
  if (needsReload() || rt.idx >= rt.words.length) loadScript()
  if (!rt.words.length) { toast("Pick a lesson or write a script first."); return }
  hideRecap()
  const frames = get().frames, viewing = get().viewing
  if (viewing && frames.length && viewing !== frames[frames.length - 1].n) renderHero(frames[frames.length - 1].n, false)
  set({ playing: true })
  clearInterval(rt.timer)
  rt.timer = setInterval(onTimer, 60000 / get().prefs.speed)
}
export function pause() { clearInterval(rt.timer); if (get().playing) set({ playing: false }) }
export const togglePlay = () => (get().playing ? pause() : play())
export function resetPlayback() { pause(); rt.loaded = false; loadScript() }
const indexOfViewing = () => get().frames.findIndex((f) => f.n === get().viewing)
export function nextSentence() {
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
export function prevScene() {
  const frames = get().frames
  if (!frames.length) return
  finishActive(); hideRecap()
  const i = indexOfViewing()
  if (i > 0) renderHero(frames[i - 1].n, false)
  else if (i === -1) renderHero(frames[frames.length - 1].n, false)
}
/** the Start button on the board */
export function start() {
  if (!get().script.trim()) { set({ panel: null }); document.getElementById("lesson-search")?.focus(); return }
  play()
}
export function restart() {
  if (get().talk) {
    clearBoard(); rt.transcript = []; rt.talkCtx = { words: [], subject: null }; set({ ticker: [] }); talkHeading()
    setLive(get().listening ? "Listening… start talking." : "Cleared. Talk or type to begin again.")
    return
  }
  resetPlayback(); rt.follow.miss = []
}
