// Looking a word up: spelling forms, a teacher's own pictures, and the small helpers scenes are built with.
import { I } from "./drawings.js"
import { RELATION } from "./relations.js"
import { EMOJI_LIB, ICON_SETTING, SETTING_ORDER, SYM_WORDS, WORD_TO_ICON } from "./vocabulary.js"
import RULES from "./words/rules.json" with { type: "json" }

function normalize(raw){ return String(raw).toLowerCase().replace(/[^a-z']/g, "").replace(/'s$/, "").replace(/'/g, ""); }
function forms(w){
  var out = [w];
  if (w.length > 4 && /ies$/.test(w)) out.push(w.slice(0, -3) + "y");
  if (w.length > 4 && /ves$/.test(w)) out.push(w.slice(0, -3) + "f");
  if (w.length > 2 && /s$/.test(w)) out.push(w.slice(0, -1));
  if (w.length > 3 && /es$/.test(w)) out.push(w.slice(0, -2));
  return out;
}
// Words that only loosely match a picture ("home" -> house, "day" -> calendar). Better to show nothing than a wrong or off-topic picture;
// a teacher can still give one a picture of their own.
var LOOSE = {};
RULES.loose.forEach(function(w){ LOOSE[w] = 1; });
function looseWord(w){ var fs = forms(w); for (var i = 0; i < fs.length; i++) if (LOOSE[fs[i]]) return true; return false; }
function extraConcept(w, extra){
  if (!extra) return undefined;
  var fs = forms(w);
  for (var i = 0; i < fs.length; i++){
    var v = extra[fs[i]];
    if (v == null || v === "") continue;
    if (v === "-") return null;
    if (v.charAt(0) === "@" && I[v.slice(1)]) return { icon: v.slice(1), key: "i:" + v.slice(1) };
    return { emoji: v, key: "e:" + fs[i] };
  }
  return undefined;
}
function conceptFor(w, extra){
  if (!w || RELATION[w]) return null;
  var ex = extraConcept(w, extra);
  if (ex !== undefined) return ex;
  if (looseWord(w)) return null;
  var fs = forms(w), i;
  for (i = 0; i < fs.length; i++) if (WORD_TO_ICON[fs[i]]) return { icon: WORD_TO_ICON[fs[i]], key: "i:" + WORD_TO_ICON[fs[i]] };
  for (i = 0; i < fs.length; i++) if (EMOJI_LIB[fs[i]]) return { emoji: EMOJI_LIB[fs[i]], key: "m:" + EMOJI_LIB[fs[i]] };
  var sw = SYM_WORDS[w] ? w : /[^s]s$/.test(w) && SYM_WORDS[w.slice(0, -1)] ? w.slice(0, -1) : /(s|x|z|ch|sh)es$/.test(w) && SYM_WORDS[w.slice(0, -2)] ? w.slice(0, -2) : "";
  if (sw) return { sym: SYM_WORDS[sw], key: "s:" + SYM_WORDS[sw] };
  return null;
}
function labelOf(raw){
  var t = String(raw).replace(/[^A-Za-z0-9'%\-]/g, "").replace(/^'+|'+$/g, "").replace(/'s$/i, "");
  return (/^[A-Z0-9]{2,}$/.test(t)) ? t : t.toLowerCase();
}
function uniq(list){
  var out = [], seen = {};
  list.forEach(function(c){
    if (seen[c.key]){
      var o = seen[c.key];
      if (o.label.toLowerCase() !== c.label.toLowerCase() && o.label.indexOf("&") < 0) o.label += " & " + c.label;
      return;
    }
    var copy = { icon: c.icon, emoji: c.emoji, sym: c.sym, key: c.key, label: c.label, at: c.at != null ? c.at : c.i };
    seen[c.key] = copy;
    out.push(copy);
  });
  return out;
}
function allItems(sc){ return (sc.subjects || []).concat(sc.objects || [], sc.then ? sc.then.objects : []); }
function autoSetting(items){
  var present = {};
  items.forEach(function(it){ if (it.icon && ICON_SETTING[it.icon]) present[ICON_SETTING[it.icon]] = true; });
  for (var i = 0; i < SETTING_ORDER.length; i++) if (present[SETTING_ORDER[i]]) return SETTING_ORDER[i];
  return "plain";
}
function joinL(items, sep){ return items.map(function(i){ return i.label; }).join(sep || " & "); }
function cap(s){ return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
// LOOSE is also read by the picture build (web/tools/pictures)
export { LOOSE, allItems, autoSetting, cap, conceptFor, extraConcept, forms, joinL, labelOf, looseWord, normalize, uniq };
