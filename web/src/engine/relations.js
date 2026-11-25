// Action words that connect things in a scene ("turns into", "eats", "makes") and how each is drawn.

// ---------- relations (action words) ----------
var RELATIONS = ["heats", "cools", "rises", "falls", "becomes", "powers", "contains", "versus", "wants", "needs", "pulls", "leads", "splits", "cycle", "and"];
var CHAINABLE = { becomes: 1, rises: 1, falls: 1, heats: 1, cools: 1, powers: 1, leads: 1, pulls: 1, splits: 1 };
var RELATION = {};
function addRel(type, words){ words.split(" ").forEach(function(w){ RELATION[w] = type; }); }
addRel("heats", "heats heated heating warms warmed warming burns burned burning");
addRel("rises", "rise rises rose rising risen evaporates evaporate evaporated evaporating climbs climbed floats floated ascends erupts erupted");
addRel("falls", "fall falls fell falling releases release released releasing pours poured sinks sank flows flowed flowing drips");
addRel("becomes", "becomes become became forms form formed forming turns turn turned turning changes changed changing makes make made making creates create created produces produced builds build built melts melted freezes froze condenses condensed");
addRel("powers", "powers powered powering drives drove driven fuels fueled energizes");
addRel("contains", "contains contain contained inside within holds hold held carries carry carried stores stored includes include");
addRel("versus", "fights fight fought fighting attacks attack attacked defeats defeat defeated against battled reduces reduce reduced prevents prevent prevented blocks blocked stops stopped");
addRel("wants", "demands demand demanded wants want wanted asks asked");
addRel("needs", "needs need needed depends depend depended rely relies relied requires require required uses use used eats eat ate absorbs absorb absorbed");
addRel("cycle", "cycle cycles repeats repeat repeated orbits orbit orbited orbiting spins rotates rotate rotated");
addRel("cools", "cools cool cooled cooling hardens harden hardened chills");
addRel("splits", "splits split splitting divides divide divided breaks break broke separates separate separated cuts cut shares share shared");
addRel("becomes", "grows grow grew growing hatches hatch hatched develops develop developed evolves evolved invented invents discovered discovers designed transforms transform transformed combine combines combined joins join joined equals equal");
addRel("leads", "pumps pump pumped sends send sent gives give gave protects protect protected saves heals sells sold buys bought trades traded connects connect connected brings brought delivers moves move");
addRel("wants", "says said tells told writes wrote written explains explained describes described argues argued speaks spoke shouts");
addRel("versus", "hunts hunt hunted chases chase chased catches catch caught attack attacks");
addRel("needs", "breathe breathes breathed consumes consume consumed takes take took collects collect collected");
addRel("pulls", "pulls pull pulled pushes push pushed attracts attract attracted lifts lifted");
addRel("leads", "causes cause caused leads led helps help helped travels travel traveled ride rides rode fly flies flew reach reaches reached sails sailed");
var REVERSE_NEXT = { by: 1, from: 1 };
export { CHAINABLE, RELATION, RELATIONS, REVERSE_NEXT };
