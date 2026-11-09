import * as React from "react"
import { BookOpen, CircleHelp, Images, Maximize, Mic, Play, Plus, SlidersHorizontal, StepForward } from "lucide-react"
import { E, useApp } from "@/app/store"
import { Button } from "@/components/ui/button"
import {
  Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut,
} from "@/components/ui/command"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Kbd } from "@/components/ui/kbd"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// ---------- guide ----------
const WAYS = [
  { how: "talk", title: "Just talk", body: "No script and no setup. Turn on the microphone and teach as you normally would. Each idea becomes a picture, and at the end you get a slideshow you can replay or save. No microphone? Type sentences or tap the examples." },
  { how: "play", title: "Play a ready lesson", body: "Pick one of 25 lessons in science, history, math, reading and health, then press Start. It reads at the pace you choose." },
  { how: "step", title: "One sentence at a time", body: "Each press of → (or a presentation clicker) shows the next picture, so you can stop and talk about each one." },
  { how: "read", title: "Read it aloud", body: "Read your script to the class. The microphone follows where you are, even if you slow down or skip a line." },
]
const KEYS: [string, string][] = [["Space", "Start or pause"], ["→  ←", "Next sentence, previous scene"], ["T", "Just talk"], ["M", "Microphone"], ["R", "Every scene so far"], ["F", "Full screen"], ["⌘ K", "Search"]]

export function GuideDialog() {
  const open = useApp((s) => s.guideOpen)
  const a = useApp((s) => s.actions)
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) a.closeGuide() }}>
      <DialogContent className="max-h-[88svh] gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b px-6 pt-6 pb-4">
          <DialogTitle className="text-lg">How Visual Companion works</DialogTitle>
          <DialogDescription>It puts a simple picture of each idea on the board as you teach, so students can see what they hear.</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="ways" className="min-h-0 gap-0">
          <TabsList variant="line" className="w-full justify-start gap-2 border-b px-6">
            <TabsTrigger value="ways">Ways to use it</TabsTrigger>
            <TabsTrigger value="pictures">Pictures</TabsTrigger>
            <TabsTrigger value="class">In class</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
          </TabsList>
          <div className="max-h-[58svh] overflow-y-auto px-6 py-6 text-sm leading-relaxed">
            <TabsContent value="ways" className="flex flex-col gap-3">
              {WAYS.map((w) => (
                <div key={w.how} className="flex items-start justify-between gap-4 rounded-lg border p-4">
                  <div>
                    <p className="font-medium">{w.title}</p>
                    <p className="mt-1 text-muted-foreground">{w.body}</p>
                  </div>
                  <Button size="sm" variant={w.how === "talk" ? "default" : "outline"} className="shrink-0" onClick={() => a.tryWay(w.how)}>Try it</Button>
                </div>
              ))}
              <p className="text-muted-foreground">To use your own script, press New lesson in the lesson list and paste what you'll say.</p>
            </TabsContent>
            <TabsContent value="pictures" className="flex flex-col gap-3 text-muted-foreground">
              <p><span className="font-medium text-foreground">One idea per picture.</span> Each sentence is read for its main things and how they connect, so “the sun heats the ocean” shows a sun, an arrow and the ocean.</p>
              <p><span className="font-medium text-foreground">Diagrams for whole topics.</span> Say “the water cycle”, “parts of a plant” or “a story mountain” and a labelled diagram appears, with the part you mention highlighted. There are {E.diagramCount}; browse them under Pictures.</p>
              <p><span className="font-medium text-foreground">No guessing.</span> Words that can mean different things, like “bank”, get no picture rather than a wrong one, and small talk shows nothing.</p>
              <p><span className="font-medium text-foreground">Fix a picture in one tap.</span> Tap any word under the board to choose a drawing, an emoji, or none. Your choice is remembered.</p>
            </TabsContent>
            <TabsContent value="class" className="flex flex-col gap-3 text-muted-foreground">
              <p><span className="font-medium text-foreground">Project it.</span> Press F for full screen; pictures and captions scale up for the back of the room.</p>
              <p><span className="font-medium text-foreground">Short, concrete sentences work best.</span> “Plants need sunlight” gives a clearer picture than a long sentence with asides.</p>
              <p><span className="font-medium text-foreground">It stays calm by default.</span> A picture is only drawn when a new idea appears, and live pictures stay up a few seconds each. Calm mode in Settings removes motion too.</p>
              <p><span className="font-medium text-foreground">Review at the end.</span> Every scene is laid out when a lesson finishes; tap any one to go back to it.</p>
              <div className="mt-1 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 rounded-lg border p-4">
                {KEYS.map(([k, v]) => <React.Fragment key={k}><Kbd>{k}</Kbd><span>{v}</span></React.Fragment>)}
              </div>
            </TabsContent>
            <TabsContent value="privacy" className="flex flex-col gap-3 text-muted-foreground">
              <p><span className="font-medium text-foreground">Nothing to sign up for.</span> Lessons, settings and word pictures are saved only in this browser. The app doesn't record or store anything you say.</p>
              <p><span className="font-medium text-foreground">Speech-to-text is done by your browser.</span> In Chrome, microphone audio is sent to Google's speech service to turn it into text. If that isn't allowed at your school, use the lessons, one sentence at a time, or typing in Just talk.</p>
              <p><span className="font-medium text-foreground">Browsers.</span> Live voice needs Chrome or Edge on a computer. Everything else works in any modern browser, and offline after your first visit.</p>
              <p>This is an early version for testing. If something looks wrong, tell the person who sent you the link.</p>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

// cmdk's default matching is fuzzy ("steam" finds "people"); teachers expect plain words, best matches first
function wordFilter(value: string, search: string) {
  const v = value.toLowerCase(), words = search.toLowerCase().trim().split(/\s+/).filter(Boolean)
  if (!words.length) return 1
  if (!words.every((w) => v.includes(w))) return 0
  return v.startsWith(words[0]) ? 1 : v.includes(" " + words[0]) ? 0.8 : 0.5
}

// ---------- choose a picture for a word ----------
const isEmoji = (s: string) => /\p{Extended_Pictographic}/u.test(s)

export function WordDialog() {
  const d = useApp((s) => s.wordDialog)
  const a = useApp((s) => s.actions)
  return (
    <CommandDialog open={d.open} onOpenChange={(o) => { if (!o) a.closeWord() }} title={"Picture for “" + d.word + "”"} description="Search the drawings, or paste an emoji.">
      {/* keyed by the word, so the search starts empty for each new word */}
      <WordPicker key={d.word} />
    </CommandDialog>
  )
}

function WordPicker() {
  const d = useApp((s) => s.wordDialog)
  const a = useApp((s) => s.actions)
  const [q, setQ] = React.useState("")
  const gallery = React.useMemo(() => E.iconGallery() as { key: string; name: string; words: string[]; svg: string }[], [])
  const emoji = isEmoji(q) ? q.trim() : ""
  return (
    <Command filter={wordFilter}>
      <div className="flex items-center gap-2 border-b px-4 py-3 text-sm">
        <span className="font-medium">“{d.word}”</span>
        <span className="flex items-center gap-2 text-muted-foreground">
          {d.now?.kind === "icon" && <span className="size-5 [&_svg]:size-5" dangerouslySetInnerHTML={{ __html: E.iconSVG(d.now.icon) }} />}
          {d.now?.kind === "emoji" && <span className="text-base">{d.now.emoji}</span>}
          {d.now?.text}
        </span>
      </div>
      <CommandInput value={q} onValueChange={setQ} placeholder="Search drawings, or paste an emoji" />
      <CommandList className="max-h-[360px]">
        <CommandEmpty>No drawing matches. Paste an emoji to use one instead.</CommandEmpty>
        {emoji && (
          <CommandGroup heading="Emoji">
            <CommandItem value={"emoji " + q} onSelect={() => a.setWordPicture(d.word, emoji)}><span className="text-base">{emoji}</span>Use this emoji</CommandItem>
          </CommandGroup>
        )}
        <CommandGroup heading="Options">
          <CommandItem value="no picture none off" onSelect={() => a.setWordPicture(d.word, "-")}>No picture for this word</CommandItem>
          {d.overridden && <CommandItem value="back to automatic reset" onSelect={() => a.setWordPicture(d.word, null)}>Back to automatic</CommandItem>}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Drawings">
          {gallery.map((g) => (
            <CommandItem key={g.key} value={g.name + " " + g.key + " " + g.words.join(" ")} onSelect={() => a.setWordPicture(d.word, "@" + g.key)}>
              <span className="size-6 shrink-0 [&_svg]:size-6" dangerouslySetInnerHTML={{ __html: g.svg }} />
              {g.name}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}

// ---------- search everything (⌘K) ----------
export function CommandMenu() {
  const open = useApp((s) => s.commandOpen)
  const playing = useApp((s) => s.playing)
  const a = useApp((s) => s.actions)
  const lessons = open ? a.allLessons() : []
  const diagrams = React.useMemo(() => (open ? (E.diagramGallery() as { key: string; title: string; say: string[] }[]) : []), [open])
  const run = (fn: () => void) => () => { a.setCommandOpen(false); fn() }
  return (
    <CommandDialog open={open} onOpenChange={a.setCommandOpen} title="Search" description="Lessons, diagrams and actions">
      <Command filter={wordFilter}>
        <CommandInput placeholder="Search lessons, diagrams and actions" />
        <CommandList className="max-h-[420px]">
          <CommandEmpty>Nothing found.</CommandEmpty>
          <CommandGroup heading="Actions">
            <CommandItem onSelect={run(a.togglePlay)}><Play />{playing ? "Pause" : "Start the lesson"}<CommandShortcut>Space</CommandShortcut></CommandItem>
            <CommandItem onSelect={run(a.nextSentence)}><StepForward />Next sentence<CommandShortcut>→</CommandShortcut></CommandItem>
            <CommandItem onSelect={run(a.enterTalk)}><Mic />Just talk<CommandShortcut>T</CommandShortcut></CommandItem>
            <CommandItem onSelect={run(a.newLesson)}><Plus />New lesson</CommandItem>
            <CommandItem onSelect={run(a.toggleFullscreen)}><Maximize />Full screen<CommandShortcut>F</CommandShortcut></CommandItem>
            <CommandItem onSelect={run(() => a.openPanel("pictures"))}><Images />Pictures and diagrams</CommandItem>
            <CommandItem onSelect={run(() => a.openPanel("settings"))}><SlidersHorizontal />Settings</CommandItem>
            <CommandItem onSelect={run(a.openGuide)}><CircleHelp />Guide<CommandShortcut>?</CommandShortcut></CommandItem>
          </CommandGroup>
          <CommandGroup heading="Lessons">
            {lessons.map((L) => (
              <CommandItem key={L.id} value={"lesson " + L.title + " " + L.subject} onSelect={run(() => a.selectLesson(L))}>
                <BookOpen />{L.title}<span className="ml-auto text-xs text-muted-foreground">{L.subject}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Show a diagram">
            {diagrams.map((g) => (
              <CommandItem key={g.key} value={"diagram " + g.title + " " + g.say.join(" ")} onSelect={run(() => a.showDiagram(g.key, g.title))}>
                <Images />{g.title}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
