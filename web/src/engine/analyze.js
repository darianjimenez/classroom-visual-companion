// Reading a sentence into a scene: splitting live talk into ideas, finding things and actions, captions, and Claude's plans.
import { DIAGRAMS, diagramScene } from "./diagrams/registry.js"
import { I } from "./drawings.js"
import { allItems, autoSetting, cap, conceptFor, extraConcept, forms, joinL, labelOf, normalize, uniq } from "./lookup.js"
import { isName, spokenNames } from "./names.js"
import { phraseAt } from "./phrases.js"
import { CHAINABLE, RELATION, RELATIONS, REVERSE_NEXT } from "./relations.js"
import { COMPUTER_CUES, CUE, FRACTION_TALK, MATH_ONLY, contextual, hasCue, hasMathCue, senseOf, usedAsVerb } from "./senses.js"
import { SETTINGS, SYM_MINOR, WEAK } from "./vocabulary.js"
import { keyPoint, tidySentence } from "./word-cards.js"

// A long sentence whose picture is one thing ("…the laws that affected them" → a picture of laws) keeps its words in the
// caption, so the idea isn't lost: "Laws" alone says little.
function ruleCaption(sc, raw){
  if (sc.relation === "cycle" && sc.subjects.length === 1) return shortCaption(sc, raw);
  // up to 16 words the caption is the sentence itself (as in the tuned lessons), without "okay so" or "please"
  var t = tidySentence(raw), tn = t ? t.split(" ").length : 0;
  if (t && tn <= 16) return t;
  var c = shortCaption(sc, raw);
  return c.split(" ").length <= 3 && t && tn <= 20 ? t : c;
}
function shortCaption(sc, raw){
  var clean = function(t){ return t.replace(/^[^A-Za-z0-9]+/, "").replace(/[.!?;:,\u2014\-]+$/, ""); };
  var n = raw.length;
  if (sc.relation === "cycle" && sc.subjects.length === 1) return "The " + sc.subjects[0].label + " cycle";
  if (n <= 11) return cap(clean(raw.join(" ")));
  var ats = allItems(sc).map(function(x){ return x.at; });
  if (sc.relation && sc.relation !== "and") ats.push(sc.verbAt);
  if (sc.then) ats.push(sc.then.verbAt);
  var lo = Math.min.apply(null, ats), hi = Math.max.apply(null, ats);
  // widen back to the start of the clause when it's only a few words away
  var lo2 = lo;
  while (lo2 > 0 && lo - lo2 < 3 && !/[,;:.!?]$/.test(raw[lo2 - 1])) lo2--;
  if (lo2 === 0 || /[,;:.!?]$/.test(raw[lo2 - 1])){ if (hi - lo2 + 1 <= 14) lo = lo2; }
  while (lo < hi && /^(and|but|which|that|so|then)$/i.test(raw[lo])) lo++;
  if (hi - lo + 1 <= 14) return cap(clean(raw.slice(lo, hi + 1).join(" ")));
  if (!sc.objects.length) return cap(joinL(sc.subjects, ", "));
  if (sc.relation === "contains") return cap(joinL(sc.objects) + " inside the " + joinL(sc.subjects));
  var s = joinL(sc.subjects) + " " + sc.verb + " " + joinL(sc.objects);
  if (sc.then) s += " → " + sc.then.verb + " " + joinL(sc.then.objects);
  return cap(s);
}
// Speech arrives without punctuation, so a long stretch of talk is one phrase. Split it where a new idea usually starts.
var SPLIT_AT = { so: 1, then: 1, but: 1, because: 1, next: 1, finally: 1, now: 1, also: 1, however: 1, meanwhile: 1, later: 1, after: 1, afterwards: 1, when: 1, while: 1, until: 1 };
var CLAUSE_START = { the: 1, it: 1, they: 1, we: 1, you: 1, he: 1, she: 1, this: 1, these: 1, those: 1, that: 1, there: 1 };
var PRONOUN = { it: 1, they: 1, he: 1, she: 1 };
function splitSpoken(text){
  var words = String(text).split(/\s+/).filter(Boolean);
  if (words.length <= 12) return words.length ? [words.join(" ")] : [];
  var parts = [], cur = [];
  for (var k = 0; k < words.length; k++){
    var w = normalize(words[k]), nx = normalize(words[k + 1] || "");
    var brk = (cur.length >= 3 && /[.!?;]$/.test(words[k - 1])) || (cur.length >= 5 && SPLIT_AT[w]) ||
      (w === "and" && ((cur.length >= 5 && SPLIT_AT[nx]) || (cur.length >= 6 && CLAUSE_START[nx]) || cur.length >= 14)) || cur.length >= 22;
    if (brk){ parts.push(cur); cur = []; }
    cur.push(words[k]);
  }
  if (cur.length) parts.push(cur);
  // fold a short tail back into the phrase before it
  if (parts.length > 1 && parts[parts.length - 1].length < 4) parts[parts.length - 2] = parts[parts.length - 2].concat(parts.pop());
  return parts.map(function(p){ return p.join(" "); });
}
function emptyScene(){ return { show: false, relation: null, verb: "", verbAt: 0, subjects: [], objects: [], then: null, setting: "plain", caption: "" }; }

// Rule-based reading of one sentence: find the things, find the action between them.
function analyze(text, extra, context){
  var raw = String(text).split(/\s+/).filter(Boolean);
  var norm = raw.map(normalize), n = raw.length, i;
  var dsc = diagramScene(text);
  if (dsc) return dsc;
  var cues = norm.concat(context && context.words || [], context && context.next || []), names = spokenNames(raw, norm);
  var concepts = [], rels = [];
  for (i = 0; i < n; i++){
    var w = norm[i];
    if (w === "into") continue;
    // a phrase that means one thing ("american football", "cell phone") is one picture, or none
    var ph = phraseAt(norm, i);
    if (ph){
      if (ph.c) concepts.push({ i: i, icon: ph.c.icon, emoji: ph.c.emoji, sym: ph.c.sym, key: ph.c.key, label: raw.slice(i, i + ph.len).map(labelOf).join(" "), weak: false });
      i += ph.len - 1;
      continue;
    }
    if (RELATION[w]){ rels.push({ i: i, type: RELATION[w] }); continue; }
    if (names[i] || isName(raw, norm, i)) continue;
    var own = extraConcept(w, extra) !== undefined;
    if (!own && usedAsVerb(w, i, norm)) continue;
    var c = conceptFor(w, extra), cx = own ? undefined : contextual(w, i, raw, cues);
    if (cx === undefined && !own) cx = senseOf(w, i, norm, cues);
    if (cx !== undefined) c = cx;
    if (c && (c.emoji === "🐭" || c.icon === "mouse") && hasCue(cues, COMPUTER_CUES)) c = { emoji: "🖱️", key: "m:🖱️" };
    if (c && MATH_ONLY[c.icon] && (!hasMathCue(cues) || (hasCue(cues, CUE.sport) && !hasCue(norm, FRACTION_TALK)))) c = null;
    if (c) concepts.push({ i: i, icon: c.icon, emoji: c.emoji, sym: c.sym, key: c.key, label: labelOf(raw[i]), weak: !!WEAK[w] && extraConcept(w, extra) === undefined,
      minor: !!c.sym && !!SYM_MINOR[c.sym], extraSym: !!c.sym });
  }
  // An action or a state ("pour", "dig", "hungry") is pictured only when the sentence has little else to show, and the symbols added
  // for words the drawings and emoji don't cover give way first when there are more things than fit on the card.
  var mainN = concepts.filter(function(c){ return !c.minor && !c.weak; }).length;
  if (mainN >= 2) concepts = concepts.filter(function(c){ return !c.minor; });
  // only an action to show, in a sentence that defines or names something ("A hypothesis is an educated guess"): the word card
  // with the key word says more than a picture of guessing
  if (concepts.length && concepts.every(function(c){ return c.minor; })){ var kp0 = keyPoint(text); if (kp0 && kp0.main) return emptyScene(); }
  var keys = {};
  concepts.forEach(function(c){ keys[c.key] = 1; });
  if (Object.keys(keys).length > 3){
    var nonSym = concepts.filter(function(c){ return !c.extraSym; });
    var nk = {}; nonSym.forEach(function(c){ nk[c.key] = 1; });
    var room = 3 - Object.keys(nk).length;
    if (Object.keys(nk).length >= 2) concepts = concepts.filter(function(c){
      if (!c.extraSym || nk[c.key]) return true;
      if (room > 0){ room--; nk[c.key] = 1; return true; }
      return false;
    });
  }
  for (i = 0; i < n; i++){
    if (norm[i] !== "into") continue;
    var pb = null;
    rels.forEach(function(r){ if (r.type === "becomes" && r.i < i && i - r.i <= 5) pb = r; });
    if (pb){ pb.objStart = i + 1; pb.into = true; }
    else if (!rels.some(function(r){ return r.i < i && i - r.i <= 3; })) rels.push({ i: i, type: "leads", bare: true });
  }
  rels.sort(function(a, b){ return a.i - b.i; });

  var scene = emptyScene();
  if (!concepts.some(function(c){ return !c.weak; })) return scene;
  scene.show = true;
  function verbText(r){ return r.bare ? "into" : labelOf(raw[r.i]).toLowerCase() + (r.into ? " into" : ""); }
  var all = uniq(concepts);

  if (rels.length && rels[0].type === "cycle"){
    scene.relation = "cycle";
    scene.verb = labelOf(raw[rels[0].i]).toLowerCase();
    scene.verbAt = rels[0].i;
    scene.subjects = all.slice(0, 3);
  } else {
    var steps = [], loose = null, prevI = -1;
    for (var j = 0; j < rels.length && steps.length < 2; j++){
      var r = rels[j], nextI = j + 1 < rels.length ? rels[j + 1].i : n;
      var objStart = r.objStart || r.i + 1;
      var subjWin = concepts.filter(function(c){ return c.i > prevI && c.i < r.i; });
      var objWin = concepts.filter(function(c){ return c.i >= objStart && c.i < nextI; });
      var subs, objs;
      if (norm[r.i] === "inside" || norm[r.i] === "within"){
        var after = uniq(concepts.filter(function(c){ return c.i > r.i; }));
        subs = after.slice(0, 1); objs = after.slice(1, 3);
      } else if (steps.length){
        if (!CHAINABLE[r.type]) break;
        subs = steps[steps.length - 1].objects;
        objs = uniq(objWin).slice(0, 2);
      } else {
        subs = uniq(subjWin).slice(-2);
        objs = uniq(objWin).filter(function(o){ return !subs.some(function(x){ return x.key === o.key; }); }).slice(0, 2);
        // live talk: "...and then it makes a chrysalis" - "it" is the last thing talked about
        if (!subs.length && context && context.subject){
          for (var p = prevI + 1; p < r.i; p++) if (PRONOUN[norm[p]]){
            var cs = context.subject;
            subs = [{ icon: cs.icon, emoji: cs.emoji, sym: cs.sym, key: cs.key, label: cs.label, at: p }];
            break;
          }
        }
        if (REVERSE_NEXT[norm[r.i + 1]]){ var t = subs; subs = objs; objs = t; }
      }
      objs = objs.filter(function(o){ return !subs.some(function(s){ return s.key === o.key; }); });
      prevI = r.i;
      if (subs.length && objs.length) steps.push({ type: r.type, verb: verbText(r), verbAt: r.i, subjects: subs, objects: objs });
      else if (!steps.length && !loose) loose = r;
    }
    if (steps.length){
      var s0 = steps[0];
      scene.relation = s0.type; scene.verb = s0.verb; scene.verbAt = s0.verbAt;
      scene.subjects = s0.subjects; scene.objects = s0.objects;
      if (steps[1]){
        var used = {};
        s0.subjects.concat(s0.objects).forEach(function(x){ used[x.key] = 1; });
        var tObjs = steps[1].objects.filter(function(o){ return !used[o.key]; });
        if (tObjs.length) scene.then = { relation: steps[1].type, verb: steps[1].verb, verbAt: steps[1].verbAt, objects: tObjs };
      }
    } else if (loose && all.length >= 2){
      var before = all.filter(function(c){ return c.at < loose.i; }), afterC = all.filter(function(c){ return c.at > loose.i; });
      var S = before.length ? before.slice(-2) : [all[0]];
      var O = (afterC.length ? afterC.slice(0, 2) : [all[all.length - 1]]).filter(function(o){ return !S.some(function(x){ return x.key === o.key; }); });
      if (O.length){
        if (REVERSE_NEXT[norm[loose.i + 1]]){ var tt = S; S = O; O = tt; }
        scene.relation = loose.type; scene.verb = verbText(loose); scene.verbAt = loose.i;
        scene.subjects = S; scene.objects = O;
      } else {
        scene.subjects = all.slice(0, 3); scene.relation = all.length > 1 ? "and" : null;
      }
    } else {
      scene.subjects = all.slice(0, 3);
      scene.relation = all.length > 1 ? "and" : null;
      scene.verbAt = scene.subjects[0].at;
    }
  }
  scene.setting = autoSetting(allItems(scene));
  scene.caption = ruleCaption(scene, raw);
  return scene;
}

// Turn one item of Claude's plan into a scene, timed against the sentence's words.
function sceneFromAI(o, text, extra){
  if (!o || typeof o !== "object") return null;
  if (o.show === false) return emptyScene();
  if (typeof o.diagram === "string" && DIAGRAMS[o.diagram]){
    var ds = diagramScene(text, o.diagram);
    if (typeof o.caption === "string" && o.caption.trim()) ds.caption = o.caption.trim().slice(0, 80);
    return ds;
  }
  var raw = String(text).split(/\s+/).filter(Boolean), norm = raw.map(normalize), n = raw.length;
  var labels = (o.labels && typeof o.labels === "object") ? o.labels : {};
  var used = {};
  function findAt(item){
    var i;
    for (i = 0; i < n; i++){ var c = conceptFor(norm[i], extra); if (c && c.key === item.key) return i; }
    var labN = normalize((item.label.split(/\s+/)[0]) || "");
    if (labN.length >= 3){
      for (i = 0; i < n; i++){
        if (norm[i] === labN || forms(norm[i]).indexOf(labN) >= 0 || (labN.length >= 5 && norm[i].slice(0, 5) === labN.slice(0, 5))) return i;
      }
    }
    return n - 1;
  }
  function mk(k){
    if (typeof k !== "string") return null;
    var key = k.trim().toLowerCase(), item = null;
    if (I[key]) item = { icon: key, key: "i:" + key };
    else { var c = conceptFor(normalize(key), extra); if (c) item = { icon: c.icon, emoji: c.emoji, sym: c.sym, key: c.key }; }
    if (!item || used[item.key]) return null;
    used[item.key] = true;
    var lab = labels[k] != null ? labels[k] : labels[key];
    item.label = (typeof lab === "string" && lab.trim()) ? lab.trim().slice(0, 24) : key;
    item.at = findAt(item);
    return item;
  }
  function list(a, max){ return (Array.isArray(a) ? a : []).map(mk).filter(Boolean).slice(0, max); }
  function findVerb(verb, fallback){
    var vn = normalize(String(verb || "").split(/\s+/)[0] || "");
    if (vn.length >= 3) for (var i = 0; i < n; i++) if (norm[i] === vn || (vn.length >= 4 && norm[i].slice(0, 4) === vn.slice(0, 4))) return i;
    return fallback;
  }
  var rel = RELATIONS.indexOf(o.relation) >= 0 ? o.relation : null;
  var hasObj = Array.isArray(o.objects) && o.objects.length > 0;
  var subjects = list(o.subjects, (rel === "cycle" || rel === "and" || !hasObj) ? 3 : 2);
  var objects = rel === "cycle" ? [] : list(o.objects, 2);
  if (!subjects.length && objects.length){ subjects = objects; objects = []; }
  if (!subjects.length) return emptyScene();
  if (!objects.length && rel !== "cycle") rel = subjects.length > 1 ? "and" : null;
  var minObj = objects.length ? Math.min.apply(null, objects.map(function(x){ return x.at; })) : n - 1;
  var maxSub = Math.max.apply(null, subjects.map(function(x){ return x.at; }));
  var scene = {
    show: true, relation: rel,
    verb: typeof o.verb === "string" ? o.verb.trim().slice(0, 22) : "",
    verbAt: 0, subjects: subjects, objects: objects, then: null, setting: "plain", caption: ""
  };
  scene.verbAt = findVerb(scene.verb, objects.length ? Math.max(0, Math.min(minObj, maxSub + 1)) : maxSub);
  if (o.then && typeof o.then === "object" && objects.length && CHAINABLE[rel]){
    var tObjs = list(o.then.objects, 2);
    if (tObjs.length){
      var tr = CHAINABLE[o.then.relation] ? o.then.relation : "leads";
      var tVerb = typeof o.then.verb === "string" ? o.then.verb.trim().slice(0, 22) : "";
      var minT = Math.min.apply(null, tObjs.map(function(x){ return x.at; }));
      scene.then = { relation: tr, verb: tVerb, verbAt: findVerb(tVerb, Math.max(0, minT - 1)), objects: tObjs };
    }
  }
  scene.setting = SETTINGS.indexOf(o.setting) >= 0 ? o.setting : autoSetting(allItems(scene));
  scene.caption = (typeof o.caption === "string" && o.caption.trim()) ? o.caption.trim().slice(0, 80) : ruleCaption(scene, raw);
  return scene;
}
export { analyze, emptyScene, sceneFromAI, splitSpoken };
