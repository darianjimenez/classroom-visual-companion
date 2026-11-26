// On-device voice: how the microphone's audio is cut into sentences for Whisper, and what's thrown away from what it hears.
import { test } from "node:test"
import assert from "node:assert/strict"
import { cleanText, RATE, Resampler, Segmenter } from "../src/app/whisper/segmenter.ts"

// a stand-in for a voice: a tone loud enough to count as talking, and a quiet hiss for the room
const ms = (n) => Math.round(RATE * n / 1000)
const talk = (n) => Float32Array.from({ length: ms(n) }, (_, i) => 0.1 * Math.sin(i / 5))
const room = (n) => Float32Array.from({ length: ms(n) }, (_, i) => 0.001 * Math.sin(i * 1.7))
function feed(seg, parts) {
  const ev = []
  for (const p of parts) ev.push(...seg.push(p))
  return ev
}
const finals = (ev) => ev.filter((e) => e.type === "final")

test("a pause ends a sentence, and two sentences make two pieces", () => {
  const ev = feed(new Segmenter(), [room(500), talk(1500), room(900), talk(2000), room(900)])
  const f = finals(ev)
  assert.equal(f.length, 2)
  // each piece keeps a little of the quiet before it, so the first sound isn't cut off
  assert.ok(f[0].audio.length > ms(1500) && f[0].audio.length < ms(1500 + 300 + 900))
  assert.ok(f[1].speechMs >= 1900 && f[1].speechMs <= 2100)
  assert.equal(ev.filter((e) => e.type === "speech").length, 2)
})

test("a click or a cough isn't a sentence", () => {
  assert.equal(finals(feed(new Segmenter(), [room(500), talk(120), room(1000)])).length, 0)
})

test("a short breath inside a sentence doesn't split it", () => {
  assert.equal(finals(feed(new Segmenter(), [room(300), talk(1000), room(400), talk(1000), room(900)])).length, 1)
})

test("a long stretch without a pause is cut, and nothing is lost", () => {
  const ev = feed(new Segmenter(), [room(300), talk(20000)])
  const f = finals(ev)
  assert.equal(f.length, 1)
  assert.ok(f[0].audio.length <= ms(12000))
  // while it goes on, a first guess is asked for about once a second
  assert.ok(ev.filter((e) => e.type === "interim").length >= 15)
})

test("stopping keeps what was being said", () => {
  const seg = new Segmenter()
  feed(seg, [room(300), talk(1200)])
  const e = seg.flush()
  assert.equal(e?.type, "final")
  assert.equal(seg.flush(), null)
})

test("48 kHz microphones come down to 16 kHz", () => {
  const r = new Resampler(48000)
  let n = 0
  for (let i = 0; i < 10; i++) n += r.push(new Float32Array(4800).fill(0.5)).length
  assert.ok(Math.abs(n - 16000) <= 1)
  assert.ok(Math.abs(new Resampler(44100).push(new Float32Array(44100)).length - 16000) <= 1)
})

test("what Whisper says to silence is dropped; real words are kept", () => {
  assert.equal(cleanText(" Thank you.", 600), "")
  assert.equal(cleanText("[BLANK_AUDIO]", 3000), "")
  assert.equal(cleanText(" (upbeat music) ", 3000), "")
  assert.equal(cleanText(" Thank you.", 4000), "Thank you.")
  assert.equal(cleanText(" Plants need sunlight [inaudible] and water.", 3000), "Plants need sunlight and water.")
})
