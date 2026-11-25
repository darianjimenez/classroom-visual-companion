// People's names, so "Rosa Parks" doesn't draw a park and "Martin Luther King" doesn't draw a crown.
import { RELATION } from "./relations.js"
import NAMES from "./words/names.json" with { type: "json" }
function toSet(list){ var o = {}; list.forEach(function(w){ o[w] = 1; }); return o; }

// "Rosa Parks" must not draw a park and "Martin Luther King" must not draw a crown: runs of capitalised words are names.
var NAME_SKIP = toSet(NAMES.notNames);
var TOPIC_WORD = /(ial|ian|ish|ese|ern|ic|al)$|^(civil|cold|world|great|new|old|ancient|solar|middle|dark|stone|bronze|iron|ice|gold)$/;
function isCap(raw, norm, i){ return i >= 0 && i < raw.length && /^[A-Z]/.test(raw[i].replace(/^[^A-Za-z]+/, "")) && !NAME_SKIP[norm[i]]; }
function isName(raw, norm, i){
  if (!isCap(raw, norm, i)) return false;
  var a = i, z = i;
  while (isCap(raw, norm, a - 1) && !/,$/.test(raw[a - 1])) a--;
  while (isCap(raw, norm, z + 1) && !/,$/.test(raw[z])) z++;
  if (z === a) return false;
  // topic phrases ("Industrial Revolution", "French Revolution", "Cold War") are not people
  for (var j = a; j <= z; j++) if (TOPIC_WORD.test(norm[j])) return false;
  return true;
}
// Speech-to-text often loses capitals ("rosa parks"), so also treat a known first name, or a title like "mr",
// and the one or two words after it as a name. A middle name or initial carries on ("martin luther king", "susan b anthony").
var FIRST_NAMES = {}, NAME_TITLES = toSet(NAMES.titles), NAME_STOP = {};
NAMES.firstNames.forEach(function(w){ FIRST_NAMES[w] = 1; });
NAMES.stopAfterName.forEach(function(w){ NAME_STOP[w] = 1; });
function spokenNames(raw, norm){
  var n = norm.length, mask = [], i, j, took;
  for (i = 0; i < n; i++){
    var first = FIRST_NAMES[norm[i]], title = NAME_TITLES[norm[i]];
    if (!first && !title) continue;
    if (first) mask[i] = true;
    if (/'s$|[,.;:!?]$/i.test(raw[i])) continue;
    for (j = i + 1, took = 0; j < n && took < 3; j++){
      var w = norm[j];
      if (!w || NAME_STOP[w] || RELATION[w]) break;
      mask[j] = true; took++;
      if (/'s$|[,.;:!?]$/i.test(raw[j])) break;
      if (!FIRST_NAMES[w] && w.length > 1){ if (norm[j + 1] === "jr" || norm[j + 1] === "junior") mask[j + 1] = true; break; }
    }
    i = j - 1 > i ? j - 1 : i;
  }
  return mask;
}
export { isName, spokenNames };
