// Full screen, the side panels, the guide and the command menu.
import { toast } from "sonner"
import { LESSONS, get, set } from "./core.ts"
import { selectLesson } from "./lessons.ts"
import { KEYS, save } from "./persist.ts"
import { nextSentence, play, resetPlayback } from "./playback.ts"
import { canListen } from "./speech.ts"
import { enterTalk, exitTalk } from "./talk.ts"
import { scrollToBoard } from "./text.ts"
import type { Panel, Way } from "./types.ts"
import { startListening } from "./voice.ts"

// ---------- full screen (Safari on older iPads only has the prefixed calls; iPhones have none) ----------
type Doc = Document & { webkitFullscreenElement?: Element | null; webkitExitFullscreen?: () => Promise<void> | undefined }
type Board = HTMLElement & { webkitRequestFullscreen?: () => Promise<void> | undefined }
const doc = document as Doc
const fsElement = () => doc.fullscreenElement || doc.webkitFullscreenElement || null
export function toggleFullscreen() {
  const board = document.getElementById("board") as Board | null
  if (fsElement()) {
    const exit = doc.exitFullscreen || doc.webkitExitFullscreen, done = exit ? exit.call(doc) : null
    if (done && typeof done.catch === "function") done.catch(() => {})
    return
  }
  const req = board && (board.requestFullscreen || board.webkitRequestFullscreen)
  if (!board || !req) { toast("Full screen isn't available on this device."); return }
  const p = req.call(board)
  if (p && typeof p.catch === "function") p.catch(() => toast("Full screen isn't available here."))
}
export function syncFullscreen() { const el = fsElement(); set({ fullscreen: !!el && el.id === "board" }) }

// ---------- panels and dialogs ----------
export const openPanel = (panel: Exclude<Panel, null>) => set((s) => ({ panel: s.panel === panel ? null : panel }))
export const closePanel = () => set({ panel: null })
export function showLessons() { set({ panel: null }); if (get().talk) exitTalk(false) }
export const openGuide = () => set({ guideOpen: true })
export function closeGuide() { set({ guideOpen: false }); save(KEYS.help, { seen: true }) }
export const setCommandOpen = (commandOpen: boolean) => set({ commandOpen })
/** the guide's "Try it" buttons */
export function tryWay(how: Way) {
  set({ guideOpen: false }); save(KEYS.help, { seen: true })
  if (how === "talk") { enterTalk(); return }
  if (get().talk) exitTalk(false)
  if (!get().script.trim() && LESSONS[0]) selectLesson(LESSONS[0], true)
  if (how === "play") { resetPlayback(); play() }
  else if (how === "step") { resetPlayback(); nextSentence() }
  else if (how === "read") {
    if (!canListen) { toast("Reading aloud needs a microphone, and this browser can't listen."); return }
    set((s) => ({ prefs: { ...s.prefs, follow: true } })); resetPlayback(); startListening()
  }
  scrollToBoard()
}
