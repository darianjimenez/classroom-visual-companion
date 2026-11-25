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
  start(): void
  abort(): void
}
export type RecognizerClass = new () => Recognizer

const w = window as Window & { SpeechRecognition?: RecognizerClass; webkitSpeechRecognition?: RecognizerClass }
/** the browser's speech recogniser, if it has one */
export const SR: RecognizerClass | undefined = w.SpeechRecognition || w.webkitSpeechRecognition
export const DEFAULT_VOICE = "Works best in Google Chrome, which sends the audio to Google's speech service to turn it into text."
