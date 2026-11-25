// The diagram registry: how diagrams are defined, matched to what a sentence names, highlighted and drawn.
import { emptyScene } from "../analyze.js"
import { I, art } from "../drawings.js"
import { cap } from "../lookup.js"
import { INK, circ, f, ln, pth, rct, sub } from "../primitives.js"
import { arrowHead, el, textLabel } from "../render.js"

// ---------- prebuilt diagrams ----------
// A labelled picture of a whole topic (the water cycle, parts of a plant, a story mountain...). It shows when a sentence
// names the topic, builds up part by part as the sentence goes on, and highlights any part the sentence mentions.
var DIAGRAMS = {}, DIAGRAM_ORDER = [];
function tok(w){ return String(w).toLowerCase().replace(/[^a-z0-9]/g, ""); }
function phraseToks(s){ return String(s).trim().split(/\s+/).map(tok).filter(Boolean); }
function sameTok(a, b){ return !!a && (a === b || a === b + "s" || b === a + "s" || a === b + "es" || b === a + "es"); }
function findPhrase(toks, ph){
  for (var i = 0; i + ph.length <= toks.length; i++){
    for (var j = 0; j < ph.length && sameTok(toks[i + j], ph[j]); j++);
    if (j === ph.length) return i;
  }
  return -1;
}
function dgm(key, title, setting, say, parts, draw){
  var p = {};
  Object.keys(parts || {}).forEach(function(k){ p[k] = { box: parts[k][0], say: parts[k][1].split(",").map(phraseToks) }; });
  DIAGRAMS[key] = { key: key, title: title, setting: setting, say: say.map(phraseToks), sayText: say, parts: p, draw: draw };
  DIAGRAM_ORDER.push(key);
}
function dI(k, x, y, s){ return I[k] ? sub(art(k), x, y, s / 100) : ""; }
function dL(t, x, y, s, a){ return textLabel(t, x, y, s || 14, a, "lbl"); }      // names a part (hidden with "no labels")
function dT(t, x, y, s, a){ return textLabel(t, x, y, s || 14, a); }             // text that is the content itself
function dLead(x1, y1, x2, y2){ return ln(x1, y1, x2, y2, "#7A6F58", 1.6) + circ(x1, y1, 2.4, "#7A6F58", 0); }
function dA(x1, y1, x2, y2, color, bend, w){
  color = color || INK; bend = bend || 0; w = w || 3.5;
  var dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
  var cx = (x1 + x2) / 2 - dy / len * bend, cy = (y1 + y2) / 2 + dx / len * bend;
  var ang = Math.atan2(y2 - cy, x2 - cx), ex = x2 - Math.cos(ang) * 7, ey = y2 - Math.sin(ang) * 7;
  return '<path d="M' + f(x1) + ' ' + f(y1) + ' Q' + f(cx) + ' ' + f(cy) + ' ' + f(ex) + ' ' + f(ey) + '" fill="none" stroke="' + color +
    '" stroke-width="' + w + '" stroke-linecap="round"/>' + arrowHead(x2, y2, ang, color, 10);
}
function dBox(x, y, w, h, fill, text, size){ return rct(x, y, w, h, fill, 10, 2.5) + (text ? dT(text, x + w / 2, y + h / 2 + 5, size || 14) : ""); }
function glow(b){ return '<rect x="' + b[0] + '" y="' + b[1] + '" width="' + b[2] + '" height="' + b[3] + '" rx="14" fill="#FFE27A" opacity="0.8" stroke="#F2C14E" stroke-width="2.5"/>'; }
// four stages in a loop, clockwise from the top
function loop4(stages){
  var P = [[160, 40], [262, 100], [160, 158], [58, 100]], out = [];
  stages.forEach(function(s, i){
    var p = P[i], q = P[(i + 1) % 4];
    out.push(s[0] + dL(s[1], p[0] + (i === 1 ? 0 : i === 3 ? 0 : 0), p[1] + (i === 0 ? 36 : 38), 14) +
      dA(p[0] + (q[0] - p[0]) * 0.3, p[1] + (q[1] - p[1]) * 0.3, p[0] + (q[0] - p[0]) * 0.7, p[1] + (q[1] - p[1]) * 0.7, "#5D8C6B", -14, 3));
  });
  return out;
}
function moonPhase(cx, cy, r, lit){
  var base = circ(cx, cy, r, "#3A322C", 2);
  if (lit <= 0.02) return base;
  if (lit >= 0.98) return circ(cx, cy, r, "#F3E9B8", 2);
  var rx = Math.abs(1 - 2 * lit) * r;
  return base + '<path d="M' + cx + ' ' + (cy - r) + ' A' + r + ' ' + r + ' 0 0 1 ' + cx + ' ' + (cy + r) + ' A' + f(rx) + ' ' + r + ' 0 0 ' + (lit < 0.5 ? 0 : 1) + ' ' + cx + ' ' + (cy - r) +
    ' Z" fill="#F3E9B8" stroke="' + INK + '" stroke-width="1.5"/>';
}
function rockBlob(cx, cy, fill){ return pth("M" + (cx - 30) + " " + (cy + 14) + " C" + (cx - 34) + " " + (cy - 6) + " " + (cx - 18) + " " + (cy - 22) + " " + cx + " " + (cy - 20) + " C" + (cx + 22) + " " + (cy - 22) + " " + (cx + 34) + " " + (cy - 4) + " " + (cx + 30) + " " + (cy + 14) + " C" + (cx + 18) + " " + (cy + 22) + " " + (cx - 18) + " " + (cy + 22) + " " + (cx - 30) + " " + (cy + 14) + " Z", fill); }
var IMAGE_DIAGRAM = {};

function findDiagram(toks){
  var best = null;
  DIAGRAM_ORDER.forEach(function(k){
    DIAGRAMS[k].say.forEach(function(ph){
      var at = findPhrase(toks, ph);
      if (at >= 0 && (!best || ph.length > best.len)) best = { key: k, at: at, len: ph.length };
    });
  });
  return best;
}
// key: use this diagram (Claude's plan); otherwise look for a topic the sentence names
function diagramScene(text, key){
  var raw = String(text).split(/\s+/).filter(Boolean), toks = raw.map(tok), m = key ? null : findDiagram(toks);
  if (!key && !m) return null;
  var d = DIAGRAMS[key || m.key];
  if (!d) return null;
  var at = m ? m.at : 0, hl = [], hlAts = [], i;
  if (m) for (i = at; i < at + m.len; i++) hlAts.push(i);
  Object.keys(d.parts).forEach(function(p){
    d.parts[p].say.forEach(function(ph){
      for (var j = 0; j + ph.length <= toks.length; j++){
        for (var q = 0; q < ph.length && sameTok(toks[j + q], ph[q]); q++);
        if (q < ph.length || (m && m.len > 1 && j < m.at + m.len && j + ph.length > m.at)) continue;
        if (hl.indexOf(p) < 0) hl.push(p);
        for (q = j; q < j + ph.length; q++) hlAts.push(q);
      }
    });
  });
  if (hl.length > 2) hl = [];   // a sentence naming most of the parts is an overview: nothing to single out
  var sc = emptyScene();
  sc.show = true; sc.diagram = d.key; sc.diagramAt = at; sc.highlight = hl; sc.hlAts = hlAts; sc.verbAt = at; sc.setting = d.setting;
  sc.imageDiagram = !!IMAGE_DIAGRAM[d.key];
  sc.caption = raw.length <= 14 ? cap(raw.join(" ").replace(/^[^A-Za-z0-9]+/, "").replace(/[.!?;:,\u2014\-]+$/, "")) : d.title;
  return sc;
}
function drawDiagram(sc){
  var d = DIAGRAMS[sc.diagram], at = sc.diagramAt || 0, out = "";
  (sc.highlight || []).forEach(function(p){ if (d.parts[p]) out += el(at, glow(d.parts[p].box)); });
  d.draw().forEach(function(layer, j){ out += el(at + j, layer); });
  return out;
}
export { DIAGRAMS, DIAGRAM_ORDER, IMAGE_DIAGRAM, dA, dBox, dI, dL, dLead, dT, dgm, diagramScene, drawDiagram, loop4, moonPhase, rockBlob };
