import * as React from "react"
import { Plus, Search, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { E, SUBJECTS, splitSentences, plural, useApp, type Lesson } from "@/app/store"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const FILTERS = [{ value: "All", label: "All subjects" }].concat(SUBJECTS.map((s) => ({ value: s, label: s })))

function LessonRow({ L, active, showSubject }: { L: Lesson; active: boolean; showSubject: boolean }) {
  const a = useApp((s) => s.actions)
  useApp((s) => s.omVersion)
  const icons = a.lessonIcons(L).map((k) => E.iconSVG(k)).join("")
  const n = splitSentences(L.text).length
  return (
    <div className="group relative">
      <button
        type="button"
        onClick={() => a.selectLesson(L)}
        aria-current={active ? "true" : undefined}
        className={cn(
          "press flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50",
          active && "bg-muted"
        )}
      >
        <span
          className="flex h-10 w-18 shrink-0 items-center justify-center gap-1 rounded-sm bg-paper ring-1 ring-black/5 [&_svg]:size-5"
          dangerouslySetInnerHTML={{ __html: icons }}
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{L.title}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {[showSubject && L.subject !== "My lessons" ? L.subject : "", L.subject === "My lessons" ? "Saved" : L.grade, plural(n, "scene", "scenes")].filter(Boolean).join(" · ")}
          </span>
        </span>
        {active && <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-foreground" aria-hidden="true" />}
      </button>
      {L.subject === "My lessons" && (
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={"Delete " + L.title}
          className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:text-destructive"
          onClick={() => a.deleteLesson(L)}
        >
          <Trash2 />
        </Button>
      )}
    </div>
  )
}

export function LessonList() {
  const filter = useApp((s) => s.filter)
  const query = useApp((s) => s.query)
  const lessonId = useApp((s) => s.lessonId)
  const mine = useApp((s) => s.mine)
  const a = useApp((s) => s.actions)
  const lessons = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return a.allLessons().filter((L) => (filter === "All" || L.subject === filter) && (!q || (L.title + " " + L.subject + " " + L.text).toLowerCase().includes(q)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, query, mine])
  const groups = React.useMemo(() => {
    if (filter !== "All" || query.trim()) return [{ subject: "", items: lessons }]
    return SUBJECTS.map((subject) => ({ subject, items: lessons.filter((L) => L.subject === subject) })).filter((g) => g.items.length)
  }, [lessons, filter, query])

  // a fixed height on wide screens, matching the board, so the list scrolls inside the card instead of spilling past it
  return (
    <aside className="flex min-h-0 flex-col overflow-hidden rounded-xl border bg-card lg:sticky lg:top-[4.5rem] lg:h-[calc(100svh-6.25rem)] lg:min-h-[560px]" aria-label="Lessons">
      <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-3">
        <h2 className="text-sm font-semibold">Lessons</h2>
        <Button size="sm" variant="outline" onClick={a.newLesson}><Plus />New lesson</Button>
      </div>
      <div className="flex gap-2 px-4 pb-4">
        <InputGroup className="flex-1">
          <InputGroupAddon><Search /></InputGroupAddon>
          <InputGroupInput id="lesson-search" placeholder="Search lessons" value={query} onChange={(e) => a.setQuery(e.target.value)} aria-label="Search lessons" />
        </InputGroup>
        <Select value={filter} onValueChange={(v) => a.setFilter(v as string)} items={FILTERS}>
          <SelectTrigger className="w-36" aria-label="Subject"><SelectValue /></SelectTrigger>
          <SelectContent>
            {FILTERS.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <ScrollArea className="min-h-0 flex-1 border-t">
        <div className="px-2 py-2">
          {!lessons.length && (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              {filter === "My lessons" ? "No saved lessons yet." : "No lessons match that search."}
            </p>
          )}
          {groups.map((g) => (
            <section key={g.subject || "all"} className="pb-1">
              {g.subject && <h3 className="px-2 pt-3 pb-1 text-xs font-medium text-muted-foreground">{g.subject}</h3>}
              {g.items.map((L) => <LessonRow key={L.id} L={L} active={L.id === lessonId} showSubject={!g.subject} />)}
            </section>
          ))}
        </div>
      </ScrollArea>
    </aside>
  )
}
