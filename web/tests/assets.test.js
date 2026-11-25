// Every picture file the engine can ask for exists, every emoji it names is in the OpenMoji bundle, and every diagram from
// Wikimedia Commons is credited. A missing file shows nothing in class, with no error anyone would see.
import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync, readdirSync, existsSync } from "node:fs"
import { loadEngine } from "./engine.js"

const PUBLIC = new URL("../public/", import.meta.url)
// plain flags OpenMoji draws only in other forms; they show as the device's own emoji
const KNOWN_MISSING = new Set(["🏴‍☠️", "🏳️", "🚩", "🏴", "🏁"])
const html = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;")

test("symbol files: every word and phrase points at a file, and every file is used", () => {
  const { E } = loadEngine()
  const table = E.symbolTable()
  const named = new Set([...Object.values(table.words), ...Object.values(table.phrases)])
  const files = new Set(readdirSync(new URL("symbols/", PUBLIC)).map((f) => f.replace(/\.svg$/, "")))
  const missing = [...named].filter((s) => !files.has(s))
  const unused = [...files].filter((s) => !named.has(s))
  assert.deepEqual(missing, [], "symbol files missing")
  assert.deepEqual(unused, [], "symbol files nothing uses")
})

test("diagram files: every diagram drawn from a file has its file and its credit", () => {
  const { E } = loadEngine()
  const credits = readFileSync(new URL("credits.html", PUBLIC), "utf8")
  for (const d of E.imageDiagrams()) {
    assert.ok(existsSync(new URL("diagrams/" + d.file, PUBLIC)), "missing diagrams/" + d.file)
    assert.ok(credits.includes(">" + html(d.title) + "<"), "no credit for " + d.title)
  }
})

test("emoji: every emoji the engine can show is in the OpenMoji bundle", () => {
  const { E } = loadEngine()
  const bundle = JSON.parse(readFileSync(new URL("openmoji-bundle.json", PUBLIC), "utf8"))
  const missing = [...E.emojiList()].filter((e) => !bundle[e.replace(/\uFE0F/g, "")])
  assert.deepEqual(missing.filter((e) => !KNOWN_MISSING.has(e)), [], "emoji missing from the OpenMoji bundle")
})
