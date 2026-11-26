// What the app and the Whisper worker say to each other, and which model a device gets.
export type WhisperModel = {
  id: string
  device: "webgpu" | "wasm"
  dtype: Record<string, "fp32" | "fp16" | "q8" | "q4">
  /** megabytes downloaded the first time */
  mb: number
}

// Timed on a 7-second sentence on a 2024 MacBook: quick 1.1 s; accurate 2.5 s, or 1.4 s with a graphics card (WebGPU).
// The accurate model is about 4 points better on hard speech, but school Wi-Fi makes a big first download the real cost.
export const MODELS = {
  quick: { id: "onnx-community/whisper-tiny.en", device: "wasm", dtype: { encoder_model: "q8", decoder_model_merged: "q8" }, mb: 41 },
  accurate: { id: "onnx-community/whisper-base.en", device: "wasm", dtype: { encoder_model: "q8", decoder_model_merged: "q8" }, mb: 77 },
  accurateGpu: { id: "onnx-community/whisper-base.en", device: "webgpu", dtype: { encoder_model: "fp32", decoder_model_merged: "q8" }, mb: 136 },
} satisfies Record<string, WhisperModel>

export type ToWorker =
  | { type: "load"; model: WhisperModel }
  | { type: "run"; id: number; audio: Float32Array; final: boolean }

export type FromWorker =
  | { type: "progress"; loaded: number; total: number }
  | { type: "ready"; model: WhisperModel; ms: number }
  | { type: "result"; id: number; text: string; final: boolean; ms: number }
  | { type: "error"; message: string }
