// The store's state and actions, as the components see them.
import type { Extra, PlanItem, Scene } from "../../engine/index.js"
import type { Lesson } from "../../engine/lessons.js"

export type { Extra, Lesson, PlanItem, Scene }

/** A scene on the board. n counts up from 1; si is its sentence in the script, or -1 for live talk and diagrams. */
export type Frame = { n: number; si: number; scene: Scene; svg: string; done: boolean }
export type TickerWord = { t: string; hit: boolean; unsure: boolean; id: number }
export type Prefs = {
  speed: number; pauseEach: boolean; drawMode: "new" | "all"; calm: boolean; labels: boolean
  tickerOn: boolean; unsure: boolean; autoRecap: boolean; follow: boolean
  /** seconds each picture stays up in Just talk before the next one */
  liveSeconds: number
}
/** the settings that are on or off */
export type Toggle = { [K in keyof Prefs]: Prefs[K] extends boolean ? K : never }[keyof Prefs]
export type Panel = "script" | "settings" | "pictures" | null
export type WordNow = { kind: "off" | "icon" | "emoji" | "symbol" | "unsure" | "none"; text: string; icon?: string; emoji?: string; sym?: string }
export type Heading = { tag: string; color: string; title: string }
export type StartCard = { mode: "ready" | "reading" | "listening"; icons: string[]; title: string; meta: string; hasScript: boolean }
export type Dot = { done: boolean; current: boolean; hasScene: boolean }
/** the four ways in, from the guide */
export type Way = "talk" | "play" | "step" | "read"

export interface AppData {
  // lessons and the script
  mine: Lesson[]; extra: Extra
  lessonId: string | null; filter: string; query: string; script: string; saveTitle: string
  // the board
  heading: Heading; start: StartCard
  stage: "empty" | "hero" | "recap"
  frames: Frame[]; viewing: number | null; activeN: number | null; revealAt: number; heroMode: "" | "enter" | "history" | "settled"
  recapOpen: boolean; recap: { title: string; restartLabel: string; canSave: boolean }
  ticker: TickerWord[]; dots: Dot[]
  count: { cur: number; total: number; done: boolean } | null; progress: string; paceStat: number
  fullscreen: boolean; omVersion: number
  // playback, Just talk and the microphone
  playing: boolean; listening: boolean; talk: boolean; boardIsTalk: boolean; lastTalk: string[]
  live: { msg: string; miss: boolean }; talkBig: string
  source: { kind: "rule" | "cur" | "ai"; msg: string }; wordCount: { words: number; sentences: number }; unsureWords: string[]
  prefs: Prefs
  voice: { supported: boolean; status: string; interim: string; log: string[] }
  ai: { available: boolean; status: string; planning: boolean; useAi: boolean }
  // panels and dialogs
  panel: Panel; guideOpen: boolean; commandOpen: boolean
  wordDialog: { open: boolean; word: string; now: WordNow | null; overridden: boolean }
}

export interface Actions {
  init(): void
  // lessons
  lessonIcons(L: Lesson): string[]
  allLessons(): Lesson[]
  selectLesson(L: Lesson): void
  setFilter(filter: string): void
  setQuery(query: string): void
  deleteLesson(L: Lesson): void
  newLesson(): void
  setScript(script: string): void
  setSaveTitle(title: string): void
  saveLesson(): void
  // playback and the board
  play(): void
  pause(): void
  togglePlay(): void
  start(): void
  restart(): void
  nextSentence(): void
  prevScene(): void
  viewFrame(n: number): void
  viewSentence(i: number): void
  toggleRecap(): void
  hideRecap(): void
  recapRestart(): void
  recapSave(): void
  toggleFullscreen(): void
  // Just talk and the microphone
  enterTalk(): void
  exitTalk(showSlides?: boolean): void
  micToggle(): void
  readAloud(): void
  voiceButton(): void
  talkOrb(): void
  sayTyped(text: string): void
  sayExample(text: string): void
  finishTalk(): void
  // settings and pictures
  setPref<K extends keyof Prefs>(key: K, value: Prefs[K]): void
  showDiagram(key: string, title: string): void
  openWord(raw: string): void
  closeWord(): void
  setWordPicture(word: string, value: string | null): void
  addWord(word: string, emoji: string): boolean
  removeWord(word: string): void
  resetWords(): void
  // Claude
  setUseAi(useAi: boolean): void
  planWithClaude(): void
  // panels and dialogs
  openPanel(panel: Exclude<Panel, null>): void
  closePanel(): void
  showLessons(): void
  openGuide(): void
  closeGuide(): void
  setCommandOpen(open: boolean): void
  tryWay(how: Way): void
}

export interface AppState extends AppData {
  actions: Actions
}
