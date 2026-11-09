import * as React from "react"
import { useApp } from "@/app/store"
import { Board } from "@/components/app/board"
import { CommandMenu, GuideDialog, WordDialog } from "@/components/app/dialogs"
import { Header } from "@/components/app/header"
import { LessonList } from "@/components/app/lesson-list"
import { PicturesPanel, ScriptPanel, SettingsPanel } from "@/components/app/panels"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"

function useShortcuts() {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = useApp.getState(), a = s.actions
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); a.setCommandOpen(!s.commandOpen); return }
      const t = e.target as HTMLElement | null, tag = t?.tagName
      if (tag === "TEXTAREA" || tag === "INPUT" || tag === "SELECT" || t?.isContentEditable) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (s.guideOpen || s.wordDialog.open || s.commandOpen || s.panel) return
      // let focused buttons handle Space and Enter themselves
      if ((e.key === " " || e.key === "Enter") && (tag === "BUTTON" || t?.getAttribute("role") === "button")) return
      if (s.talk && e.key === " ") { e.preventDefault(); a.micToggle(); return }
      switch (e.key) {
        case " ": e.preventDefault(); a.togglePlay(); break
        case "t": case "T": a.enterTalk(); break
        case "ArrowRight": case "PageDown": e.preventDefault(); a.nextSentence(); break
        case "ArrowLeft": case "PageUp": e.preventDefault(); a.prevScene(); break
        case "r": case "R": a.toggleRecap(); break
        case "f": case "F": a.toggleFullscreen(); break
        case "m": case "M": a.micToggle(); break
        case "?": a.openGuide(); break
        case "Escape": a.hideRecap(); break
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [])
}

export default function App() {
  const talk = useApp((s) => s.talk)
  React.useEffect(() => { useApp.getState().actions.init() }, [])
  useShortcuts()
  return (
    <TooltipProvider delay={400}>
      <Header />
      <main className={talk
        ? "mx-auto grid max-w-[1100px] gap-5 px-3 py-4 sm:px-5 sm:py-5"
        : "mx-auto grid max-w-[1440px] items-start gap-5 px-3 py-4 sm:px-5 sm:py-5 lg:grid-cols-[minmax(0,1fr)_360px]"}>
        <Board />
        {!talk && <LessonList />}
      </main>
      <ScriptPanel />
      <SettingsPanel />
      <PicturesPanel />
      <GuideDialog />
      <WordDialog />
      <CommandMenu />
      <Toaster position="bottom-center" />
    </TooltipProvider>
  )
}
