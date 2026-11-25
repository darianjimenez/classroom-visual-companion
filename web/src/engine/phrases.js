// Phrases that mean one thing ("american football", "power plant", "cell phone") and what each shows.
import OPENMOJI from "./data/openmoji-words.json" with { type: "json" }
import { I } from "./drawings.js"
import { forms, normalize } from "./lookup.js"
import PHRASE_GROUPS from "./words/phrases.json" with { type: "json" }

// ---------- phrases, senses and verbs: what live talk needs beyond single words ----------
// Phrases that mean one thing ("american football", "power plant", "hot dog"). Read word by word they draw the wrong
// pictures, so the whole phrase is matched first: i:drawing, m:emoji, or "-" for no picture at all. The last word may be plural.
var PHRASE_SRC =
  // sport and games
  Object.keys(PHRASE_GROUPS.groups).map(function(g){
  return Object.keys(PHRASE_GROUPS.groups[g]).map(function(t){ return t + "|" + PHRASE_GROUPS.groups[g][t]; }).join(";");
}).join(";");
var PHRASES = {};
PHRASE_SRC.split(";").forEach(function(row){
  var p = row.split("|"), ws = p[0].split(" ").map(normalize);
  (PHRASES[ws[0]] = PHRASES[ws[0]] || []).push({ words: ws, pic: p[1] });
});
var PHRASE_START = {};
Object.keys(PHRASES).forEach(function(k){ PHRASE_START[k] = 1; });
var PHRASE_MORE = OPENMOJI.phrases;
function addPhrase(text, pic){
  var ws = String(text).split(" ").map(normalize).filter(Boolean);
  if (ws.length < 2) return;
  var list = PHRASES[ws[0]] = PHRASES[ws[0]] || [], key = ws.join(" ");
  if (!list.some(function(x){ return x.words.join(" ") === key; })) list.push({ words: ws, pic: pic });
}
Object.keys(PHRASE_MORE).forEach(function(t){ addPhrase(t, "m:" + PHRASE_MORE[t]); });
function sortPhrases(){ Object.keys(PHRASES).forEach(function(k){ PHRASES[k].sort(function(a, b){ return b.words.length - a.words.length; }); }); }
sortPhrases();
// the symbol table's phrases ("pencil sharpener", "new zealand"), once it has loaded
function addSymbolPhrases(phrases){
  Object.keys(phrases).forEach(function(t){ addPhrase(t, "s:" + phrases[t]); });
  sortPhrases();
}
function picOf(spec){
  if (!spec || spec === "-") return null;
  if (spec.slice(0, 2) === "i:" && I[spec.slice(2)]) return { icon: spec.slice(2), key: "i:" + spec.slice(2) };
  if (spec.slice(0, 2) === "m:") return { emoji: spec.slice(2), key: "m:" + spec.slice(2) };
  if (spec.slice(0, 2) === "s:") return { sym: spec.slice(2), key: "s:" + spec.slice(2) };
  return null;
}
// the longest phrase starting at word i, or null
function phraseAt(norm, i){
  var list = PHRASES[norm[i]];
  if (!list) return null;
  for (var k = 0; k < list.length; k++){
    var ws = list[k].words, ok = i + ws.length <= norm.length;
    for (var j = 1; ok && j < ws.length; j++){
      var t = norm[i + j];
      ok = t === ws[j] || (j === ws.length - 1 && forms(t).indexOf(ws[j]) >= 0);
    }
    if (ok) return { len: ws.length, c: picOf(list[k].pic) };
  }
  return null;
}
// PHRASE_SRC is also read by the picture build (web/tools/pictures)
export { PHRASES, PHRASE_SRC, PHRASE_START, addSymbolPhrases, phraseAt };
