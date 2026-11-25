// Words that mean different things: the sentence and the talk around it decide ("football", "law", "branch", verbs used as verbs).
import { normalize } from "./lookup.js"
import { PHRASE_START } from "./phrases.js"

// A word whose picture depends on the rest of the lesson: "brush your teeth", "spring" the season or the coil, "3 times 4".
function cueSet(s){ var o = {}; s.split(" ").forEach(function(w){ o[w] = 1; }); return o; }
var TEETH = cueSet("teeth tooth toothbrush toothpaste floss dentist"),
    PHYS = cueSet("force forces stretch stretched compress compressed mass bounce coil push pull weight newton energy"),
    CHEM = cueSet("dissolve dissolves dissolved mixture mixtures liquid liquids salt sugar chemical chemicals acid concentration"),
    LOUD = cueSet("loud louder quiet quieter sound sounds music speaker hear hearing noise"),
    SKY = cueSet("planet planets star stars rocket rockets astronaut astronauts orbit moon sun galaxy outer satellite"),
    MUSIC = cueSet("music song songs sing singing melody piano notes rhythm instrument"),
    // speech recognizers sometimes write the wrong homophone; where it sits in the sentence usually gives it away
    MODAL = cueSet("to will can could would should must might may gonna wanna not never always just also cant wont dont didnt ill youll well theyll lets"),
    WHO = cueSet("i you he she it we they who everybody nobody somebody someone everyone"),
    PREP = cueSet("of in to for with around from on at about into"), BE = cueSet("is are was were be been am"),
    BONDS = cueSet("lone unshared shared electron electrons bond bonds atom atoms carbon nitrogen oxygen hydrogen"),
    HOMO_NEXT = cueSet("a an the you your it its we they i he she that this what how if or to not careful patient positive kind nice happy quiet ready able sure"),
    BRAIN = cueSet("brain brains neuron neurons mental psychology cortex nerve nerves"),
    STORY = cueSet("story stories character characters book books setting author chapter climax conflict resolution events reader readers ending"),
    NUM_WORD = cueSet("zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty thirty forty fifty hundred");
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
var CUE = {
  usFootball: cueSet("quarterback quarterbacks touchdown touchdowns nfl superbowl linebacker tackle tackled endzone helmet helmets"),
  soccer: cueSet("soccer goalie goalkeeper fifa premier messi ronaldo striker midfielder worldcup"),
  ballgame: cueSet("baseball cricket batter batting pitcher pitch inning innings swing swung hit hits homerun ball umpire"),
  tree: cueSet("tree trees trunk branch branches wood forest leaves roots oak pine maple log"),
  dog: cueSet("dog dogs puppy puppies woof growl loud"),
  duckBird: cueSet("duck ducks bird birds beak platypus feathers"),
  law: cueSet("law laws congress senate senator president vote voted signed sign government lawmakers representatives house"),
  royal: cueSet("king kings queen queens kingdom kingdoms empire emperor throne crown reign reigned ruled power powerful pharaoh land country people"),
  measure: cueSet("measure measured measuring length width height inches inch centimeters centimeter cm long longer short"),
  birdish: cueSet("bird birds wings wade wades wading legs feathers fly flies marsh pond"),
  building: cueSet("lift lifts lifted building construction steel beam beams heavy site tower machine"),
  eye: cueSet("eye eyes iris lens light dark retina vision see"),
  phone: cueSet("phone phones call calls text texting signal battery app apps"),
  jail: cueSet("prison jail locked"),
  lock: cueSet("lock locks door unlock locked open"),
  elephant: cueSet("elephant elephants"),
  sea: cueSet("ocean sea swim swims fish ice arctic zoo flipper flippers pup pups beach"),
  music: cueSet("music song songs sing singing melody piano notes note rhythm instrument instruments band"),
  map: cueSet("map maps symbol symbols legend miles distance"),
  fish: cueSet("fish fishes scales reptile reptiles snake snakes skin"),
  data: cueSet("data chart charts rows row columns column graph graphs record results tally"),
  electric: cueSet("electricity electric circuit circuits battery batteries wire wires charge voltage"),
  water: cueSet("river rivers ocean water swim stream sea waves")
};
CUE.batAnimal = cueSet("cave caves sleep sleeps wings wing night nocturnal upside mammal mammals echolocation insects vampire roost hang hangs");
CUE.kick = cueSet("kick kicks kicked kicking"); CUE.goal = cueSet("goal goals net nets");
CUE.sport = cueSet("ball balls team teams player players score scored scores coach soccer football basketball baseball hockey referee halftime field court goal goals");
CUE.fire = cueSet("fire fires flame flames stove oven burn burns burned burning cook cooking pan grill magma lava candle candles campfire sun stars star");
CUE.bodyOrgan = cueSet("body heart lungs liver kidney kidneys stomach brain skin");
// cues for middle and high school subjects, where everyday words mean something else
CUE.cellBio = cueSet("cell cells cellular organism organisms nucleus membrane cytoplasm mitochondria chloroplast chloroplasts dna rna mrna gene genes " +
  "genetic chromosome chromosomes ribosome ribosomes protein proteins enzyme enzymes glucose atp aerobic anaerobic fermentation photosynthesis " +
  "tissue tissues allele alleles nucleotide nucleotides amino transcription translation bacteria");
CUE.genetics = cueSet("dna rna mrna gene genes genetic chromosome chromosomes ribosome ribosomes allele alleles nucleotide nucleotides amino transcription translation trait traits");
CUE.atomic = cueSet("atom atoms atomic proton protons neutron neutrons electron electrons valence ion ions isotope isotopes element elements periodic " +
  "orbital orbitals molecule molecules bond bonds noble");
CUE.chemEq = cueSet("equation equations reaction reactions reactant reactants product products chemical chemicals yields coefficient coefficients formula formulas subscript subscripts");
CUE.physics = cueSet("force forces newton inertia motion mass acceleration accelerate accelerates velocity momentum friction gravity action push pushes pull pulls collision collisions");
CUE.mathGraph = cueSet("graph graphs graphing equation equations parabola parabolas quadratic factor factoring polynomial function functions axis intercept " +
  "solution solutions squared formula discriminant vertex exponent exponents");
CUE.geometry = cueSet("angle angles triangle triangles polygon polygons acute obtuse protractor congruent isosceles hypotenuse geometry");
CUE.temp = cueSet("temperature hot cold warm weather fahrenheit celsius thermometer heat freezing boiling fever");
CUE.gov = cueSet("government congress president presidents legislative executive judicial court courts constitution framers federal federalism " +
  "senate amendment amendments democracy king kings checks balances veto");
CUE.treeOnly = cueSet("tree trees trunk wood forest leaves leaf roots oak pine maple log bird birds nest climb climbed");
CUE.argue = cueSet("essay argument arguments argumentative claim claims thesis rebuttal counterclaim counterclaims evidence reasoning debate opinion");
CUE.war = cueSet("war wars soviet soviets superpower superpowers communism communist capitalism nuclear");
CUE.computer = cueSet("computer computers code coding coder program programs programming loop loops variable variables binary algorithm algorithms " +
  "byte bytes bits laptop laptops software app apps website");
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
var BIO = cueSet("organism organisms nucleus membrane cytoplasm mitochondria plant plants animal animals body blood tissue bacteria microscope");
// Words that are nouns with a picture but also everyday verbs: right after "to", "can", "you", "we"... they're the verb ("train your dog",
// "likes to bark", "let's face it"), and the noun's picture would only confuse.
var NOUN_VERB = cueSet("train trains bark ring rings face faces check checks change changes park parks point points present show shows rock rocks " +
  "wave fire match bear duck book hand head land mind object record sink stamp star tie trip type file mark iron box light play run sign order " +
  "watch saw fly ship bowl spring");
var VERB_BEFORE = cueSet("to can could will would should must might may lets please dont didnt doesnt cant wont gonna wanna ill youll well theyll " +
  "i you we they he she just also always never really");
// Does a phrase stop mid-idea? Then live talk joins it to the next one instead of drawing it alone
// ("we're learning about American" … "football", "the power" … "plant", "put it in the" … "fridge").
var DANGLE = cueSet("the a an of to and or but in on at for with about from into onto by as than like my your our their his her its this that " +
  "these those very more most some any every each another other no not is are was were be being");
function dangling(text){
  var ws = String(text).split(/\s+/).filter(Boolean).map(normalize).filter(Boolean);
  if (ws.length <= 2) return true;
  var last = ws[ws.length - 1], prev = ws[ws.length - 2];
  if (/^(is|are|was|were)$/.test(last) && /^(there|it|they|we|you|he|she|that|this|what|where|who|how|which)$/.test(prev)) return false;
  return !!DANGLE[last] || (!!PHRASE_START[last] && !VERB_BEFORE[last] && ws.length <= 7);
}
var NEEDS_DET = cueSet("store stores log logs beat beats mask masks switch switches");
var NOUN_DET = cueSet("the a an this that these those my your our his her their its every each some any no one");
var NOUN_ADJ = cueSet("grocery toy pet book candy corner local general big small little new old light wall drum paper face");
function usedAsVerb(w, i, norm){
  if (NEEDS_DET[w] && !NOUN_DET[norm[i - 1]] && !(NOUN_ADJ[norm[i - 1]] && NOUN_DET[norm[i - 2]])) return true;
  if (!NOUN_VERB[w]) return false;
  var pv = norm[i - 1] || "";
  return !!VERB_BEFORE[pv];
}

// Fraction pictures (pizza, halves...) only make sense in a maths sentence; "the whole cycle" must not show a pizza.
var MATH_ONLY = { whole: 1, half: 1, slice: 1, pizza: 1 };
var MATH_CUES = { fraction: 1, fractions: 1, equal: 1, equally: 1, parts: 1, part: 1, numerator: 1, denominator: 1, divide: 1, divided: 1, pizza: 1, pie: 1, cut: 1, third: 1, thirds: 1, fourth: 1, fourths: 1, fifth: 1, fifths: 1, eighth: 1, eighths: 1, quarter: 1, quarters: 1, halves: 1, slices: 1 };
function hasMathCue(norm){ for (var k = 0; k < norm.length; k++) if (MATH_CUES[norm[k]] || MATH_CUES[norm[k].replace(/s$/, "")]) return true; return false; }
var FRACTION_TALK = { fraction: 1, fractions: 1, numerator: 1, denominator: 1, pizza: 1, pie: 1, slice: 1, slices: 1, equal: 1, equally: 1, parts: 1 };
var COMPUTER_CUES = { computer: 1, keyboard: 1, screen: 1, click: 1, laptop: 1, cursor: 1, code: 1, internet: 1, monitor: 1, tablet: 1 };
function hasCue(norm, cues){ for (var k = 0; k < norm.length; k++) if (cues[norm[k]]) return true; return false; }
export { COMPUTER_CUES, CUE, FRACTION_TALK, MATH_ONLY, contextual, cueSet, dangling, hasCue, hasMathCue, senseOf, usedAsVerb };
