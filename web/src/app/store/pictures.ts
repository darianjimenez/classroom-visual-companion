// Settings, and the pictures: which picture a word shows, and putting a diagram on the board.
import { toast } from "sonner"
import { finishActive, hideRecap, refreshFrames, revealTo, startFrame, talkHeading } from "./board.ts"
import { E, get, set } from "./core.ts"
import { EXTRA_DEFAULTS, KEYS, save } from "./persist.ts"
import { onTimer, pause } from "./playback.ts"
import { rt } from "./runtime.ts"
import { renderUnsure } from "./scenes.ts"
import { scrollToBoard } from "./text.ts"
import type { Extra, Prefs, WordNow } from "./types.ts"

export function setPref<K extends keyof Prefs>(key: K, value: Prefs[K]) {
  set((s) => ({ prefs: { ...s.prefs, [key]: value } }))
  if (key === "speed" && get().playing) { clearInterval(rt.timer); rt.timer = setInterval(onTimer, 60000 / (value as number)) }
}

export function showDiagram(key: string, title: string) {
  const sc = E.diagramScene(title, key)
  if (!sc) return
  sc.highlight = []; sc.caption = title
  pause(); finishActive(); hideRecap()
  startFrame("d" + ++rt.voiceSeq, sc, -1)
  revealTo(Infinity); finishActive()
  if (get().talk) talkHeading()
  set({ panel: null, commandOpen: false })
  scrollToBoard()
}

// ---------- word pictures ----------
function saveWords(extra: Extra) { set({ extra }); save(KEYS.extra, extra); refreshFrames() }
/** the word dialog: what a word shows now */
export function openWord(raw: string) {
  const w = E.normalize(raw)
  if (!w || w.length < 2) return
  const extra = get().extra, v = extra[w], c = E.lookup(w, extra)
  let now: WordNow
  if (v === "-") now = { kind: "off", text: "No picture (you turned it off)" }
  else if (c && c.icon) now = { kind: "icon", icon: c.icon, text: "Shows a drawing" }
  else if (c && c.emoji) now = { kind: "emoji", emoji: c.emoji, text: "Shows an emoji" }
  else if (c && c.sym) now = { kind: "symbol", sym: c.sym, text: "Shows a symbol" }
  else if (E.isUnsure(w, extra)) now = { kind: "unsure", text: "Could mean different things here, so nothing shows" }
  else now = { kind: "none", text: "No picture yet" }
  set({ wordDialog: { open: true, word: w, now, overridden: v != null } })
}
export const closeWord = () => set((s) => ({ wordDialog: { ...s.wordDialog, open: false } }))
/** value: an emoji, "@" and a drawing's name, "-" for no picture, or null for automatic */
export function setWordPicture(w: string, val: string | null) {
  const extra = { ...get().extra }
  if (val == null) delete extra[w]; else extra[w] = val
  set({ extra, wordDialog: { ...get().wordDialog, open: false } })
  save(KEYS.extra, extra)
  refreshFrames(); renderUnsure()
  toast(val == null ? "“" + w + "” is back to automatic" : val === "-" ? "No picture for “" + w + "”" : "Saved a picture for “" + w + "”")
}
export function addWord(word: string, emoji: string) {
  const w = String(word).trim().toLowerCase().replace(/[^a-z]/g, ""), em = String(emoji).trim()
  if (!w || !em) return false
  saveWords({ ...get().extra, [w]: em })
  return true
}
export function removeWord(w: string) { const extra = { ...get().extra }; delete extra[w]; saveWords(extra) }
export function resetWords() { saveWords({ ...EXTRA_DEFAULTS }) }
