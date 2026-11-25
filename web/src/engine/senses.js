// Words that mean different things: the sentence and the talk around it decide ("football", "law", "branch", verbs used as verbs).
import { normalize } from "./lookup.js"
import { PHRASE_START } from "./phrases.js"
import SENSES from "./words/senses.json" with { type: "json" }

// A word whose picture depends on the rest of the lesson: "brush your teeth", "spring" the season or the coil, "3 times 4".
function cueSet(s){ var o = {}; (Array.isArray(s) ? s : s.split(" ")).forEach(function(w){ o[w] = 1; }); return o; }
var TEETH = cueSet(SENSES.teeth),
    PHYS = cueSet(SENSES.phys),
    CHEM = cueSet(SENSES.chem),
    LOUD = cueSet(SENSES.loud),
    SKY = cueSet(SENSES.sky),
    MUSIC = cueSet(SENSES.music),
    // speech recognizers sometimes write the wrong homophone; where it sits in the sentence usually gives it away
    MODAL = cueSet(SENSES.modal),
    WHO = cueSet(SENSES.who),
    PREP = cueSet(SENSES.prep), BE = cueSet(SENSES.be),
    BONDS = cueSet(SENSES.bonds),
    HOMO_NEXT = cueSet(SENSES.homoNext),
    BRAIN = cueSet(SENSES.brain),
    STORY = cueSet(SENSES.story),
    NUM_WORD = cueSet(SENSES.numWord);
function isNum(t){ return t != null && (/^\d/.test(t) || !!NUM_WORD[normalize(t)]); }
function contextual(w, i, raw, cues){
  var pv = normalize(raw[i - 1] || ""), nx = normalize(raw[i + 1] || "");
  function em(e){ return { emoji: e, key: "m:" + e }; }
  function ic(k){ return { icon: k, key: "i:" + k }; }
  switch (w){
    case "brush": case "brushing": return hasCue(cues, TEETH) ? em("🪥") : undefined;
    case "spring": case "springs": return hasCue(cues, PHYS) ? undefined : em("🌸");
    case "solution": case "solutions": return hasCue(cues, CHEM) ? undefined : null;
    case "volume": return hasCue(cues, LOUD) ? em("🔊") : ic("beaker");
    case "space": return hasCue(cues, SKY) ? ic("rocket") : null;
    case "note": return hasCue(cues, MUSIC) ? undefined : null;
    case "plot": return hasCue(cues, STORY) ? undefined : null;
    case "capital": return raw[i + 1] && (/^[a-z]$/i.test(raw[i + 1]) || /^letters?$/i.test(raw[i + 1])) ? em("🔠") : null;
    case "times": return isNum(raw[i - 1]) && isNum(raw[i + 1]) ? ic("times") : null;
    case "feet": case "foot": case "inch": case "inches": case "yard": case "yards": return isNum(raw[i - 1]) ? ic("ruler") : undefined;
    case "pound": case "pounds": return isNum(raw[i - 1]) ? ic("scale") : null;
    case "bee": case "bees": return MODAL[pv] || HOMO_NEXT[nx] ? null : undefined;                  // "to bee positive"
    case "sea": return MODAL[pv] || WHO[pv] || HOMO_NEXT[nx] ? null : undefined;                    // "i'll sea you"
    case "wood": return WHO[pv] || WHO[nx] || nx === "like" || nx === "be" ? null : undefined;         // "wood you like", "we wood say"
    case "hour": return PREP[pv] ? null : undefined;                                                   // "outside of hour window"
    case "mail": return BE[pv] ? null : undefined;                                                     // "if you were mail"
    case "knight": return pv === "good" ? null : undefined;                                            // "good knight"
    case "pear": case "pears": return nx === "of" || hasCue(cues, BONDS) ? null : undefined;           // "a pear of shoes", "a lone pear"
    case "weather": return HOMO_NEXT[nx] || nx === "your" || nx === "or" ? null : undefined;          // "weather you like it"
    case "peace": return nx === "of" ? null : undefined;                                               // "a peace of paper"
    case "nose": return WHO[pv] || HOMO_NEXT[nx] ? null : undefined;                                  // "jill nose that"
    case "charge": case "charges": case "charged": return normalize(raw[i - 1] || "") === "in" ? null : ic("bolt");
    case "hemisphere": case "hemispheres": return hasCue(cues, BRAIN) ? ic("brain") : ic("globe");
  }
  return undefined;
}

// Words with more than one meaning: the rest of the talk decides (the sentence, what came before and, live, what comes next).
var CUE = {};
Object.keys(SENSES.cues).forEach(function(k){ CUE[k] = cueSet(SENSES.cues[k]); });

function senseOf(w, i, norm, cues){
  var pv = norm[i - 1] || "", nx = norm[i + 1] || "";
  function em(e){ return { emoji: e, key: "m:" + e }; }
  function ic(k){ return { icon: k, key: "i:" + k }; }
  function L(set){ return hasCue(norm, set); }
  function W(set){ return hasCue(cues, set); }
  // which of two meanings the talk points to: this sentence first, then what was said around it (1, 2, or 0 for no telling)
  function pick(a, b){
    var la = L(a), lb = L(b);
    if (la !== lb) return la ? 1 : 2;
    var wa = W(a), wb = W(b);
    if (wa !== wb) return wa ? 1 : 2;
    return 0;
  }
  switch (w){
    // classes here are mostly in the US, where "football" is American football; soccer needs a sign ("goalkeeper", "kick it into the goal")
    case "football": case "footballs":
      var fb = pick(CUE.usFootball, CUE.soccer);
      return fb === 2 || (fb === 0 && L(CUE.kick) && L(CUE.goal)) ? em("⚽") : em("🏈");
    case "sport": case "sports": return em("🏅");
    case "bat": case "bats": return pick(CUE.batAnimal, CUE.ballgame) === 2 ? em("⚾") : ic("bat");
    case "bark": case "barks": return pick(CUE.dog, CUE.tree) === 1 ? null : undefined;
    case "bill": case "bills": var bl = pick(CUE.duckBird, CUE.law); return bl === 1 ? null : bl === 2 ? ic("scroll") : undefined;
    case "ruler": case "rulers": return pick(CUE.royal, CUE.measure) === 1 ? ic("crown") : undefined;
    case "crane": case "cranes": var cr = pick(CUE.building, CUE.birdish); return cr === 1 ? em("🏗️") : cr === 2 ? ic("bird") : null;
    case "pupil": case "pupils": return W(CUE.eye) ? ic("eye") : null;
    case "cell": case "cells": return W(CUE.jail) ? null : pick(CUE.phone, BIO) === 1 ? ic("phone") : undefined;
    case "virus": case "viruses": return pick(COMPUTER_CUES, BIO) === 1 ? null : undefined;
    case "plant": case "plants": return pv === "power" || pv === "nuclear" || pv === "coal" || pv === "manufacturing" ? ic("factory") : undefined;
    case "seal": case "seals": return W(CUE.sea) ? undefined : null;
    case "trunk": case "trunks": var tr = pick(CUE.elephant, CUE.tree); return tr === 1 ? ic("elephant") : tr === 2 ? undefined : null;
    case "organ": case "organs": return pick(CUE.music, CUE.bodyOrgan) === 1 ? em("🎹") : undefined;
    case "scale": case "scales": return L(CUE.fish) || (W(CUE.fish) && !L(CUE.measure)) ? ic("fish") : W(CUE.map) ? ic("ruler") : W(CUE.music) ? ic("note") : undefined;
    case "table": case "tables": return W(CUE.data) ? ic("chart") : undefined;
    case "current": case "currents": var cu = pick(CUE.electric, CUE.water); return cu === 1 ? undefined : cu === 2 ? ic("wave") : null;
    case "key": case "keys": return W(CUE.map) ? ic("map") : W(CUE.music) ? em("🎹") : undefined;
    case "wave": case "waves": case "waved": case "waving": return nx === "hello" || nx === "goodbye" || nx === "hi" || nx === "bye" ? em("👋") : undefined;
    case "matter": return pv === "the" || pv === "no" || pv === "doesnt" || pv === "dont" ? null : undefined;
    // "a game has two halves": in a sport it's the match, not a board game
    case "game": case "games": return W(CUE.sport) ? null : undefined;
    // hot weather or a hot place is temperature; hot magma, a hot stove or fire is the flame
    case "hot": case "hotter": case "hottest": return W(CUE.fire) ? undefined : ic("thermometer");
    case "string": case "strings": return W(CUE.music) ? ic("violin") : undefined;
    case "bass": return W(CUE.music) ? ic("guitar") : undefined;
    // biology: tissue is cells, not paper; the nucleus of a cell is not an atom; respiration in a cell is not breathing
    case "tissue": case "tissues": return W(CUE.cellBio) || W(CUE.bodyOrgan) ? null : undefined;
    case "nucleus": case "nuclei": return pick(CUE.atomic, CUE.cellBio) === 2 ? ic("cell") : undefined;
    case "respiration": return L(CUE.cellBio) ? null : undefined;
    case "code": case "codes": return pick(CUE.computer, CUE.genetics) === 2 ? null : undefined;
    case "protein": case "proteins": return L(CUE.genetics) || L(CUE.cellBio) || W(CUE.genetics) ? null : undefined;
    // chemistry and physics: an electron shell, the arrow in an equation, a law of nature, an equal and opposite reaction
    case "shell": case "shells": return W(CUE.atomic) ? null : undefined;
    case "arrow": case "arrows": return W(CUE.chemEq) || W(CUE.mathGraph) ? null : undefined;
    case "conservation": return nx === "of" ? null : undefined;
    case "law": case "laws": return L(CUE.physics) || L(CUE.electric) || /^(newton|ohm|boyle|charles|hooke|kepler|mendel)$/.test(pv) || (nx === "of" && /^(conservation|inertia|gravity|motion|gravitation|thermodynamics|physics|nature|reflection|averages)$/.test(norm[i + 2] || "")) ? null : undefined;
    case "reaction": case "reactions": return L(CUE.physics) && !L(CUE.chemEq) ? null : undefined;
    // maths: angles are measured in degrees, and a parabola's roots are numbers
    case "degree": case "degrees": return pick(CUE.geometry, CUE.temp) === 1 ? null : undefined;
    case "root": case "roots": return W(CUE.mathGraph) || pv === "square" || pv === "cube" ? null : undefined;
    // civics and history: a branch of government, power that people hold, the Cold War
    case "branch": case "branches": return pick(CUE.gov, CUE.treeOnly) === 1 ? ic("columns") : undefined;
    case "power": case "powers": case "powerful": return L(CUE.electric) || W(CUE.electric) ? undefined : W(CUE.gov) || W(CUE.royal) || W(CUE.mathGraph) ? null : undefined;
    case "cold": return W(CUE.war) ? null : undefined;
    case "position": case "positions": return W(CUE.argue) ? null : undefined;
    case "program": case "programs": case "programming": return W(CUE.computer) || W(COMPUTER_CUES) ? undefined : null;
    case "block": case "blocks": return W(CUE.computer) ? null : undefined;
  }
  return undefined;
}
var BIO = cueSet(SENSES.bio);
// Words that are nouns with a picture but also everyday verbs: right after "to", "can", "you", "we"... they're the verb ("train your dog",
// "likes to bark", "let's face it"), and the noun's picture would only confuse.
var NOUN_VERB = cueSet(SENSES.nounVerb);
var VERB_BEFORE = cueSet(SENSES.verbBefore);
// Does a phrase stop mid-idea? Then live talk joins it to the next one instead of drawing it alone
// ("we're learning about American" … "football", "the power" … "plant", "put it in the" … "fridge").
var DANGLE = cueSet(SENSES.dangle);
function dangling(text){
  var ws = String(text).split(/\s+/).filter(Boolean).map(normalize).filter(Boolean);
  if (ws.length <= 2) return true;
  var last = ws[ws.length - 1], prev = ws[ws.length - 2];
  if (/^(is|are|was|were)$/.test(last) && /^(there|it|they|we|you|he|she|that|this|what|where|who|how|which)$/.test(prev)) return false;
  return !!DANGLE[last] || (!!PHRASE_START[last] && !VERB_BEFORE[last] && ws.length <= 7);
}
var NEEDS_DET = cueSet(SENSES.needsDet);
var NOUN_DET = cueSet(SENSES.nounDet);
var NOUN_ADJ = cueSet(SENSES.nounAdj);
function usedAsVerb(w, i, norm){
  if (NEEDS_DET[w] && !NOUN_DET[norm[i - 1]] && !(NOUN_ADJ[norm[i - 1]] && NOUN_DET[norm[i - 2]])) return true;
  if (!NOUN_VERB[w]) return false;
  var pv = norm[i - 1] || "";
  return !!VERB_BEFORE[pv];
}

// Fraction pictures (pizza, halves...) only make sense in a maths sentence; "the whole cycle" must not show a pizza.
var MATH_ONLY = cueSet(SENSES.mathOnly);
var MATH_CUES = cueSet(SENSES.mathCues);
function hasMathCue(norm){ for (var k = 0; k < norm.length; k++) if (MATH_CUES[norm[k]] || MATH_CUES[norm[k].replace(/s$/, "")]) return true; return false; }
var FRACTION_TALK = cueSet(SENSES.fractionTalk);
var COMPUTER_CUES = cueSet(SENSES.computerCues);
function hasCue(norm, cues){ for (var k = 0; k < norm.length; k++) if (cues[norm[k]]) return true; return false; }
export { COMPUTER_CUES, CUE, FRACTION_TALK, MATH_ONLY, contextual, cueSet, dangling, hasCue, hasMathCue, senseOf, usedAsVerb };
