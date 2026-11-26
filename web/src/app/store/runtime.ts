// Things that change many times a second, or that React never draws, live here rather than in the store.
import type { Sample } from "./claude.ts"
import type { Recognizer } from "./speech.ts"
import type { PlanItem, Scene } from "./types.ts"
import type { SceneItem } from "../../engine/index.js"

type Timer = ReturnType<typeof setTimeout>

export const rt = {
  // the loaded script, word by word, and where playback is
  sentences: [] as { text: string; tokens: string[] }[],
  words: [] as string[],
  wordMap: [] as { s: number; k: number; last: boolean }[],
  idx: 0, timer: undefined as Timer | undefined, scriptText: "", loaded: false,
  // scenes worked out so far (by sentence and where they came from), and lesson-card icons
  cache: {} as Record<string, Scene>, icons: {} as Record<string, string[]>,
  // what has been on the board, so repeats can be left out
  skipped: {} as Record<number, boolean>, shownKeys: {} as Record<string, boolean>, shownWords: {} as Record<string, boolean>,
  wordsFor: {} as Record<number, Scene>, recent: [] as string[],
  frameCount: 0, active: null as { id: number | string; n: number } | null,
  settleTimer: undefined as Timer | undefined, recapTimer: undefined as Timer | undefined, popTimes: [] as number[],
  // Just talk
  liveQueue: [] as Scene[], liveTimer: undefined as Timer | undefined, lastLiveAt: 0, voiceSeq: 0,
  transcript: [] as string[], talkCtx: { words: [] as string[], subject: null as SceneItem | null },
  pending: "", pendingTimer: undefined as Timer | undefined,
  // Claude
  aiPlan: null as { script: string; scenes: (PlanItem | null)[] } | null,
  sample: null as Sample | null, planning: null as AbortController | null,
  // the microphone, and following along a script read aloud
  recognition: null as Recognizer | null, nativeFailed: false, restarts: [] as number[], restartTimer: undefined as Timer | undefined,
  follow: { on: false, processed: {} as Record<number, number>, miss: [] as string[] },
}
