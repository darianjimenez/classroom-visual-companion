// Turns the microphone's stream into sentences for Whisper: brings the audio down to 16,000 samples a second, finds where
// the teacher is talking, and cuts at the pauses. Whisper works on whole stretches of audio, so this decides what it hears.
export const RATE = 16000
const FRAME = 480 // 30 ms
const MS = FRAME / RATE * 1000

/** box-filter resampling: plenty for speech, and cheap enough to run on every buffer */
export class Resampler {
  private r: number; private t = 0; private sum = 0; private n = 0
  constructor(from: number) { this.r = from / RATE }
  push(x: Float32Array): Float32Array {
    if (this.r === 1) return x
    const out = new Float32Array(Math.ceil(x.length / this.r) + 1)
    let k = 0
    for (let i = 0; i < x.length; i++) {
      this.sum += x[i]; this.n++; this.t += 1
      if (this.t >= this.r) { out[k++] = this.sum / this.n; this.sum = 0; this.n = 0; this.t -= this.r }
    }
    return out.subarray(0, k)
  }
}

export type SegmentEvent =
  | { type: "speech" }
  | { type: "interim"; audio: Float32Array }
  | { type: "final"; audio: Float32Array; speechMs: number }

export const SEGMENT = {
  /** quiet this long ends a sentence */
  endSilenceMs: 700,
  /** kept from just before the talking starts, so the first sound isn't clipped */
  preRollMs: 300,
  /** shorter than this is a cough or a chair, not words */
  minSpeechMs: 250,
  /** a stretch with no pause is cut here, at its quietest moment in the last 3 seconds */
  maxMs: 12000,
  /** how often a sentence still being spoken is sent for a first guess */
  interimMs: 1000,
}

export class Segmenter {
  private frame = new Float32Array(FRAME); private fn = 0
  private floor = 0.002
  private loud = 0 // loud frames in a row, before speech is counted as started
  private pre: Float32Array[] = []
  private seg: Float32Array[] = []; private levels: number[] = []
  private inSpeech = false; private quietMs = 0; private speechMs = 0; private sinceInterim = 0

  push(x: Float32Array): SegmentEvent[] {
    const ev: SegmentEvent[] = []
    for (let i = 0; i < x.length; i++) {
      this.frame[this.fn++] = x[i]
      if (this.fn === FRAME) { this.onFrame(this.frame, ev); this.frame = new Float32Array(FRAME); this.fn = 0 }
    }
    return ev
  }
  /** the end of listening: whatever was being said */
  flush(): SegmentEvent | null {
    const e = this.inSpeech && this.speechMs >= SEGMENT.minSpeechMs ? { type: "final" as const, audio: join(this.seg), speechMs: this.speechMs } : null
    this.reset(); return e
  }
  private reset() { this.seg = []; this.levels = []; this.inSpeech = false; this.quietMs = 0; this.speechMs = 0; this.sinceInterim = 0 }

  private onFrame(f: Float32Array, ev: SegmentEvent[]) {
    let s = 0
    for (let i = 0; i < f.length; i++) s += f[i] * f[i]
    const rms = Math.sqrt(s / f.length)
    const loud = rms > Math.max(0.005, this.floor * 2.5)
    if (!this.inSpeech) {
      // the room's own noise level, followed while nobody is talking
      if (!loud) this.floor = Math.max(0.0005, this.floor * 0.95 + rms * 0.05)
      this.pre.push(f)
      if (this.pre.length > SEGMENT.preRollMs / MS) this.pre.shift()
      this.loud = loud ? this.loud + 1 : 0
      if (this.loud >= 2) {
        this.inSpeech = true; this.seg = this.pre; this.pre = []
        this.levels = this.seg.map(() => 0); this.levels[this.levels.length - 1] = rms
        this.speechMs = 2 * MS; this.quietMs = 0; this.sinceInterim = 0
        ev.push({ type: "speech" })
      }
      return
    }
    this.seg.push(f); this.levels.push(rms)
    if (loud) { this.speechMs += MS; this.quietMs = 0 } else this.quietMs += MS
    this.sinceInterim += MS
    if (this.quietMs >= SEGMENT.endSilenceMs) {
      if (this.speechMs >= SEGMENT.minSpeechMs) ev.push({ type: "final", audio: join(this.seg), speechMs: this.speechMs })
      this.reset(); this.loud = 0
      return
    }
    if (this.seg.length * MS >= SEGMENT.maxMs) {
      // no pause: cut at the quietest frame of the last 3 seconds and carry the rest on
      const from = Math.max(1, this.seg.length - Math.round(3000 / MS))
      let cut = from
      for (let i = from; i < this.seg.length; i++) if (this.levels[i] < this.levels[cut]) cut = i
      ev.push({ type: "final", audio: join(this.seg.slice(0, cut)), speechMs: this.speechMs })
      this.seg = this.seg.slice(cut); this.levels = this.levels.slice(cut)
      this.speechMs = this.seg.length * MS; this.sinceInterim = 0
      return
    }
    if (this.sinceInterim >= SEGMENT.interimMs) { this.sinceInterim = 0; ev.push({ type: "interim", audio: join(this.seg) }) }
  }
}

function join(parts: Float32Array[]) {
  const out = new Float32Array(parts.reduce((n, p) => n + p.length, 0))
  let k = 0
  for (const p of parts) { out.set(p, k); k += p.length }
  return out
}

// Whisper was trained on subtitles, so near-silence can come back as "Thank you." or "[BLANK_AUDIO]".
const STAGE = /\[[^\]]*\]|\([^)]*\)|\*[^*]*\*|♪+/g
const GHOSTS = new Set(["", "you", "thank you", "thanks", "thank you for watching", "thanks for watching", "bye", "okay", "so"])
export function cleanText(text: string, speechMs: number): string {
  const t = String(text).replace(STAGE, " ").replace(/\s+/g, " ").trim()
  const bare = t.toLowerCase().replace(/[^a-z' ]/g, "").trim()
  if (!bare) return ""
  if (GHOSTS.has(bare) && speechMs < 1500) return ""
  return t
}
