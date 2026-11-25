// What every part of the store shares: the store itself, the picture engine, the lesson library and a few fixed lists.
import type { ExternalToast } from "sonner"
import type { StoreApi } from "zustand"
import { SceneEngine } from "../../engine/index.js"
import { LESSONS as BUILT_IN } from "../../engine/lessons.js"
import type { AppState } from "./types.ts"

// where the app is served from (Vite fills this in; the store tests run without it)
export const BASE: string = (import.meta.env && import.meta.env.BASE_URL) || "./"
export const E = SceneEngine
E.setAssetBase(BASE)
export const LESSONS = BUILT_IN

export const SUBJECTS = ["Science", "History", "Math", "Reading", "Health", "My lessons"]
export const SUBJECT_COLORS: Record<string, string> = {
  Science: "var(--sub-science)", History: "var(--sub-history)", Math: "var(--sub-math)",
  Reading: "var(--sub-reading)", Health: "var(--sub-health)", "My lessons": "var(--sub-mine)",
}
export const PACES = [{ wpm: 100, label: "Slow" }, { wpm: 130, label: "Normal" }, { wpm: 170, label: "Fast" }]
// notices about the lesson list and the side panels appear on that side of the screen; board notices stay centred under the board
export const NEAR_LIST: ExternalToast = { position: "bottom-right" }

// The store, once index.ts has made it. The parts read and change it through these two.
let store: StoreApi<AppState>
export function bind(api: StoreApi<AppState>) { store = api }
export const get = (): AppState => store.getState()
export function set(patch: Partial<AppState> | ((s: AppState) => Partial<AppState>)) { store.setState(patch) }
