// Every scene the engine makes for the built-in lessons, the lecture set and the hard-to-picture talk, compared with the saved
// snapshot: any change to what a sentence shows, or to how a picture or diagram is drawn, fails here until it is looked at.
// After a change you mean to make: npm run test:update, then read the snapshot's diff before committing it.
import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync, writeFileSync, existsSync } from "node:fs"
import { loadEngine, splitSentences, describe, svgHash, lessonScene, replayLive } from "./engine.js"
import { LECTURES } from "./fixtures/lectures.js"
import { IDEAS, SPOKEN, LIVE } from "./fixtures/talk.js"

const FILE = new URL("./snapshots/scenes.json", import.meta.url)
const UPDATE = process.env.UPDATE_SNAPSHOTS === "1"
const saved = existsSync(FILE) ? JSON.parse(readFileSync(FILE, "utf8")) : {}
const next = {}

function check(group, key, value) {
  next[group] = next[group] || {}
  next[group][key] = value
  if (!UPDATE) assert.deepEqual(value, saved[group] && saved[group][key], group + ": " + key)
}

test("lesson library: tuned scenes and the rule reader", () => {
  const { E, LESSONS } = loadEngine()
  for (const L of LESSONS) {
    splitSentences(L.text).forEach((s, i) => {
      const plan = L.plan && L.plan[i + 1]
      const tuned = plan ? (plan.diagram ? null : E.diagramScene(s)) || E.sceneFromAI(plan, s, {}) : null
      const rule = lessonScene(E, s)
      check("lessons", L.id + " " + (i + 1), { tuned: tuned ? describe(tuned) : null, rule: describe(rule), svg: svgHash(E.renderScene(rule)) })
    })
  }
})

test("lecture set, elementary to high school", () => {
  const { E } = loadEngine()
  for (const [title, text] of Object.entries(LECTURES)) {
    splitSentences(text).forEach((s, i) => {
      const sc = lessonScene(E, s)
      check("lectures", title + " " + (i + 1), { text: s, scene: describe(sc), svg: svgHash(E.renderScene(sc)) })
    })
  }
})

test("hard-to-picture talk: word cards typed and spoken", () => {
  const { E } = loadEngine()
  for (const s of IDEAS) check("ideas", s, { scene: describe(lessonScene(E, s)), card: describe(E.wordScene(s)) })
  for (const s of SPOKEN) check("spoken", s, { lesson: describe(E.wordScene(s)), live: describe(E.wordScene(s, { live: true })) })
})

test("live talk replay: joining, look-ahead and context", () => {
  const { E } = loadEngine()
  LIVE.forEach((pieces) => check("live", pieces.join(" / "), replayLive(E, pieces)))
})

test("every drawing and diagram, drawn", () => {
  const { E } = loadEngine()
  E.setOpenMoji(JSON.parse(readFileSync(new URL("../public/openmoji-bundle.json", import.meta.url), "utf8")))
  for (const g of E.iconGallery()) check("drawings", g.key, svgHash(g.svg))
  for (const d of E.diagramGallery()) check("diagrams", d.key, svgHash(d.svg))
  check("counts", "all", { drawings: E.iconCount, emoji: E.emojiCount, symbols: E.symbolCount, diagrams: E.diagramCount, words: E.wordCount })
})

test("snapshot file", { skip: !UPDATE && "only written with UPDATE_SNAPSHOTS=1" }, () => {
  // tests run in order in this file, so every group above has been filled in by now
  writeFileSync(FILE, JSON.stringify(next, null, 1) + "\n")
})
