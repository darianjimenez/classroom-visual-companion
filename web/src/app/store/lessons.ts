// The lesson list and the script: picking a lesson, writing one, saving and deleting.
import { toast } from "sonner"
import { setBoardHeading } from "./board.ts"
import { NEAR_LIST, get, set } from "./core.ts"
import { setAi } from "./claude.ts"
import { KEYS, save } from "./persist.ts"
import { loadScript, pause, resetPlayback } from "./playback.ts"
import { curLesson, renderUnsure, updateSource } from "./scenes.ts"
import { exitTalk } from "./talk.ts"
import { scrollToBoard } from "./text.ts"
import type { Lesson } from "./types.ts"
import { rt } from "./runtime.ts"

/** quiet: on opening the app, with no notice and no scrolling */
export function selectLesson(L: Lesson, quiet?: boolean) {
  set({ lessonId: L.id, script: L.text })
  if (quiet) { loadScript(); updateSource(); return }
  resetPlayback(); renderUnsure(); setBoardHeading(); updateSource()
  toast("Ready: “" + L.title + "”", NEAR_LIST)
  scrollToBoard()
}
export function deleteLesson(L: Lesson) {
  const mine = get().mine.filter((x) => x.id !== L.id)
  set({ mine })
  save(KEYS.mine, mine)
  if (get().lessonId === L.id) set({ lessonId: null })
  setBoardHeading()
  toast("Deleted “" + L.title + "”", NEAR_LIST)
}
export function newLesson() {
  const txt = get().script.trim(), L = curLesson()
  // a library or saved lesson is safe to clear; unsaved writing is kept
  if (!txt || (L && L.text.trim() === txt)) {
    set({ lessonId: null, script: "", saveTitle: "" })
    resetPlayback(); setBoardHeading(); updateSource(); renderUnsure()
  }
  if (get().talk) exitTalk(false)
  set({ panel: "script" })
}
export function setScript(script: string) {
  set({ script })
  pause()
  setBoardHeading(); updateSource(); renderUnsure()
  if (rt.aiPlan && rt.aiPlan.script !== script.trim()) setAi({ status: "The script changed since Claude's plan. Plan again to use it." })
}
export function saveLesson() {
  const text = get().script.trim()
  if (!text) { toast("Write a script first."); return }
  const title = get().saveTitle.trim() || text.split(/\s+/).slice(0, 5).join(" ") + "…"
  const L: Lesson = { id: "my-" + Date.now(), subject: "My lessons", grade: "", title, text, plan: {} }
  const mine = [L].concat(get().mine)
  set({ mine, lessonId: L.id, saveTitle: "", query: "", filter: "My lessons" })
  save(KEYS.mine, mine)
  setBoardHeading(); updateSource()
  toast("Saved “" + title + "”", NEAR_LIST)
}
/** a finished talk becomes a script, ready to save */
export function recapSave() {
  const sents = get().lastTalk.map((raw) => { let t = raw.trim(); t = t.charAt(0).toUpperCase() + t.slice(1); return /[.!?]$/.test(t) ? t : t + "." })
  set({ lessonId: null, script: sents.join(" "), panel: "script" })
  setBoardHeading(); updateSource(); renderUnsure()
  toast("Your talk is now a script", { ...NEAR_LIST, description: "Add a title and press Save." })
}
