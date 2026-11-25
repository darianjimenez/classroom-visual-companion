// Drawing a scene as a 320×200 SVG: settings, labels, emoji badges, layouts and connectors.
import { DIAGRAMS, drawDiagram } from "./diagrams/registry.js"
import { I, art } from "./drawings.js"
import { OM, omKey } from "./openmoji.js"
import { EMOJI_FONT, INK, LABEL_FONT, circ, ell, esc, f, ln, pline, polar, poly, pth, sub } from "./primitives.js"
import { symArt } from "./vocabulary.js"
import { drawWords } from "./word-cards.js"

// ---------- scene rendering (320 x 200) ----------
var W = 320, H = 200;

function background(setting, id){
  var sky = '<linearGradient id="' + id + 'sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BFE3F5"/><stop offset="1" stop-color="#F1F9FC"/></linearGradient>';
  var skyRect = '<rect width="320" height="200" fill="url(#' + id + 'sky)"/>';
  switch (setting){
    case "sky": return { defs: sky, body: skyRect };
    case "land": return { defs: sky, body: skyRect +
      '<path d="M0 156 Q70 128 150 150 T320 140 V200 H0 Z" fill="#CFE6B8"/><path d="M0 174 Q90 156 190 172 T320 168 V200 H0 Z" fill="#B9DBA0"/>' };
    case "sea": return { defs: sky, body: skyRect +
      '<path d="M0 150 Q20 144 40 150 T80 150 T120 150 T160 150 T200 150 T240 150 T280 150 T320 150 V200 H0 Z" fill="#A7D3EC"/>' +
      '<path d="M0 172 Q20 167 40 172 T80 172 T120 172 T160 172 T200 172 T240 172 T280 172 T320 172" fill="none" stroke="#D3EAF6" stroke-width="2"/>' };
    case "space": {
      var stars = [[22, 24, 1.4], [58, 70, 1], [96, 18, 1.6], [140, 46, 1], [182, 16, 1.2], [214, 64, 1.5], [262, 28, 1], [296, 74, 1.4],
                   [30, 150, 1.2], [80, 180, 1], [128, 160, 1.4], [196, 186, 1.1], [246, 150, 1.5], [300, 176, 1], [12, 96, 1], [306, 120, 1.2]];
      return { defs: "", body: '<rect width="320" height="200" fill="#22304F"/>' + stars.map(function(s){ return circ(s[0], s[1], s[2], "#F3EFE2", 0); }).join("") };
    }
    case "bio": return {
      defs: '<radialGradient id="' + id + 'bio" cx="0.5" cy="0.5" r="0.7"><stop offset="0" stop-color="#FFF6F0"/><stop offset="1" stop-color="#F4D6CC"/></radialGradient>',
      body: '<rect width="320" height="200" fill="url(#' + id + 'bio)"/><circle cx="160" cy="100" r="128" fill="none" stroke="#E7B9AA" stroke-width="2" opacity="0.7"/>' +
        circ(40, 30, 6, "none", 0).replace('fill="none"', 'fill="none" stroke="#EBC3B6" stroke-width="2"') +
        circ(286, 168, 9, "none", 0).replace('fill="none"', 'fill="none" stroke="#EBC3B6" stroke-width="2"') };
    case "lab": {
      var g = "";
      for (var x = 20; x < W; x += 20) g += ln(x, 0, x, H, "#D3E1EC", 1);
      for (var y = 20; y < H; y += 20) g += ln(0, y, W, y, "#D3E1EC", 1);
      return { defs: "", body: '<rect width="320" height="200" fill="#E6EFF6"/>' + g };
    }
    case "history": {
      var l = "";
      for (var yy = 24; yy < H; yy += 18) l += ln(14, yy, W - 14, yy, "#E5D5AE", 1);
      return { defs: "", body: '<rect width="320" height="200" fill="#F3E7C9"/>' + l + '<rect x="7" y="7" width="306" height="186" rx="6" fill="none" stroke="#D9C597" stroke-width="2"/>' };
    }
    case "town": return { defs: sky, body: skyRect + '<rect y="150" width="320" height="12" fill="#C9CDD1"/><rect y="162" width="320" height="38" fill="#9AA0A6"/>' +
      ln(0, 181, 320, 181, "#F3EFE2", 2.5, { dash: "16 12", cap: "butt" }) };
    case "math": {
      var gm = "";
      for (var gx = 16; gx < W; gx += 16) gm += ln(gx, 0, gx, H, (gx % 64 === 0) ? "#C7D6EA" : "#DFE8F3", 1);
      for (var gy = 16; gy < H; gy += 16) gm += ln(0, gy, W, gy, (gy % 64 === 0) ? "#C7D6EA" : "#DFE8F3", 1);
      return { defs: "", body: '<rect width="320" height="200" fill="#F8FAFD"/>' + gm };
    }
    case "class": {
      var cl = "";
      for (var cy = 30; cy < H; cy += 22) cl += ln(0, cy, W, cy, "#CFE0F0", 1.2);
      return { defs: "", body: '<rect width="320" height="200" fill="#FFFCF0"/>' + cl + ln(30, 0, 30, H, "#E8A6A6", 1.5) };
    }
    default: return { defs: "", body: '<rect width="320" height="200" fill="#F7F3E6"/>' };
  }
}

function textLabel(text, x, y, size, anchor, cls){
  // keep labels on the card: estimate width and nudge inward
  var wEst = String(text).length * size * 0.58;
  if (!anchor || anchor === "middle") x = Math.max(wEst / 2 + 4, Math.min(W - 4 - wEst / 2, x));
  else if (anchor === "start") x = Math.min(x, W - 4 - wEst);
  else if (anchor === "end") x = Math.max(x, wEst + 4);
  var a = '<text' + (cls ? ' class="' + cls + '"' : '') + ' x="' + f(x) + '" y="' + f(y) + '" text-anchor="' + (anchor || "middle") + '" font-family="' + LABEL_FONT + '" font-size="' + size + '" font-weight="700"';
  return a + ' fill="#FFFDF6" stroke="#FFFDF6" stroke-width="5" stroke-linejoin="round">' + esc(text) + '</text>' +
    a + ' fill="' + INK + '">' + esc(text) + '</text>';
}
function emojiBadge(e){
  var art = OM && OM[omKey(e)];
  if (art) return circ(50, 50, 40, "#FFFDF6", 2) + '<g transform="translate(13,13) scale(1.03)">' + art + '</g>';
  return circ(50, 50, 38, "#FFFDF6") + '<text x="50" y="53" text-anchor="middle" dominant-baseline="middle" font-size="44" font-family="' + EMOJI_FONT + '">' + esc(e) + '</text>';
}
function iconArt(item){ return item.icon && I[item.icon] ? art(item.icon) : item.sym ? symArt(item.sym) : emojiBadge(item.emoji || "❓"); }
function el(at, inner){ return '<g class="el" data-at="' + (at | 0) + '">' + inner + '</g>'; }

function placeGroup(items, cx, cy, size, dir){
  if (items.length <= 1) return items.map(function(it){ return { item: it, x: cx, y: cy, size: size }; });
  var s2 = size * 0.72, off = s2 * (dir === "h" ? 0.82 : 0.66);
  if (dir === "h") cx = Math.max(38 + off, Math.min(282 - off, cx));   // keep both items and their labels on the card
  return items.slice(0, 2).map(function(it, i){
    return { item: it, x: dir === "h" ? cx + (i ? off : -off) : cx, y: dir === "v" ? cy + (i ? off : -off) : cy, size: s2 };
  });
}
function makeGroup(items, cx, cy, size, dir){
  var pl = placeGroup(items, cx, cy, size, dir);
  var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  pl.forEach(function(p){
    var r = p.size * 0.42;
    minX = Math.min(minX, p.x - r); maxX = Math.max(maxX, p.x + r);
    minY = Math.min(minY, p.y - r); maxY = Math.max(maxY, p.y + r);
  });
  return { pl: pl, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2, hw: Math.max(8, (maxX - minX) / 2), hh: Math.max(8, (maxY - minY) / 2) };
}
function drawItem(p, showLabel, side){
  var s = Math.round(p.size / 100 * 1000) / 1000;
  var g = sub(iconArt(p.item), p.x, p.y, s);
  if (showLabel && p.item.label){
    g += side === "right" ? textLabel(p.item.label, p.x + p.size * 0.44 + 5, p.y + 5, 16, "start", "lbl")
                          : textLabel(p.item.label, p.x, p.y + p.size * 0.46 + 13, 15, "middle", "lbl");
  }
  return el(p.item.at, g);
}
function drawGroup(g, labelSide){
  var side = (labelSide === "right" && g.pl.length === 1) ? "right" : null;
  return g.pl.map(function(p){ return drawItem(p, true, side); }).join("");
}
function edge(a, b, pad){
  var dx = b.cx - a.cx, dy = b.cy - a.cy, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
  function rad(g){ return 1 / Math.sqrt(Math.pow(ux / g.hw, 2) + Math.pow(uy / g.hh, 2)); }
  var ra = rad(a) + pad, rb = rad(b) + pad;
  return { x1: a.cx + ux * ra, y1: a.cy + uy * ra, x2: b.cx - ux * rb, y2: b.cy - uy * rb };
}
function arrowHead(x, y, ang, color, size){
  size = size || 11;
  return poly([[x, y], [x - size * Math.cos(ang - 0.45), y - size * Math.sin(ang - 0.45)], [x - size * Math.cos(ang + 0.45), y - size * Math.sin(ang + 0.45)]], color, 1.5);
}
var REL_COLOR = { heats: "#E06D3A", cools: "#4A90C8", powers: "#E9A23B", rises: "#3F7FAF", falls: "#3F7FAF", becomes: INK, pulls: INK, leads: INK, needs: "#4F9D78", splits: "#D9674B" };
function connector(e, rel, text, below, fontSize){
  var x1 = e.x1, y1 = e.y1, x2 = e.x2, y2 = e.y2;
  var dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
  if (len < 10) return "";
  var ux = dx / len, uy = dy / len, px = -uy, py = ux;
  var color = REL_COLOR[rel] || INK, out = "", endAng = Math.atan2(dy, dx), k, t, pts;
  if (rel === "heats" || rel === "cools"){
    pts = [];
    for (k = 0; k <= 30; k++){
      t = k / 30;
      var amp = 5 * Math.sin(t * Math.PI * 6) * Math.min(1, (1 - t) * 6);
      pts.push([x1 + dx * t * 0.94 + px * amp, y1 + dy * t * 0.94 + py * amp]);
    }
    out += pline(pts, color, 4.5);
  } else if (rel === "powers"){
    pts = [];
    for (k = 0; k <= 6; k++){
      t = k / 6 * 0.94;
      var off = (k === 0 || k === 6) ? 0 : (k % 2 ? 8 : -8);
      pts.push([x1 + dx * t + px * off, y1 + dy * t + py * off]);
    }
    out += pline(pts, INK, 8.5) + pline(pts, "#F6C343", 4.5);
  } else if (rel === "rises" || rel === "falls"){
    var cxp = (x1 + x2) / 2 + px * 16, cyp = (y1 + y2) / 2 + py * 16;
    out += '<path d="M' + f(x1) + ' ' + f(y1) + ' Q' + f(cxp) + ' ' + f(cyp) + ' ' + f(x2) + ' ' + f(y2) + '" fill="none" stroke="' + color + '" stroke-width="4" stroke-linecap="round" stroke-dasharray="1 0"/>';
    endAng = Math.atan2(y2 - cyp, x2 - cxp);
    for (k = 1; k <= 2; k++){
      t = k / 3;
      var mx0 = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cxp + t * t * x2, my0 = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * cyp + t * t * y2;
      out += ln(mx0 - px * 7, my0 - py * 7, mx0 - px * 14, my0 - py * 14, color, 2.5, { op: 0.7 });
    }
  } else if (rel === "becomes"){
    out += ln(x1, y1, x2 - ux * 6, y2 - uy * 6, color, 3.5, { dash: "7 6" });
  } else if (rel === "pulls"){
    out += ln(x1, y1, x2 - ux * 8, y2 - uy * 8, color, 7);
  } else {
    out += ln(x1, y1, x2 - ux * 6, y2 - uy * 6, color, 3.5);
  }
  out += arrowHead(x2, y2, endAng, color, rel === "pulls" ? 16 : 13);
  if (rel === "becomes") out += arrowHead(x2 - ux * 10, y2 - uy * 10, endAng, color, 12);
  if (text){
    var mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    var fs = fontSize || 16;
    var avail = len + 22, need = String(text).length * fs * 0.5;
    if (need > avail) fs = Math.max(11, Math.floor(avail / (String(text).length * 0.5)));
    if (Math.abs(ux) > 0.6) out += textLabel(text, mx, below ? my + 24 : my - 13, fs);
    else {
      var side = (rel === "rises" || rel === "falls") ? -1 : 1;
      var lx = mx + px * 16 * side;
      out += textLabel(text, lx, my + 5, fs, (px * side) > 0 ? "start" : "end");
    }
  }
  return out;
}

function layoutScene(sc){
  var S = sc.subjects || [], O = sc.objects || [], T = sc.then ? sc.then.objects : [];
  var rel = sc.relation, vAt = sc.verbAt | 0, out = "", i, p;

  if (rel === "cycle"){
    var items = S.slice(0, 3), ringColor = "#4F9D78";
    if (items.length <= 1){
      if (items[0]) out += drawItem({ item: items[0], x: 160, y: 92, size: 96 }, true);
      var ring = "";
      for (i = 0; i < 3; i++){
        var a0 = -Math.PI / 2 + i * 2 * Math.PI / 3 + 0.35, a1 = a0 + 2 * Math.PI / 3 - 0.7, arc = [];
        for (var k = 0; k <= 16; k++) arc.push(polar(160, 96, 76, a0 + (a1 - a0) * k / 16));
        ring += pline(arc, INK, 7.5) + pline(arc, ringColor, 4);
        var end = arc[arc.length - 1];
        ring += arrowHead(end[0], end[1], Math.atan2(Math.cos(a1), -Math.sin(a1)), ringColor, 13);
      }
      out = el(vAt, ring) + out;
    } else {
      var n = items.length, R = 62, angs = n === 2 ? [Math.PI, 0] : [-Math.PI / 2, Math.PI / 6, 5 * Math.PI / 6];
      var ring2 = "";
      for (i = 0; i < n; i++){
        var b0 = angs[i] + 0.55, b1 = (n === 2 ? angs[i] + Math.PI : angs[(i + 1) % n] + (i + 1 === n ? 2 * Math.PI : 0)) - 0.55;
        if (n === 3 && i === 2) b1 = angs[0] + 2 * Math.PI - 0.55;
        if (n === 3 && i < 2) b1 = angs[i + 1] - 0.55;
        var arc2 = [];
        for (var k2 = 0; k2 <= 14; k2++) arc2.push(polar(160, 98, R, b0 + (b1 - b0) * k2 / 14));
        ring2 += pline(arc2, INK, 7.5) + pline(arc2, ringColor, 4);
        var e2 = arc2[arc2.length - 1];
        ring2 += arrowHead(e2[0], e2[1], Math.atan2(Math.cos(b1), -Math.sin(b1)), ringColor, 12);
      }
      out += el(vAt, ring2);
      for (i = 0; i < n; i++){
        p = polar(160, 98, R, angs[i]);
        out += drawItem({ item: items[i], x: p[0], y: p[1] - 6, size: 60 }, true);
      }
    }
    return out;
  }

  if (rel === "contains" && S.length && O.length){
    var bx = 246, by = 92, br = 54;
    out += el(vAt, ln(150, 82, bx - br + 4, by - 6, INK, 2.5, { dash: "5 5" }) + circ(bx, by, br, "#FFFDF6") +
      ln(bx + br * 0.7, by + br * 0.7, bx + br * 0.7 + 18, by + br * 0.7 + 18, INK, 9) + ln(bx + br * 0.7, by + br * 0.7, bx + br * 0.7 + 18, by + br * 0.7 + 18, "#8A5A3C", 5) +
      (sc.verb ? textLabel(sc.verb, bx, by - br - 8, 16) : ""));
    out += drawItem({ item: S[0], x: 108, y: 92, size: 132 }, true);
    out += drawGroup(makeGroup(O, bx, by - 6, 70, "h"), true);
    return out;
  }

  if (!O.length){
    var row = S.slice(0, 3);
    if (row.length === 1) return drawItem({ item: row[0], x: 160, y: 88, size: 118 }, true);
    var xs = row.length === 2 ? [100, 220] : [62, 160, 258], size = row.length === 2 ? 100 : 80;
    for (i = 0; i < row.length; i++){
      out += drawItem({ item: row[i], x: xs[i], y: 90, size: size }, true);
      if (i > 0) out += el(row[i].at, textLabel("+", (xs[i] + xs[i - 1]) / 2, 100, 30));
    }
    return out;
  }

  if (rel === "versus"){
    var gs = makeGroup(S, 78, 94, 96, "v"), go = makeGroup(O, 242, 94, 96, "v"), burst = [];
    for (i = 0; i < 24; i++) burst.push(polar(160, 92, i % 2 ? 15 : 28, i * Math.PI / 12));
    out += el(vAt, poly(burst, "#F6C343", 2.5) + textLabel("vs", 160, 100, 20) + (sc.verb ? textLabel(sc.verb, 160, 50, 17) : ""));
    return out + drawGroup(gs) + drawGroup(go);
  }

  if (rel === "wants"){
    var gw = makeGroup(S, 70, 128, 84, "h");
    out += el(vAt, pth("M140 104 L106 130 L166 114 Z", "#FFFDF6") + ell(214, 78, 98, 60, "#FFFDF6") + (sc.verb ? textLabel(sc.verb, 70, 66, 17) : ""));
    var bxs = O.length > 1 ? [166, 266] : [214];
    O.slice(0, 2).forEach(function(it, i){ out += drawItem({ item: it, x: bxs[i], y: 70, size: O.length > 1 ? 60 : 78 }, true); });
    return out + drawGroup(gw);
  }

  var gS, gO, gT, hasT = T.length > 0, vertical = false;
  if (rel === "rises" || rel === "falls"){
    var up = rel === "rises";
    if (!hasT){
      vertical = true;
      gS = makeGroup(S, 150, up ? 156 : 46, up ? 58 : 70, "h");
      gO = makeGroup(O, 150, up ? 46 : 156, up ? 70 : 58, "h");
    } else {
      var P3 = up ? [[58, 152], [160, 100], [262, 48]] : [[58, 46], [160, 98], [262, 150]];
      gS = makeGroup(S, P3[0][0], P3[0][1], 60, "h");
      gO = makeGroup(O, P3[1][0], P3[1][1], 60, "h");
      gT = makeGroup(T, P3[2][0], P3[2][1], 60, "h");
    }
  } else if (!hasT){
    gS = makeGroup(S, 76, 90, 98, "v");
    gO = makeGroup(O, 244, 90, 98, "v");
  } else {
    gS = makeGroup(S, 46, 88, 66, "v");
    gO = makeGroup(O, 160, 88, 66, "v");
    gT = makeGroup(T, 274, 88, 66, "v");
  }
  var side = vertical ? "right" : null;
  out += drawGroup(gS, side) + drawGroup(gO, side) + (hasT ? drawGroup(gT) : "");
  // arrows go on top so their labels are never hidden behind a drawing
  if (!hasT && !vertical && gO.pl.length === 2){
    // one arrow per object, so "A gives B and C" reads as a branch
    gO.pl.forEach(function(p, i){
      var r = p.size * 0.42, one = { cx: p.x, cy: p.y, hw: r, hh: r };
      out += el(vAt, connector(edge(gS, one, 5), rel || "leads", i === 0 ? sc.verb : "", false, 16));
    });
  } else out += el(vAt, connector(edge(gS, gO, 5), rel || "leads", sc.verb, false, hasT ? 14 : 16));
  if (hasT) out += el(sc.then.verbAt, connector(edge(gO, gT, 5), sc.then.relation, sc.then.verb, !vertical && rel !== "rises" && rel !== "falls", 14));
  return out;
}

var renderCount = 0;
function renderScene(sc){
  var id = "s" + (++renderCount) + "_";
  var bg = background(sc.setting, id);
  return '<svg class="scene" viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(sc.caption || (sc.words && sc.words.say) || "") + '">' +
    '<defs>' + bg.defs + '</defs>' + bg.body + (sc.words ? drawWords(sc) : sc.diagram && DIAGRAMS[sc.diagram] ? drawDiagram(sc) : layoutScene(sc)) + '</svg>';
}
export { arrowHead, el, renderScene, textLabel };
