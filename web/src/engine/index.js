// The picture engine's public interface, as the app and the tests use it.
import "./diagrams/drawn.js"
import "./diagrams/images.js"
import { analyze, sceneFromAI, splitSpoken } from "./analyze.js"
import { IMAGE_DIAGRAMS } from "./diagrams/images.js"
import { DIAGRAMS, DIAGRAM_ORDER, diagramScene } from "./diagrams/registry.js"
import { I, art } from "./drawings.js"
import { allItems, conceptFor, extraConcept, looseWord, normalize } from "./lookup.js"
import { setOpenMoji } from "./openmoji.js"
import { PHRASES, addSymbolPhrases } from "./phrases.js"
import { buildPlanPrompt } from "./prompt.js"
import { RELATION } from "./relations.js"
import { renderScene } from "./render.js"
import { dangling } from "./senses.js"
import { EMOJI_LIB, SYM, SYM_WORDS, VOCAB, WORD_TO_ICON, applySymbols, setAssetBase } from "./vocabulary.js"
import { sceneWords, wordScene } from "./word-cards.js"

// ---------- helpers for the app ----------
function firstAt(sc){
  if (sc.diagram) return sc.diagramAt || 0;
  if (sc.words) return sc.words.first;
  var ats = allItems(sc).map(function(x){ return x.at; });
  if (sc.relation && sc.relation !== "and") ats.push(sc.verbAt);
  return ats.length ? Math.min.apply(null, ats) : 0;
}
function highlightAts(sc){
  var h = {};
  if (!sc.show) return h;
  if (sc.diagram){ (sc.hlAts || []).forEach(function(i){ h[i] = true; }); return h; }
  if (sc.words){ (sc.words.main || []).concat(sc.words.words).forEach(function(tk){ if (tk.k) h[tk.at] = true; }); return h; }
  allItems(sc).forEach(function(x){ h[x.at] = true; });
  if (sc.relation && sc.relation !== "and") h[sc.verbAt] = true;
  if (sc.then) h[sc.then.verbAt] = true;
  return h;
}
function sceneKeys(sc){ return sc.words ? [sc.words.sig] : sc.diagram ? ["d:" + sc.diagram + ":" + (sc.highlight || []).join(",")] : allItems(sc).map(function(x){ return x.key; }); }
function iconSVG(key){ return I[key] ? '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + art(key) + '</svg>' : ""; }
function iconGallery(){
  return Object.keys(I).map(function(k){ return { key: k, name: VOCAB[k] ? VOCAB[k][0] : k, words: VOCAB[k] || [k], svg: iconSVG(k) }; });
}
function sceneIcons(sc){ return allItems(sc).filter(function(x){ return x.icon; }).map(function(x){ return x.icon; }); }
function uniqueEmoji(){ var u = {}; Object.keys(EMOJI_LIB).forEach(function(k){ u[EMOJI_LIB[k]] = 1; }); return u; }
export const SceneEngine = {
  iconSVG: iconSVG, sceneIcons: sceneIcons,
  analyze: analyze, sceneFromAI: sceneFromAI, renderScene: renderScene, firstAt: firstAt,
  highlightAts: highlightAts, sceneKeys: sceneKeys, buildPlanPrompt: buildPlanPrompt, iconGallery: iconGallery, isUnsure: function(w, extra){ w = normalize(w); return !!w && !RELATION[w] && looseWord(w) && extraConcept(w, extra) === undefined; }, lookup: function(w, extra){ return conceptFor(normalize(w), extra); },
  setOpenMoji: setOpenMoji,
  splitSpoken: splitSpoken, dangling: dangling, wordScene: wordScene, sceneWords: sceneWords, diagramScene: diagramScene, diagramCount: DIAGRAM_ORDER.length,
  diagramGallery: function(){
    return DIAGRAM_ORDER.map(function(k){ var d = DIAGRAMS[k], sc = diagramScene(d.title, k); sc.caption = d.title; sc.highlight = []; return { key: k, title: d.title, say: d.sayText, svg: renderScene(sc) }; });
  },
  normalize: normalize, iconCount: Object.keys(I).length,
  // these grow when the symbol table arrives, so they are worked out when asked
  get wordCount(){ return Object.keys(WORD_TO_ICON).length + Object.keys(EMOJI_LIB).length + Object.keys(SYM_WORDS).length; },
  get symbolCount(){ var u = {}; Object.keys(SYM.words).concat(Object.keys(SYM.phrases)).forEach(function(k){ u[SYM.words[k] || SYM.phrases[k]] = 1; }); return Object.keys(u).length; },
  get emojiCount(){ return Object.keys(uniqueEmoji()).length; },
  // the symbol table (public/symbols/index.json), once fetched
  setSymbols: function(table){ applySymbols(table); addSymbolPhrases(table.phrases || {}); },
  setAssetBase: setAssetBase,
  // for the asset tests: every symbol file, diagram file and emoji the engine can ask for
  symbolTable: function(){ return { words: SYM.words, phrases: SYM.phrases }; },
  imageDiagrams: function(){ return IMAGE_DIAGRAMS.map(function(d){ return { key: d[0], title: d[1], file: d[0] + "." + (d[3] || "svg") }; }); },
  emojiList: function(){
    var u = uniqueEmoji();
    Object.keys(PHRASES).forEach(function(k){ PHRASES[k].forEach(function(p){ if (p.pic && p.pic.slice(0, 2) === "m:") u[p.pic.slice(2)] = 1; }); });
    return Object.keys(u);
  }
};
