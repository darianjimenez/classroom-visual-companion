import * as React from "react"
import NumberFlow from "@number-flow/react"
import {
  LayoutGrid, Maximize, Mic, MicOff, Minimize, Pause, Pencil, Play, RotateCcw, SkipBack, SkipForward, StepForward,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { E, PACES, useApp } from "@/app/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

// buttons that sit on the dark board
const onBoard = "text-board-foreground/85 hover:bg-white/10 hover:text-board-foreground aria-pressed:bg-white/15 aria-pressed:text-board-foreground dark:hover:bg-white/10"

function BoardButton({ label, onClick, pressed, disabled, className, children }: {
  label: string; onClick: () => void; pressed?: boolean; disabled?: boolean; className?: string; children: React.ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button variant="ghost" size="icon" aria-label={label} aria-pressed={pressed} disabled={disabled}
            onClick={onClick} className={cn(onBoard, className)} />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

function BoardHeader() {
  const heading = useApp((s) => s.heading)
  const count = useApp((s) => s.count)
  const recapOpen = useApp((s) => s.recapOpen)
  const fullscreen = useApp((s) => s.fullscreen)
  const talk = useApp((s) => s.talk)
  const a = useApp((s) => s.actions)
  return (
    <div className="flex items-center gap-2">
      <div className="flex min-w-0 items-center gap-3">
        <span className="shrink-0 text-xs font-medium tracking-wide text-board-muted uppercase">{heading.tag}</span>
        <h2 className="board-title truncate text-base font-semibold text-board-foreground">{heading.title}</h2>
        {!talk && (
          <BoardButton label="Edit the script" onClick={() => a.openPanel("script")} className="size-7"><Pencil className="size-3.5" /></BoardButton>
        )}
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-1">
        {count && (
          <span className="tabular mr-1 hidden text-sm text-board-muted sm:inline">
            {count.done ? <>All {count.total} sentences</> : <>Sentence <NumberFlow value={count.cur} /> of {count.total}</>}
          </span>
        )}
        <BoardButton label="Every scene so far (R)" onClick={a.toggleRecap} pressed={recapOpen}><LayoutGrid /></BoardButton>
        <BoardButton label={fullscreen ? "Exit full screen (F)" : "Full screen (F)"} onClick={a.toggleFullscreen}>{fullscreen ? <Minimize /> : <Maximize />}</BoardButton>
      </div>
    </div>
  )
}

function Dots() {
  const dots = useApp((s) => s.dots)
  const a = useApp((s) => s.actions)
  if (!dots.length) return <div className="mt-2 h-4" />
  return (
    <div className="mt-2 flex flex-wrap gap-1" aria-label="Lesson progress">
      {dots.map((d, i) => (
        <button key={i} type="button" aria-label={"Sentence " + (i + 1)} aria-current={d.current ? "step" : undefined} disabled={!d.hasScene} onClick={() => a.viewSentence(i)}
          className={cn("group flex h-4 w-6 items-center", d.hasScene && "cursor-pointer")}>
          <span className={cn("h-1 w-full rounded-full bg-white/15 transition-colors", d.done && "bg-white/40", d.current && "bg-board-foreground", d.hasScene && "group-hover:bg-board-foreground")} />
        </button>
      ))}
    </div>
  )
}

function StartCard() {
  const start = useApp((s) => s.start)
  const voice = useApp((s) => s.voice)
  const a = useApp((s) => s.actions)
  if (start.mode !== "ready") {
    return (
      <div className="flex max-w-md flex-col items-center gap-2 text-center">
        <span className="live-dot mb-2 size-3 rounded-full" />
        <h3 className="font-caption text-3xl font-medium text-board-foreground">{start.mode === "reading" ? "Start reading" : "Listening…"}</h3>
        <p className="text-sm text-board-muted">
          {start.mode === "reading" ? "The pictures follow along as you read the script out loud." : "Talk to the class. Pictures appear as you speak."}
        </p>
        <p className="mt-1 text-xs text-board-muted">Press M or the microphone to stop.</p>
      </div>
    )
  }
  const icons = start.icons.map((k) => E.iconSVG(k)).join("")
  return (
    <div className="flex max-w-lg flex-col items-center text-center">
      {icons && <div className="mb-6 flex gap-3 rounded-lg bg-paper px-4 py-3 shadow-[var(--shadow-thumb)] [&_svg]:size-11 sm:[&_svg]:size-12" dangerouslySetInnerHTML={{ __html: icons }} />}
      <h3 className="font-caption text-3xl leading-tight font-medium text-board-foreground sm:text-4xl">{start.title}</h3>
      <p className="mt-2 text-sm text-board-muted">{start.meta}</p>
      <Button onClick={a.start} className="mt-8 h-11 gap-2 bg-brand px-6 text-base font-semibold text-brand-foreground hover:bg-brand/90">
        <Play className="fill-current" />{start.hasScript ? "Start lesson" : "Choose a lesson"}
      </Button>
      {start.hasScript && (
        <div className="mt-4 flex flex-wrap justify-center gap-1">
          <Button variant="ghost" className={onBoard} onClick={a.nextSentence}><StepForward />One sentence at a time</Button>
          <Button variant="ghost" className={onBoard} onClick={a.readAloud} disabled={!voice.supported}
            title={voice.supported ? "Read the script aloud and the pictures keep up with you" : "Live voice needs Google Chrome"}>
            <Mic />Read it aloud
          </Button>
        </div>
      )}
      <button type="button" onClick={a.enterTalk} className="mt-2 py-1 text-sm text-board-muted underline-offset-4 hover:text-board-foreground hover:underline">
        or just start talking
      </button>
    </div>
  )
}

const EXAMPLES = [
  "The sun heats the ocean and the water turns into vapor.",
  "A caterpillar eats leaves and turns into a butterfly.",
  "Today we will learn the parts of a plant.",
  "Volcanoes erupt when hot magma rises.",
]

function TalkScreen() {
  const talkBig = useApp((s) => s.talkBig)
  const listening = useApp((s) => s.listening)
  const a = useApp((s) => s.actions)
  return (
    <div className="flex max-w-lg flex-col items-center text-center">
      <button type="button" onClick={a.talkOrb} aria-label={listening ? "Turn the microphone off" : "Turn the microphone on"}
        className={cn("press flex size-20 items-center justify-center rounded-full shadow-[var(--shadow-thumb)] transition-colors",
          listening ? "bg-live text-white" : "bg-brand text-brand-foreground hover:bg-brand/90")}>
        {listening ? <Mic className="size-8" /> : <MicOff className="size-8" />}
      </button>
      <h3 className="mt-6 font-caption text-3xl font-medium text-board-foreground">{talkBig}</h3>
      <p className="mt-2 max-w-[44ch] text-sm text-board-muted">Talk the way you would to your class. Each idea becomes a picture, and naming a topic like “the water cycle” shows its diagram.</p>
      <div className="mt-8 flex flex-col items-center gap-2">
        <span className="text-xs text-board-muted">No microphone? Try one:</span>
        {EXAMPLES.map((t) => (
          <button key={t} type="button" onClick={() => a.sayExample(t)}
            className="press rounded-lg border border-white/15 px-3 py-2 font-caption text-sm text-board-foreground transition-colors hover:bg-white/10">
            {t}
          </button>
        ))}
      </div>
    </div>
  )
}

function Hero() {
  const frames = useApp((s) => s.frames)
  const viewing = useApp((s) => s.viewing)
  const activeN = useApp((s) => s.activeN)
  const revealAt = useApp((s) => s.revealAt)
  const heroMode = useApp((s) => s.heroMode)
  const frame = frames.find((f) => f.n === viewing)
  const art = React.useRef<HTMLDivElement>(null)
  // the scene's parts appear as the matching words are spoken
  React.useLayoutEffect(() => {
    const live = frame && frame.n === activeN
    art.current?.querySelectorAll(".el").forEach((g) => g.classList.toggle("pending", !!live && +(g.getAttribute("data-at") || 0) > revealAt))
  }, [frame, activeN, revealAt])
  if (!frame) return null
  return (
    <div className="hero flex w-full flex-col items-center gap-4" data-mode={heroMode}>
      <div key={frame.n} className="hero-card relative w-full rounded-xl bg-paper p-2 shadow-[var(--shadow-card)]">
        <span className="tabular absolute -top-3 -left-3 z-10 flex size-6 items-center justify-center rounded-full bg-board text-xs font-semibold text-board-foreground ring-1 ring-white/20">{frame.n}</span>
        <div ref={art} className="overflow-hidden rounded-sm" dangerouslySetInnerHTML={{ __html: frame.svg }} />
      </div>
      <p className="hero-caption max-w-[34ch] text-center font-caption text-2xl leading-snug text-board-foreground sm:text-3xl" aria-live="polite">{frame.scene.caption}</p>
    </div>
  )
}

function Recap() {
  const frames = useApp((s) => s.frames)
  const recap = useApp((s) => s.recap)
  const a = useApp((s) => s.actions)
  return (
    <div className="recap w-full self-stretch">
      <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
        <h3 className="mr-2 font-caption text-2xl font-medium text-board-foreground">{recap.title}</h3>
        <Button variant="ghost" className={onBoard} onClick={a.recapRestart}><RotateCcw />{recap.restartLabel}</Button>
        {recap.canSave && <Button variant="ghost" className={onBoard} onClick={a.recapSave}>Save as a lesson</Button>}
        <Button variant="ghost" className={onBoard} onClick={a.hideRecap}>Close</Button>
      </div>
      <div className="grid max-h-[62vh] grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-4 overflow-y-auto px-1 pb-2 [.is-fullscreen_&]:max-h-none">
        {frames.map((f) => (
          <button key={f.n} type="button" onClick={() => a.viewFrame(f.n)}
            className="press relative rounded-lg bg-paper p-1 text-left shadow-[var(--shadow-thumb)] outline-none focus-visible:ring-2 focus-visible:ring-board-foreground">
            <span className="tabular absolute -top-2 -left-2 flex size-5 items-center justify-center rounded-full bg-board text-xs font-semibold text-board-foreground ring-1 ring-white/20">{f.n}</span>
            <div className="overflow-hidden rounded-sm" dangerouslySetInnerHTML={{ __html: f.svg }} />
            <p className="mt-2 px-1 pb-1 text-center font-caption text-sm leading-tight text-neutral-800">{f.scene.caption}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

function Filmstrip() {
  const frames = useApp((s) => s.frames)
  const viewing = useApp((s) => s.viewing)
  const stage = useApp((s) => s.stage)
  const a = useApp((s) => s.actions)
  const ref = React.useRef<HTMLDivElement>(null)
  const done = frames.filter((f) => f.done).slice(-60)
  const last = done.length ? done[done.length - 1].n : 0
  React.useEffect(() => { if (ref.current) ref.current.scrollLeft = ref.current.scrollWidth }, [last])
  if (!done.length || stage === "recap") return null
  return (
    <div ref={ref} className="thumb-scroll flex gap-3 overflow-x-auto border-t border-board-line px-2 pt-4 pb-2" aria-label="Scenes so far">
      {done.map((f) => (
        <button key={f.n} type="button" onClick={() => a.viewFrame(f.n)} aria-label={"Scene " + f.n + ": " + f.scene.caption}
          className={cn("press relative w-30 shrink-0 rounded-lg bg-paper p-1 text-left opacity-80 transition-opacity outline-none hover:opacity-100 focus-visible:ring-2 focus-visible:ring-board-foreground",
            f.n === viewing && "opacity-100 ring-2 ring-board-foreground")}>
          <span className="tabular absolute -top-2 -left-2 flex size-5 items-center justify-center rounded-full bg-board text-xs font-semibold text-board-foreground ring-1 ring-white/20">{f.n}</span>
          <div className="overflow-hidden rounded-sm" dangerouslySetInnerHTML={{ __html: f.svg }} />
          <p className="mt-1 line-clamp-2 px-1 text-center font-caption text-xs leading-tight text-neutral-800">{f.scene.caption}</p>
        </button>
      ))}
    </div>
  )
}

function TalkBar() {
  const live = useApp((s) => s.live)
  const hasPictures = useApp((s) => s.frames.length > 0)
  const a = useApp((s) => s.actions)
  const [text, setText] = React.useState("")
  return (
    <div className="flex flex-col gap-2 border-t border-board-line pt-3">
      <p className={cn("flex items-center gap-2 text-sm text-board-foreground", live.miss && "text-board-muted")} aria-live="polite">
        <span className="live-dot size-2.5 shrink-0 rounded-full" />{live.msg}
      </p>
      <form className="flex flex-wrap gap-2" onSubmit={(e) => { e.preventDefault(); a.sayTyped(text); setText("") }}>
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Or type a sentence and press Enter" aria-label="Type a sentence to show as a picture"
          className="min-w-[180px] flex-1 border-white/20 bg-white/5 text-board-foreground placeholder:text-board-muted dark:bg-white/5" />
        <Button type="submit" variant="ghost" className={cn("border border-white/20", onBoard)}>Show</Button>
        {/* only the main action once there is something to show; until then the microphone is */}
        <Button type="button" onClick={a.finishTalk} disabled={!hasPictures}
          className={hasPictures ? "bg-brand font-semibold text-brand-foreground hover:bg-brand/90" : cn("border border-white/20", onBoard)}>
          Finish & see slideshow
        </Button>
      </form>
    </div>
  )
}

function Ticker() {
  const ticker = useApp((s) => s.ticker)
  const a = useApp((s) => s.actions)
  return (
    <div className="ticker mt-2 min-h-10 border-t border-board-line px-1 pt-2 text-sm leading-relaxed text-board-muted" aria-hidden="true">
      {ticker.length === 0 && <span className="italic opacity-70">Words show up here as you go. Tap one to change its picture.</span>}
      {ticker.map((w) => (
        <span key={w.id} onClick={() => a.openWord(w.t)} title="Choose a picture for this word"
          className={cn("cursor-pointer hover:underline hover:decoration-dotted hover:underline-offset-4", w.hit && "hit font-medium", w.unsure && "unsure")}>
          {w.t}{" "}
        </span>
      ))}
    </div>
  )
}

function Controls() {
  const playing = useApp((s) => s.playing)
  const listening = useApp((s) => s.listening)
  const talk = useApp((s) => s.talk)
  const speed = useApp((s) => s.prefs.speed)
  const supported = useApp((s) => s.voice.supported)
  // while the start card shows, its Start button is the one main action
  const startShowing = useApp((s) => s.stage === "empty" && !s.talk)
  const a = useApp((s) => s.actions)
  return (
    <div className="mt-2 grid grid-cols-[auto_1fr] items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
      <div className="justify-self-start">
        <BoardButton label={listening ? "Stop listening (M)" : "Microphone (M)"} onClick={a.micToggle} pressed={listening} disabled={!supported}
          className={cn("size-10 rounded-full border border-white/20", listening && "border-live bg-live text-white hover:bg-live/90 aria-pressed:bg-live")}>
          {listening ? <Mic /> : <MicOff />}
        </BoardButton>
      </div>
      <div className="flex items-center gap-2 justify-self-center">
        <BoardButton label="Start over" onClick={a.restart} className="size-10"><RotateCcw /></BoardButton>
        <BoardButton label="Previous scene (←)" onClick={a.prevScene} className="size-10"><SkipBack /></BoardButton>
        {!talk && (
          <Button aria-label={playing ? "Pause (Space)" : "Play (Space)"} onClick={a.togglePlay} variant={startShowing ? "ghost" : "default"}
            className={cn("size-12 rounded-full", startShowing ? cn("border border-white/20", onBoard) : "bg-brand text-brand-foreground hover:bg-brand/90")}>
            {playing ? <Pause className="size-5 fill-current" /> : <Play className="size-5 translate-x-px fill-current" />}
          </Button>
        )}
        <BoardButton label="Next sentence (→)" onClick={a.nextSentence} className="size-10"><SkipForward /></BoardButton>
      </div>
      {!talk && (
        <ToggleGroup value={[String(speed)]} onValueChange={(v: string[]) => v[0] && a.setPref("speed", +v[0])} aria-label="Reading pace"
          className="col-span-2 justify-self-center rounded-lg border border-white/20 p-1 sm:col-span-1 sm:justify-self-end" spacing={0}>
          {PACES.map((p) => (
            <ToggleGroupItem key={p.wpm} value={String(p.wpm)} size="sm"
              className="h-6 rounded-sm px-3 text-xs font-medium text-board-muted hover:bg-white/10 hover:text-board-foreground data-[pressed]:bg-white/15 data-[pressed]:text-board-foreground">
              {p.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      )}
    </div>
  )
}

export function Board() {
  const stage = useApp((s) => s.stage)
  const talk = useApp((s) => s.talk)
  const listening = useApp((s) => s.listening)
  const fullscreen = useApp((s) => s.fullscreen)
  const prefs = useApp((s) => s.prefs)
  return (
    <section id="board" aria-label="Storyboard"
      className={cn("board relative flex min-h-[560px] flex-col rounded-xl bg-board px-4 pt-4 pb-4 text-board-foreground shadow-[var(--shadow-board)] sm:px-5",
        talk && "talking", listening && "mic-on", fullscreen && "is-fullscreen", !prefs.labels && "no-labels", prefs.calm && "calm",
        prefs.unsure && "show-unsure", !prefs.tickerOn && "no-ticker")}>
      <BoardHeader />
      <Dots />
      <div className="relative flex min-h-[340px] flex-1 items-center justify-center px-1 py-5">
        {stage === "empty" && (talk ? <TalkScreen /> : <StartCard />)}
        {stage === "hero" && <Hero />}
        {stage === "recap" && <Recap />}
      </div>
      <Filmstrip />
      {talk && <TalkBar />}
      <Ticker />
      <Controls />
    </section>
  )
}
