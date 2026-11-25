// npm run pictures:build: rebuilds every generated picture file from the sources downloaded by `npm run pictures:fetch`
// (kept in tools/pictures/.cache, not in git). It works offline and writes:
//   src/engine/data/symbols.js         words and phrases → Mulberry symbol and state-map files
//   src/engine/data/openmoji-words.js  words and phrases for OpenMoji pictures the drawings don't cover
//   src/engine/data/image-diagrams.js  the diagrams kept as files
//   public/symbols/, public/diagrams/  the picture files themselves
//   public/credits.html                every source, author and licence
// The choices made by hand are in review.js and diagrams.js. After a build, `npm test` shows what changed in class.
import { readFileSync, writeFileSync, readdirSync, rmSync, mkdirSync, copyFileSync, existsSync, statSync } from "node:fs"
import { DIAGRAMS } from "./diagrams.js"
import * as R from "./review.js"
import { drawStates } from "./states.mjs"
import { cacheName } from "./build-names.mjs"

const TOOLS = new URL("./", import.meta.url), CACHE = new URL("./.cache/", import.meta.url)
const WEB = new URL("../../", import.meta.url), DATA = new URL("src/engine/data/", WEB), PUBLIC = new URL("public/", WEB)
const need = (rel) => { const u = new URL(rel, CACHE); if (!existsSync(u)) throw new Error("missing " + rel + ": run npm run pictures:fetch"); return u }

// ---------- the engine as it is without the generated data, to see what the drawings and emoji already cover ----------
const DATA_FILES = ["symbols.js", "openmoji-words.js", "image-diagrams.js"]
const saved = Object.fromEntries(DATA_FILES.map((f) => [f, readFileSync(new URL(f, DATA), "utf8")]))
writeFileSync(new URL("symbols.js", DATA), "export const PICTURE_SYMBOLS = { words: {}, phrases: {} }\n")
writeFileSync(new URL("openmoji-words.js", DATA), "export const OPENMOJI_WORDS = {}\nexport const OPENMOJI_PHRASES = {}\n")
writeFileSync(new URL("image-diagrams.js", DATA), "export const IMAGE_DIAGRAM_LIST = []\n")
try {
  await build()
} catch (e) {
  for (const f of DATA_FILES) writeFileSync(new URL(f, DATA), saved[f])
  throw e
}

async function build() {
  const { SceneEngine: E } = await import("../../src/engine/index.js")
  const { NEVER, EMOJI_LIB_SRC } = await import("../../src/engine/vocabulary.js")
  const { LOOSE } = await import("../../src/engine/lookup.js")
  const { PHRASE_SRC } = await import("../../src/engine/phrases.js")
  const handPhrases = new Set(PHRASE_SRC.split(";").map((r) => r.split("|")[0].trim()))

  // ---------- Mulberry Symbols: one symbol per concept, named the way a teacher would say it ----------
  const rows = parseCsv(readFileSync(need("mulberry/symbol-info.csv"), "utf8")).filter((r) => r.rated === "0")
  const skipCats = new Set(R.SKIP_CATS), skipNames = new Set(R.SKIP_NAMES)
  const cands = new Map()
  const add = (text, row, prio, kind) => {
    text = text.trim().toLowerCase().replace(/\s+/g, " ")
    if (!text) return
    const old = cands.get(text)
    if (!old || prio < old.prio) cands.set(text, { prio, row, kind })
  }
  for (const r of rows) {
    const n = r["symbol-en"], cat = r["category-en"]
    if (skipCats.has(cat) || skipNames.has(n)) continue
    const verb = n.includes(",_to") || r.grammar === "Verb" || r.grammar === "VerbComplex"
    let base = n.replace(",_to", "").replace(/^_+|_+$/g, ""), prio = 0
    const m = base.match(/^(.*?)_(\d+)([ab]?)$/)   // variants "_1a", "_2b": the plainest one wins
    if (m) { base = m[1]; prio = +m[2] * 2 + (m[3] === "b" ? 1 : 0) }
    if (cat === "People Feelings") {
      const m2 = base.match(/^(.*)_(lady|man)$/)
      if (m2) add(m2[1].replace(/_/g, " "), r, m2[2] === "lady" ? 0 : 1, "feeling")
      continue
    }
    if (cat === "Country Maps") { if (base.startsWith("country_")) add(base.slice(8).replace(/_/g, " "), r, 0, "country"); continue }
    if (cat === "People Profession") base = base.replace(/_(1|2)?[ab]?$/, "")
    add(base.replace(/_/g, " ").replace(/\b(the|a)\b/g, ""), r, prio, verb ? "verb" : "noun")
  }
  const ambiguous = new Set(R.AMBIGUOUS)
  const list = [...cands].map(([text, { row, kind }]) => {
    const forms = kind === "verb" && !text.includes(" ") ? verbForms(text) : [text]
    return { text, kind, cat: row["category-en"], name: row["symbol-en"], slug: slug(row["symbol-en"]), forms,
      ambiguous: forms.some((f) => ambiguous.has(f)) || ambiguous.has(text) }
  })
  const bySlug = new Map(list.map((c) => [c.slug, c]))

  // which of them the drawings and emoji don't cover yet
  const STOPISH = new Set(("make take get go come put give have do be use keep let set see look find show tell say know think want need try call " +
    "feel seem turn start begin finish stop end work help play move change open close win lose hold bring carry ask answer like love hate wait").split(" "))
  const newWords = {}, newPhrases = {}
  for (const c of list) {
    if (c.text.includes(" ")) { if (!handPhrases.has(c.text)) newPhrases[c.text] = c.slug; continue }
    if (c.ambiguous) continue
    if (c.forms.some((f) => NEVER[f] || LOOSE[f])) continue
    if (c.kind === "verb" && STOPISH.has(c.text)) continue
    if (c.forms.every((f) => E.lookup(f, {}))) continue
    for (const f of c.forms) if (!E.lookup(f, {}) && !newWords[f]) newWords[f] = c.slug
  }
  const drop = new Set(R.DROP_WORDS), dropPh = new Set(R.DROP_PHRASES), heads = new Set(R.REORDER_HEADS)
  const words = {}, phrases = {}
  for (const [w, s] of Object.entries(newWords)) if (!drop.has(bySlug.get(s).text) && !drop.has(w)) words[w] = s
  for (const [w, t] of Object.entries(R.EXTRA_WORDS)) { const c = list.find((x) => x.text === t); if (c) words[w] = c.slug }
  for (const [p, s] of Object.entries(newPhrases)) {
    if (R.VARIANT_PARTS.test(p) || p.split(" ").length > 3 || dropPh.has(p) || p.includes(" - ")) continue
    const t = p.startsWith("the ") ? p.slice(4) : p
    phrases[t] = s
    const ws = t.split(" ")
    if (ws.length >= 2 && heads.has(ws[0])) phrases[ws.slice(1).concat(ws[0]).join(" ")] = s
  }
  Object.assign(phrases, R.EXTRA_PHRASES)
  // a country named on its own shows its map, which carries its flag, instead of the flag alone
  const flag = /^[\u{1F1E6}-\u{1F1FF}]{2}$/u
  const override = []
  for (const c of list) if (c.kind === "country" && !c.text.includes(" ") && !drop.has(c.text)) {
    const got = E.lookup(c.text, {})
    if (got && got.emoji && flag.test(got.emoji)) { words[c.text] = c.slug; override.push(c.text) }
  }

  // ---------- US state maps, drawn from the Census boundaries ----------
  const states = drawStates(JSON.parse(readFileSync(need("us-atlas/states-albers-10m.json"), "utf8")))
  for (const st of states) {
    const n = st.name.toLowerCase()
    if (n === "washington") phrases["washington state"] = st.slug
    else if (n === "district of columbia") { phrases["washington dc"] = st.slug; phrases["district of columbia"] = st.slug }
    else if (n.includes(" ")) phrases[n] = st.slug
    else words[n] = st.slug
  }
  const minorCats = new Set(R.MINOR_CATS)
  const minor = [...new Set(Object.values(words).filter((s) => bySlug.has(s) && (bySlug.get(s).kind === "verb" || minorCats.has(bySlug.get(s).cat))))].sort()

  // ---------- OpenMoji: words for the pictures that had none, and flags for the remaining countries ----------
  const om = JSON.parse(readFileSync(need("openmoji/openmoji.json"), "utf8")).filter((e) => !e.skintone)
  const bundle = JSON.parse(readFileSync(new URL("openmoji-bundle.json", PUBLIC), "utf8"))
  const key = (e) => e.replace(/️/g, "")
  const byName = new Map(om.map((e) => [e.annotation.toLowerCase(), e]))
  const omWords = {}, omPhrases = {}
  for (const [name, said] of Object.entries(R.OPENMOJI_PICK)) {
    const e = byName.get(name.toLowerCase())
    if (!e || !bundle[key(e.emoji)]) throw new Error("no OpenMoji picture named " + name)
    for (const w of said.split("|")) {
      if (w.includes(" ") || w.includes("'")) omPhrases[w] = key(e.emoji)
      else if (!E.lookup(w, {})) omWords[w] = key(e.emoji)
    }
  }
  for (const e of om.filter((x) => x.group === "flags" && x.subgroups === "country-flag")) {
    let n = e.annotation.toLowerCase().replace(/^flag: /, "").replace(/ & /g, " and ").replace(/\bst\. /g, "saint ").replace(/ \(.*\)$/, "")
      .replace(/ sar china$/, "").replace(/[’']/g, "").trim().normalize("NFD").replace(/[̀-ͯ]/g, "")
    if (R.NO_FLAG.test(n) || !bundle[key(e.emoji)]) continue
    if (n.includes(" ")) { if (!phrases[n]) omPhrases[n] = key(e.emoji) }
    else if (!E.lookup(n, {}) && !words[n]) omWords[n] = key(e.emoji)
  }
  omPhrases["european union"] = "🇪🇺"
  for (const p of Object.keys(omPhrases)) if (/\d/.test(p)) delete omPhrases[p]

  // ---------- the symbol files: exactly the ones something points at ----------
  const symDir = new URL("symbols/", PUBLIC)
  rmSync(symDir, { recursive: true, force: true }); mkdirSync(symDir)
  const mulDir = need("mulberry/EN-symbols/")
  for (const s of new Set([...Object.values(words), ...Object.values(phrases)])) {
    const st = states.find((x) => x.slug === s)
    // the file of the very symbol the word was chosen for ("sieve" the kitchen tool, not "sieve, to")
    if (st) writeFileSync(new URL(s + ".svg", symDir), st.svg)
    else if (bySlug.has(s)) copyFileSync(new URL(bySlug.get(s).name + ".svg", mulDir), new URL(s + ".svg", symDir))
    else throw new Error("no symbol file for " + s)
  }

  // ---------- diagrams from Wikimedia Commons ----------
  const meta = JSON.parse(readFileSync(need("commons/commons.json"), "utf8"))
  const dgDir = new URL("diagrams/", PUBLIC)
  rmSync(dgDir, { recursive: true, force: true }); mkdirSync(dgDir)
  const credits = []
  for (const d of DIAGRAMS) {
    const m = meta[d.file]
    if (!m) throw new Error("no licence details for " + d.file + ": run npm run pictures:fetch")
    const lic = m.license.toLowerCase()
    if (!(lic.includes("public domain") || lic.startsWith("cc0") || lic.startsWith("cc by"))) throw new Error("licence not open enough: " + d.file + " " + m.license)
    const src = need("commons/" + cacheName(d.file, d.as))
    if (d.as === "png") copyFileSync(src, new URL(d.key + ".png", dgDir))
    else writeFileSync(new URL(d.key + ".svg", dgDir), readFileSync(src, "utf8").replace(/\r\n?/g, "\n").replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<metadata\b[\s\S]*?<\/metadata>/g, "").replace(/<sodipodi:namedview\b[\s\S]*?(\/>|<\/sodipodi:namedview>)/g, ""))
    credits.push({ ...d, ...m })
  }

  // ---------- the generated modules and the credits page ----------
  const sorted = (o) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)))
  writeFileSync(new URL("symbols.js", DATA), "// Generated by web/tools/pictures (npm run pictures:build) from Mulberry Symbols (CC BY-SA 4.0, Steve Lee, mulberrysymbols.org)\n" +
    "// and US Census Bureau state boundaries (public domain, via us-atlas). Each word or phrase names a picture file in public/symbols/.\n" +
    "export const PICTURE_SYMBOLS = " + JSON.stringify({ words: sorted(words), phrases: sorted(phrases), minor, override: override.sort() }) + ";\n")
  writeFileSync(new URL("openmoji-words.js", DATA), "// Generated by web/tools/pictures (npm run pictures:build): words and phrases for OpenMoji pictures the drawings don't cover.\n" +
    "export const OPENMOJI_WORDS = " + JSON.stringify(sorted(omWords)) + ";\nexport const OPENMOJI_PHRASES = " + JSON.stringify(sorted(omPhrases)) + ";\n")
  writeFileSync(new URL("image-diagrams.js", DATA), "// Generated by web/tools/pictures (npm run pictures:build): diagrams kept as files in public/diagrams/, each as\n" +
    "// [key, title, phrases that bring it up, file type]. Credits are in public/credits.html.\nexport const IMAGE_DIAGRAM_LIST = [\n" +
    DIAGRAMS.map((d) => "  " + JSON.stringify([d.key, d.title, d.say, d.as])).join(",\n") + "\n];\n")
  writeFileSync(new URL("credits.html", PUBLIC), creditsPage(credits))
  const files = readdirSync(symDir).length
  console.log(`symbols: ${Object.keys(words).length} words, ${Object.keys(phrases).length} phrases, ${files} files (${override.length} country maps instead of flags)`)
  console.log(`openmoji: ${Object.keys(omWords).length} words, ${Object.keys(omPhrases).length} phrases; diagrams: ${DIAGRAMS.length}`)
}

// ---------- helpers ----------
function slug(name) { return name.toLowerCase().replace(",_to", "").replace("_-_", "_").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") }
function verbForms(v) {
  const out = [v]
  if (/(s|sh|ch|x|z|o)$/.test(v)) out.push(v + "es")
  else if (/[^aeiou]y$/.test(v)) out.push(v.slice(0, -1) + "ies")
  else out.push(v + "s")
  let ing, ed
  if (v.endsWith("e") && !v.endsWith("ee")) { ing = v.slice(0, -1) + "ing"; ed = v + "d" }
  else if (/[^aeiou]y$/.test(v)) { ing = v + "ing"; ed = v.slice(0, -1) + "ied" }
  else if (/^[^aeiou]*[aeiou][bdgklmnprt]$/.test(v) && v.length <= 5) { ing = v + v.slice(-1) + "ing"; ed = v + v.slice(-1) + "ed" }
  else { ing = v + "ing"; ed = v + "ed" }
  return out.concat(ing, R.IRREGULAR[v] || [ed])
}
// a CSV reader for the symbol list: quoted fields may hold commas ("gravy_pour_,_to")
function parseCsv(text) {
  const rows = []; let row = [], cell = "", q = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (q) { if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++ } else if (ch === '"') q = false; else cell += ch; continue }
    if (ch === '"') q = true
    else if (ch === ",") { row.push(cell); cell = "" }
    else if (ch === "\n" || ch === "\r") { if (ch === "\r" && text[i + 1] === "\n") i++; row.push(cell); rows.push(row); row = []; cell = "" }
    else cell += ch
  }
  if (cell || row.length) { row.push(cell); rows.push(row) }
  const head = rows.shift()
  return rows.filter((r) => r.length === head.length).map((r) => Object.fromEntries(head.map((h, i) => [h, r[i]])))
}
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;") }
function creditsPage(list) {
  const lic = (c) => (c.licenseUrl ? `<a href="${esc(c.licenseUrl)}">${esc(c.license)}</a>` : esc(c.license))
  const rows = list.map((c) => `<li><b>${esc(c.title)}</b>: <a href="${esc(c.page)}">${esc(c.file)}</a> by ${esc(c.artist || "unknown")}, ${lic(c)}.</li>`).join("\n")
  return readFileSync(new URL("credits-template.html", TOOLS), "utf8").replace("<!-- diagrams -->", rows)
}
