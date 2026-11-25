// Planning the scenes with Claude, where the page can reach Claude (it is given window.claude when it runs inside Claude).
import { E, get, set } from "./core.ts"
import { resetPlayback } from "./playback.ts"
import { rt } from "./runtime.ts"
import { updateSource } from "./scenes.ts"
import { splitSentences } from "./text.ts"
import type { AppData, PlanItem } from "./types.ts"

export interface Sample { json(prompt: string, opts: { modelTier: string; signal: AbortSignal }): Promise<unknown> }
declare global {
  interface Window { claude?: { use(capability: string): Promise<Sample | null> } }
}

export const setAi = (patch: Partial<AppData["ai"]>) => set((s) => ({ ai: { ...s.ai, ...patch } }))
export function initSample() {
  if (!window.claude || typeof window.claude.use !== "function") return
  window.claude.use("sample").then((sample) => { if (sample) { rt.sample = sample; setAi({ available: true }) } }).catch(() => {})
}
export function setUseAi(useAi: boolean) { rt.cache = {}; setAi({ useAi }); updateSource() }

const UNAVAILABLE = ["not_granted", "sampling_disabled", "not_declared", "capability_disabled", "capability_removed"]
const FAILED: Record<string, string> = {
  rate_limited: "Too many requests right now. Try again in a little while.",
  session_expired: "Your Claude session expired. Sign in again, then retry.",
  invalid_json: "Claude's plan came back in a format I couldn't read. Try again.",
  refused: "Claude declined to plan this script. Try rewording it.",
  empty_completion: "Claude returned nothing for this script. Try a shorter lesson.",
  prompt_too_large: "That script is too long to plan in one go. Try a shorter section.",
}
export function planWithClaude() {
  if (!rt.sample || rt.planning) return
  const text = get().script.trim(), sents = splitSentences(text)
  if (!sents.length) { setAi({ status: "Write a script first." }); return }
  if (sents.length > 60) { setAi({ status: "That's a long script. Plan up to 60 sentences at a time." }); return }
  const ctl = new AbortController()
  rt.planning = ctl
  setAi({ planning: true, status: "Claude is reading the lesson and planning each scene…" })
  rt.sample.json(E.buildPlanPrompt(sents, Object.keys(get().extra)), { modelTier: "default", signal: ctl.signal }).then((result) => {
    if (!Array.isArray(result)) throw { code: "invalid_json" }
    const scenes: (PlanItem | null)[] = sents.map(() => null)
    result.forEach((o) => { const i = (o && +o.i) - 1; if (i >= 0 && i < sents.length) scenes[i] = o })
    rt.aiPlan = { script: text, scenes }
    setAi({ useAi: true })
    const shown = scenes.filter((o) => o && o.show !== false).length
    resetPlayback(); updateSource()
    setAi({ status: "Claude planned " + shown + " scenes for " + sents.length + " sentences. Press Play." })
  }).catch((e) => {
    const code = e && e.code
    if (code === "cancelled") return
    if (UNAVAILABLE.indexOf(code) >= 0) { setAi({ available: false }); return }
    setAi({ status: FAILED[code] || "Something went wrong reaching Claude. Try again." })
  }).then(() => { setAi({ planning: false }); rt.planning = null })
}
