import { WhisperRecognizer, whisperSupported } from "../whisper/recognizer.ts"
import type { Prefs } from "./types.ts"

// The parts of the Web Speech API the app uses. TypeScript's DOM types don't include it, and Chrome and Safari only have
// the webkit-prefixed name.
export interface SpeechResults {
  length: number
  [i: number]: { isFinal: boolean; [alt: number]: { transcript: string } }
}
export interface Recognizer {
  continuous: boolean; interimResults: boolean; lang: string
  onstart: (() => void) | null
  onaudiostart: (() => void) | null
  onspeechstart: (() => void) | null
  onresult: ((e: { resultIndex: number; results: SpeechResults }) => void) | null
  onerror: ((e: { error: string; message?: string }) => void) | null
  onend: (() => void) | null
  /** Whisper only: download progress and the like, for the status line */
  onstatus?: ((msg: string) => void) | null
  start(): void
  abort(): void
}
export type RecognizerClass = new () => Recognizer

const w = window as Window & { SpeechRecognition?: RecognizerClass; webkitSpeechRecognition?: RecognizerClass }
/** the browser's own speech recogniser, if it has one (Chrome and Edge send the audio to an online service) */
export const NATIVE: RecognizerClass | undefined = w.SpeechRecognition || w.webkitSpeechRecognition
/** Whisper, on the device: any browser with a microphone and Web Audio */
export const ON_DEVICE = whisperSupported()
/** can this browser listen at all? */
export const canListen = !!NATIVE || ON_DEVICE

/** which recogniser to use: the browser's own unless the teacher asked to keep voice on the device, or there isn't one */
export function recognizerFor(prefs: Pick<Prefs, "onDevice">, nativeFailed = false): RecognizerClass | undefined {
  if (ON_DEVICE && (!NATIVE || prefs.onDevice || nativeFailed)) return WhisperRecognizer
  return NATIVE
}
export const usesWhisper = (prefs: Pick<Prefs, "onDevice">) => recognizerFor(prefs) === WhisperRecognizer

/** the line under Settings → Live voice */
export function voiceBlurb(prefs: Pick<Prefs, "onDevice" | "accurateVoice">): string {
  if (!canListen) return "Live voice isn't supported in this browser. Try a recent Chrome, Edge, Safari or Firefox."
  if (!usesWhisper(prefs)) return "Uses Chrome's speech service, which sends the audio to Google to turn it into text."
  return "Runs on this device with Whisper, so the audio never leaves the room. The first time, it downloads a speech model (" +
    (prefs.accurateVoice ? "about 80 MB, or 140 MB on computers with a graphics card" : "41 MB") + "); after that it works offline."
}
