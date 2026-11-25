// What the app remembers on this device: the teacher's settings, saved lessons and word pictures.
import type { Extra, Prefs } from "./types.ts"

export const KEYS = { extra: "cvc-extra-words-v4", mine: "cvc-my-lessons-v1", prefs: "cvc-prefs-v2", oldPrefs: "cvc-prefs-v1", help: "cvc-help-seen-v1" }
export const EXTRA_DEFAULTS: Extra = { animal: "🐾", switch: "🔘", soil: "🟫", friction: "🌀", weather: "⛅", game: "🎲", sport: "⚽", smile: "😊", dance: "💃", mud: "🟤" }

export function load<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); if (raw) { const v = JSON.parse(raw); if (v && typeof v === "object") return v } } catch { /* unreadable: use the fallback */ }
  return fallback
}
export function save(key: string, val: unknown) { try { localStorage.setItem(key, JSON.stringify(val)) } catch { /* storage full or blocked */ } }

export const DEFAULT_PREFS: Prefs = { speed: 130, pauseEach: false, drawMode: "new", calm: false, labels: true, tickerOn: true, unsure: false, autoRecap: true, follow: true }
export function loadPrefs(): Prefs {
  const p = load<Partial<Prefs> | null>(KEYS.prefs, null)
  if (p) return { ...DEFAULT_PREFS, ...p }
  // settings saved by the previous version of the app
  const o = load<Record<string, unknown>>(KEYS.oldPrefs, {})
  const m = { ...DEFAULT_PREFS }
  if ("speedSlider" in o) m.speed = Number(o.speedSlider) || 130
  if ("pauseEach" in o) m.pauseEach = !!o.pauseEach
  if ("drawMode" in o) m.drawMode = o.drawMode as Prefs["drawMode"]
  if ("calmToggle" in o) m.calm = !!o.calmToggle
  if ("labelsToggle" in o) m.labels = !!o.labelsToggle
  if ("tickerToggle" in o) m.tickerOn = !!o.tickerToggle
  if ("unsureToggle" in o) m.unsure = !!o.unsureToggle
  if ("recapToggle" in o) m.autoRecap = !!o.recapToggle
  if ("followToggle" in o) m.follow = !!o.followToggle
  return m
}
