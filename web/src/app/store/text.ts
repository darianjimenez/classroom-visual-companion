// Small helpers for sentences and the page.
export function splitSentences(text: string): string[] {
  const m = String(text).replace(/\s+/g, " ").trim().match(/[^.!?]+[.!?]+["')\]]*|[^.!?]+$/g) || []
  return m.map((s) => s.trim()).filter(Boolean)
}
/** a short sentence can be its own caption */
export function sentenceCaption(t: string) { return t.split(/\s+/).length <= 16 ? t.replace(/[.!?;:,]+$/, "") : null }
export function plural(n: number, one: string, many: string) { return n + " " + (n === 1 ? one : many) }
function isNarrow() { return window.matchMedia("(max-width: 960px)").matches }
export function scrollToBoard() { if (isNarrow()) document.getElementById("board")?.scrollIntoView({ behavior: "smooth", block: "start" }) }
