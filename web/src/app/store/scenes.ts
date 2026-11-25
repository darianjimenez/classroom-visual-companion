// Which scene each sentence gets: from Claude's plan, from a tuned lesson's own scenes, or from the built-in reader.
import { E, LESSONS, get, set } from "./core.ts"
import { rt } from "./runtime.ts"
import { sentenceCaption, splitSentences } from "./text.ts"
import type { Lesson, PlanItem, Scene } from "./types.ts"

const aiActive = () => !!(get().ai.useAi && rt.aiPlan && rt.aiPlan.script === rt.scriptText)
export const allLessons = (): Lesson[] => LESSONS.concat(get().mine)
export function curLesson(): Lesson | null { const s = get(); return allLessons().find((L) => L.id === s.lessonId) || null }
const curatedActive = () => { const L = curLesson(); return !!(L && L.plan && L.text.trim() === rt.scriptText) }

export function sceneForText(text: string, planItem?: PlanItem | null): Scene {
  // a sentence that names a whole topic gets its labelled diagram, even in tuned lessons
  let sc = planItem && planItem.diagram ? null : E.diagramScene(text)
  // a tuned lesson keeps its own pictures: only the drawn diagrams step in there, not the detailed ones from Wikimedia Commons
  if (sc && sc.imageDiagram && planItem) sc = null
  if (sc) return sc
  if (planItem) {
    sc = E.sceneFromAI(planItem, text, get().extra)
    if (sc && sc.show && !planItem.caption) { const c = sentenceCaption(text); if (c) sc.caption = c }
  }
  sc = sc || E.analyze(text, get().extra)
  // nothing to picture: the key point goes up in words instead, so no sentence leaves a gap in the storyboard
  return sc.show ? sc : E.wordScene(text)
}
export function sceneFor(si: number): Scene {
  if (rt.wordsFor[si]) return rt.wordsFor[si]
  const mode = aiActive() ? "ai" : curatedActive() ? "cur" : "rule"
  const key = si + ":" + mode
  if (!(key in rt.cache)) {
    const text = rt.sentences[si].text
    let item: PlanItem | null | undefined = null
    if (mode === "ai") item = rt.aiPlan?.scenes[si]
    else if (mode === "cur") item = curLesson()?.plan?.[si + 1]
    rt.cache[key] = sceneForText(text, item)
  }
  return rt.cache[key]
}
/** the first few drawings in a lesson, for its card in the list */
export function lessonIcons(L: Lesson): string[] {
  if (rt.icons[L.id]) return rt.icons[L.id]
  const seen: Record<string, number> = {}, out: string[] = []
  splitSentences(L.text).forEach((s, i) => {
    if (out.length >= 3) return
    const sc = sceneForText(s, L.plan ? L.plan[i + 1] : null)
    if (!sc.show) return
    E.sceneIcons(sc).forEach((k) => { if (out.length < 3 && !seen[k]) { seen[k] = 1; out.push(k) } })
  })
  rt.icons[L.id] = out
  return out
}

/** the line under the script that says where the pictures come from */
export function updateSource() {
  const s = get(), txt = s.script.trim(), L = curLesson()
  let source: { kind: "rule" | "cur" | "ai"; msg: string } = { kind: "rule", msg: "Pictures come from the built-in reader" }
  if (s.ai.useAi && rt.aiPlan && rt.aiPlan.script === txt) source = { kind: "ai", msg: "Pictures come from Claude's plan" }
  else if (L && L.subject !== "My lessons" && L.text.trim() === txt) source = { kind: "cur", msg: "Pictures are tuned for this lesson" }
  const n = txt ? txt.split(/\s+/).length : 0
  set({ source, wordCount: { words: n, sentences: splitSentences(txt).length } })
}
/** words in the script that get no picture because they could mean different things */
export function renderUnsure() {
  const seen: Record<string, boolean> = {}, words: string[] = []
  get().script.split(/\s+/).forEach((t) => {
    const w = E.normalize(t)
    if (w && !seen[w] && E.isUnsure(w, get().extra)) { seen[w] = true; words.push(w) }
  })
  set({ unsureWords: words.slice(0, 40) })
}
