// The app's store, driven the way a teacher drives it: a lesson stepped and played, a custom script, Just talk, saved lessons,
// word pictures and settings. What the board shows after each step is compared with the saved snapshot, so a change to the
// store's behaviour fails here. Runs in Node with a small stand-in browser and the test runner's clock.
import { test, mock } from "node:test"
import assert from "node:assert/strict"
import { readFileSync, writeFileSync, existsSync } from "node:fs"
import { svgHash } from "./engine.js"

// ---------- a browser just big enough for the store ----------
const storage = new Map()
globalThis.window = globalThis
globalThis.localStorage = { getItem: (k) => (storage.has(k) ? storage.get(k) : null), setItem: (k, v) => storage.set(k, String(v)), removeItem: (k) => storage.delete(k) }
globalThis.matchMedia = () => ({ matches: false })
const el = () => ({ setAttribute() {}, appendChild() {}, style: {}, styleSheet: null })
globalThis.document = { addEventListener() {}, getElementById() { return null }, fullscreenElement: null, head: el(),
  getElementsByTagName: () => [el()], createElement: el, createTextNode: () => ({}) }
const PUBLIC = new URL("../public/", import.meta.url)
globalThis.fetch = async (url) => {
  const file = String(url).replace(/^\.\//, "")
  const u = new URL(file, PUBLIC)
  return existsSync(u) ? { ok: true, json: async () => JSON.parse(readFileSync(u, "utf8")) } : { ok: false }
}
// the test runner's clock: timers only move when the test moves them
mock.timers.enable({ apis: ["setTimeout", "setInterval", "Date"], now: 1_700_000_000_000 })

const { useApp } = await import("../src/app/store/index.ts")
const a = () => useApp.getState().actions
const S = () => useApp.getState()
const settle = async () => { for (let i = 0; i < 5; i++) await new Promise((r) => setImmediate(r)) }

// what a teacher would see: the board, its scenes, the progress dots, the spoken-word line, and the status line in Just talk
function board() {
  const s = S()
  return {
    stage: s.stage, heading: s.heading, count: s.count, progress: s.progress, playing: s.playing, talk: s.talk,
    viewing: s.viewing, revealAt: s.revealAt === Infinity ? "all" : s.revealAt, heroMode: s.heroMode,
    frames: s.frames.map((f) => [f.n, f.si, f.done, f.scene.words ? "words: " + f.scene.words.say : f.scene.diagram ? "diagram: " + f.scene.diagram : f.scene.caption, svgHash(f.svg)]),
    dots: s.dots.map((d) => (d.done ? "d" : "-") + (d.current ? "c" : "") + (d.hasScene ? "s" : "")).join(" "),
    ticker: s.ticker.map((w) => w.t + (w.hit ? "*" : "")).join(" "),
    live: s.live, recap: s.recapOpen ? s.recap : null, start: s.start, source: s.source,
  }
}

const FILE = new URL("./snapshots/store.json", import.meta.url)
const UPDATE = process.env.UPDATE_SNAPSHOTS === "1"
const saved = existsSync(FILE) ? JSON.parse(readFileSync(FILE, "utf8")) : {}
const next = {}
function check(key, value) {
  next[key] = JSON.parse(JSON.stringify(value))
  if (!UPDATE) assert.deepEqual(next[key], saved[key], key)
}

test("opening the app: the first lesson is ready", async () => {
  a().init()
  await settle()
  check("open", board())
})

test("a lesson, one sentence at a time, then the storyboard", () => {
  for (let i = 1; i <= 3; i++) { a().nextSentence(); check("step " + i, board()) }
  while (!S().count || !S().count.done) a().nextSentence()
  check("lesson done", board())
  mock.timers.tick(2300)   // the storyboard opens by itself a moment after the end
  check("storyboard", board())
  a().prevScene(); a().prevScene()
  check("looking back", board())
})

test("a lesson played: the pictures build up word by word", () => {
  a().restart()
  a().play()
  mock.timers.tick(Math.ceil(60000 / 130) * 6)
  check("playing, six words in", board())
  mock.timers.tick(Math.ceil(60000 / 130) * 20)
  check("playing, more words", board())
  a().pause()
  check("paused", board())
})

test("a custom script: repeats become words, nothing is skipped", () => {
  a().setScript("Everything around you is made of matter, and matter is made of atoms. An atom has a nucleus with protons and neutrons, surrounded by electrons. " +
    "Isotopes are atoms of the same element with different numbers of neutrons. Valence electrons are the electrons in the outermost shell. " +
    "Metals tend to lose electrons and form positive ions. Nonmetals tend to gain electrons and form negative ions. Great job, that's exactly right. " +
    "A hypothesis is an educated guess about what will happen.")
  while (!S().count || !S().count.done) a().nextSentence()
  check("custom script", board())
  a().setPref("drawMode", "all")
  a().restart()
  while (!S().count || !S().count.done) a().nextSentence()
  check("custom script, every sentence", board())
  a().setPref("drawMode", "new")
})

test("Just talk, typed: pictures, word cards, the slideshow", () => {
  a().enterTalk()
  check("talk open", board())
  a().sayTyped("Virginia and Massachusetts were two of the first colonies.")
  check("talk 1", board())
  a().sayTyped("A hypothesis is an educated guess about what will happen. The heart has four chambers: two atria and two ventricles.")
  check("talk 2, waiting their turn", board())
  mock.timers.tick(6000)
  check("talk 2, next shown", board())
  a().sayTyped("Great job, that's exactly right.")
  a().sayTyped("Electrons move around the nucleus of an atom.")
  a().sayTyped("Metals tend to lose electrons and form positive ions.")
  a().finishTalk()
  check("talk finished", board())
  check("talk transcript", S().lastTalk)
  a().recapSave()
  check("talk saved as a script", { script: S().script, panel: S().panel })
})

test("lessons: save, find, delete", () => {
  a().setSaveTitle("Atoms review")
  a().saveLesson()
  check("saved", { mine: S().mine.map((L) => [L.id, L.title, L.subject]), filter: S().filter, lessonId: S().lessonId, heading: S().heading, stored: localStorage.getItem("cvc-my-lessons-v1") })
  a().deleteLesson(S().mine[0])
  check("deleted", { mine: S().mine.length, lessonId: S().lessonId, heading: S().heading })
})

test("word pictures: what a word shows, and changing it", () => {
  const kinds = {}
  for (const w of ["dog", "volcano", "pour", "virginia", "kangaroo", "zzyzx", "bat"]) { a().openWord(w); kinds[w] = S().wordDialog.now }
  check("word dialog", kinds)
  a().setWordPicture("kangaroo", "🦘")
  a().openWord("kangaroo")
  check("own picture", { now: S().wordDialog.now, overridden: S().wordDialog.overridden, extra: S().extra.kangaroo })
  a().removeWord("kangaroo")
  a().resetWords()
  check("words reset", S().extra)
})

test("settings are remembered on this device", () => {
  a().setPref("speed", 170)
  a().setPref("calm", true)
  check("prefs", { prefs: S().prefs, stored: JSON.parse(localStorage.getItem("cvc-prefs-v2")) })
  a().setPref("calm", false)
  a().setPref("speed", 130)
})

test("no microphone in this browser: Just talk says so", () => {
  a().showLessons()
  a().micToggle()
  check("mic without speech recognition", { talk: S().talk, live: S().live, voice: S().voice.status, talkBig: S().talkBig })
  a().talkOrb()
  check("talk orb", S().live)
  a().showLessons()
})

test("snapshot file", { skip: !UPDATE && "only written with UPDATE_SNAPSHOTS=1" }, () => {
  writeFileSync(FILE, JSON.stringify(next, null, 1) + "\n")
})
