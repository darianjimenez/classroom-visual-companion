// What the engine must and must not do, one case per problem found while building it. Each line: a sentence, then text its scene
// must contain ("has") and text it must not ("not"). Scenes are described by tests/engine.js, e.g. "football=m:🏈"; the caption
// is left out of the check, since it repeats the sentence.
import { test } from "node:test"
import assert from "node:assert/strict"
import { loadEngine, describe, lessonScene, replayLive } from "./engine.js"

const CASES = [
  // words that mean more than one thing
  ["We're learning about American football today.", { has: "m:🏈", not: "🇺🇸" }],
  ["The goalkeeper stops the ball before it goes in the goal, and that's football.", { has: "⚽" }],
  ["We are going to visit the power plant.", { has: "i:factory", not: "sprout" }],
  ["You can train your dog to sit.", { has: "dog", not: "train" }],
  ["The ruler of the kingdom lived in a castle.", { has: "i:crown" }],
  ["A duck uses its bill to find food.", { not: "scroll" }],
  ["Bats sleep in caves during the day.", { has: "i:bat", not: "⚾" }],
  // school words that are not their everyday meaning
  ["Multicellular organisms have specialized cells that work together as tissues and organs.", { not: "🧻" }],
  ["Valence electrons are in the outer shell of the atom.", { not: "🐚" }],
  ["Count the atoms on both sides of the arrow in the chemical equation.", { not: "bowarrow" }],
  ["The angles in a triangle always add up to one hundred eighty degrees.", { not: "thermometer" }],
  ["The roots are where the graph crosses the x-axis.", { not: "sprout" }],
  ["The legislative branch makes laws.", { not: "🪵" }],
  ["The Federal Reserve can raise interest rates to slow inflation.", { not: "mouse" }],
  ["Getting enough sleep helps your brain store memories.", { not: "🏬" }],
  ["This happens in two stages.", { not: "stag" }],
  // places and names
  ["Japan, China and South Korea are in East Asia.", { has: "s:country-japan" }],
  ["Virginia and Massachusetts were two of the first colonies.", { has: "s:state-virginia" }],
  ["Rosa Parks refused to give up her seat on the bus.", { not: "park" }],
  // pictures from the open collections
  ["Pour the water slowly.", { has: "s:pour" }],
  ["Some materials are transparent, like glass.", { has: "s:transparent" }],
  ["The heart has four chambers: two atria and two ventricles.", { has: "DIAGRAM heartparts" }],
  ["The thirteen colonies were ruled by Britain.", { has: "DIAGRAM thirteencolonies" }],
  ["The Cold War was a rivalry between the United States and the Soviet Union.", { has: "DIAGRAM coldwareurope" }],
  // a symbol for an action gives way when the sentence has its main things to show
  ["Scientists dig up fossils and study them to learn how dinosaurs lived.", { has: "dinosaur", not: "s:dig" }],
  // word cards
  ["A hypothesis is an educated guess about what will happen.", { has: "[Key word] «HYPOTHESIS»" }],
  ["Today we're going to talk about theme.", { has: "[Today] «THEME»" }],
  ["First, underline what the question is asking.", { has: "[First]" }],
  ["How do you know?", { has: "[Question]" }],
  ["Great job, that's exactly right.", { has: "—" }],
]

test("scenes: meanings, places, collections, word cards", () => {
  const { E } = loadEngine()
  for (const [text, want] of CASES) {
    const got = describe(lessonScene(E, text)).replace(/ ‹[^›]*›$/, "")
    if (want.has) assert.ok(got.includes(want.has), `${text}\n  wanted ${want.has}\n  got    ${got}`)
    if (want.not) assert.ok(!got.includes(want.not), `${text}\n  did not want ${want.not}\n  got          ${got}`)
  }
})

// the card a sentence gets when its picture is already on the board (the app shows the words instead of repeating it)
test("word cards for sentences whose picture is already shown", () => {
  const { E } = loadEngine()
  assert.match(describe(E.wordScene("Your rough draft is due on Friday.")), /^\[Remember\]/)
  assert.match(describe(E.wordScene("Metals tend to lose electrons and form positive ions.")), /^\[Key idea\] METALS/)
  assert.match(describe(E.wordScene("Isotopes are atoms of the same element with different numbers of neutrons.")), /^\[Key word\] «ISOTOPES»/)
})

test("live talk: a pause in the middle of an idea joins the two halves", () => {
  const { E } = loadEngine()
  assert.match(replayLive(E, ["today we are learning about american", "football and the rules of the game"])[0], /american football=m:🏈/)
  assert.match(replayLive(E, ["look at the crane", "it is lifting steel beams on the construction site"])[0], /crane=m:🏗️/)
  // a finished sentence ending in a phrase's first word ("…the cell") is not held back for the next one
  assert.equal(replayLive(E, ["the cell membrane controls what goes in and out of the cell", "inside the cell is a jelly-like fluid called cytoplasm"]).length, 2)
})

test("live talk: small talk gets no card", () => {
  const { E } = loadEngine()
  for (const s of ["okay so", "good morning everyone", "can everyone see the board", "give me one second"]) {
    assert.equal(E.wordScene(s, { live: true }).show, false, s)
  }
})
