// Action words that connect things in a scene ("turns into", "eats", "makes") and how each is drawn.
import RELATIONS_DATA from "./words/relations.json" with { type: "json" }

// ---------- relations (action words) ----------
var RELATIONS = RELATIONS_DATA.types;
var CHAINABLE = toSet(RELATIONS_DATA.chainable);
var RELATION = {};
function addRel(type, words){ words.forEach(function(w){ RELATION[w] = type; }); }
function toSet(list){ var o = {}; list.forEach(function(w){ o[w] = 1; }); return o; }
RELATIONS_DATA.words.forEach(function(r){ addRel(r[0], r[1]); });

var REVERSE_NEXT = toSet(RELATIONS_DATA.reverseNext);
export { CHAINABLE, RELATION, RELATIONS, REVERSE_NEXT };
