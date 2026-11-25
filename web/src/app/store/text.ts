// Small helpers for sentences and the page.
// "Martin Luther King Jr. led…", "Dr. Lee said…": a title's full stop doesn't end the sentence
const TITLE = /(^|\s)(Mr|Mrs|Ms|Dr|Jr|Sr|St|Mt|Prof|Gen|Capt|Lt|Sgt|Rev|Gov|Sen|Rep|Pres)\.$/
export function splitSentences(text: string): string[] {
  const m = String(text).replace(/\s+/g, " ").trim().match(/[^.!?]+[.!?]+["')\]]*|[^.!?]+$/g) || []
  const out: string[] = []
  m.map((s) => s.trim()).filter(Boolean).forEach((s) => {
    if (out.length && TITLE.test(out[out.length - 1])) out[out.length - 1] += " " + s
    else out.push(s)
  })
  return out
}
/** a short sentence can be its own caption */
export function sentenceCaption(t: string) { return t.split(/\s+/).length <= 16 ? t.replace(/[.!?;:,]+$/, "") : null }
export function plural(n: number, one: string, many: string) { return n + " " + (n === 1 ? one : many) }
function isNarrow() { return window.matchMedia("(max-width: 960px)").matches }
export function scrollToBoard() { if (isNarrow()) document.getElementById("board")?.scrollIntoView({ behavior: "smooth", block: "start" }) }
