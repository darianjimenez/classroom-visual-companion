// Speech recognition on the device, with Whisper, for browsers without Chrome's speech service (Safari, Firefox, Brave) or
// for teachers who'd rather the audio stayed in the room. It looks like the browser's own recogniser to the rest of the app.
import type { Recognizer, SpeechResults } from "../store/speech.ts"
import { MODELS, type FromWorker, type WhisperModel } from "./protocol.ts"
import { cleanText, Resampler, Segmenter, type SegmentEvent } from "./segmenter.ts"

type Nav = Navigator & { gpu?: { requestAdapter(): Promise<unknown> } }

/** does this browser have what on-device recognition needs? */
export const whisperSupported = () =>
  typeof Worker !== "undefined" && typeof WebAssembly !== "undefined" && typeof AudioWorkletNode !== "undefined" &&
  typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia

async function chooseModel(accurate: boolean): Promise<WhisperModel> {
  if (!accurate) return MODELS.quick
  try { const g = (navigator as Nav).gpu; if (g && (await g.requestAdapter())) return MODELS.accurateGpu } catch { /* no WebGPU */ }
  return MODELS.accurate
}

// ---------- the worker, kept between listening sessions so the model loads once ----------
const W: { worker: Worker | null; model: WhisperModel | null; ready: boolean; busy: number; to: ((m: FromWorker) => void) | null } =
  { worker: null, model: null, ready: false, busy: 0, to: null }
function ensureWorker(model: WhisperModel) {
  if (W.worker && W.model && W.model.id === model.id && W.model.device === model.device) return
  W.worker?.terminate()
  W.worker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" })
  W.model = model; W.ready = false; W.busy = 0
  W.worker.onmessage = (e: MessageEvent<FromWorker>) => {
    const m = e.data
    if (m.type === "ready") W.ready = true
    if (m.type === "result") W.busy = Math.max(0, W.busy - 1)
    // the model didn't load (a dropped download): start afresh next time rather than keep a worker with no model
    if (m.type === "error" && !W.ready) { W.worker?.terminate(); W.worker = null; W.model = null }
    W.to?.(m)
  }
  W.worker.onerror = (e) => { W.to?.({ type: "error", message: e.message || "the speech worker stopped" }); W.worker?.terminate(); W.worker = null; W.model = null }
  W.worker.postMessage({ type: "load", model })
}
function run(id: number, audio: Float32Array, final: boolean) {
  W.busy++
  W.worker?.postMessage({ type: "run", id, audio, final }, [audio.buffer])
}

// the AudioWorklet that hands the microphone's samples over, about 20 times a second
const TAP = `class Tap extends AudioWorkletProcessor {
  constructor() { super(); this.b = new Float32Array(2048); this.n = 0 }
  process(inputs) {
    const ch = inputs[0] && inputs[0][0]
    if (ch) for (let i = 0; i < ch.length; i++) { this.b[this.n++] = ch[i]; if (this.n === 2048) { this.port.postMessage(this.b, [this.b.buffer]); this.b = new Float32Array(2048); this.n = 0 } }
    return true
  }
}
registerProcessor("plato-tap", Tap)`

const mb = (n: number) => Math.round(n / 1e6)

export class WhisperRecognizer implements Recognizer {
  continuous = true; interimResults = true; lang = "en-US"
  /** the larger, slower, more accurate model */
  accurate = false
  onstart: (() => void) | null = null
  onaudiostart: (() => void) | null = null
  onspeechstart: (() => void) | null = null
  onresult: ((e: { resultIndex: number; results: SpeechResults }) => void) | null = null
  onerror: ((e: { error: string; message?: string }) => void) | null = null
  onend: (() => void) | null = null
  /** download progress and other news for the status line */
  onstatus: ((msg: string) => void) | null = null

  private on = false
  private stream: MediaStream | null = null
  private ctx: AudioContext | null = null
  private seg = new Segmenter()
  private seq = 0
  private results: { isFinal: boolean; 0: { transcript: string } }[] = []
  private speechMs: Record<number, number> = {}

  start() {
    this.on = true
    this.onstart?.()
    this.begin().catch((err: Error) => {
      if (!this.on) return
      const name = err?.name || ""
      this.fail(name === "NotAllowedError" ? "not-allowed" : name === "NotFoundError" ? "audio-capture" : "whisper", err?.message || String(err))
    })
  }
  abort() {
    if (!this.on) return
    this.on = false
    if (W.to === this.hear) W.to = null
    this.stream?.getTracks().forEach((t) => t.stop())
    this.ctx?.close().catch(() => {})
    this.stream = null; this.ctx = null
    this.onend?.()
  }

  private fail(error: string, message?: string) { this.onerror?.({ error, message }); this.abort() }

  private async begin() {
    const model = await chooseModel(this.accurate)
    W.to = this.hear
    ensureWorker(model)
    const stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true } })
    if (!this.on) { stream.getTracks().forEach((t) => t.stop()); return }
    this.stream = stream
    const ctx = this.ctx = new AudioContext()
    if (ctx.state === "suspended") await ctx.resume().catch(() => {})
    const url = URL.createObjectURL(new Blob([TAP], { type: "text/javascript" }))
    try { await ctx.audioWorklet.addModule(url) } finally { URL.revokeObjectURL(url) }
    if (!this.on) return
    const src = ctx.createMediaStreamSource(stream), tap = new AudioWorkletNode(ctx, "plato-tap"), mute = ctx.createGain()
    mute.gain.value = 0
    src.connect(tap); tap.connect(mute); mute.connect(ctx.destination)
    const rs = new Resampler(ctx.sampleRate)
    tap.port.onmessage = (e: MessageEvent<Float32Array>) => { if (this.on) this.feed(this.seg.push(rs.push(e.data))) }
    this.onaudiostart?.()
    this.onstatus?.(W.ready ? "Listening on this device. Say a few sentences out loud."
      : "Getting the speech model ready (" + model.mb + " MB the first time; after that it works offline)…")
  }

  private feed(events: SegmentEvent[]) {
    for (const e of events) {
      if (e.type === "speech") this.onspeechstart?.()
      // until the model is ready, what's said is let go rather than drawn minutes late
      else if (!W.ready) continue
      else if (e.type === "interim") { if (W.busy === 0) run(this.seq, e.audio, false) }
      else { this.speechMs[this.seq] = e.speechMs; run(this.seq++, e.audio, true) }
    }
  }

  // arrow function: it is handed to the worker as its listener
  private hear = (m: FromWorker) => {
    if (!this.on) return
    if (m.type === "progress") { if (m.total) this.onstatus?.("Downloading the speech model: " + mb(m.loaded) + " of " + mb(m.total) + " MB. This happens once.") }
    else if (m.type === "ready") this.onstatus?.("Listening on this device. Say a few sentences out loud.")
    else if (m.type === "error") this.fail("whisper", m.message)
    else if (m.type === "result") {
      const k = m.id
      if (this.results[k]?.isFinal) return
      const text = cleanText(m.text, m.final ? this.speechMs[k] ?? 0 : 9999)
      if (!m.final && !text) return
      this.results[k] = { isFinal: m.final, 0: { transcript: text } }
      this.onresult?.({ resultIndex: k, results: this.results as unknown as SpeechResults })
    }
  }
}
