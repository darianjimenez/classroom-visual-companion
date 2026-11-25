// npm run pictures:fetch: downloads the picture sources into tools/pictures/.cache (not in git), skipping what is already
// there. Then `npm run pictures:build` turns them into the app's picture files. Needs `unzip` and `tar` (macOS and Linux have both).
//   Mulberry Symbols 3.6.1 (CC BY-SA 4.0): the SVG release and its symbol list, from GitHub
//   OpenMoji 17.0.0 (CC BY-SA 4.0): its list of emoji names, from GitHub
//   us-atlas 3.0.1 (ISC; Census Bureau boundaries, public domain): the US states, from npm
//   Wikimedia Commons: each diagram in diagrams.js with its licence and author. Commons rate-limits original files, so the
//   requests are spaced out, and diagrams marked "png" use Commons' standard 1280px renderings, as Commons asks.
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs"
import { execFileSync } from "node:child_process"
import { fileURLToPath } from "node:url"
import { DIAGRAMS } from "./diagrams.js"
import { cacheName } from "./build-names.mjs"

const CACHE = new URL("./.cache/", import.meta.url)
const UA = { "User-Agent": "plato-classroom-app/1.0 (open-source educational project)" }
const at = (rel) => new URL(rel, CACHE)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
async function get(url, tries = 5) {
  for (let i = 0; ; i++) {
    const r = await fetch(url, { headers: UA })
    if (r.ok) return Buffer.from(await r.arrayBuffer())
    if (r.status !== 429 || i >= tries) throw new Error(r.status + " " + url)
    await sleep(15000 * (i + 1))   // asked to slow down
  }
}
async function save(rel, url) {
  if (existsSync(at(rel))) return false
  mkdirSync(new URL(".", at(rel)), { recursive: true })
  writeFileSync(at(rel), await get(url))
  console.log("downloaded", rel)
  return true
}

await save("mulberry/symbol-info.csv", "https://github.com/mulberrysymbols/mulberry-symbols/releases/download/v3.6.1/symbol-info.csv")
if (!existsSync(at("mulberry/EN-symbols/"))) {
  await save("mulberry/mulberry-symbols.zip", "https://github.com/mulberrysymbols/mulberry-symbols/releases/download/v3.6.1/mulberry-symbols.zip")
  execFileSync("unzip", ["-q", "-o", fileURLToPath(at("mulberry/mulberry-symbols.zip")), "EN-symbols/*", "-d", fileURLToPath(at("mulberry/"))])
}
await save("openmoji/openmoji.json", "https://raw.githubusercontent.com/hfg-gmuend/openmoji/17.0.0/data/openmoji.json")
if (!existsSync(at("us-atlas/states-albers-10m.json"))) {
  await save("us-atlas/us-atlas.tgz", "https://registry.npmjs.org/us-atlas/-/us-atlas-3.0.1.tgz")
  execFileSync("tar", ["-xzf", fileURLToPath(at("us-atlas/us-atlas.tgz")), "-C", fileURLToPath(at("us-atlas/")), "--strip-components=1", "package/states-albers-10m.json"])
}

// Wikimedia Commons: licence, author and file address for every diagram, in one request per 40 files
const metaFile = at("commons/commons.json")
mkdirSync(at("commons/"), { recursive: true })
const meta = existsSync(metaFile) ? JSON.parse(readFileSync(metaFile, "utf8")) : {}
const missing = DIAGRAMS.filter((d) => !meta[d.file] || !existsSync(at("commons/" + cacheName(d.file, d.as))))
const text = (h) => String(h || "").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#0?39;|&#x27;/g, "'").replace(/\s+/g, " ").trim()
for (let i = 0; i < missing.length; i += 40) {
  const q = new URLSearchParams({ action: "query", format: "json", prop: "imageinfo", iiprop: "url|extmetadata", iiurlwidth: "1280",
    iiextmetadatafilter: "LicenseShortName|Artist|LicenseUrl", titles: missing.slice(i, i + 40).map((d) => "File:" + d.file).join("|") })
  const data = JSON.parse((await get("https://commons.wikimedia.org/w/api.php?" + q)).toString())
  for (const p of Object.values(data.query.pages)) {
    if (!p.imageinfo) { console.log("not on Commons:", p.title); continue }
    const ii = p.imageinfo[0], md = ii.extmetadata || {}, file = p.title.slice(5)
    meta[file] = { page: ii.descriptionurl, license: text(md.LicenseShortName && md.LicenseShortName.value),
      licenseUrl: text(md.LicenseUrl && md.LicenseUrl.value), artist: text(md.Artist && md.Artist.value).slice(0, 200), svg: ii.url, png: ii.thumburl }
  }
  writeFileSync(metaFile, JSON.stringify(meta, null, 1))
}
for (const d of missing) {
  const m = meta[d.file]
  if (!m) continue
  if (await save("commons/" + cacheName(d.file, d.as), d.as === "png" ? m.png : m.svg)) await sleep(4000)
}
console.log("sources ready in tools/pictures/.cache")
