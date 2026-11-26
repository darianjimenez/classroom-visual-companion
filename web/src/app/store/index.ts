// The app's state and behaviour. React draws what is in the store; the parts in this folder change it:
//   scenes.ts    which scene each sentence gets
//   board.ts     the board: heading, scenes as they go up, the storyboard, the spoken-word line, the progress dots
//   playback.ts  playing a lesson, or stepping through it
//   talk.ts      Just talk, where each idea spoken or typed becomes a picture
//   voice.ts     the microphone, and following along a script read aloud
//   lessons.ts   the lesson list and the script
//   pictures.ts  settings, word pictures and diagrams
//   claude.ts    planning scenes with Claude
//   ui.ts        full screen, panels, the guide
import { create } from "zustand"
import { hideRecap, refreshFrames, setBoardHeading, toggleRecap, updatePace, viewFrame, viewSentence } from "./board.ts"
import { initSample, planWithClaude, setUseAi } from "./claude.ts"
import { BASE, E, LESSONS, bind } from "./core.ts"
import { deleteLesson, newLesson, recapSave, saveLesson, selectLesson, setScript } from "./lessons.ts"
import { EXTRA_DEFAULTS, KEYS, load, loadPrefs, save } from "./persist.ts"
import { addWord, closeWord, openWord, removeWord, resetWords, setPref, setWordPicture, showDiagram } from "./pictures.ts"
import { nextSentence, pause, play, prevScene, restart, start, togglePlay } from "./playback.ts"
import { allLessons, lessonIcons, renderUnsure, updateSource } from "./scenes.ts"
import { canListen, voiceBlurb } from "./speech.ts"
import { enterTalk, exitTalk, finishTalk, micToggle, recapRestart, sayExample, sayTyped, talkOrb } from "./talk.ts"
import type { Actions, AppData, AppState, Extra, Lesson } from "./types.ts"
import { closeGuide, closePanel, openGuide, openPanel, setCommandOpen, showLessons, syncFullscreen, toggleFullscreen, tryWay } from "./ui.ts"
import { readAloud, voiceButton } from "./voice.ts"

export { E, LESSONS, PACES, SUBJECTS, SUBJECT_COLORS } from "./core.ts"
export { plural, splitSentences } from "./text.ts"
export { NATIVE, ON_DEVICE, usesWhisper } from "./speech.ts"
export type * from "./types.ts"

function init() {
  if (LESSONS[0]) selectLesson(LESSONS[0], true)
  setBoardHeading(); renderUnsure(); updateSource(); updatePace()
  initSample()
  // bundled OpenMoji pictures: fetched once (then cached offline), swapped in without disturbing the lesson
  fetch(BASE + "openmoji-bundle.json").then((r) => (r.ok ? r.json() : null)).then((o) => { if (o) { E.setOpenMoji(o); refreshFrames() } }).catch(() => {})
  // the table of which word shows which symbol: small, and needed only once a lesson says one of those words
  fetch(BASE + "symbols/index.json").then((r) => (r.ok ? r.json() : null)).then((o) => { if (o) { E.setSymbols(o); refreshFrames() } }).catch(() => {})
}

const initial = (): AppData => ({
  // lessons and the script
  mine: load<Lesson[]>(KEYS.mine, []), extra: load<Extra>(KEYS.extra, { ...EXTRA_DEFAULTS }),
  lessonId: null, filter: "All", query: "", script: "", saveTitle: "",
  // the board
  heading: { tag: "Lesson", color: "var(--sub-mine)", title: "" }, start: { mode: "ready", icons: [], title: "", meta: "", hasScript: false },
  stage: "empty", frames: [], viewing: null, activeN: null, revealAt: Infinity, heroMode: "",
  recapOpen: false, recap: { title: "The storyboard", restartLabel: "Start over", canSave: false },
  ticker: [], dots: [], count: null, progress: "", paceStat: 0, fullscreen: false, omVersion: 0,
  // playback, Just talk and the microphone
  playing: false, listening: false, talk: false, boardIsTalk: false, lastTalk: [],
  live: { msg: "", miss: false }, talkBig: "Start talking",
  source: { kind: "rule", msg: "" }, wordCount: { words: 0, sentences: 0 }, unsureWords: [],
  prefs: loadPrefs(),
  voice: { supported: canListen, status: voiceBlurb(loadPrefs()), interim: "", log: [] },
  ai: { available: false, status: "", planning: false, useAi: true },
  // panels and dialogs
  panel: null, guideOpen: !load(KEYS.help, null), commandOpen: false,
  wordDialog: { open: false, word: "", now: null, overridden: false },
})

const actions: Actions = {
  init,
  // lessons
  lessonIcons, allLessons,
  selectLesson: (L) => selectLesson(L),
  setFilter: (filter) => useApp.setState({ filter }),
  setQuery: (query) => useApp.setState({ query }),
  setSaveTitle: (saveTitle) => useApp.setState({ saveTitle }),
  deleteLesson, newLesson, setScript, saveLesson,
  // playback and the board
  play, pause, togglePlay, start, restart, nextSentence, prevScene, viewFrame, viewSentence,
  toggleRecap, hideRecap, recapRestart, recapSave, toggleFullscreen,
  // Just talk and the microphone
  enterTalk, exitTalk, micToggle, readAloud, voiceButton, talkOrb, sayTyped, sayExample, finishTalk,
  // settings and pictures
  setPref, showDiagram, openWord, closeWord, setWordPicture, addWord, removeWord, resetWords,
  // Claude
  setUseAi, planWithClaude,
  // panels and dialogs
  openPanel, closePanel, showLessons, openGuide, closeGuide, setCommandOpen, tryWay,
}

export const useApp = create<AppState>()((_set, _get, api) => {
  bind(api)
  return { ...initial(), actions }
})

setInterval(updatePace, 3000)
document.addEventListener("fullscreenchange", syncFullscreen)
document.addEventListener("webkitfullscreenchange", syncFullscreen)
// remember the teacher's settings on this device
useApp.subscribe((s, prev) => { if (s.prefs !== prev.prefs) save(KEYS.prefs, s.prefs) })
