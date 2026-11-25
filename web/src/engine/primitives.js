// Drawing primitives: colours, fonts and the small SVG helpers every picture is made from.

var INK = "#2B2620";
var SKIN = "#F2C9A0";
var LABEL_FONT = "Caveat, 'Comic Sans MS', cursive";
var EMOJI_FONT = "'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif";

// ---------- drawing primitives ----------
function f(n){ return Math.round(n * 10) / 10; }
function esc(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
function strokeAttr(sw){ return sw === 0 ? "" : ' stroke="' + INK + '" stroke-width="' + (sw || 3) + '"'; }
function circ(cx, cy, r, fill, sw){ return '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r) + '" fill="' + fill + '"' + strokeAttr(sw) + '/>'; }
function pth(d, fill, o){
  o = o || {};
  return '<path d="' + d + '" fill="' + (fill || "none") + '" stroke="' + (o.stroke || INK) + '" stroke-width="' + (o.w == null ? 3 : o.w) +
    '" stroke-linejoin="round" stroke-linecap="round"' + (o.dash ? ' stroke-dasharray="' + o.dash + '"' : "") +
    (o.op != null ? ' opacity="' + o.op + '"' : "") + '/>';
}
function ln(x1, y1, x2, y2, color, w, o){
  o = o || {};
  return '<line x1="' + f(x1) + '" y1="' + f(y1) + '" x2="' + f(x2) + '" y2="' + f(y2) + '" stroke="' + (color || INK) +
    '" stroke-width="' + (w || 3) + '" stroke-linecap="' + (o.cap || "round") + '"' + (o.dash ? ' stroke-dasharray="' + o.dash + '"' : "") +
    (o.op != null ? ' opacity="' + o.op + '"' : "") + '/>';
}
function rct(x, y, w, h, fill, rx, sw){ return '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(h) + '" rx="' + (rx || 0) + '" fill="' + fill + '"' + strokeAttr(sw) + '/>'; }
function ell(cx, cy, rx, ry, fill, sw, extra){ return '<ellipse cx="' + f(cx) + '" cy="' + f(cy) + '" rx="' + f(rx) + '" ry="' + f(ry) + '" fill="' + fill + '"' + strokeAttr(sw) + (extra || "") + '/>'; }
function polar(cx, cy, r, a){ return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; }
function ptsStr(a){ return a.map(function(p){ return f(p[0]) + "," + f(p[1]); }).join(" "); }
function poly(points, fill, sw){ return '<polygon points="' + ptsStr(points) + '" fill="' + fill + '"' + strokeAttr(sw) + ' stroke-linejoin="round"/>'; }
function pline(points, color, w, op){ return '<polyline points="' + ptsStr(points) + '" fill="none" stroke="' + color + '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round"' + (op != null ? ' opacity="' + op + '"' : "") + '/>'; }
function blob(circles, fill){
  var a = "", b = "";
  circles.forEach(function(c){ a += circ(c[0], c[1], c[2] + 2.5, INK, 0); b += circ(c[0], c[1], c[2], fill, 0); });
  return a + b;
}
function sub(svg, cx, cy, s){ return '<g transform="translate(' + f(cx) + ',' + f(cy) + ') scale(' + s + ') translate(-50,-50)">' + svg + '</g>'; }
function person(color){ return pth("M28 88 C28 64 38 50 50 50 C62 50 72 64 72 88 Z", color) + circ(50, 30, 12, SKIN); }
export { EMOJI_FONT, INK, LABEL_FONT, blob, circ, ell, esc, f, ln, person, pline, polar, poly, pth, rct, sub };
