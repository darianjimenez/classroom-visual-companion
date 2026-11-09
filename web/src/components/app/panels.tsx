import * as React from "react"
import NumberFlow from "@number-flow/react"
import { Search, Sparkles, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { E, PACES, useApp } from "@/app/store"
import { Panel } from "@/components/app/panel"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Kbd } from "@/components/ui/kbd"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

function Section({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("flex flex-col gap-1", className)}>
      <h3 className="text-xs font-medium text-muted-foreground">{title}</h3>
      {children}
    </section>
  )
}

function ToggleRow({ id, label, hint, checked, onChange, disabled }: {
  id: string; label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-6 py-2.5">
      <div className="flex flex-col gap-0.5">
        <Label htmlFor={id} className="text-sm font-medium">{label}</Label>
        {hint && <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p>}
      </div>
      <Switch id={id} checked={checked} onCheckedChange={(v) => onChange(!!v)} disabled={disabled} className="mt-0.5" />
    </div>
  )
}

// ---------- script ----------
export function ScriptPanel() {
  const open = useApp((s) => s.panel === "script")
  const script = useApp((s) => s.script)
  const saveTitle = useApp((s) => s.saveTitle)
  const source = useApp((s) => s.source)
  const wc = useApp((s) => s.wordCount)
  const progress = useApp((s) => s.progress)
  const unsure = useApp((s) => s.unsureWords)
  const ai = useApp((s) => s.ai)
  const a = useApp((s) => s.actions)
  return (
    <Panel open={open} onClose={a.closePanel} title="Script" description="What you'll say. Short, plain sentences give the clearest pictures.">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Textarea
            autoFocus
            value={script}
            onChange={(e) => a.setScript(e.target.value)}
            aria-label="Lesson script"
            placeholder="Paste or type what you'll say. Name a topic, like “the water cycle”, to show its diagram."
            className="min-h-60 text-[15px] leading-relaxed"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className={cn("size-1.5 rounded-full", source.kind === "cur" ? "bg-[var(--sub-science)]" : source.kind === "ai" ? "bg-[var(--sub-math)]" : "bg-muted-foreground")} />
              {source.msg}
            </span>
            <span className="tabular">{wc.words} words · {wc.sentences} sentences</span>
          </div>
          {progress && <p className="text-xs text-muted-foreground">{progress}</p>}
        </div>

        {unsure.length > 0 && (
          <Section title="Words that need your help">
            <p className="mb-2 text-xs text-muted-foreground">These can mean different things, so they show no picture yet. Tap one to choose.</p>
            <div className="flex flex-wrap gap-1.5">
              {unsure.map((w) => (
                <Badge key={w} variant="outline" render={<button type="button" onClick={() => a.openWord(w)} />} className="cursor-pointer border-dashed">
                  {w}
                </Badge>
              ))}
            </div>
          </Section>
        )}

        {ai.available && (
          <Section title="Plan with Claude">
            <p className="mb-2 text-xs text-muted-foreground">Claude reads the whole lesson once and picks pictures by meaning. It uses your Claude account.</p>
            <div className="flex items-center justify-between gap-3">
              <Button variant="outline" onClick={a.planWithClaude} disabled={ai.planning}><Sparkles />{ai.planning ? "Planning…" : "Plan scenes"}</Button>
              <div className="flex items-center gap-2">
                <Label htmlFor="use-ai" className="text-sm">Use the plan</Label>
                <Switch id="use-ai" checked={ai.useAi} onCheckedChange={(v) => a.setUseAi(!!v)} />
              </div>
            </div>
            {ai.status && <p className="mt-2 text-xs text-muted-foreground">{ai.status}</p>}
          </Section>
        )}

        <Section title="Save for next time">
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); a.saveLesson() }}>
            <Input value={saveTitle} onChange={(e) => a.setSaveTitle(e.target.value)} placeholder="Lesson title" maxLength={60} aria-label="Lesson title" />
            <Button type="submit">Save</Button>
          </form>
          <p className="mt-1 text-xs text-muted-foreground">Saved on this device, under My lessons.</p>
        </Section>
      </div>
    </Panel>
  )
}

// ---------- settings ----------
const DRAW_MODES = [
  { value: "new", label: "Only when a new idea appears" },
  { value: "all", label: "For every sentence with something to show" },
]
const SHORTCUTS: [string, string][] = [
  ["Space", "Start or pause"], ["→", "Next sentence (a clicker works too)"], ["←", "Previous scene"], ["M", "Microphone on or off"],
  ["T", "Just talk"], ["R", "Every scene so far"], ["F", "Full screen"], ["?", "Guide"], ["⌘ K", "Search"],
]

export function SettingsPanel() {
  const open = useApp((s) => s.panel === "settings")
  const p = useApp((s) => s.prefs)
  const paceStat = useApp((s) => s.paceStat)
  const voice = useApp((s) => s.voice)
  const listening = useApp((s) => s.listening)
  const a = useApp((s) => s.actions)
  const set = (k: string) => (v: boolean) => a.setPref(k, v)
  const paceName = PACES.find((x) => x.wpm === p.speed)?.label
  return (
    <Panel open={open} onClose={a.closePanel} title="Settings" description="Remembered on this device.">
      <div className="flex flex-col gap-6">
        <Section title="Playback">
          <div className="flex flex-col gap-3 py-2.5">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Reading pace</Label>
              <span className="tabular text-sm text-muted-foreground"><NumberFlow value={p.speed} /> words a minute{paceName ? " · " + paceName : ""}</span>
            </div>
            <Slider min={60} max={220} step={10} value={p.speed} onValueChange={(v) => a.setPref("speed", Array.isArray(v) ? v[0] : v)} aria-label="Words per minute" />
          </div>
          <ToggleRow id="pause-each" label="Pause after each sentence" hint="Press Play or → to go on, so you can talk about each picture." checked={p.pauseEach} onChange={set("pauseEach")} />
        </Section>
        <Separator />
        <Section title="Keep it calm">
          <ToggleRow id="calm" label="Calm mode" hint="No motion, and pictures stay up longer." checked={p.calm} onChange={set("calm")} />
          <div className="flex flex-col gap-2 py-2.5">
            <Label className="text-sm font-medium">Draw a picture</Label>
            <Select value={p.drawMode} onValueChange={(v) => a.setPref("drawMode", v)} items={DRAW_MODES}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>{DRAW_MODES.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
            </Select>
            <p className="tabular text-xs text-muted-foreground"><NumberFlow value={paceStat} /> {paceStat === 1 ? "picture" : "pictures"} in the last minute</p>
          </div>
        </Section>
        <Separator />
        <Section title="On the board">
          <ToggleRow id="labels" label="Word labels on pictures" hint="Turn off to let students name things themselves." checked={p.labels} onChange={set("labels")} />
          <ToggleRow id="ticker" label="Spoken words under the board" hint="Tap any of them to change its picture." checked={p.tickerOn} onChange={set("tickerOn")} />
          <ToggleRow id="unsure" label="Underline words that need your help" hint="Words with no picture because they could mean different things." checked={p.unsure} onChange={set("unsure")} />
          <ToggleRow id="recap" label="Show every scene when a lesson ends" checked={p.autoRecap} onChange={set("autoRecap")} />
        </Section>
        <Separator />
        <Section title="Live voice">
          <ToggleRow id="follow" label="Follow the lesson script" hint="With a script loaded, the microphone follows along as you read it. Turn off to always use Just talk." checked={p.follow} onChange={set("follow")} />
          <div className="flex items-center gap-3 py-2">
            <Button variant="outline" onClick={a.voiceButton} disabled={!voice.supported}>{listening ? "Stop listening" : "Start listening"}</Button>
            {voice.interim && <span className="truncate text-xs text-muted-foreground italic">{voice.interim}</span>}
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">{voice.status}</p>
          <details className="mt-2 text-xs">
            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">Voice diagnostics</summary>
            <pre className="mt-2 max-h-40 overflow-auto rounded-md bg-muted p-2 font-mono text-[11px] whitespace-pre-wrap">{voice.log.join("\n") || "Nothing yet."}</pre>
          </details>
        </Section>
        <Separator />
        <Section title="Keyboard shortcuts">
          <dl className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2 pt-1 text-sm">
            {SHORTCUTS.map(([k, v]) => (
              <React.Fragment key={k}><dt><Kbd>{k}</Kbd></dt><dd className="text-muted-foreground">{v}</dd></React.Fragment>
            ))}
          </dl>
        </Section>
      </div>
    </Panel>
  )
}

// ---------- pictures ----------
function DiagramGrid() {
  const a = useApp((s) => s.actions)
  const [q, setQ] = React.useState("")
  const all = React.useMemo(() => E.diagramGallery() as { key: string; title: string; say: string[]; svg: string }[], [])
  const shown = all.filter((g) => !q || (g.title + " " + g.say.join(" ")).toLowerCase().includes(q.toLowerCase()))
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground">Name a topic while you teach and its diagram appears, with the part you mention highlighted. Tap one to show it now.</p>
      <InputGroup>
        <InputGroupAddon><Search /></InputGroupAddon>
        <InputGroupInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search diagrams, like cell or fractions" aria-label="Search diagrams" />
      </InputGroup>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {shown.map((g) => (
          <button key={g.key} type="button" onClick={() => a.showDiagram(g.key, g.title)} aria-label={"Show " + g.title + " on the board"}
            className="press group rounded-lg border bg-card p-1.5 text-left outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50">
            <div className="overflow-hidden rounded-md" dangerouslySetInnerHTML={{ __html: g.svg }} />
            <p className="mt-1.5 px-0.5 text-xs font-medium">{g.title}</p>
            <p className="truncate px-0.5 text-[11px] text-muted-foreground">Say “{g.say[0]}”</p>
          </button>
        ))}
      </div>
    </div>
  )
}

function DrawingGrid() {
  const [q, setQ] = React.useState("")
  const all = React.useMemo(() => E.iconGallery() as { key: string; name: string; words: string[]; svg: string }[], [])
  const shown = all.filter((g) => !q || (g.key + " " + g.words.join(" ")).toLowerCase().includes(q.toLowerCase()))
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground">{E.iconCount} drawings, about {Math.round(E.wordCount / 50) * 50} words. Emoji artwork by <a href="credits.html" target="_blank" rel="noopener" className="underline underline-offset-2">OpenMoji</a> (CC BY-SA 4.0).</p>
      <InputGroup>
        <InputGroupAddon><Search /></InputGroupAddon>
        <InputGroupInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search drawings, like rocket or vote" aria-label="Search drawings" />
      </InputGroup>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(76px,1fr))] gap-2">
        {shown.map((g) => (
          <figure key={g.key} title={g.words.join(", ")} className="m-0 rounded-lg bg-paper px-1 pt-2 pb-1.5 text-center">
            <div className="mx-auto size-11 [&_svg]:size-11" dangerouslySetInnerHTML={{ __html: g.svg }} />
            <figcaption className="mt-1 truncate text-[11px] text-neutral-600">{g.name}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  )
}

function WordList() {
  const extra = useApp((s) => s.extra)
  const a = useApp((s) => s.actions)
  const [word, setWord] = React.useState("")
  const [emoji, setEmoji] = React.useState("")
  const keys = Object.keys(extra).sort()
  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-muted-foreground">Words you've given a picture, or turned off. You can also tap any word under the board while a lesson plays.</p>
      <div className="flex flex-wrap gap-1.5">
        {keys.map((k) => {
          const v = extra[k]
          const icon = v.charAt(0) === "@" ? E.iconSVG(v.slice(1)) : ""
          return (
            <Badge key={k} variant="secondary" className="gap-1.5 py-1 pr-1 pl-2 text-[13px]">
              {v === "-" ? <span className="text-muted-foreground">off</span> : icon ? <span className="size-4 [&_svg]:size-4" dangerouslySetInnerHTML={{ __html: icon }} /> : <span>{v}</span>}
              {k}
              <button type="button" aria-label={"Remove " + k} onClick={() => a.removeWord(k)} className="rounded-sm p-0.5 text-muted-foreground hover:bg-background hover:text-foreground"><X className="size-3" /></button>
            </Badge>
          )
        })}
      </div>
      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (a.addWord(word, emoji)) { setWord(""); setEmoji("") } }}>
        <Input value={word} onChange={(e) => setWord(e.target.value)} placeholder="Word" maxLength={24} aria-label="Word" className="flex-[2]" />
        <Input value={emoji} onChange={(e) => setEmoji(e.target.value)} placeholder="Emoji" maxLength={4} aria-label="Emoji" className="flex-1 text-center" />
        <Button type="submit" variant="outline">Add</Button>
      </form>
      <Button variant="link" className="h-auto self-start p-0 text-xs text-muted-foreground" onClick={a.resetWords}>Reset word pictures</Button>
    </div>
  )
}

export function PicturesPanel() {
  const open = useApp((s) => s.panel === "pictures")
  const a = useApp((s) => s.actions)
  return (
    <Panel open={open} onClose={a.closePanel} title="Pictures" wide>
      <Tabs defaultValue="diagrams" className="gap-4">
        <TabsList className="w-full">
          <TabsTrigger value="diagrams">Diagrams</TabsTrigger>
          <TabsTrigger value="drawings">Drawings</TabsTrigger>
          <TabsTrigger value="words">My words</TabsTrigger>
        </TabsList>
        <TabsContent value="diagrams"><DiagramGrid /></TabsContent>
        <TabsContent value="drawings"><DrawingGrid /></TabsContent>
        <TabsContent value="words"><WordList /></TabsContent>
      </Tabs>
    </Panel>
  )
}
