// Whisper, running in a worker so the board stays smooth while it listens. The model is downloaded from Hugging Face the
// first time and kept in the browser's cache after that; the audio never leaves the device.
import { env, pipeline, type AutomaticSpeechRecognitionPipeline, type ProgressInfo } from "@huggingface/transformers"
import type { FromWorker, ToWorker, WhisperModel } from "./protocol.ts"

env.allowLocalModels = false

const post = (m: FromWorker) => self.postMessage(m)
let asr: Promise<AutomaticSpeechRecognitionPipeline> | null = null

function load(model: WhisperModel) {
  if (asr) return asr
  asr = (async () => {
    const t0 = performance.now()
    const p = await pipeline("automatic-speech-recognition", model.id, {
      device: model.device, dtype: model.dtype,
      progress_callback: (e: ProgressInfo) => { if (e.status === "progress_total") post({ type: "progress", loaded: e.loaded, total: e.total }) },
    })
    // the first run sets the model up on the device; do it now on a second of silence, not on the teacher's first sentence
    await p(new Float32Array(16000), {})
    post({ type: "ready", model, ms: Math.round(performance.now() - t0) })
    return p as AutomaticSpeechRecognitionPipeline
  })()
  asr.catch((err: Error) => { asr = null; post({ type: "error", message: err?.message || String(err) }) })
  return asr
}

self.onmessage = async (e: MessageEvent<ToWorker>) => {
  const m = e.data
  if (m.type === "load") { load(m.model).catch(() => {}); return }
  if (!asr) { post({ type: "result", id: m.id, text: "", final: m.final, ms: 0 }); return }
  try {
    const p = await asr
    const t0 = performance.now()
    const out = await p(m.audio, {})
    const text = (Array.isArray(out) ? out.map((o) => o.text).join(" ") : out.text) || ""
    post({ type: "result", id: m.id, text, final: m.final, ms: Math.round(performance.now() - t0) })
  } catch (err) {
    post({ type: "result", id: m.id, text: "", final: m.final, ms: 0 })
    post({ type: "error", message: (err as Error)?.message || String(err) })
  }
}
