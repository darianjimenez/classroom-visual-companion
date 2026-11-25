// Test helpers: the picture engine as the app uses it, scenes described as short readable text, and live talk replayed the way
// the app replays it (a phrase waits for the next one, a phrase that stops mid-idea is joined to it, recent words are context).
import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import { SceneEngine } from "../src/engine/index.js"
import { LESSONS } from "../src/engine/lessons.js"

// the symbol table arrives in the app after the first screen; here it is handed over once, before any test runs
SceneEngine.setSymbols(JSON.parse(readFileSync(new URL("../public/symbols/index.json", import.meta.url), "utf8")))

export function loadEngine() {
  return { E: SceneEngine, LESSONS }
}

export const splitSentences = (text) =>
  (String(text).replace(/\s+/g, " ").trim().match(/[^.!?]+[.!?]+["')\]]*|[^.!?]+$/g) || []).map((s) => s.trim()).filter(Boolean)

const pic = (x) => x.label + "=" + (x.icon ? "i:" + x.icon : x.sym ? "s:" + x.sym : "m:" + x.emoji)
// one line per scene: what is drawn, how it is connected, and the caption
export function describe(sc) {
  if (!sc || !sc.show) return "—"
  if (sc.words) {
    const k = sc.words, t = (a) => a.map((w) => (w.k ? w.t.toUpperCase() : w.t)).join(" ")
    return "[" + k.label + "] " + (k.main ? "«" + t(k.main) + "» " : "") + t(k.words) + (sc.caption ? " ‹" + sc.caption + "›" : "")
  }
  if (sc.diagram) return "DIAGRAM " + sc.diagram + (sc.highlight && sc.highlight.length ? " (" + sc.highlight.join(",") + ")" : "") + " ‹" + sc.caption + "›"
  let s = (sc.subjects || []).map(pic).join(" + ")
  if (sc.relation && sc.relation !== "and" && sc.objects && sc.objects.length) s += " " + sc.verb + "→ " + sc.objects.map(pic).join(" + ")
  if (sc.then) s += " → " + sc.then.verb + " " + sc.then.objects.map(pic).join(" + ")
  return s + " ‹" + sc.caption + "›"
}
// drawings get numbered ids in the order they are drawn; take them out so a picture's fingerprint doesn't depend on that order
export const svgHash = (svg) => createHash("sha1").update(String(svg).replace(/\bs\d+_/g, "s_")).digest("hex").slice(0, 12)

// the app's reading of one sentence in a lesson: a diagram if the sentence names one, else pictures, else a word card
export function lessonScene(E, text) {
  const sc = E.diagramScene(text) || E.analyze(text, {})
  return sc.show ? sc : E.wordScene(text)
}

// live talk, as in the app's store: look-ahead, joining, splitting into ideas, recent words and the last subject as context
export function replayLive(E, pieces) {
  const ctx = { words: [], subject: null }, out = []
  const draw = (text, nextText) => {
    const parts = E.splitSpoken(text)
    parts.forEach((part, k) => {
      const next = parts.slice(k + 1).concat(nextText || "").join(" ").split(/\s+/).filter(Boolean).slice(0, 24).map(E.normalize)
      let sc = E.analyze(part, {}, { words: ctx.words, subject: ctx.subject, next })
      ctx.words = ctx.words.concat(part.split(/\s+/).filter(Boolean).map(E.normalize)).slice(-100)
      if (!sc.show) sc = E.wordScene(part, { live: true })
      else if (sc.subjects && sc.subjects.length) ctx.subject = sc.subjects[0]
      out.push(part + " | " + describe(sc))
    })
  }
  let pending = ""
  for (const p of pieces) {
    let t = p
    if (pending && E.dangling(pending)) t = pending + " " + p
    else if (pending) draw(pending, p)
    pending = t
  }
  if (pending) draw(pending, "")
  return out
}
