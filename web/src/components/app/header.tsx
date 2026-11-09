import type * as React from "react"
import { BookOpen, CircleHelp, Images, Mic, Search, SlidersHorizontal } from "lucide-react"
import { useApp } from "@/app/store"
import { Button } from "@/components/ui/button"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform)

export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <rect x="2" y="5" width="28" height="22" rx="6" fill="var(--board)" />
      <rect x="6.5" y="10" width="11" height="8.5" rx="2" fill="var(--paper)" />
      <circle cx="10" cy="14.2" r="2" fill="var(--brand)" />
      <path d="M21 11.5h5M21 15.5h3.5M7.5 22h17" stroke="var(--board-foreground)" strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
    </svg>
  )
}

function IconButton({ label, onClick, children, className }: { label: string; onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger render={<Button variant="ghost" size="icon" aria-label={label} onClick={onClick} className={className} />}>{children}</TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

export function Header() {
  const talk = useApp((s) => s.talk)
  const a = useApp((s) => s.actions)
  return (
    <header className="sticky top-0 z-30 border-b bg-background">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-2 px-3 sm:gap-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-2">
          <Logo className="size-7 shrink-0" />
          <span className="hidden truncate text-base font-semibold tracking-tight lg:inline">Visual Companion</span>
        </div>
        <Tabs value={talk ? "talk" : "lessons"} onValueChange={(v) => (v === "talk" ? a.enterTalk() : a.showLessons())} className="mx-auto">
          <TabsList>
            <TabsTrigger value="lessons" className="px-2 sm:px-3"><BookOpen />Lessons</TabsTrigger>
            <TabsTrigger value="talk" className="px-2 sm:px-3"><Mic />Just talk</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-1">
          <Button variant="outline" className="hidden w-44 justify-start gap-2 text-muted-foreground md:inline-flex" onClick={() => a.setCommandOpen(true)}>
            <Search />
            <span>Search</span>
            <KbdGroup className="ml-auto"><Kbd>{isMac ? "⌘" : "Ctrl"}</Kbd><Kbd>K</Kbd></KbdGroup>
          </Button>
          <IconButton label="Search" onClick={() => a.setCommandOpen(true)} className="hidden sm:inline-flex md:hidden"><Search /></IconButton>
          <IconButton label="Pictures and diagrams" onClick={() => a.openPanel("pictures")}><Images /></IconButton>
          <IconButton label="Settings" onClick={() => a.openPanel("settings")}><SlidersHorizontal /></IconButton>
          <IconButton label="Guide" onClick={a.openGuide}><CircleHelp /></IconButton>
        </div>
      </div>
    </header>
  )
}
