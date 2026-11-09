// Types for store.js, so the React components can use it safely.
export type Lesson = { id: string; subject: string; grade?: string; title: string; text: string; plan?: Record<string, unknown> }
export type Frame = { n: number; si: number; scene: { caption: string; diagram?: string }; svg: string; done: boolean }
export type TickerWord = { t: string; hit: boolean; unsure: boolean; id: number }
export type Prefs = {
  speed: number; pauseEach: boolean; drawMode: "new" | "all"; calm: boolean; labels: boolean
  tickerOn: boolean; unsure: boolean; autoRecap: boolean; follow: boolean
}
export type Panel = "script" | "settings" | "pictures" | null
export type WordNow = { kind: "off" | "icon" | "emoji" | "unsure" | "none"; text: string; icon?: string; emoji?: string }

// the store's actions come from plain JavaScript, so their arguments are left open
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Action = (...args: any[]) => any

export interface AppState {
  mine: Lesson[]; extra: Record<string, string>
  lessonId: string | null; filter: string; query: string; script: string; saveTitle: string
  heading: { tag: string; color: string; title: string }
  start: { mode: "ready" | "reading" | "listening"; icons: string[]; title: string; meta: string; hasScript: boolean }
  stage: "empty" | "hero" | "recap"
  frames: Frame[]; viewing: number | null; activeN: number | null; revealAt: number; heroMode: "" | "enter" | "history" | "settled"
  recapOpen: boolean; recap: { title: string; restartLabel: string; canSave: boolean }
  ticker: TickerWord[]; dots: { done: boolean; current: boolean; hasScene: boolean }[]
  count: { cur: number; total: number; done: boolean } | null; progress: string; paceStat: number
  fullscreen: boolean; omVersion: number
  playing: boolean; listening: boolean; talk: boolean; boardIsTalk: boolean; lastTalk: string[]
  live: { msg: string; miss: boolean }; talkBig: string
  source: { kind: "rule" | "cur" | "ai"; msg: string }; wordCount: { words: number; sentences: number }; unsureWords: string[]
  prefs: Prefs
  voice: { supported: boolean; status: string; interim: string; log: string[] }
  ai: { available: boolean; status: string; planning: boolean; useAi: boolean }
  panel: Panel; guideOpen: boolean; commandOpen: boolean
  wordDialog: { open: boolean; word: string; now: WordNow | null; overridden: boolean }
  actions: Record<string, Action> & {
    lessonIcons: (L: Lesson) => string[]
    allLessons: () => Lesson[]
  }
}

export const useApp: {
  <T>(selector: (s: AppState) => T): T
  getState: () => AppState
  subscribe: (listener: (s: AppState, prev: AppState) => void) => () => void
}
// the picture engine is plain JavaScript shared with the tests
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const E: any
export const LESSONS: Lesson[]
export const SUBJECTS: string[]
export const SUBJECT_COLORS: Record<string, string>
export const PACES: { wpm: number; label: string }[]
export function splitSentences(text: string): string[]
export function plural(n: number, one: string, many: string): string
