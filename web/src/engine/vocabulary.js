// Which word shows which picture: the drawings' word lists, the emoji library, the symbol table, and words kept picture-less.
import OPENMOJI from "./data/openmoji-words.json" with { type: "json" }
import { I } from "./drawings.js"
import DRAWINGS from "./words/drawings.json" with { type: "json" }
import EMOJI from "./words/emoji.json" with { type: "json" }
import RULES from "./words/rules.json" with { type: "json" }

var VOCAB = DRAWINGS.vocab;
var VOCAB_MORE = DRAWINGS.more;
Object.keys(VOCAB_MORE).forEach(function(k){ VOCAB[k] = VOCAB_MORE[k]; });

// pack 2 vocabulary (words already claimed by an earlier drawing keep that drawing)
var VOCAB_PACK2 = DRAWINGS.pack2;
(function(){
  var claimed = {};
  Object.keys(VOCAB).forEach(function(k){ VOCAB[k].forEach(function(w){ claimed[w] = true; }); });
  VOCAB.shield = VOCAB.shield.filter(function(w){ return w !== "knight"; }); delete claimed.knight;
  Object.keys(VOCAB_PACK2).forEach(function(k){
    var ws = VOCAB_PACK2[k].split(" ").filter(function(w){ return !claimed[w]; });
    if (!ws.length) ws = [k];
    ws.forEach(function(w){ claimed[w] = true; });
    VOCAB[k] = ws;
  });
})();
var WORD_TO_ICON = {};
Object.keys(VOCAB).forEach(function(k){ VOCAB[k].forEach(function(w){ WORD_TO_ICON[w] = k; }); });
var VOCAB_PACK3 = DRAWINGS.pack3;
(function(){
  var claimed = {};
  Object.keys(WORD_TO_ICON).forEach(function(w){ claimed[w] = true; });
  Object.keys(VOCAB_PACK3).forEach(function(k){
    var ws = VOCAB_PACK3[k].split(" ").filter(function(w){ return !claimed[w]; });
    ws.forEach(function(w){ claimed[w] = true; });
    VOCAB[k] = (VOCAB[k] || []).concat(ws);
  });
  WORD_TO_ICON = {};
  Object.keys(VOCAB).forEach(function(k){ VOCAB[k].forEach(function(w){ WORD_TO_ICON[w] = k; }); });
})();
// K-12 gaps: new drawings, and more words for existing ones (only words no other picture already claims)
var VOCAB_PACK5 = DRAWINGS.pack5;
(function(){
  var claimed = {};
  Object.keys(WORD_TO_ICON).forEach(function(w){ claimed[w] = true; });
  Object.keys(VOCAB_PACK5).forEach(function(k){
    if (!I[k]) return;
    var ws = VOCAB_PACK5[k].split(" ").filter(function(w){ return !claimed[w]; });
    ws.forEach(function(w){ claimed[w] = true; });
    VOCAB[k] = (VOCAB[k] || []).concat(ws);
  });
  WORD_TO_ICON = {};
  Object.keys(VOCAB).forEach(function(k){ VOCAB[k].forEach(function(w){ WORD_TO_ICON[w] = k; }); });
})();

// ---------- built-in emoji library (fallback tier under the drawings) ----------
var EMOJI_LIB_SRC = EMOJI.rows.join("|");
var EMOJI_LIB = {};
EMOJI_LIB_SRC.split("|").forEach(function(row){
  var p = row.split(" "), e = p[0];
  for (var i = 1; i < p.length; i++) if (!EMOJI_LIB[p[i]]) EMOJI_LIB[p[i]] = e;
});
// Found by replaying recorded lessons through the app. These words are nearly always meant another way in real teaching
// ("kind of", "I saw", "good job", "watch this", "one more time", "the steps"), so they get no picture unless a teacher picks one.
var NEVER = {};
RULES.never.forEach(function(w){ NEVER[w] = 1; delete WORD_TO_ICON[w]; delete EMOJI_LIB[w]; });
Object.keys(VOCAB).forEach(function(k){ VOCAB[k] = VOCAB[k].filter(function(w){ return !NEVER[w]; }); });
// ...and better pictures for words real lessons use a lot ("letter" in phonics is the ABC, not mail)
var REMAP = DRAWINGS.remap;
Object.keys(REMAP).forEach(function(w){
  var v = REMAP[w];
  delete WORD_TO_ICON[w]; delete EMOJI_LIB[w];
  if (v.slice(0, 2) === "i:" && I[v.slice(2)]) WORD_TO_ICON[w] = v.slice(2);
  else if (v.slice(0, 2) === "m:") EMOJI_LIB[w] = v.slice(2);
});
// More words for OpenMoji pictures that had none, picked by going through the whole set: "black hole", "judge", "avalanche"…
var EMOJI_MORE = OPENMOJI.words;
Object.keys(EMOJI_MORE).forEach(function(w){ if (!WORD_TO_ICON[w] && !EMOJI_LIB[w] && !NEVER[w]) EMOJI_LIB[w] = EMOJI_MORE[w]; });
// Mulberry Symbols (CC BY-SA 4.0), made for children and adults who communicate with pictures, and maps of the US states. They are
// separate files, loaded the first time they are shown, and only used for words nothing above covers. See public/credits.html.
// Which word shows which symbol (public/symbols/index.json) arrives after the first screen is drawn and is handed over here;
// until then those words have no picture.
var SYM = { words: {}, phrases: {}, minor: [], override: [] };
var SYM_WORDS = {}, SYM_MINOR = {};
function applySymbols(table){
  SYM = table;
  (SYM.minor || []).forEach(function(k){ SYM_MINOR[k] = 1; });
  Object.keys(SYM.words).forEach(function(w){ if (!WORD_TO_ICON[w] && !EMOJI_LIB[w] && !NEVER[w]) SYM_WORDS[w] = SYM.words[w]; });
  // a country named on its own shows its map (which carries its flag) rather than the flag alone; "American", "French" keep the flag
  (SYM.override || []).forEach(function(w){ if (SYM.words[w] && !WORD_TO_ICON[w]){ delete EMOJI_LIB[w]; SYM_WORDS[w] = SYM.words[w]; } });
}
var ASSET_BASE = "";
function symArt(name){ return '<image href="' + ASSET_BASE + 'symbols/' + String(name).replace(/[^a-z0-9-]/g, "") + '.svg" x="3" y="3" width="94" height="94"/>'; }

// Generic words ("people", "a good question", "great idea", "I'd love to") can join a picture of something else, but never make one alone.
var WEAK = {};
RULES.weak.forEach(function(w){ WEAK[w] = 1; });

var ICON_SETTING = {};
DRAWINGS.settings1.forEach(function(row){
  row[1].forEach(function(k){ ICON_SETTING[k] = row[0]; });
});
DRAWINGS.settings2.forEach(function(row){
  row[1].forEach(function(k){ ICON_SETTING[k] = row[0]; });
});
var SETTING_ORDER = ["space", "bio", "history", "sea", "land", "town", "sky", "math", "class", "lab"];
var SETTINGS = ["sky", "land", "sea", "space", "bio", "lab", "history", "town", "math", "class", "plain"];
DRAWINGS.settings3.forEach(function(row){
  row[1].forEach(function(k){ ICON_SETTING[k] = row[0]; });
});
export function setAssetBase(b){ ASSET_BASE = b || ""; }

// NEVER and EMOJI_LIB_SRC are also read by the picture build (web/tools/pictures)
export { ASSET_BASE, EMOJI_LIB, applySymbols, EMOJI_LIB_SRC, ICON_SETTING, NEVER, SETTINGS, SETTING_ORDER, SYM, SYM_MINOR, SYM_WORDS, VOCAB, WEAK, WORD_TO_ICON, symArt };
