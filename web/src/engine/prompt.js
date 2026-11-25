// The prompt that asks Claude to plan a lesson's scenes from the icon list.
import { DIAGRAMS, DIAGRAM_ORDER } from "./diagrams/registry.js"
import { I } from "./drawings.js"

var ICON_HINT = {
  drop: "water", wave: "ocean/sea", sprout: "plant/seed", bolt: "energy/electricity", flame: "fire/heat", snowflake: "ice/cold",
  globe: "Earth/world/country", crown: "king/queen/ruler", group: "people/citizens/crowd/soldiers", person: "one person/student/teacher",
  gear: "machine/wheel", columns: "government/law/democracy", ballot: "voting/election", vapor: "steam/gas/evaporation",
  bulb: "idea/invention/light", scroll: "document/history", swords: "war/battle", dove: "peace/freedom", coins: "money/trade",
  fist: "revolution/protest", chart: "data/graph", flask: "experiment/chemistry", gravity: "gravity/falling objects", apple: "food/fruit",
  cell: "living cell", dna: "DNA/genes", atom: "atom/molecule/matter", rain: "rain", storm: "storm/thunder",
  pizza: "fraction (pizza with a slice missing)", whole: "a whole (full pizza)", half: "one half", slice: "one slice/quarter", numbers: "numbers/math", co2: "carbon dioxide", quill: "writer/author/scribe", puzzle: "plot/puzzle",
  trophy: "goal/prize/climax", question: "question/problem", magnifier: "clue/evidence", handshake: "agreement/union", map: "map/setting/route",
  muscle: "muscle/force", cocoon: "chrysalis/cocoon", fox: "fox/predator", rabbit: "rabbit/prey", grass: "grass/producer", mushroom: "mushroom/decomposer",
  shield: "protection/immune system", pill: "medicine/vaccine", plug: "wire/circuit", note: "music", sound: "sound", house: "home/house", city: "city/town"
};
function buildPlanPrompt(sentences, extraWords){
  var icons = Object.keys(I).map(function(k){ return ICON_HINT[k] ? k + " (" + ICON_HINT[k] + ")" : k; }).join(", ");
  var extra = extraWords && extraWords.length ? "\nExtra words the teacher added (also usable as icon keys): " + extraWords.join(", ") : "";
  return [
    "You are helping a teacher turn a spoken lesson into a simple picture storyboard for students. For each numbered sentence, decide whether a small illustrated scene would help students picture the idea, and if so describe the scene using ONLY the icons and relations listed below.",
    "",
    "Icons (use the key exactly): " + icons + extra,
    "",
    "Relations:",
    "- heats / cools: subject warms, burns, cools, or hardens the object",
    "- rises / falls: movement up / down (evaporating, raining, sinking, flowing downhill)",
    "- becomes: subject turns into, forms, or builds the object",
    "- powers: subject gives energy to or drives the object",
    "- contains: subject (the container) holds the objects inside it",
    "- versus: subject fights or opposes the object",
    "- wants: subject says, writes, demands, or asks for the objects (drawn as a speech bubble)",
    "- needs: subject uses, depends on, or eats the objects",
    "- pulls: subject pulls, pushes, or attracts the object",
    "- leads: subject causes, leads to, helps, gives, sends, or moves to the object",
    "- splits: subject divides, breaks, or shares into the objects",
    "- cycle: the subjects repeat in a loop or orbit (list every participant in subjects, no objects)",
    "- and: no clear action; just show the subjects together",
    "Settings: sky, land, sea, space, bio, lab, history, town, math, class, plain",
    "",
    "Diagrams: when a sentence introduces one of these whole topics, reply {\"i\":n,\"show\":true,\"diagram\":\"key\",\"caption\":\"...\"} instead of icons: " +
      DIAGRAM_ORDER.map(function(k){ return k + " (" + DIAGRAMS[k].title + ")"; }).join(", "),
    "",
    "Rules:",
    "- Picture the MEANING of the phrase, not just its nouns. Pick icons for what the words refer to (\"citizens\" -> group, \"the ruler\" -> crown, \"steam\" -> vapor) and the relation that shows what happens.",
    "- subjects: 1-2 icon keys doing the action. objects: 0-2 icon keys it acts on. Never repeat a key within a sentence.",
    "- Optional \"then\" continues the story from the objects: {\"relation\", \"verb\", \"objects\"} (the sun heats the ocean, which then becomes vapor). Only for heats, cools, rises, falls, becomes, powers, pulls, leads, splits.",
    "- verb: the arrow label, 1-3 words in the teacher's own wording (\"heats\", \"turns into\").",
    "- labels: for each icon key used, the 1-2 word name to print under it, in the teacher's words (\"ocean\", not \"wave\").",
    "- caption: at most 7 plain words a 10-year-old could read.",
    "- Use \"show\": false for sentences with nothing concrete to picture (greetings, transitions), and when nothing in the icon list fits. A missing picture is better than a misleading one.",
    "",
    "Reply with only a JSON array, one object per sentence, in order. Example:",
    '[{"i":1,"show":true,"setting":"sea","subjects":["sun"],"relation":"heats","verb":"heats","objects":["wave"],"then":{"relation":"becomes","verb":"turns into","objects":["vapor"]},"labels":{"sun":"sun","wave":"ocean","vapor":"vapor"},"caption":"The sun turns ocean water into vapor"},{"i":2,"show":false}]',
    "",
    "Sentences:",
    sentences.map(function(s, i){ return (i + 1) + ". " + s; }).join("\n")
  ].join("\n");
}
export { buildPlanPrompt };
