// Moved verbatim from the original single-file app. It sets window.SceneEngine; the picture tests load this file directly.
window.SceneEngine = (function(){
  "use strict";
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

  // ---------- illustration library (each drawn in a 100x100 box) ----------
  var I = {};
  var CLOUD_D = "M28 66 H72 A14 14 0 0 0 72 38 A18 18 0 0 0 38 32 A17 17 0 0 0 28 66 Z";

  I.sun = (function(){
    var s = "";
    for (var i = 0; i < 8; i++){
      var a = i * Math.PI / 4, p1 = polar(50, 50, 28, a), p2 = polar(50, 50, 41, a);
      s += ln(p1[0], p1[1], p2[0], p2[1], "#E9A23B", 5);
    }
    return s + circ(50, 50, 21, "#F6C343") + pth("M40 45 Q43 39 49 40", "none", { stroke: "#FFF3C4", w: 3 });
  })();
  I.cloud = pth(CLOUD_D, "#FFFFFF") + pth("M34 58 Q40 62 48 60", "none", { stroke: "#D6E4EE", w: 2.5 });
  I.rain = '<g transform="translate(0,-14)">' + pth(CLOUD_D, "#FFFFFF") + '</g>' +
    ln(36, 62, 32, 76, "#4A90C8", 5) + ln(50, 62, 46, 82, "#4A90C8", 5) + ln(64, 62, 60, 76, "#4A90C8", 5);
  I.drop = pth("M50 14 C50 14 26 46 26 62 A24 24 0 0 0 74 62 C74 46 50 14 50 14 Z", "#6FB3E0") +
    ell(41, 62, 4, 8, "#FFFFFF", 0, ' opacity="0.75"');
  I.wave = pth("M8 58 Q20 44 32 58 T56 58 T80 58 T92 54 V88 H8 Z", "#3F8FC4") +
    pth("M14 72 Q24 64 34 72 T54 72 T74 72 T88 70", "none", { stroke: "#D6ECF8", w: 3 }) +
    pth("M20 83 Q30 77 40 83 T60 83", "none", { stroke: "#D6ECF8", w: 2.5, op: 0.7 });
  I.river = (function(){
    var d = "M20 92 C44 74 20 58 44 46 S76 30 80 8";
    return pth("M10 46 l4 -9 l4 9", "none", { stroke: "#4F9D78", w: 3 }) + pth("M70 82 l4 -9 l4 9", "none", { stroke: "#4F9D78", w: 3 }) +
      '<path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="19" stroke-linecap="round"/>' +
      '<path d="' + d + '" fill="none" stroke="#6FB3E0" stroke-width="13" stroke-linecap="round"/>' +
      pth("M34 70 Q38 66 42 70", "none", { stroke: "#D6ECF8", w: 2.5 }) + pth("M56 38 Q60 34 64 38", "none", { stroke: "#D6ECF8", w: 2.5 });
  })();
  I.mountain = pth("M46 84 L68 44 L92 84 Z", "#A9B4BE") + pth("M8 84 L38 28 L66 84 Z", "#8E9AA6") +
    pth("M38 28 L30 43 L35 40 L39 44 L43.6 38.6 Z", "#FFFFFF", { w: 2.5 }) + pth("M68 44 L63 53 L68 51 L72 53 Z", "#FFFFFF", { w: 2.5 });
  I.tree = pth("M45 56 H55 V88 H45 Z", "#8A5A3C") + blob([[50, 36, 20], [33, 50, 14], [67, 50, 14], [50, 56, 15]], "#4F9D78") +
    circ(42, 34, 4, "#6BBF8A", 0) + circ(60, 48, 3.5, "#6BBF8A", 0);
  I.sprout = pth("M18 84 Q50 64 82 84 Z", "#8A5A3C") + ln(50, 76, 50, 42, "#3E7D5F", 4) +
    pth("M50 54 C38 52 28 42 30 30 C44 32 50 42 50 54 Z", "#6BBF8A") + pth("M50 48 C62 46 72 36 70 24 C56 26 50 36 50 48 Z", "#6BBF8A");
  I.flower = (function(){
    var petals = [];
    for (var i = 0; i < 5; i++){ var p = polar(50, 36, 14, -Math.PI / 2 + i * 2 * Math.PI / 5); petals.push([p[0], p[1], 10]); }
    return ln(50, 50, 50, 90, "#3E7D5F", 4) + pth("M50 76 C40 74 33 66 35 58 C44 60 50 68 50 76 Z", "#6BBF8A") +
      blob(petals, "#F28FA6") + circ(50, 36, 8, "#F6C343");
  })();
  I.leaf = pth("M20 78 C20 40 50 18 82 20 C82 54 60 82 20 78 Z", "#6BBF8A") + pth("M22 76 L70 30", "none", { w: 2.5 }) +
    pth("M38 60 L36 44 M50 48 L48 34 M38 60 L54 62 M50 48 L66 50", "none", { w: 2, op: 0.6 });
  I.cell = ell(50, 50, 40, 32, "#F7C6B9") + ell(30, 61, 8, 4, "#E58F7B", 2, ' transform="rotate(-20 30 61)"') +
    ell(70, 66, 7, 3.5, "#E58F7B", 2, ' transform="rotate(15 70 66)"') + circ(57, 45, 13, "#B5779B") + circ(60, 42, 4, "#8A4F72", 0) +
    circ(34, 40, 2.6, "#D9674B", 0) + circ(44, 70, 2.6, "#D9674B", 0) + circ(78, 48, 2.4, "#D9674B", 0);
  I.dna = (function(){
    var a = [], b = [], r = "";
    for (var t = 0; t <= 40; t++){
      var y = 8 + t * 2.1, ph = t / 40 * Math.PI * 3, xa = 50 + 18 * Math.sin(ph), xb = 50 - 18 * Math.sin(ph);
      a.push([xa, y]); b.push([xb, y]);
      if (t % 4 === 2) r += ln(xa, y, xb, y, INK, 2.5);
    }
    return r + pline(a, INK, 8) + pline(a, "#5F9BC7", 4.5) + pline(b, INK, 8) + pline(b, "#D9674B", 4.5);
  })();
  I.virus = (function(){
    var s = "";
    for (var i = 0; i < 8; i++){
      var a = i * Math.PI / 4 + Math.PI / 8, p1 = polar(50, 50, 20, a), p2 = polar(50, 50, 30, a), p3 = polar(50, 50, 33, a);
      s += ln(p1[0], p1[1], p2[0], p2[1], INK, 3) + circ(p3[0], p3[1], 4.5, "#D9674B", 2.5);
    }
    return s + circ(50, 50, 21, "#9BCB6B") + circ(43, 45, 4, "#7AAE4F", 0) + circ(57, 57, 5, "#7AAE4F", 0) + circ(56, 41, 2.5, "#7AAE4F", 0);
  })();
  I.atom = (function(){
    var s = "", e = "";
    [0, 60, 120].forEach(function(a){
      s += ell(50, 50, 40, 13, "none", 0, ' stroke="#5F9BC7" stroke-width="3.5" transform="rotate(' + a + ' 50 50)"');
      var p = polar(50, 50, 40, a * Math.PI / 180);
      e += circ(p[0], p[1], 4.5, "#F6C343", 2);
    });
    return s + circ(50, 50, 8, "#D9674B") + e;
  })();
  I.magnet = '<path d="M30 30 V58 A20 20 0 0 0 70 58 V30" fill="none" stroke="' + INK + '" stroke-width="22"/>' +
    '<path d="M30 31.5 V58 A20 20 0 0 0 70 58 V31.5" fill="none" stroke="#D9674B" stroke-width="16"/>' +
    rct(19, 18, 22, 13, "#D8DCE0", 2) + rct(59, 18, 22, 13, "#D8DCE0", 2);
  I.bolt = poly([[58, 8], [26, 56], [48, 56], [40, 92], [76, 40], [54, 40], [64, 8]], "#F6C343");
  I.flame = pth("M50 10 C62 30 78 42 74 62 C72 80 62 90 50 90 C36 90 26 80 26 64 C26 50 36 44 40 30 C46 40 46 46 50 50 C54 40 55 26 50 10 Z", "#F08A4B") +
    pth("M50 56 C58 64 60 74 52 82 C46 84 42 80 42 72 C42 66 46 62 50 56 Z", "#F6C343", { w: 2 });
  I.snowflake = (function(){
    var ink = "", col = "";
    for (var j = 0; j < 6; j++){
      var a = j * Math.PI / 3 - Math.PI / 2, p = polar(50, 50, 36, a), q = polar(50, 50, 22, a),
          b1 = polar(q[0], q[1], 10, a + 0.8), b2 = polar(q[0], q[1], 10, a - 0.8);
      ink += ln(50, 50, p[0], p[1], INK, 9) + ln(q[0], q[1], b1[0], b1[1], INK, 7) + ln(q[0], q[1], b2[0], b2[1], INK, 7);
      col += ln(50, 50, p[0], p[1], "#8CC8EA", 5) + ln(q[0], q[1], b1[0], b1[1], "#8CC8EA", 3.5) + ln(q[0], q[1], b2[0], b2[1], "#8CC8EA", 3.5);
    }
    return ink + col + circ(50, 50, 5, "#8CC8EA", 2);
  })();
  I.rocket = pth("M38 56 L24 76 L38 72 Z", "#D9674B") + pth("M62 56 L76 76 L62 72 Z", "#D9674B") + pth("M42 72 L50 93 L58 72 Z", "#F6C343") +
    pth("M50 8 C66 22 68 48 63 74 H37 C32 48 34 22 50 8 Z", "#F3EFE2") + circ(50, 38, 7, "#5F9BC7") + ln(40, 62, 60, 62, INK, 2.5);
  I.planet = circ(50, 50, 23, "#E3A857") + pth("M29 44 Q50 52 72 43", "none", { w: 2, stroke: "#B87A35" }) + pth("M31 60 Q50 66 69 58", "none", { w: 2, stroke: "#B87A35" }) +
    ell(50, 50, 43, 11, "none", 0, ' stroke="' + INK + '" stroke-width="6.5" transform="rotate(-18 50 50)"') +
    ell(50, 50, 43, 11, "none", 0, ' stroke="#F3D9A6" stroke-width="3" transform="rotate(-18 50 50)"');
  I.moon = pth("M46.6 20 A32 32 0 1 0 76.1 67.2 A28 28 0 0 1 46.6 20 Z", "#F4E7B5") +
    circ(30, 54, 4, "#E5D28F", 0) + circ(40, 72, 3, "#E5D28F", 0) + circ(28, 40, 2.5, "#E5D28F", 0);
  I.star = (function(){
    var p = [];
    for (var k = 0; k < 10; k++) p.push(polar(50, 52, k % 2 ? 16 : 38, -Math.PI / 2 + k * Math.PI / 5));
    return poly(p, "#F6C343");
  })();
  I.globe = circ(50, 50, 34, "#6FB3E0") +
    pth("M30 30 C40 24 52 30 50 40 C48 50 36 46 32 56 C24 50 24 38 30 30 Z", "#6BBF8A", { w: 2.5 }) +
    pth("M58 54 C68 50 80 58 74 70 C68 78 58 72 58 54 Z", "#6BBF8A", { w: 2.5 }) +
    pth("M60 22 C66 22 70 28 66 32 C62 34 58 28 60 22 Z", "#6BBF8A", { w: 2 }) +
    ell(50, 50, 16, 34, "none", 0, ' stroke="' + INK + '" stroke-width="1.5" opacity="0.35"');
  I.crown = pth("M18 72 L22 32 L37 52 L50 26 L63 52 L78 32 L82 72 Z", "#F6C343") + rct(18, 70, 64, 12, "#E9A23B", 3) +
    circ(22, 30, 4.5, "#F6C343", 2.5) + circ(50, 24, 4.5, "#F6C343", 2.5) + circ(78, 30, 4.5, "#F6C343", 2.5) +
    circ(36, 76, 3.5, "#D9674B", 2) + circ(50, 76, 3.5, "#5F9BC7", 2) + circ(64, 76, 3.5, "#4F9D78", 2);
  I.castle = pth("M36 86 V46 H42 V52 H50 V46 H58 V52 H64 V86 Z", "#C9BFA8") +
    pth("M14 86 V30 H20 V36 H26 V30 H32 V36 H38 V86 Z", "#B5AA90") + pth("M62 86 V36 H68 V30 H74 V36 H80 V30 H86 V86 Z", "#B5AA90") +
    pth("M43 86 V72 A7 7 0 0 1 57 72 V86 Z", "#8A5A3C") + rct(23, 48, 6, 10, INK, 3, 0) + rct(71, 48, 6, 10, INK, 3, 0) +
    ln(26, 30, 26, 12, INK, 2.5) + pth("M26 12 L38 16 L26 20 Z", "#D9674B", { w: 2 });
  I.person = person("#5F9BC7");
  I.group = sub(person("#4F9D78"), 30, 50, 0.76) + sub(person("#D9674B"), 70, 50, 0.76) + sub(person("#5F9BC7"), 50, 54, 0.92);
  I.ship = pth("M50 62 V14", "none") + pth("M52 18 L52 58 L78 58 Z", "#FFFFFF") + pth("M48 24 L48 58 L26 58 Z", "#FFFFFF") +
    pth("M50 14 L61 17 L50 20 Z", "#D9674B", { w: 2 }) + pth("M12 62 H88 L76 80 H24 Z", "#8A5A3C") +
    pth("M6 86 Q18 80 30 86 T54 86 T78 86 T94 86", "none", { stroke: "#3F8FC4", w: 3 });
  I.gear = (function(){
    var p = [], N = 10, step = 2 * Math.PI / N, w = 0.13;
    for (var k = 0; k < N; k++){
      var a0 = k * step;
      p.push(polar(50, 50, 40, a0 - w), polar(50, 50, 40, a0 + w), polar(50, 50, 30, a0 + w + 0.08), polar(50, 50, 30, a0 + step - w - 0.08));
    }
    return poly(p, "#A7B0B8") + '<circle cx="50" cy="50" r="21" fill="none" stroke="' + INK + '" stroke-width="2" opacity="0.4"/>' + circ(50, 50, 10, "#F3EFE2");
  })();
  I.lever = '<g transform="rotate(-14 50 62)">' + rct(10, 58, 80, 8, "#C69C6D", 3) + rct(14, 40, 18, 18, "#D9674B", 3) + '</g>' +
    poly([[50, 64], [38, 86], [62, 86]], "#8E9AA6") + ln(84, 22, 84, 36, INK, 3.5) + poly([[84, 44], [78, 35], [90, 35]], INK, 0);
  I.robot = rct(22, 62, 10, 18, "#A7B0B8", 4, 2.5) + rct(68, 62, 10, 18, "#A7B0B8", 4, 2.5) + rct(34, 58, 32, 28, "#8E9AA6", 6) +
    circ(44, 70, 3.5, "#F6C343", 2) + circ(56, 70, 3.5, "#4F9D78", 2) + ln(50, 22, 50, 12, INK, 3) + circ(50, 10, 4.5, "#D9674B", 2.5) +
    rct(28, 22, 44, 34, "#A7B0B8", 8) + circ(40, 38, 5.5, "#5F9BC7") + circ(60, 38, 5.5, "#5F9BC7") + ln(42, 49, 58, 49, INK, 3);
  I.book = pth("M12 34 V80 C26 76 40 76 50 82 C60 76 74 76 88 80 V34", "none", { stroke: "#5F9BC7", w: 5 }) +
    pth("M50 32 C40 26 26 26 14 30 V76 C26 72 40 72 50 78 Z", "#FFFFFF") + pth("M50 32 C60 26 74 26 86 30 V76 C74 72 60 72 50 78 Z", "#FFFFFF") +
    pth("M22 42 C30 40 38 40 44 42 M22 52 C30 50 38 50 44 52 M22 62 C30 60 36 60 40 62", "none", { w: 2, op: 0.45 }) +
    pth("M56 42 C62 40 70 40 78 42 M56 52 C62 50 70 50 78 52 M56 62 C62 60 68 60 72 62", "none", { w: 2, op: 0.45 });
  I.brain = blob([[38, 42, 16], [60, 40, 17], [34, 58, 13], [66, 58, 13], [50, 62, 15], [50, 36, 12]], "#F2A7B8") +
    pth("M50 26 C46 40 54 50 49 72", "none", { w: 2.5 }) + pth("M28 48 C34 44 38 52 44 48", "none", { w: 2 }) +
    pth("M58 50 C62 46 68 52 72 48", "none", { w: 2 }) + pth("M36 64 C40 60 44 66 46 62", "none", { w: 2 }) + pth("M56 32 C60 30 64 34 66 32", "none", { w: 2 });
  I.heart = pth("M50 84 C20 64 12 44 22 31 C32 18 47 24 50 36 C53 24 68 18 78 31 C88 44 80 64 50 84 Z", "#E05A5A") +
    pth("M28 38 Q31 30 38 30", "none", { stroke: "#F7B3B3", w: 3 });
  I.apple = blob([[40, 58, 21], [60, 58, 21], [50, 68, 18]], "#E05A5A") + ln(50, 40, 53, 24, "#8A5A3C", 4) +
    pth("M54 32 C60 22 72 22 76 26 C70 34 62 36 54 32 Z", "#6BBF8A", { w: 2.5 }) + ell(35, 52, 4, 7, "#F7B3B3", 0, ' transform="rotate(20 35 52)"');
  I.gravity = sub(I.apple, 50, 28, 0.5) + ln(50, 52, 50, 70, INK, 3, { dash: "4 5" }) + poly([[50, 79], [44, 69], [56, 69]], INK, 0) +
    ln(14, 86, 86, 86, "#8A5A3C", 5) + pth("M20 86 l3 -6 l3 6 M70 86 l3 -6 l3 6", "none", { stroke: "#4F9D78", w: 2.5 });
  I.columns = pth("M12 36 L50 14 L88 36 Z", "#E9E2D0") + rct(16, 36, 68, 8, "#E9E2D0", 1) +
    [22, 37, 52, 67].map(function(x){ return rct(x, 44, 11, 34, "#F7F3E6", 1); }).join("") + rct(12, 78, 76, 9, "#E9E2D0", 1);
  I.ballot = '<g transform="rotate(-10 50 34)">' + rct(36, 14, 28, 34, "#FFFFFF", 2) +
    pth("M42 30 L48 37 L58 24", "none", { stroke: "#4F9D78", w: 4 }) + '</g>' + rct(20, 46, 60, 38, "#5F9BC7", 4) + rct(34, 46, 32, 5, INK, 1, 0);
  I.bird = pth("M24 56 L8 46 L12 62 Z", "#5F9BC7") +
    pth("M22 56 C26 40 48 34 62 42 C68 34 80 34 84 42 C84 48 78 50 74 50 C72 64 56 72 38 68 C30 66 24 62 22 56 Z", "#5F9BC7") +
    pth("M38 54 C44 38 58 32 66 36 C60 50 52 58 38 58 Z", "#3F7FAF") + circ(76, 42, 2.5, INK, 0) + pth("M84 42 L94 45 L84 48 Z", "#F6C343", { w: 2 });
  I.fish = pth("M74 50 L90 36 L88 64 Z", "#F08A4B") + pth("M14 50 C28 28 60 28 76 50 C60 72 28 72 14 50 Z", "#F6A55B") +
    pth("M42 35 C48 26 58 28 60 35", "#F08A4B", { w: 2.5 }) + circ(28, 47, 3.5, INK, 0) + pth("M46 40 Q52 50 46 60", "none", { w: 2, op: 0.6 });
  I.volcano = blob([[50, 22, 8], [60, 14, 9], [42, 12, 7]], "#C9CDD1") + pth("M10 88 L36 40 H64 L90 88 Z", "#8A6A55") +
    pth("M36 40 C40 52 46 46 50 58 C54 46 60 52 64 40 Z", "#F08A4B", { w: 2.5 }) + pth("M61 47 C66 58 62 66 70 76", "none", { stroke: "#F08A4B", w: 4 });
  I.vapor = (function(){
    function wisp(x){ return "M" + x + " 86 C" + (x - 8) + " 72 " + (x + 8) + " 64 " + x + " 50 C" + (x - 8) + " 38 " + (x + 4) + " 28 " + x + " 16"; }
    var s = "";
    [30, 50, 70].forEach(function(x){ s += pth(wisp(x), "none", { w: 9 }); });
    [30, 50, 70].forEach(function(x){ s += pth(wisp(x), "none", { stroke: "#D3E2EC", w: 5 }); });
    return s;
  })();
  I.bulb = (function(){
    var s = "";
    [-150, -120, -90, -60, -30].forEach(function(d){
      var a = d * Math.PI / 180, p1 = polar(50, 40, 30, a), p2 = polar(50, 40, 40, a);
      s += ln(p1[0], p1[1], p2[0], p2[1], "#E9A23B", 4);
    });
    return s + circ(50, 40, 22, "#F9E07F") + pth("M43 46 L46 38 L50 46 L54 38 L57 46", "none", { stroke: "#C98B1E", w: 2.5 }) +
      rct(40, 60, 20, 8, "#A7B0B8", 2) + rct(42, 68, 16, 8, "#8E9AA6", 2);
  })();
  I.scroll = rct(26, 22, 48, 54, "#F3E4BD", 2) + rct(20, 16, 60, 11, "#E2CF9F", 5.5) + rct(20, 72, 60, 11, "#E2CF9F", 5.5) +
    ln(33, 38, 67, 38, INK, 2, { op: 0.45 }) + ln(33, 46, 62, 46, INK, 2, { op: 0.45 }) + ln(33, 54, 67, 54, INK, 2, { op: 0.45 }) + ln(33, 62, 56, 62, INK, 2, { op: 0.45 });
  I.swords = ln(26, 74, 72, 28, INK, 10) + ln(26, 74, 72, 28, "#D8DCE0", 5) + ln(74, 74, 28, 28, INK, 10) + ln(74, 74, 28, 28, "#D8DCE0", 5) +
    ln(27, 63, 37, 73, INK, 9) + ln(27, 63, 37, 73, "#8A5A3C", 5) + ln(63, 73, 73, 63, INK, 9) + ln(63, 73, 73, 63, "#8A5A3C", 5) +
    ln(26, 74, 18, 82, INK, 9) + ln(26, 74, 18, 82, "#8A5A3C", 5) + ln(74, 74, 82, 82, INK, 9) + ln(74, 74, 82, 82, "#8A5A3C", 5);
  I.dove = pth("M18 58 C24 42 44 38 58 46 C64 38 74 36 80 42 C84 46 82 50 78 50 C76 64 60 74 40 70 C30 68 22 64 18 58 Z", "#FFFFFF") +
    pth("M42 54 C46 34 62 24 74 26 C66 42 58 52 44 60 Z", "#E8EEF1") + circ(76, 43, 2.4, INK, 0) + pth("M81 43 L90 46 L81 49 Z", "#F6A55B", { w: 2 }) +
    pth("M86 50 C80 60 72 64 64 62", "none", { stroke: "#4F9D78", w: 3 }) + ell(74, 64, 4.5, 2.4, "#6BBF8A", 1.5) + ell(80, 58, 4.5, 2.4, "#6BBF8A", 1.5);
  I.coins = [70, 62, 54].map(function(y){ return ell(40, y + 5, 24, 8, "#E9A23B") + ell(40, y, 24, 8, "#F6C343"); }).join("") +
    circ(70, 56, 16, "#F6C343") + '<text x="70" y="62" text-anchor="middle" font-size="18" font-weight="700" font-family="Figtree, sans-serif" fill="#A8701A">$</text>';
  I.flag = ln(28, 90, 28, 12, INK, 4) + pth("M28 16 C42 10 56 26 76 18 V48 C56 56 42 40 28 46 Z", "#D9674B") + circ(28, 11, 3.5, "#F6C343", 2);
  I.fist = rct(38, 58, 26, 32, SKIN, 4) + rct(28, 20, 44, 42, SKIN, 12) + ln(39, 22, 39, 38, INK, 2.5) + ln(50, 22, 50, 38, INK, 2.5) + ln(61, 22, 61, 38, INK, 2.5) +
    pth("M30 48 C40 44 50 46 56 54", "none", { w: 2.5 }) + ln(14, 18, 21, 25, INK, 3) + ln(10, 32, 19, 34, INK, 3) + ln(86, 18, 79, 25, INK, 3) + ln(90, 32, 81, 34, INK, 3);
  I.clock = (function(){
    var t = "";
    for (var i = 0; i < 12; i++){ var a = i * Math.PI / 6, p1 = polar(50, 52, 27, a), p2 = polar(50, 52, 31, a); t += ln(p1[0], p1[1], p2[0], p2[1], INK, 2.5); }
    return circ(50, 52, 35, "#FFFFFF") + t + ln(50, 52, 50, 32, INK, 4) + ln(50, 52, 64, 58, INK, 4) + circ(50, 52, 3.5, "#D9674B", 0);
  })();
  I.chart = ln(18, 14, 18, 84, INK, 3) + ln(18, 84, 88, 84, INK, 3) + rct(26, 58, 12, 26, "#5F9BC7", 2, 2.5) + rct(44, 46, 12, 38, "#4F9D78", 2, 2.5) +
    rct(62, 30, 12, 54, "#F6C343", 2, 2.5) + pline([[28, 50], [50, 38], [68, 22], [80, 14]], "#D9674B", 3.5) + poly([[84, 11], [74, 13], [80, 20]], "#D9674B", 0);
  I.flask = rct(40, 12, 20, 6, "#D8DCE0", 2, 2.5) + pth("M44 18 V42 L24 78 C21 85 26 90 33 90 H67 C74 90 79 85 76 78 L56 42 V18", "#FFFFFF") +
    pth("M32 64 H68 L76 78 C79 85 74 90 67 90 H33 C26 90 21 85 24 78 Z", "#6BBF8A", { w: 2.5 }) +
    circ(44, 76, 3, "#FFFFFF", 1.5) + circ(57, 81, 4, "#FFFFFF", 1.5) + circ(51, 55, 2.5, "#6BBF8A", 1.5);

  // ---------- expanded library ----------
  function txt(s, x, y, size, fill){ return '<text x="' + x + '" y="' + y + '" text-anchor="middle" font-size="' + size + '" font-weight="700" font-family="Figtree, Arial, sans-serif" fill="' + fill + '">' + s + '</text>'; }
  function cubeAt(x, y, s, top, front, side){
    var d = s * 0.36;
    return rct(x, y, s, s, front, 2) + poly([[x, y], [x + d, y - d], [x + s + d, y - d], [x + s, y]], top) + poly([[x + s, y], [x + s + d, y - d], [x + s + d, y + s - d], [x + s, y + s]], side);
  }
  function fatLine(d, color, w){ return pth(d, "none", { w: w + 4 }) + pth(d, "none", { stroke: color, w: w }); }

  // weather & earth
  I.rainbow = (function(){
    var cols = ["#E05A5A", "#F6C343", "#6BBF8A", "#5F9BC7"];
    var s = '<path d="M19.75 78 A30.25 30.25 0 0 1 80.25 78" fill="none" stroke="' + INK + '" stroke-width="27.5"/>';
    [40, 33.5, 27, 20.5].forEach(function(r, i){ s += '<path d="M' + (50 - r) + ' 78 A' + r + ' ' + r + ' 0 0 1 ' + (50 + r) + ' 78" fill="none" stroke="' + cols[i] + '" stroke-width="5.6"/>'; });
    return s + blob([[12, 78, 9], [23, 81, 8]], "#FFFFFF") + blob([[88, 78, 9], [77, 81, 8]], "#FFFFFF");
  })();
  I.wind = (function(){
    var d = ["M10 38 H60 C72 38 74 22 63 20 C56 19 53 27 58 30", "M18 54 H74 C86 54 88 70 77 72 C70 73 67 65 72 62", "M10 70 H44 C54 70 56 82 48 84"];
    return d.map(function(x){ return pth(x, "none", { w: 9 }); }).join("") + d.map(function(x){ return pth(x, "none", { stroke: "#BFE3F5", w: 4.5 }); }).join("");
  })();
  I.tornado = [[58, 82, 8, 4], [57, 70, 13, 5], [55, 56, 19, 6], [52, 40, 26, 7], [50, 23, 34, 8]].map(function(e){ return ell(e[0], e[1], e[2], e[3], "#BFC4C8"); }).join("") +
    ln(16, 88, 28, 86, INK, 3) + ln(72, 90, 84, 88, INK, 3) + rct(78, 70, 7, 7, "#8A5A3C", 1, 2) + rct(18, 72, 6, 6, "#8A5A3C", 1, 2);
  I.thermometer = rct(40, 10, 20, 66, "#FFFFFF", 10) + circ(50, 78, 13, "#E05A5A") + rct(46, 34, 8, 42, "#E05A5A", 3, 0) +
    [22, 32, 42, 52, 62].map(function(y){ return ln(62, y, 70, y, INK, 2.5); }).join("");
  I.storm = '<g transform="translate(0,-16)">' + pth(CLOUD_D, "#8E9AA6") + '</g>' + sub(I.bolt, 52, 72, 0.4) + ln(30, 60, 26, 72, "#4A90C8", 4) + ln(74, 60, 70, 72, "#4A90C8", 4);
  I.rock = pth("M58 84 L64 66 L78 62 L90 72 L90 84 Z", "#C2BCB2") + pth("M10 84 L18 54 L40 38 L62 44 L76 64 L72 84 Z", "#A9A39A") +
    pth("M18 54 L36 62 L40 38 M36 62 L58 66 L62 44 M58 66 L72 84", "none", { w: 2, op: 0.45 }) + ln(6, 86, 94, 86, INK, 3);
  I.fossil = (function(){
    var pts = [], ribs = "";
    for (var t = 0; t <= 3.4 * Math.PI; t += 0.15) pts.push(polar(50, 52, 29 - t * 2.5, t - Math.PI / 2));
    for (var k = 0; k < 14; k++){
      var a = k * 0.5 - Math.PI / 2, r1 = 29 - k * 0.5 * 2.5;
      if (r1 < 9) break;
      var p1 = polar(50, 52, r1, a), p2 = polar(50, 52, Math.max(4, r1 - 7), a);
      ribs += ln(p1[0], p1[1], p2[0], p2[1], INK, 1.6, { op: 0.6 });
    }
    return circ(50, 52, 31, "#E9DCC0") + ribs + pline(pts, INK, 3);
  })();
  I.cactus = pth("M6 90 Q50 78 94 90 Z", "#F1D49A") +
    pth("M42 58 H32 C26 58 24 54 24 50 V40 C24 34 32 34 32 40 V48 H42", "#6BBF8A") +
    pth("M58 50 H68 C74 50 76 46 76 42 V32 C76 26 68 26 68 32 V40 H58", "#6BBF8A") +
    pth("M41 86 V28 C41 18 59 18 59 28 V86 Z", "#6BBF8A") + pth("M50 30 V80", "none", { w: 2, op: 0.4 }) +
    [[37, 40], [63, 36], [37, 64], [63, 60], [28, 44], [72, 36]].map(function(p){ return ln(p[0] - 2, p[1], p[0] + 2, p[1], INK, 1.5); }).join("");
  I.island = pth("M18 80 Q50 62 82 80 Z", "#F1D49A") + fatLine("M50 74 C52 58 50 44 56 30", "#8A5A3C", 5) +
    pth("M56 30 C46 22 34 24 26 34 C38 30 46 31 56 30 Z", "#4F9D78") + pth("M56 30 C66 20 78 22 86 32 C74 28 66 29 56 30 Z", "#4F9D78") +
    pth("M56 30 C52 18 44 12 36 12 C46 18 50 23 56 30 Z", "#4F9D78") + pth("M56 30 C62 18 70 14 78 16 C68 20 62 24 56 30 Z", "#4F9D78") +
    circ(53, 35, 3, "#8A5A3C", 1.5) + circ(60, 35, 3, "#8A5A3C", 1.5) +
    pth("M4 88 Q20 82 36 88 T68 88 T100 88", "none", { stroke: "#3F8FC4", w: 3 });
  I.earthquake = pth("M6 48 H46 L40 60 L48 70 L42 90 H6 Z", "#B08968") + pth("M56 44 H94 V90 H50 L56 70 L48 60 Z", "#B08968") +
    ln(6, 48, 46, 48, "#4F9D78", 4) + ln(56, 44, 94, 44, "#4F9D78", 4) + pth("M20 32 l-6 -8 M32 26 l0 -10 M70 24 l6 -8 M82 32 l8 -6", "none", { w: 3 });

  // living things
  I.bee = ell(42, 34, 10, 15, "#E8F4FB", 2.5, ' transform="rotate(-25 42 34)"') + ell(58, 32, 10, 15, "#E8F4FB", 2.5, ' transform="rotate(20 58 32)"') +
    poly([[27, 56], [16, 58], [27, 62]], INK, 0) + ell(50, 58, 24, 16, "#F6C343") + ln(44, 44, 44, 72, INK, 5, { cap: "butt" }) + ln(55, 43, 55, 73, INK, 5, { cap: "butt" }) +
    circ(76, 54, 10, "#3B3B3B") + circ(79, 51, 2.5, "#FFFFFF", 0) + pth("M78 45 C80 37 86 33 90 35 M74 45 C72 37 74 31 78 29", "none", { w: 2.5 });
  I.butterfly = ell(33, 38, 19, 16, "#F28FA6", 3, ' transform="rotate(-20 33 38)"') + ell(67, 38, 19, 16, "#F28FA6", 3, ' transform="rotate(20 67 38)"') +
    ell(36, 64, 13, 12, "#F6C343", 3, ' transform="rotate(20 36 64)"') + ell(64, 64, 13, 12, "#F6C343", 3, ' transform="rotate(-20 64 64)"') +
    circ(30, 36, 5, "#FFFFFF", 2) + circ(70, 36, 5, "#FFFFFF", 2) + rct(46, 28, 8, 48, INK, 4, 0) +
    pth("M48 30 C44 20 38 16 34 16 M52 30 C56 20 62 16 66 16", "none", { w: 2.5 });
  I.caterpillar = [[20, 64], [33, 60], [46, 64], [59, 60]].map(function(p){ return ln(p[0], p[1] + 10, p[0], p[1] + 15, INK, 3); }).join("") +
    blob([[20, 64, 10], [33, 60, 11], [46, 64, 11], [59, 60, 11]], "#9BCB6B") + circ(74, 52, 13, "#6BBF8A") + circ(78, 49, 2.5, INK, 0) +
    pth("M70 40 L66 30 M78 40 L82 30", "none", { w: 2.5 }) + circ(66, 29, 2.5, "#D9674B", 1.5) + circ(82, 29, 2.5, "#D9674B", 1.5) + pth("M74 58 Q78 60 82 57", "none", { w: 2 });
  I.cocoon = ln(14, 14, 86, 14, "#8A5A3C", 6) + ln(50, 14, 50, 24, INK, 3) + ell(50, 54, 15, 31, "#C69C6D") +
    pth("M37 42 Q50 48 63 42 M36 56 Q50 62 64 56 M38 70 Q50 76 62 70", "none", { w: 2, op: 0.55 }) + pth("M68 20 C76 16 80 24 76 28", "#6BBF8A", { w: 2 });
  I.egg = pth("M50 12 C70 12 82 44 82 60 C82 78 68 90 50 90 C32 90 18 78 18 60 C18 44 30 12 50 12 Z", "#FFF6E5") +
    circ(38, 50, 3, "#E9C99B", 0) + circ(60, 36, 2.5, "#E9C99B", 0) + circ(62, 66, 3.5, "#E9C99B", 0) + ell(38, 38, 4, 8, "#FFFFFF", 0, ' transform="rotate(25 38 38)"');
  I.frog = blob([[50, 62, 27], [34, 38, 12], [66, 38, 12]], "#6BBF8A") + circ(34, 37, 6.5, "#FFFFFF", 2) + circ(66, 37, 6.5, "#FFFFFF", 2) +
    circ(35, 38, 3, INK, 0) + circ(67, 38, 3, INK, 0) + pth("M34 62 Q50 74 66 62", "none", { w: 3 }) + ell(50, 77, 14, 5, "#9BCB6B", 0) +
    ell(22, 85, 11, 5, "#6BBF8A") + ell(78, 85, 11, 5, "#6BBF8A");
  I.dinosaur = (function(){
    var tail = "M30 60 C20 62 12 68 6 76", neck = "M66 56 C72 44 74 30 80 22", G = "#9BCB6B";
    return pth(tail, "none", { w: 13 }) + pth(neck, "none", { w: 13 }) + rct(34, 68, 9, 18, G, 3) + rct(58, 68, 9, 18, G, 3) + ell(50, 62, 26, 15, G) +
      pth(tail, "none", { stroke: G, w: 8 }) + pth(neck, "none", { stroke: G, w: 8 }) + ell(84, 20, 9, 6, G) + circ(86, 18, 1.8, INK, 0) +
      pth("M40 54 Q44 50 48 54 M52 52 Q56 48 60 52", "none", { stroke: "#6BA34F", w: 2.5 });
  })();
  I.bone = (function(){
    var ends = [[24, 36], [32, 26], [68, 74], [76, 64]];
    return ln(30, 34, 70, 66, INK, 19) + ends.map(function(p){ return circ(p[0], p[1], 11.5, INK, 0); }).join("") +
      ln(30, 34, 70, 66, "#F5EEDC", 13) + ends.map(function(p){ return circ(p[0], p[1], 9, "#F5EEDC", 0); }).join("");
  })();
  I.tooth = pth("M30 20 C40 14 46 20 50 20 C54 20 60 14 70 20 C82 28 78 46 72 56 C68 64 68 84 62 86 C56 88 56 68 50 68 C44 68 44 88 38 86 C32 84 32 64 28 56 C22 46 18 28 30 20 Z", "#FFFFFF") +
    pth("M34 28 Q38 24 44 26", "none", { stroke: "#BFE3F5", w: 3 });
  I.eye = pth("M8 50 C26 24 74 24 92 50 C74 76 26 76 8 50 Z", "#FFFFFF") + circ(50, 50, 16, "#5F9BC7") + circ(50, 50, 7, INK, 0) + circ(55, 45, 3, "#FFFFFF", 0) +
    pth("M30 30 L26 22 M50 25 V15 M70 30 L74 22", "none", { w: 3 });
  I.ear = pth("M38 14 C62 6 82 26 76 48 C74 60 64 62 62 72 C60 84 50 90 42 84 C36 80 40 72 34 66 C24 56 20 26 38 14 Z", SKIN) +
    pth("M44 30 C56 24 66 34 62 46 C60 52 52 52 52 60", "none", { w: 2.5 });
  I.hand = '<g transform="rotate(-35 26 62)">' + rct(18, 44, 10, 30, SKIN, 5) + '</g>' +
    rct(30, 18, 10, 36, SKIN, 5) + rct(41, 12, 10, 40, SKIN, 5) + rct(52, 14, 10, 38, SKIN, 5) + rct(63, 20, 10, 32, SKIN, 5) + rct(29, 44, 45, 42, SKIN, 13);
  I.lungs = fatLine("M50 8 V40 M50 40 L42 50 M50 40 L58 50", "#E8D5C4", 4) +
    pth("M44 30 C30 30 18 50 18 70 C18 82 30 86 42 78 C46 74 46 60 46 50 Z", "#F28FA6") + pth("M56 30 C70 30 82 50 82 70 C82 82 70 86 58 78 C54 74 54 60 54 50 Z", "#F28FA6") +
    pth("M30 56 Q36 60 38 68 M70 56 Q64 60 62 68", "none", { w: 2, op: 0.5 });
  I.stomach = pth("M40 12 C40 30 30 36 30 52 C30 74 52 84 70 76 C86 68 84 48 70 46 C58 44 58 56 50 50 C46 46 52 30 52 12 Z", "#F2A7B8") +
    pth("M38 60 Q48 70 62 66", "none", { w: 2, op: 0.5 });
  I.muscle = pth("M14 84 C16 70 26 60 38 58 L40 40 C40 30 48 24 56 26 C64 28 64 38 56 42 L52 44 C58 40 74 42 80 54 C86 68 74 82 56 82 Z", SKIN) +
    pth("M52 62 C58 56 68 56 74 62", "none", { w: 2.5 }) + pth("M84 30 l6 -6 M86 42 l8 0 M80 20 l2 -8", "none", { w: 3 });
  I.rabbit = ell(62, 22, 5.5, 16, "#E9E2D6", 3, ' transform="rotate(-10 62 22)"') + ell(76, 22, 5.5, 16, "#E9E2D6", 3, ' transform="rotate(12 76 22)"') +
    ell(62, 22, 2.2, 10, "#F2A7B8", 0, ' transform="rotate(-10 62 22)"') + ell(76, 22, 2.2, 10, "#F2A7B8", 0, ' transform="rotate(12 76 22)"') +
    circ(24, 62, 7, "#FFFFFF") + ell(46, 66, 24, 18, "#E9E2D6") + circ(68, 48, 15, "#E9E2D6") + circ(73, 46, 2.2, INK, 0) + circ(82, 52, 2.5, "#F28FA6", 1.5) +
    ell(56, 82, 9, 4, "#E9E2D6");
  I.fox = poly([[20, 24], [38, 40], [30, 46]], "#C46A35") + poly([[80, 24], [62, 40], [70, 46]], "#C46A35") +
    pth("M20 24 L38 40 H62 L80 24 L78 56 L50 86 L22 56 Z", "#E9894A") + pth("M22 56 L50 86 L40 58 Z", "#FFFFFF", { w: 2 }) + pth("M78 56 L50 86 L60 58 Z", "#FFFFFF", { w: 2 }) +
    circ(38, 54, 3, INK, 0) + circ(62, 54, 3, INK, 0) + circ(50, 80, 4, INK, 0);
  I.grass = ln(8, 88, 92, 88, "#8A5A3C", 4) + [14, 26, 40, 54, 68, 82].map(function(x, i){
    var h = i % 2 ? 50 : 38, lean = i % 2 ? 6 : -6;
    return pth("M" + (x - 5) + " 88 C" + (x - 4) + " " + (88 - h * 0.5) + " " + (x + lean - 1) + " " + (88 - h * 0.8) + " " + (x + lean) + " " + (88 - h) +
      " C" + (x + lean + 2) + " " + (88 - h * 0.7) + " " + (x + 5) + " " + (88 - h * 0.4) + " " + (x + 5) + " 88 Z", i % 2 ? "#6BBF8A" : "#4F9D78", { w: 2.5 });
  }).join("");
  I.mushroom = ln(8, 86, 92, 86, "#4F9D78", 3) + rct(40, 48, 20, 38, "#F5EEDC", 8) + pth("M12 54 C12 22 88 22 88 54 Z", "#D9674B") +
    circ(30, 42, 5, "#FFFFFF", 0) + circ(54, 32, 6, "#FFFFFF", 0) + circ(72, 44, 4, "#FFFFFF", 0);
  I.whale = pth("M10 58 C12 36 46 30 66 38 C76 42 80 50 82 56 L94 44 L92 70 L80 62 C70 76 40 80 22 74 C14 70 10 64 10 58 Z", "#5F9BC7") +
    pth("M16 64 C30 72 56 72 72 62", "none", { stroke: "#D6ECF8", w: 3 }) + circ(26, 54, 3, INK, 0) +
    pth("M38 30 C36 20 30 16 26 14 M38 30 C40 20 46 16 50 14", "none", { stroke: "#6FB3E0", w: 3.5 });

  // space
  I.comet = ln(58, 44, 14, 16, "#F6C343", 9, { op: 0.55 }) + ln(58, 50, 8, 40, "#F6C343", 7, { op: 0.45 }) + ln(62, 56, 22, 68, "#F6C343", 5, { op: 0.35 }) +
    circ(66, 50, 15, "#D8D2C4") + circ(61, 46, 3, "#B9B2A3", 0) + circ(70, 55, 4, "#B9B2A3", 0);
  I.telescope = '<g transform="rotate(-25 50 44)">' + rct(14, 34, 58, 18, "#5F9BC7", 4) + rct(70, 30, 14, 26, "#3F7FAF", 3) + rct(6, 38, 10, 10, "#8E9AA6", 2) + '</g>' +
    ln(50, 54, 34, 90, INK, 3.5) + ln(50, 54, 50, 90, INK, 3.5) + ln(50, 54, 66, 90, INK, 3.5) + circ(50, 54, 4, "#8E9AA6", 2);
  I.satellite = '<g transform="rotate(-20 50 50)">' + ln(36, 50, 64, 50, INK, 3) +
    rct(6, 40, 30, 20, "#5F9BC7", 2) + ln(16, 40, 16, 60, INK, 1.5) + ln(26, 40, 26, 60, INK, 1.5) + ln(6, 50, 36, 50, INK, 1.5) +
    rct(64, 40, 30, 20, "#5F9BC7", 2) + ln(74, 40, 74, 60, INK, 1.5) + ln(84, 40, 84, 60, INK, 1.5) + ln(64, 50, 94, 50, INK, 1.5) +
    rct(40, 36, 20, 28, "#D8DCE0", 3) + ln(50, 36, 50, 26, INK, 3) + pth("M40 22 Q50 34 60 22 Z", "#F3EFE2", { w: 2.5 }) + '</g>';

  // physics & technology
  I.battery = rct(14, 32, 66, 36, "#4F9D78", 6) + rct(80, 42, 8, 16, "#A7B0B8", 2) + rct(14, 32, 20, 36, "#3B3B3B", 6) +
    ln(58, 44, 58, 56, "#FFFFFF", 4) + ln(52, 50, 64, 50, "#FFFFFF", 4) + ln(20, 50, 28, 50, "#FFFFFF", 4);
  I.plug = rct(38, 22, 7, 20, "#A7B0B8", 2) + rct(55, 22, 7, 20, "#A7B0B8", 2) + pth("M50 72 C50 88 70 90 88 84", "none", { w: 5 }) + rct(28, 38, 44, 36, "#E9E2D0", 9);
  I.sound = poly([[16, 40], [32, 40], [50, 24], [50, 76], [32, 60], [16, 60]], "#A7B0B8") +
    pth("M60 38 Q68 50 60 62", "none", { w: 4 }) + pth("M68 30 Q80 50 68 70", "none", { w: 4 }) + pth("M76 22 Q92 50 76 78", "none", { w: 4 });
  I.note = ln(42, 74, 42, 24, INK, 4) + ln(78, 66, 78, 16, INK, 4) + poly([[42, 22], [78, 14], [78, 26], [42, 34]], INK, 0) +
    ell(34, 74, 11, 8, "#5F9BC7", 3, ' transform="rotate(-20 34 74)"') + ell(70, 66, 11, 8, "#5F9BC7", 3, ' transform="rotate(-20 70 66)"');
  I.prism = fatLine("M4 60 L34 54", "#FFFFFF", 3) + poly([[50, 16], [82, 76], [18, 76]], "#E8F4FB") +
    ["#E05A5A", "#F6C343", "#6BBF8A", "#5F9BC7"].map(function(c, i){ return ln(68, 48 + i * 3, 96, 36 + i * 12, c, 4); }).join("");
  I.microscope = rct(20, 82, 56, 8, "#8E9AA6", 3) + fatLine("M60 82 C80 70 80 38 62 26", "#A7B0B8", 5) + rct(28, 58, 40, 6, "#A7B0B8", 2, 2.5) +
    ln(48, 64, 48, 82, INK, 4) + '<g transform="rotate(-22 50 34)">' + rct(42, 12, 14, 44, "#5F9BC7", 4) + rct(39, 6, 20, 8, "#3F7FAF", 2, 2.5) + '</g>';
  I.beaker = pth("M30 16 V80 C30 86 34 90 40 90 H60 C66 90 70 86 70 80 V16", "#FFFFFF") +
    pth("M30 52 H70 V80 C70 86 66 90 60 90 H40 C34 90 30 86 30 80 Z", "#7FB8E8", { w: 2.5 }) + ln(26, 16, 74, 16, INK, 3) +
    [28, 38, 48].map(function(y){ return ln(30, y, 38, y, INK, 2); }).join("") + circ(44, 70, 3, "#FFFFFF", 1.5) + circ(56, 78, 4, "#FFFFFF", 1.5);
  I.scale = rct(30, 82, 40, 8, "#8E9AA6", 3) + ln(50, 20, 50, 84, INK, 4) + ln(14, 30, 86, 30, INK, 4) +
    ln(14, 30, 6, 54, INK, 2) + ln(14, 30, 22, 54, INK, 2) + ln(86, 30, 78, 54, INK, 2) + ln(86, 30, 94, 54, INK, 2) +
    pth("M2 54 H26 Q14 68 2 54 Z", "#F6C343") + pth("M74 54 H98 Q86 68 74 54 Z", "#F6C343") + circ(50, 20, 4.5, "#F6C343", 2);
  I.ramp = poly([[8, 84], [92, 84], [92, 38]], "#C69C6D") + '<g transform="rotate(-28.7 52 59)">' + rct(44, 41, 18, 18, "#D9674B", 2) + '</g>' +
    pth("M24 66 L40 57", "none", { w: 3 }) + poly([[44, 55], [36, 54], [40, 62]], INK, 0);
  I.pulley = rct(14, 8, 72, 8, "#8A5A3C", 2) + ln(50, 16, 50, 28, INK, 3) + ln(38, 40, 38, 76, INK, 3) + ln(62, 40, 62, 66, INK, 3) +
    circ(50, 40, 12, "#A7B0B8") + circ(50, 40, 3, INK, 0) + rct(26, 76, 24, 14, "#8E9AA6", 2) + poly([[62, 78], [56, 68], [68, 68]], INK, 0);
  I.spring = rct(26, 10, 48, 8, "#A7B0B8", 2) + rct(26, 82, 48, 8, "#A7B0B8", 2) + (function(){
    var p = [[50, 18]];
    for (var y = 24, i = 0; y <= 76; y += 7, i++) p.push([i % 2 ? 32 : 68, y]);
    p.push([50, 82]);
    return pline(p, INK, 7) + pline(p, "#D8DCE0", 3);
  })();
  I.car = pth("M8 66 V54 C8 50 12 48 16 48 H28 L40 32 H66 L78 48 H86 C90 48 92 52 92 56 V66 Z", "#D9674B") +
    pth("M43 36 H52 V48 H34 Z", "#BFE3F5", { w: 2 }) + pth("M56 36 H64 L72 48 H56 Z", "#BFE3F5", { w: 2 }) +
    circ(28, 68, 10, "#3B3B3B") + circ(28, 68, 4, "#D8DCE0", 0) + circ(72, 68, 10, "#3B3B3B") + circ(72, 68, 4, "#D8DCE0", 0);
  I.train = blob([[26, 16, 6], [36, 10, 7]], "#D8DCE0") + rct(20, 22, 10, 18, INK, 2, 0) + rct(12, 40, 52, 30, "#4F9D78", 4) + rct(48, 22, 30, 48, "#3E7D5F", 4) +
    rct(54, 28, 18, 14, "#BFE3F5", 2, 2.5) + poly([[12, 58], [4, 72], [12, 72]], "#D9674B") +
    circ(24, 72, 8, "#3B3B3B") + circ(44, 72, 8, "#3B3B3B") + circ(66, 72, 8, "#3B3B3B") + ln(4, 82, 96, 82, "#8A5A3C", 4);
  I.plane = poly([[44, 52], [62, 52], [46, 82], [36, 82]], "#5F9BC7") + poly([[14, 48], [24, 48], [18, 28], [10, 28]], "#5F9BC7") +
    pth("M8 52 C8 46 14 44 22 44 H74 C84 44 92 48 92 52 C92 56 84 58 74 58 H22 C14 58 8 56 8 52 Z", "#F3EFE2") +
    [34, 44, 54, 64].map(function(x){ return circ(x, 50, 2.6, "#5F9BC7", 0); }).join("") + pth("M80 47 Q86 48 88 52", "none", { w: 2 });
  I.computer = rct(12, 16, 76, 50, "#3B3B3B", 6) + rct(18, 22, 64, 38, "#BFE3F5", 2, 0) +
    ln(24, 30, 50, 30, "#5F9BC7", 3) + ln(30, 38, 62, 38, "#D9674B", 3) + ln(30, 46, 56, 46, "#4F9D78", 3) + ln(24, 54, 44, 54, "#5F9BC7", 3) +
    poly([[42, 66], [58, 66], [62, 78], [38, 78]], "#8E9AA6") + rct(28, 78, 44, 6, "#A7B0B8", 3);
  I.phone = rct(30, 8, 40, 84, "#3B3B3B", 8) + rct(34, 16, 32, 62, "#BFE3F5", 3, 0) +
    [["#D9674B", 38, 22], ["#4F9D78", 54, 22], ["#F6C343", 38, 38], ["#5F9BC7", 54, 38]].map(function(a){ return rct(a[1], a[2], 10, 10, a[0], 3, 0); }).join("") +
    circ(50, 85, 2.5, "#8E9AA6", 0);
  I.envelope = rct(12, 26, 76, 50, "#FFFDF6", 4) + pth("M12 28 L50 56 L88 28", "none") + rct(70, 32, 12, 12, "#D9674B", 1, 2);

  // math
  I.pizza = circ(50, 50, 40, "#E2A65B") + circ(50, 50, 33, "#F6C343", 0) + pth("M50 50 L50 17 A33 33 0 0 1 83 50 Z", "#FFFFFF", { w: 2 }) +
    [[34, 34], [30, 62], [64, 68], [42, 74], [70, 58], [24, 46]].map(function(p){ return circ(p[0], p[1], 4.5, "#D9674B", 1.5); }).join("") +
    ln(50, 10, 50, 90, INK, 3) + ln(10, 50, 90, 50, INK, 3);
  function pepperoni(list){ return list.map(function(p){ return circ(p[0], p[1], 4.5, "#D9674B", 1.5); }).join(""); }
  I.whole = circ(50, 50, 40, "#E2A65B") + circ(50, 50, 33, "#F6C343", 0) + pepperoni([[34, 34], [30, 62], [64, 68], [42, 74], [70, 58], [24, 46], [62, 32], [70, 42]]) +
    ln(50, 10, 50, 90, INK, 3) + ln(10, 50, 90, 50, INK, 3);
  I.half = '<g transform="translate(0,20)">' + pth("M10 50 A40 40 0 0 1 90 50 Z", "#E2A65B") + pth("M17 50 A33 33 0 0 1 83 50 Z", "#F6C343", { w: 0 }) +
    pepperoni([[32, 36], [62, 32], [46, 24], [70, 42]]) + ln(50, 10, 50, 50, INK, 3) + ln(10, 50, 90, 50, INK, 3) + '</g>';
  I.slice = pth("M22 78 L22 24 A54 54 0 0 1 76 78 Z", "#E2A65B") + pth("M27 73 L27 31 A46 46 0 0 1 69 73 Z", "#F6C343", { w: 0 }) +
    pepperoni([[38, 50], [52, 62], [36, 64], [44, 40]]);
  I.triangle = poly([[50, 14], [90, 82], [10, 82]], "#F28FA6") + pth("M18 72 Q24 74 24 82 M82 72 Q76 74 76 82", "none", { w: 2 });
  I.square = rct(16, 16, 68, 68, "#5F9BC7", 3) + pth("M16 72 H28 V84", "none", { stroke: "#FFFFFF", w: 2.5 });
  I.circle = circ(50, 50, 36, "#6BBF8A") + ln(50, 50, 86, 50, INK, 2.5, { dash: "4 4" }) + circ(50, 50, 3, INK, 0);
  I.cube = cubeAt(16, 38, 48, "#F9E07F", "#F6C343", "#E9A23B");
  I.ruler = '<g transform="rotate(-20 50 50)">' + rct(6, 38, 88, 24, "#F6C343", 3) +
    (function(){ var t = ""; for (var x = 12, i = 0; x <= 88; x += 6, i++) t += ln(x, 38, x, i % 2 ? 46 : 50, INK, 2); return t; })() + '</g>';
  I.numbers = [[8, "#5F9BC7", "1"], [37, "#D9674B", "2"], [66, "#4F9D78", "3"]].map(function(b, i){
    var y = i === 1 ? 30 : 46;
    return rct(b[0], y, 26, 26, b[1], 5) + txt(b[2], b[0] + 13, y + 20, 19, "#FFFFFF");
  }).join("") + ln(4, 76, 96, 76, INK, 3);
  I.sugar = cubeAt(12, 54, 30, "#FFFFFF", "#F7F3E6", "#E2DCCF") + cubeAt(48, 40, 36, "#FFFFFF", "#F7F3E6", "#E2DCCF") + pth("M28 30 l0 10 M23 35 l10 0", "none", { w: 2.5 });

  // history & society
  I.pyramid = poly([[50, 16], [92, 82], [8, 82]], "#E9C77B") + poly([[50, 16], [92, 82], [62, 82]], "#D4A853") +
    ln(29, 49, 71, 49, INK, 1.5, { op: 0.4 }) + ln(18, 66, 82, 66, INK, 1.5, { op: 0.4 }) + ln(4, 84, 96, 84, "#C9A35B", 4);
  I.house = rct(64, 22, 9, 18, "#8A5A3C", 1) + rct(22, 46, 56, 40, "#F3E4BD", 1) + poly([[14, 48], [50, 18], [86, 48]], "#D9674B") +
    rct(44, 62, 14, 24, "#8A5A3C", 2) + rct(26, 56, 12, 12, "#BFE3F5", 1, 2) + rct(64, 56, 10, 10, "#BFE3F5", 1, 2);
  I.city = (function(){
    var b = [[8, 40, 22, 48, "#8E9AA6"], [30, 20, 24, 68, "#A7B0B8"], [54, 48, 18, 40, "#5F9BC7"], [72, 30, 20, 58, "#8E9AA6"]], s = "";
    b.forEach(function(r){
      s += rct(r[0], r[1], r[2], r[3], r[4], 2);
      for (var y = r[1] + 6; y < r[1] + r[3] - 8; y += 10) for (var x = r[0] + 4; x < r[0] + r[2] - 5; x += 8) s += rct(x, y, 4, 5, "#F9E07F", 0.5, 0);
    });
    return s + ln(4, 88, 96, 88, INK, 3);
  })();
  I.factory = rct(70, 16, 10, 38, "#8A5A3C", 1) + blob([[78, 10, 5], [87, 7, 5]], "#D8DCE0") +
    pth("M10 88 V50 L30 38 V50 L50 38 V50 L70 38 V50 H90 V88 Z", "#B5AA90") +
    rct(18, 62, 12, 12, "#F9E07F", 1, 2) + rct(40, 62, 12, 12, "#F9E07F", 1, 2) + rct(62, 62, 12, 12, "#F9E07F", 1, 2) + rct(80, 70, 8, 18, "#8A5A3C", 1, 2);
  I.farm = pth("M18 88 V48 L50 22 L82 48 V88 Z", "#D9674B") + pth("M12 52 L50 18 L88 52", "none", { w: 5 }) +
    rct(38, 60, 24, 28, "#F3EFE2", 1) + ln(38, 60, 62, 88, INK, 2.5) + ln(62, 60, 38, 88, INK, 2.5) + rct(44, 36, 12, 10, "#F3EFE2", 1, 2);
  I.wheat = (function(){
    var s = "";
    [[32, -8], [50, 0], [68, 8]].forEach(function(st){
      var x = st[0], lean = st[1];
      s += pth("M" + x + " 90 Q" + x + " 60 " + (x + lean) + " 30", "none", { stroke: "#C69C6D", w: 3 });
      for (var k = 0; k < 4; k++){
        var y = 30 + k * 8, cx = x + lean * (1 - (k + 1) * 0.2);
        s += ell(cx - 5, y + 2, 3.2, 6, "#E9C77B", 1.6, ' transform="rotate(-25 ' + f(cx - 5) + ' ' + (y + 2) + ')"') +
             ell(cx + 5, y + 2, 3.2, 6, "#E9C77B", 1.6, ' transform="rotate(25 ' + f(cx + 5) + ' ' + (y + 2) + ')"');
      }
      s += ell(x + lean, 24, 3.2, 6, "#E9C77B", 1.6);
    });
    return s;
  })();
  I.bridge = pth("M6 46 H94 V86 H76 C76 66 66 56 50 56 C34 56 24 66 24 86 H6 Z", "#B5AA90") + ln(6, 46, 94, 46, "#8A5A3C", 5) +
    pth("M14 58 H22 M78 58 H86 M14 72 H20 M80 72 H86", "none", { w: 2, op: 0.5 }) + pth("M30 82 Q38 78 46 82 T62 82 T72 82", "none", { stroke: "#3F8FC4", w: 3 });
  I.wall = rct(8, 28, 84, 56, "#C2694A", 2) + [42, 56, 70].map(function(y){ return ln(8, y, 92, y, INK, 2); }).join("") +
    (function(){ var s = ""; for (var k = 0; k < 4; k++){ var y0 = 28 + 14 * k; for (var x = (k % 2 ? 22 : 36); x < 92; x += 28) s += ln(x, y0, x, y0 + 14, INK, 2); } return s; })();
  I.map = poly([[10, 24], [36, 16], [64, 24], [90, 16], [90, 78], [64, 86], [36, 78], [10, 86]], "#F3E4BD") +
    ln(36, 16, 36, 78, INK, 2, { op: 0.4 }) + ln(64, 24, 64, 86, INK, 2, { op: 0.4 }) +
    pth("M20 70 C30 50 44 66 56 46 S72 36 78 32", "none", { stroke: "#D9674B", w: 3, dash: "5 4" }) + pth("M76 24 l8 8 M84 24 l-8 8", "none", { stroke: "#D9674B", w: 3.5 });
  I.compass = circ(50, 50, 40, "#C69C6D") + circ(50, 50, 32, "#F3EFE2") + poly([[50, 20], [57, 50], [43, 50]], "#D9674B", 2.5) +
    poly([[50, 80], [57, 50], [43, 50]], "#FFFFFF", 2.5) + circ(50, 50, 4, INK, 0) + txt("N", 50, 17, 9, "#FFFFFF");
  I.quill = pth("M82 8 C58 14 36 38 28 70 C42 62 68 42 82 8 Z", "#F3EFE2") + pth("M82 8 C62 30 44 52 26 80", "none", { w: 2.5 }) +
    pth("M60 26 l8 4 M50 38 l8 4 M42 50 l7 4", "none", { w: 1.5, op: 0.5 }) + ln(26, 80, 18, 92, INK, 3.5) + pth("M8 92 Q14 86 20 92", "none", { stroke: "#5F9BC7", w: 3 });
  I.newspaper = rct(14, 16, 72, 68, "#F7F3E6", 2) + rct(20, 22, 60, 10, INK, 1, 0) + rct(20, 38, 26, 22, "#BFC4C8", 1, 2) +
    [40, 46, 52, 58].map(function(y){ return ln(52, y, 80, y, INK, 2, { op: 0.5 }); }).join("") +
    [66, 72, 78].map(function(y){ return ln(20, y, 80, y, INK, 2, { op: 0.5 }); }).join("");
  I.handshake = rct(2, 46, 22, 22, "#5F9BC7", 3) + rct(76, 40, 22, 22, "#D9674B", 3) +
    pth("M22 48 C34 42 44 40 54 42 L78 42 V60 L64 62 C58 70 46 72 38 68 L22 66 Z", SKIN) +
    pth("M44 50 C50 50 56 54 60 58 M40 56 C46 56 52 60 54 64 M54 42 C52 48 56 52 62 52", "none", { w: 2 });

  // reading, arts & classroom
  I.pencil = '<g transform="rotate(-40 50 50)">' + rct(14, 42, 10, 16, "#F28FA6", 2) + rct(22, 42, 6, 16, "#A7B0B8", 1) + rct(28, 42, 42, 16, "#F6C343", 1) +
    poly([[70, 42], [88, 50], [70, 58]], "#F3D9A6") + poly([[82, 47.3], [88, 50], [82, 52.7]], INK, 0) + '</g>';
  I.speech = pth("M18 20 H82 C88 20 92 24 92 30 V58 C92 64 88 68 82 68 H44 L26 84 L32 68 H18 C12 68 8 64 8 58 V30 C8 24 12 20 18 20 Z", "#FFFFFF") +
    ln(20, 36, 78, 36, INK, 3, { op: 0.5 }) + ln(20, 48, 64, 48, INK, 3, { op: 0.5 });
  I.question = circ(50, 50, 38, "#F3EFE2") + '<text x="50" y="72" text-anchor="middle" font-size="62" font-weight="800" font-family="Figtree, Arial, sans-serif" fill="#5F9BC7" stroke="' + INK + '" stroke-width="2.5">?</text>';
  I.magnifier = fatLine("M64 64 L88 88", "#8A5A3C", 8) + circ(44, 44, 27, "#E8F4FB") + pth("M30 36 Q34 26 44 24", "none", { stroke: "#FFFFFF", w: 4 });
  I.puzzle = pth("M22 28 H40 C38 16 58 16 56 28 H74 V46 C86 44 86 64 74 62 V80 H56 C58 70 38 70 40 80 H22 V62 C32 64 32 44 22 46 Z", "#6BBF8A");
  I.trophy = pth("M30 22 H18 C18 36 24 42 32 44 M70 22 H82 C82 36 76 42 68 44", "none", { w: 4 }) + pth("M30 14 H70 V34 C70 48 60 56 50 56 C40 56 30 48 30 34 Z", "#F6C343") +
    rct(45, 56, 10, 14, "#E9A23B", 1) + rct(30, 70, 40, 12, "#8A5A3C", 2) + pth("M50 24 l3 6 6 1 -4.5 4 1 6 -5.5 -3 -5.5 3 1 -6 -4.5 -4 6 -1 Z", "#FFFDF6", { w: 1.5 });
  I.calendar = rct(14, 22, 72, 64, "#FFFFFF", 6) + rct(14, 22, 72, 18, "#D9674B", 6) + rct(15.5, 32, 69, 8, "#D9674B", 0, 0) +
    ln(32, 14, 32, 28, INK, 4) + ln(68, 14, 68, 28, INK, 4) +
    (function(){ var s = ""; for (var r = 0; r < 3; r++) for (var c = 0; c < 4; c++) s += rct(22 + c * 15, 48 + r * 12, 9, 7, (r === 1 && c === 2) ? "#F6C343" : "#D8DCE0", 1.5, 0); return s; })();
  I.palette = pth("M50 14 C74 14 90 30 90 50 C90 64 80 70 70 66 C62 62 56 68 60 76 C64 86 56 90 48 90 C26 90 10 72 10 50 C10 30 28 14 50 14 Z", "#E9C99B") +
    circ(32, 36, 7, "#E05A5A", 2) + circ(52, 26, 7, "#F6C343", 2) + circ(72, 36, 7, "#5F9BC7", 2) + circ(26, 58, 7, "#6BBF8A", 2) + circ(40, 76, 5, "#FFFFFF", 2);
  I.carrot = '<g transform="rotate(35 50 52)">' + pth("M50 30 C44 18 36 12 30 14 C36 20 42 26 50 30 Z", "#6BBF8A", { w: 2.5 }) +
    pth("M50 30 C56 18 64 12 70 14 C64 20 58 26 50 30 Z", "#6BBF8A", { w: 2.5 }) + pth("M38 32 C44 28 56 28 62 32 L52 92 C51 94 49 94 48 92 Z", "#F08A4B") +
    ln(42, 44, 48, 44, INK, 2) + ln(52, 56, 58, 56, INK, 2) + ln(44, 68, 49, 68, INK, 2) + '</g>';
  I.bed = rct(8, 30, 8, 52, "#8A5A3C", 2) + rct(84, 60, 7, 22, "#8A5A3C", 2) + rct(14, 44, 74, 12, "#F3EFE2", 4) + rct(14, 56, 76, 12, "#8A5A3C", 2) +
    rct(16, 34, 22, 12, "#FFFFFF", 5) + rct(38, 40, 50, 18, "#5F9BC7", 5) + txt("z", 68, 28, 14, INK) + txt("Z", 82, 18, 19, INK);
  I.soap = rct(16, 50, 68, 30, "#BFE3F5", 10) + pth("M26 58 Q40 54 54 58", "none", { stroke: "#FFFFFF", w: 3 }) +
    circ(30, 36, 8, "#FFFFFF", 2) + circ(46, 24, 6, "#FFFFFF", 2) + circ(62, 34, 10, "#FFFFFF", 2) + circ(80, 20, 5, "#FFFFFF", 2);
  I.shield = pth("M50 10 L84 22 V48 C84 70 66 84 50 92 C34 84 16 70 16 48 V22 Z", "#5F9BC7") +
    pth("M50 20 L74 29 V48 C74 64 62 75 50 81 C38 75 26 64 26 48 V29 Z", "#BFE3F5", { w: 2 }) + pth("M38 50 L47 59 L64 40", "none", { stroke: "#4F9D78", w: 5 });
  I.pill = '<g transform="rotate(-35 50 50)">' + pth("M30 38 H50 V62 H30 A12 12 0 0 1 30 38 Z", "#E05A5A") + pth("M50 38 H70 A12 12 0 0 1 70 62 H50 Z", "#FFFFFF") + '</g>';
  I.oxygen = ln(36, 50, 64, 50, INK, 8) + circ(34, 50, 19, "#E05A5A") + circ(66, 50, 19, "#E05A5A") + txt("O", 34, 57, 18, "#FFFFFF") + txt("O", 66, 57, 18, "#FFFFFF");
  I.co2 = ln(22, 50, 78, 50, INK, 7) + circ(22, 50, 14, "#E05A5A") + circ(78, 50, 14, "#E05A5A") + circ(50, 50, 19, "#3B3B3B") +
    txt("C", 50, 57, 18, "#FFFFFF") + txt("O", 22, 55, 13, "#FFFFFF") + txt("O", 78, 55, 13, "#FFFFFF");


  // ---------- pack 2: animals ----------
  I.dog = ell(24, 46, 11, 21, "#8A5A3C", 3, ' transform="rotate(15 24 46)"') + ell(76, 46, 11, 21, "#8A5A3C", 3, ' transform="rotate(-15 76 46)"') +
    ell(50, 52, 27, 27, "#E8C79A") + ell(50, 66, 14, 11, "#FFFFFF", 2.5) + circ(50, 60, 4.5, INK, 0) + circ(39, 45, 3.2, INK, 0) + circ(61, 45, 3.2, INK, 0) +
    pth("M50 64 V69 M43 72 Q50 77 57 72", "none", { w: 2.5 });
  I.cat = poly([[22, 46], [24, 14], [44, 28]], "#F6A55B") + poly([[78, 46], [76, 14], [56, 28]], "#F6A55B") + poly([[27, 36], [28, 22], [37, 29]], "#F7C6C6", 0) + poly([[73, 36], [72, 22], [63, 29]], "#F7C6C6", 0) +
    ell(50, 58, 29, 25, "#F6A55B") + circ(39, 53, 3.6, INK, 0) + circ(61, 53, 3.6, INK, 0) + poly([[46, 62], [54, 62], [50, 67]], "#E8788A", 0) +
    pth("M50 67 Q46 72 42 70 M50 67 Q54 72 58 70", "none", { w: 2.2 }) + ln(14, 60, 32, 63, INK, 2) + ln(14, 69, 32, 67, INK, 2) + ln(86, 60, 68, 63, INK, 2) + ln(86, 69, 68, 67, INK, 2);
  I.horse = pth("M28 90 L36 54 C34 36 46 20 62 16 L70 6 L72 22 C84 28 90 42 86 58 L82 64 C76 66 70 62 68 58 C62 68 60 78 62 90 Z", "#A9744F") +
    pth("M66 12 C52 16 42 30 44 50 C40 40 38 30 46 22", "none", { stroke: "#4A3322", w: 7 }) + circ(74, 38, 3.2, INK, 0) + circ(83, 58, 2, INK, 0) + pth("M70 24 L66 12", "none", { w: 3 });
  I.cow = poly([[26, 30], [20, 12], [36, 22]], "#F4F1E8") + poly([[74, 30], [80, 12], [64, 22]], "#F4F1E8") + ell(16, 40, 10, 6, "#FFFFFF", 2.5, ' transform="rotate(20 16 40)"') + ell(84, 40, 10, 6, "#FFFFFF", 2.5, ' transform="rotate(-20 84 40)"') +
    ell(50, 46, 24, 28, "#FFFFFF") + circ(36, 30, 7, "#2B2620", 0) + ell(50, 70, 17, 13, "#F7C6C6") + circ(43, 71, 2.6, INK, 0) + circ(57, 71, 2.6, INK, 0) + circ(40, 44, 3.2, INK, 0) + circ(60, 44, 3.2, INK, 0);
  I.pig = poly([[24, 36], [20, 14], [42, 26]], "#F5A9B8") + poly([[76, 36], [80, 14], [58, 26]], "#F5A9B8") + circ(50, 52, 31, "#F5A9B8") + ell(50, 62, 15, 11, "#EE8CA0", 2.5) +
    circ(45, 62, 2.6, INK, 0) + circ(55, 62, 2.6, INK, 0) + circ(38, 45, 3.2, INK, 0) + circ(62, 45, 3.2, INK, 0);
  I.sheep = blob([[28, 46, 14], [42, 34, 15], [60, 34, 15], [74, 46, 14], [36, 62, 13], [64, 62, 13], [50, 50, 18]], "#FFFFFF") + ell(50, 58, 15, 18, "#3A322C") + circ(44, 52, 2.6, "#FFFFFF", 0) + circ(56, 52, 2.6, "#FFFFFF", 0) +
    ell(31, 56, 7, 4, "#3A322C", 2.5, ' transform="rotate(30 31 56)"') + ell(69, 56, 7, 4, "#3A322C", 2.5, ' transform="rotate(-30 69 56)"');
  I.chicken = pth("M20 60 C20 36 42 28 56 40 C70 34 82 44 80 62 C78 82 58 90 42 86 C28 82 20 74 20 60 Z", "#FFFFFF") + pth("M52 34 C48 24 54 18 58 24 C60 16 68 18 66 28", "#E05A5A", { w: 2.5 }) + poly([[26, 52], [12, 56], [26, 60]], "#F6C343") +
    circ(34, 50, 3, INK, 0) + pth("M44 62 C52 54 66 58 66 68 C58 74 48 72 44 62 Z", "#F3E4BD", { w: 2.5 }) + ln(46, 88, 46, 94, "#F08A4B", 3) + ln(60, 88, 60, 94, "#F08A4B", 3);
  I.duck = pth("M14 58 C14 40 34 34 46 42 C46 26 62 20 72 30 C80 36 76 46 70 50 C84 52 88 70 74 80 C58 90 22 88 14 58 Z", "#F6C343") + pth("M70 36 L90 38 L72 46 Z", "#F08A4B", { w: 2.5 }) +
    circ(66, 32, 3, INK, 0) + pth("M30 62 C40 54 56 58 60 68 C50 76 34 74 30 62 Z", "#E9A23B", { w: 2.5 });
  I.elephant = ell(20, 46, 17, 24, "#B8BEC4") + ell(80, 46, 17, 24, "#B8BEC4") + ell(50, 44, 24, 26, "#C9CED3") + pth("M42 56 C40 72 42 86 52 88 C60 90 62 82 58 78", "none", { w: 15 }) + pth("M42 56 C40 72 42 86 52 88 C60 90 62 82 58 78", "none", { stroke: "#C9CED3", w: 9 }) +
    circ(40, 40, 3.2, INK, 0) + circ(60, 40, 3.2, INK, 0) + poly([[36, 62], [30, 76], [42, 68]], "#FFFFFF", 2);
  I.lion = blob([[50, 12, 12], [28, 20, 12], [72, 20, 12], [16, 42, 12], [84, 42, 12], [20, 66, 12], [80, 66, 12], [34, 82, 12], [66, 82, 12], [50, 50, 36]], "#C9772E") +
    circ(30, 30, 7, "#E8C79A", 2.5) + circ(70, 30, 7, "#E8C79A", 2.5) + ell(50, 54, 24, 26, "#F2CB86") + ell(50, 64, 12, 9, "#FFFFFF", 2.5) + poly([[45, 56], [55, 56], [50, 62]], "#8A5A3C", 1.5) + circ(40, 46, 3.2, INK, 0) + circ(60, 46, 3.2, INK, 0) + pth("M50 62 V68 M44 70 Q50 74 56 70", "none", { w: 2.2 });
  I.bear = circ(26, 26, 12, "#8A5A3C") + circ(74, 26, 12, "#8A5A3C") + circ(26, 26, 5.5, "#D9A66F", 0) + circ(74, 26, 5.5, "#D9A66F", 0) + circ(50, 52, 31, "#8A5A3C") + ell(50, 63, 14, 11, "#E8C79A", 2.5) +
    ell(50, 58, 5, 3.6, INK, 0) + circ(38, 44, 3.2, INK, 0) + circ(62, 44, 3.2, INK, 0) + pth("M50 61 V66 M45 69 Q50 72 55 69", "none", { w: 2.2 });
  I.monkey = circ(18, 52, 10, "#8A5A3C") + circ(82, 52, 10, "#8A5A3C") + circ(18, 52, 5, "#F2C9A0", 0) + circ(82, 52, 5, "#F2C9A0", 0) + circ(50, 46, 30, "#8A5A3C") + blob([[40, 46, 12], [60, 46, 12], [50, 62, 14]], "#F2C9A0") +
    circ(42, 44, 3.2, INK, 0) + circ(58, 44, 3.2, INK, 0) + circ(46, 56, 1.6, INK, 0) + circ(54, 56, 1.6, INK, 0) + pth("M42 66 Q50 72 58 66", "none", { w: 2.5 });
  I.snake = pth("M18 82 C6 70 18 58 34 62 C54 66 70 50 56 38 C44 28 52 14 70 18", "none", { w: 17 }) + pth("M18 82 C6 70 18 58 34 62 C54 66 70 50 56 38 C44 28 52 14 70 18", "none", { stroke: "#6BBF8A", w: 11 }) +
    pth("M30 60 L36 74 M52 62 L58 52 M54 36 L46 28", "none", { stroke: "#F6C343", w: 4 }) + circ(72, 18, 8, "#6BBF8A") + circ(75, 16, 2, INK, 0) + pth("M80 20 L90 22 M90 22 L94 18 M90 22 L94 26", "none", { stroke: "#E05A5A", w: 2.5 });
  I.turtle = ell(50, 56, 32, 24, "#6BBF8A") + pth("M30 70 C34 52 46 46 50 46 C54 46 66 52 70 70 Z", "#4F9D78", { w: 2.5 }) + pth("M50 46 V70 M38 58 H62", "none", { w: 2.5 }) + circ(86, 54, 9, "#8FD0A8") + circ(89, 52, 1.8, INK, 0) +
    ell(22, 78, 8, 5, "#8FD0A8") + ell(76, 80, 8, 5, "#8FD0A8") + ell(18, 62, 6, 4, "#8FD0A8");
  I.spider = pth("M44 46 L20 26 L10 36 M44 50 L14 50 L8 62 M44 54 L20 72 L16 88 M56 46 L80 26 L90 36 M56 50 L86 50 L92 62 M56 54 L80 72 L84 88", "none", { w: 3.5 }) +
    circ(50, 64, 17, "#4A3A55") + circ(50, 42, 11, "#4A3A55") + circ(46, 40, 2.6, "#FFFFFF", 0) + circ(54, 40, 2.6, "#FFFFFF", 0) + pth("M50 56 L50 72", "none", { stroke: "#D9674B", w: 4 });
  I.ant = pth("M34 62 L22 80 M50 64 L50 84 M62 62 L76 80 M34 52 L18 40 M66 52 L82 40", "none", { w: 3 }) + ell(26, 56, 14, 11, "#A9442F") + ell(50, 56, 9, 8, "#A9442F") + circ(72, 52, 12, "#A9442F") +
    pth("M76 42 L86 24 M70 42 L66 26", "none", { w: 2.5 }) + circ(76, 50, 2.4, "#FFFFFF", 0);
  I.shark = pth("M6 60 C24 36 62 32 86 52 L96 36 L94 66 L86 62 C62 80 24 80 6 60 Z", "#8EA3B5") + pth("M10 60 C30 70 60 72 84 60 C62 76 28 74 10 60 Z", "#E8EEF3", { w: 0 }) + poly([[40, 40], [52, 14], [58, 42]], "#8EA3B5") +
    circ(26, 54, 2.8, INK, 0) + pth("M18 62 L22 66 L26 62 L30 66 L34 62", "none", { stroke: "#FFFFFF", w: 2.2 });
  I.octopus = pth("M22 60 C16 78 10 82 14 90 M34 66 C32 80 30 86 36 92 M50 66 V92 M66 66 C68 80 70 86 64 92 M78 60 C84 78 90 82 86 90", "none", { w: 12 }) +
    pth("M22 60 C16 78 10 82 14 90 M34 66 C32 80 30 86 36 92 M50 66 V92 M66 66 C68 80 70 86 64 92 M78 60 C84 78 90 82 86 90", "none", { stroke: "#B58AD6", w: 7 }) + pth("M20 54 C16 22 84 22 80 54 C78 68 22 68 20 54 Z", "#B58AD6") +
    circ(40, 46, 5, "#FFFFFF", 2) + circ(60, 46, 5, "#FFFFFF", 2) + circ(41, 47, 2, INK, 0) + circ(61, 47, 2, INK, 0);
  I.crab = pth("M28 66 L12 80 M36 72 L24 90 M72 66 L88 80 M64 72 L76 90", "none", { w: 4 }) + pth("M30 52 C14 50 10 28 24 24 C30 30 30 40 36 46 M70 52 C86 50 90 28 76 24 C70 30 70 40 64 46", "#E05A5A", { w: 3 }) +
    ell(50, 62, 26, 18, "#E05A5A") + pth("M42 46 V38 M58 46 V38", "none", { w: 3 }) + circ(42, 36, 4.5, "#FFFFFF", 2) + circ(58, 36, 4.5, "#FFFFFF", 2) + circ(42, 36, 1.8, INK, 0) + circ(58, 36, 1.8, INK, 0) + pth("M42 64 Q50 70 58 64", "none", { w: 2.5 });
  I.penguin = ell(50, 56, 28, 34, "#2F3A4A") + ell(50, 62, 18, 26, "#FFFFFF", 0) + circ(42, 38, 5, "#FFFFFF", 0) + circ(58, 38, 5, "#FFFFFF", 0) + circ(43, 39, 2.2, INK, 0) + circ(57, 39, 2.2, INK, 0) + poly([[44, 46], [56, 46], [50, 54]], "#F08A4B", 2) +
    ell(20, 60, 7, 18, "#2F3A4A", 2.5, ' transform="rotate(14 20 60)"') + ell(80, 60, 7, 18, "#2F3A4A", 2.5, ' transform="rotate(-14 80 60)"') + ell(38, 92, 9, 4, "#F08A4B", 2.5) + ell(62, 92, 9, 4, "#F08A4B", 2.5);
  I.owl = poly([[26, 30], [24, 10], [42, 22]], "#8A5A3C") + poly([[74, 30], [76, 10], [58, 22]], "#8A5A3C") + ell(50, 54, 30, 36, "#A9744F") + ell(50, 66, 18, 22, "#F3E4BD", 0) + circ(38, 44, 12, "#FFFFFF", 2.5) + circ(62, 44, 12, "#FFFFFF", 2.5) +
    circ(38, 44, 5.5, INK, 0) + circ(62, 44, 5.5, INK, 0) + poly([[45, 52], [55, 52], [50, 62]], "#F6C343", 2) + pth("M40 72 Q44 76 48 72 M52 72 Q56 76 60 72 M42 82 Q46 86 50 82 M50 82 Q54 86 58 82", "none", { w: 2, stroke: "#A9744F" });
  I.giraffe = ln(36, 6, 38, 20, INK, 3) + ln(54, 6, 52, 20, INK, 3) + circ(36, 6, 3.5, "#8A5A3C", 0) + circ(54, 6, 3.5, "#8A5A3C", 0) +
    pth("M34 20 C34 40 30 62 26 94 H66 C64 62 62 44 62 28 C66 20 56 14 46 16 C40 16 36 18 34 20 Z", "#F6C343") + ell(68, 26, 8, 5, "#F6C343", 2.5, ' transform="rotate(20 68 26)"') + ell(34, 24, 8, 5, "#F6C343", 2.5, ' transform="rotate(-20 34 24)"') +
    circ(44, 24, 2.4, INK, 0) + circ(56, 24, 2.4, INK, 0) + ell(50, 32, 9, 6, "#E8C79A", 2) + circ(38, 52, 4, "#A9744F", 0) + circ(52, 60, 4.5, "#A9744F", 0) + circ(40, 74, 4.5, "#A9744F", 0) + circ(54, 84, 4, "#A9744F", 0);
  I.deer = pth("M32 34 L20 18 M26 26 L14 22 M26 26 L24 10 M68 34 L80 18 M74 26 L86 22 M74 26 L76 10", "none", { stroke: "#8A5A3C", w: 4 }) + ell(26, 42, 12, 7, "#C98A4F", 2.5, ' transform="rotate(-25 26 42)"') + ell(74, 42, 12, 7, "#C98A4F", 2.5, ' transform="rotate(25 74 42)"') +
    pth("M30 38 C34 30 66 30 70 38 C70 56 60 70 54 84 H46 C40 70 30 56 30 38 Z", "#C98A4F") + circ(42, 46, 3, INK, 0) + circ(58, 46, 3, INK, 0) + ell(50, 80, 8, 6, INK, 0);
  I.mouse = circ(24, 30, 15, "#B8BEC4") + circ(76, 30, 15, "#B8BEC4") + circ(24, 30, 8, "#F7C6C6", 0) + circ(76, 30, 8, "#F7C6C6", 0) + pth("M50 22 C74 22 82 48 70 70 C64 80 56 84 50 84 C44 84 36 80 30 70 C18 48 26 22 50 22 Z", "#C9CED3") +
    circ(40, 50, 3, INK, 0) + circ(60, 50, 3, INK, 0) + circ(50, 68, 4.5, "#E8788A", 0) + ln(10, 62, 32, 64, INK, 2) + ln(10, 72, 32, 68, INK, 2) + ln(90, 62, 68, 64, INK, 2) + ln(90, 72, 68, 68, INK, 2);
  I.squirrel = pth("M60 84 C92 84 96 38 74 20 C60 12 54 28 64 38 C70 46 66 60 56 64", "#C9772E") + pth("M60 84 C40 84 34 64 40 50 C42 40 52 36 58 42 C64 50 66 70 60 84 Z", "#A9744F") + circ(48, 38, 12, "#A9744F") +
    circ(40, 28, 5, "#A9744F") + circ(46, 36, 2.4, INK, 0) + circ(37, 41, 2, INK, 0) + circ(34, 52, 6, "#8A5A3C", 2.5);
  I.snail = pth("M10 78 C10 70 20 68 30 70 H80 C88 70 90 78 84 80 C70 84 24 86 10 78 Z", "#C9D88F") + pth("M80 72 L86 52 M88 74 L94 56", "none", { w: 3 }) + circ(86, 51, 3, "#C9D88F", 2) + circ(94, 55, 3, "#C9D88F", 2) +
    circ(50, 50, 24, "#D9A06F") + pth("M50 50 m0 -2 a4 4 0 1 1 -4 4 a9 9 0 1 1 9 9 a15 15 0 1 1 -15 -15", "none", { w: 2.8, stroke: "#8A5A3C" });
  I.jellyfish = pth("M34 54 C32 68 36 76 32 90 M46 56 C44 70 48 80 44 94 M58 56 C60 70 56 80 60 94 M70 54 C68 68 72 76 68 90", "none", { stroke: "#E39BD6", w: 4 }) + pth("M16 56 C14 18 86 18 84 56 C70 50 64 60 50 56 C36 60 30 50 16 56 Z", "#F2B8E8") + circ(38, 38, 4, "#FFFFFF", 0, "") + circ(60, 34, 3, "#FFFFFF", 0);
  I.dolphin = pth("M4 56 L22 52 C30 30 64 22 82 38 C88 44 92 40 98 30 C100 50 92 66 74 66 C58 82 30 82 22 66 Z", "#8EB4D4") + pth("M24 66 C40 76 62 74 72 64 C62 70 40 70 24 66 Z", "#EAF3FA", { w: 0 }) + poly([[46, 30], [56, 10], [64, 32]], "#8EB4D4") + circ(34, 52, 2.6, INK, 0);
  // ---------- pack 2: everyday objects, school, home ----------
  I.key = circ(30, 50, 18, "#F6C343") + circ(30, 50, 7, "#FFFFFF") + rct(46, 46, 44, 9, "#F6C343", 3) + rct(70, 54, 7, 12, "#F6C343", 2) + rct(82, 54, 7, 16, "#F6C343", 2);
  I.lock = pth("M30 46 V32 C30 12 70 12 70 32 V46", "none", { w: 8 }) + pth("M30 46 V32 C30 12 70 12 70 32 V46", "none", { stroke: "#B8BEC4", w: 3.5 }) + rct(20, 44, 60, 44, "#F6C343", 6) + circ(50, 62, 6, INK, 0) + rct(47, 62, 6, 14, INK, 2, 0);
  I.umbrella = pth("M8 52 C8 20 92 20 92 52 C84 44 76 44 70 52 C64 44 56 44 50 52 C44 44 36 44 30 52 C24 44 16 44 8 52 Z", "#D9674B") + pth("M50 52 V84 C50 92 38 92 38 84", "none", { w: 6 }) + pth("M50 52 V30 M28 38 L36 50 M72 38 L64 50", "none", { stroke: "#FFFFFF", w: 2.5, op: 0.8 });
  I.scissors = ln(26, 20, 66, 66, "#B8BEC4", 7) + ln(74, 20, 34, 66, "#B8BEC4", 7) + circ(26, 76, 11, "none", 4.5) + circ(74, 76, 11, "none", 4.5) + circ(26, 76, 9, "#D9674B", 0) + circ(74, 76, 9, "#D9674B", 0) + circ(26, 76, 4.5, "#FFFFFF", 0) + circ(74, 76, 4.5, "#FFFFFF", 0) + circ(50, 54, 3, INK, 0);
  I.hammer = rct(44, 32, 12, 58, "#A9744F", 3) + rct(14, 14, 62, 22, "#8E9AA6", 4) + poly([[76, 14], [92, 18], [92, 34], [76, 36]], "#B8BEC4");
  I.wrench = pth("M70 14 C58 12 48 22 52 34 L16 70 C10 76 18 90 28 84 L64 50 C76 54 88 44 86 32 L76 40 L66 34 L64 24 L74 16 Z", "#B8BEC4") + circ(24, 78, 3, INK, 0);
  I.ladder = ln(30, 8, 22, 94, "#A9744F", 7) + ln(70, 8, 78, 94, "#A9744F", 7) + [22, 40, 58, 76].map(function(y){ var o = 8 * (y - 8) / 86; return ln(30 - o, y, 70 + o, y, "#8A5A3C", 5); }).join("");
  I.bucket = pth("M24 42 C24 2 76 2 76 42", "none", { w: 4 }) + pth("M18 38 H82 L74 92 H26 Z", "#5F9BC7") + ell(50, 38, 32, 7, "#A9CCE6", 3) + ln(30, 52, 34, 80, "#FFFFFF", 3, { op: 0.6 });
  I.lamp = pth("M30 8 H70 L84 46 H16 Z", "#F6C343") + ln(50, 46, 50, 80, INK, 4) + ell(50, 88, 22, 6, "#8A5A3C", 3) + circ(50, 44, 3, "#FFFFFF", 0, "");
  I.candle = rct(36, 40, 28, 50, "#FFFFFF", 4) + pth("M36 52 C42 60 48 50 54 58 C58 62 62 54 64 56 V44 H36 Z", "#F3E4BD", { w: 0 }) + ln(50, 40, 50, 30, INK, 3) + pth("M50 10 C60 22 58 30 50 30 C42 30 40 22 50 10 Z", "#F6C343") + pth("M50 20 C54 26 54 28 50 28 C46 28 46 26 50 20 Z", "#F08A4B", { w: 0 });
  I.door = rct(24, 8, 52, 84, "#A9744F", 4) + rct(32, 16, 16, 28, "#8A5A3C", 2, 2) + rct(52, 16, 16, 28, "#8A5A3C", 2, 2) + rct(32, 50, 16, 34, "#8A5A3C", 2, 2) + rct(52, 50, 16, 34, "#8A5A3C", 2, 2) + circ(64, 52, 4, "#F6C343");
  I.window = rct(14, 14, 72, 72, "#BFE3F5", 4, 4) + ln(50, 14, 50, 86, INK, 4) + ln(14, 50, 86, 50, INK, 4) + pth("M22 30 L34 22 M22 44 L40 26", "none", { stroke: "#FFFFFF", w: 3 }) + rct(8, 84, 84, 8, "#A9744F", 2);
  I.chair = pth("M30 10 H66 L70 52 H30 Z", "#C98A4F") + rct(24, 50, 52, 12, "#A9744F", 3) + ln(30, 62, 26, 92, INK, 5) + ln(70, 62, 74, 92, INK, 5) + ln(30, 62, 26, 92, "#8A5A3C", 2.5) + ln(70, 62, 74, 92, "#8A5A3C", 2.5);
  I.table = rct(10, 30, 80, 12, "#C98A4F", 3) + ln(20, 42, 16, 90, INK, 6) + ln(80, 42, 84, 90, INK, 6) + ln(20, 42, 16, 90, "#A9744F", 3) + ln(80, 42, 84, 90, "#A9744F", 3);
  I.cup = pth("M72 34 C92 32 92 62 70 62", "none", { w: 8 }) + pth("M72 34 C92 32 92 62 70 62", "none", { stroke: "#FFFFFF", w: 3 }) + pth("M18 28 H74 L68 82 C67 88 62 90 58 90 H34 C30 90 25 88 24 82 Z", "#FFFFFF") + ell(46, 28, 28, 5, "#8A5A3C", 3) + pth("M36 10 C32 14 40 16 36 20 M50 8 C46 12 54 14 50 18", "none", { stroke: "#B8BEC4", w: 2.5 });
  I.bottle = rct(40, 6, 20, 10, "#5F9BC7", 2) + pth("M42 16 H58 V28 C70 34 72 44 72 52 V86 C72 92 68 94 64 94 H36 C32 94 28 92 28 86 V52 C28 44 30 34 42 28 Z", "#D6ECF8") + pth("M30 56 H70 V86 C70 90 66 92 64 92 H36 C34 92 30 90 30 86 Z", "#6FB3E0", { w: 0 }) + ln(38, 40, 38, 64, "#FFFFFF", 3);
  I.bowl = pth("M10 44 H90 C90 70 72 88 50 88 C28 88 10 70 10 44 Z", "#F08A4B") + ell(50, 44, 40, 8, "#F6C343", 3) + pth("M24 56 C30 66 40 72 50 72", "none", { stroke: "#FFFFFF", w: 3, op: 0.8 });
  I.fork = [30, 50, 70].map(function(x){ return ln(x, 8, x, 36, INK, 10); }).join("") + pth("M30 34 C30 52 70 52 70 34", "none", { w: 10 }) + ln(50, 48, 50, 92, INK, 12) + [30, 50, 70].map(function(x){ return ln(x, 8, x, 36, "#C9CED3", 5); }).join("") + pth("M30 34 C30 52 70 52 70 34", "none", { stroke: "#C9CED3", w: 5 }) + ln(50, 48, 50, 92, "#C9CED3", 6);
  I.shoe = pth("M10 66 C10 54 18 52 24 50 L26 30 C26 24 34 22 38 28 C44 40 56 48 70 52 C86 54 92 62 92 72 V78 H10 Z", "#5F9BC7") + rct(10, 74, 82, 10, "#FFFFFF", 4) + pth("M30 52 L36 44 M40 56 L46 48 M50 58 L56 50", "none", { stroke: "#FFFFFF", w: 3 });
  I.shirt = pth("M34 12 C40 22 60 22 66 12 L92 26 L82 48 L72 42 V90 H28 V42 L18 48 L8 26 Z", "#5F9BC7") + pth("M34 12 C40 22 60 22 66 12", "none", { stroke: "#FFFFFF", w: 3 });
  I.hat = ell(50, 64, 42, 10, "#A9744F", 3) + pth("M22 64 C22 20 78 20 78 64 Z", "#C98A4F") + rct(22, 52, 56, 9, "#D9674B", 0, 2.5);
  I.glasses = circ(28, 54, 19, "#E4F2FB", 5) + circ(72, 54, 19, "#E4F2FB", 5) + pth("M47 52 C50 46 50 46 53 52", "none", { w: 4 }) + ln(9, 50, 2, 40, INK, 4) + ln(91, 50, 98, 40, INK, 4) + pth("M18 48 L28 40 M62 48 L72 40", "none", { stroke: "#FFFFFF", w: 3 });
  I.backpack = pth("M32 22 C32 8 68 8 68 22", "none", { w: 5 }) + rct(20, 20, 60, 70, "#D9674B", 14) + rct(30, 54, 40, 26, "#B24B34", 6) + ln(30, 54, 70, 54, INK, 3) + rct(42, 62, 16, 6, "#F6C343", 2, 2) + ln(50, 20, 50, 44, INK, 0);
  I.balloon = pth("M50 8 C80 8 84 44 66 62 L50 68 L34 62 C16 44 20 8 50 8 Z", "#E05A5A") + poly([[44, 70], [56, 70], [50, 64]], "#B24B34") + pth("M50 70 C42 78 58 84 50 94", "none", { w: 2.5 }) + pth("M34 24 C36 18 42 14 46 14", "none", { stroke: "#FFFFFF", w: 3.5, op: 0.8 });
  I.gift = rct(14, 40, 72, 50, "#5F9BC7", 3) + rct(10, 28, 80, 16, "#7DB3DA", 3) + rct(44, 28, 12, 62, "#F6C343", 0) + pth("M50 28 C36 8 22 14 34 26 Z M50 28 C64 8 78 14 66 26 Z", "#F6C343", { w: 3 });
  I.kite = poly([[50, 6], [82, 40], [50, 72], [18, 40]], "#F6C343") + ln(50, 6, 50, 72, INK, 2.5) + ln(18, 40, 82, 40, INK, 2.5) + pth("M50 72 C40 78 60 84 50 90 C42 94 56 98 50 98", "none", { w: 2.5 }) + poly([[44, 80], [34, 78], [38, 86]], "#D9674B", 2) + poly([[56, 88], [66, 86], [62, 94]], "#5F9BC7", 2);
  I.bicycle = circ(24, 66, 18, "none", 5) + circ(76, 66, 18, "none", 5) + pth("M24 66 L40 38 H62 L76 66 M40 38 L50 66 H24 M62 38 L58 28 H68 M40 38 L36 30 H46 M50 66 L62 38", "none", { w: 4, stroke: "#D9674B" }) + circ(50, 66, 4, INK, 0);
  I.bus = rct(8, 24, 84, 52, "#F6C343", 8) + [16, 36, 56].map(function(x){ return rct(x, 32, 16, 16, "#BFE3F5", 2, 2.5); }).join("") + rct(76, 32, 12, 24, "#BFE3F5", 2, 2.5) + ln(8, 58, 92, 58, INK, 3) + circ(28, 78, 9, "#3A322C") + circ(72, 78, 9, "#3A322C") + circ(28, 78, 3.5, "#B8BEC4", 0) + circ(72, 78, 3.5, "#B8BEC4", 0);
  I.helicopter = ln(12, 18, 76, 18, INK, 4) + ln(44, 18, 44, 28, INK, 4) + ell(44, 50, 30, 20, "#D9674B") + pth("M72 44 L94 36 L94 48 L72 58 Z", "#D9674B") + pth("M30 40 C34 32 48 32 54 40 V54 H30 Z", "#BFE3F5", { w: 2.5 }) + ln(22, 78, 70, 78, INK, 3.5) + ln(34, 70, 34, 78, INK, 3) + ln(58, 70, 58, 78, INK, 3);
  I.tractor = circ(70, 68, 20, "#3A322C") + circ(70, 68, 8, "#F6C343", 0) + circ(26, 76, 12, "#3A322C") + circ(26, 76, 5, "#F6C343", 0) + pth("M12 62 V40 H34 L42 22 H62 V44 H88 V56 H12 Z", "#6BBF8A") + rct(44, 26, 14, 16, "#BFE3F5", 2, 2.5) + rct(66, 24, 6, 20, INK, 1, 0);
  I.sailboat = poly([[50, 8], [50, 62], [18, 62]], "#FFFFFF") + poly([[54, 22], [54, 62], [84, 62]], "#F6C343") + ln(50, 8, 50, 70, INK, 3.5) + pth("M10 68 H90 L78 86 H22 Z", "#D9674B") + pth("M4 90 Q14 84 24 90 T44 90 T64 90 T84 90 T98 90", "none", { stroke: "#6FB3E0", w: 3.5 });
  I.anchor = circ(50, 18, 8, "none", 5) + ln(50, 26, 50, 84, INK, 6) + ln(32, 42, 68, 42, INK, 6) + pth("M14 62 C16 82 36 90 50 88 C64 90 84 82 86 62 M14 62 L8 72 M86 62 L92 72", "none", { w: 6 });
  I.lighthouse = poly([[34, 90], [40, 30], [60, 30], [66, 90]], "#FFFFFF") + poly([[37, 60], [63, 60], [65, 74], [35, 74]], "#D9674B", 0) + poly([[39, 40], [61, 40], [62, 50], [38, 50]], "#D9674B", 0) + rct(38, 20, 24, 12, "#F6C343", 2) + poly([[36, 20], [50, 6], [64, 20]], "#D9674B") + ln(24, 26, 8, 20, "#F6C343", 3.5) + ln(76, 26, 92, 20, "#F6C343", 3.5) + rct(26, 88, 48, 6, "#8A5A3C", 1);
  I.tent = poly([[50, 14], [92, 86], [8, 86]], "#F08A4B") + poly([[50, 14], [50, 86], [34, 86]], "#D9674B", 0) + poly([[50, 42], [64, 86], [38, 86]], "#3A322C") + ln(50, 14, 50, 6, INK, 3);
  I.campfire = pth("M16 84 L66 70 M84 84 L34 70", "none", { stroke: "#A9744F", w: 11 }) + pth("M16 84 L66 70 M84 84 L34 70", "none", { stroke: "#8A5A3C", w: 5 }) + pth("M50 12 C72 34 76 50 66 64 C60 72 40 72 34 64 C24 50 34 34 50 12 Z", "#F08A4B") + pth("M50 36 C60 48 62 56 54 64 C48 68 42 64 42 58 C42 52 46 48 50 36 Z", "#F6C343", { w: 0 });
  I.bell = pth("M50 10 C30 10 26 30 26 46 C26 60 14 66 14 72 H86 C86 66 74 60 74 46 C74 30 70 10 50 10 Z", "#F6C343") + circ(50, 82, 7, "#E9A23B") + circ(50, 9, 4, "#E9A23B");
  I.camera = rct(8, 28, 84, 56, "#5A6572", 8) + pth("M30 28 L36 16 H64 L70 28", "#5A6572", { w: 3 }) + circ(50, 56, 20, "#B8BEC4") + circ(50, 56, 13, "#5F9BC7") + circ(45, 51, 4, "#FFFFFF", 0) + circ(80, 40, 4, "#F6C343", 0);
  I.headphones = pth("M16 60 V50 C16 14 84 14 84 50 V60", "none", { w: 7 }) + rct(10, 54, 20, 32, "#D9674B", 8) + rct(70, 54, 20, 32, "#D9674B", 8);
  I.guitar = pth("M26 62 C16 58 12 70 18 80 C24 92 40 92 48 84 C54 78 52 70 58 66 C54 62 46 66 42 62 C38 58 40 50 34 56 C30 60 30 62 26 62 Z", "#D98A4F") + circ(34, 74, 6, "#3A322C") + ln(46, 62, 84, 22, "#8A5A3C", 7) + rct(80, 8, 14, 18, "#3A322C", 3, 0) + ln(34, 74, 82, 24, "#FFFFFF", 1.5);
  I.piano = rct(8, 24, 84, 56, "#FFFFFF", 4, 3.5) + [22, 36, 50, 64, 78].map(function(x){ return ln(x, 52, x, 80, INK, 2.5); }).join("") + [18, 32, 56, 70].map(function(x){ return rct(x, 24, 9, 32, INK, 1, 0); }).join("");
  I.drum = pth("M10 38 V70 C10 82 90 82 90 70 V38", "#D9674B") + ell(50, 38, 40, 12, "#F3E4BD", 3) + ln(10, 40, 50, 74, "#F6C343", 3) + ln(90, 40, 50, 74, "#F6C343", 3) + ln(26, 20, 56, 38, "#C98A4F", 5) + ln(74, 20, 44, 38, "#C98A4F", 5);
  I.trumpet = pth("M4 52 H66", "none", { w: 14 }) + pth("M4 52 H66", "none", { stroke: "#F6C343", w: 8 }) + pth("M60 42 L94 22 C98 40 98 64 94 82 L60 62 Z", "#F6C343") + ell(94, 52, 5, 30, "#E9A23B", 3) + [22, 34, 46].map(function(x){ return ln(x, 52, x, 32, INK, 4) + circ(x, 30, 4, "#E9A23B"); }).join("") + circ(8, 52, 5, "#E9A23B");
  I.violin = pth("M50 40 C34 36 30 52 38 58 C26 66 30 88 50 90 C70 88 74 66 62 58 C70 52 66 36 50 40 Z", "#C9772E") + ln(50, 8, 50, 74, INK, 4) + rct(44, 4, 12, 12, "#3A322C", 3, 0) + ln(78, 14, 30, 90, "#8A5A3C", 3) + pth("M44 62 V74 M56 62 V74", "none", { w: 2, stroke: "#3A322C" });
  I.paintbrush = ln(80, 12, 38, 64, "#A9744F", 9) + pth("M38 58 L46 66 C42 84 26 92 10 88 C20 80 22 66 38 58 Z", "#5F9BC7") + ln(76, 16, 68, 26, "#F6C343", 6, {});
  I.parachute = pth("M8 44 C8 6 92 6 92 44 C86 38 78 38 72 44 C66 38 58 38 50 44 C42 38 34 38 28 44 C22 38 14 38 8 44 Z", "#D9674B") + pth("M30 14 C26 24 28 38 30 42 M50 8 V42 M70 14 C74 24 72 38 70 42", "none", { stroke: "#FFFFFF", w: 2.5, op: 0.7 }) + pth("M10 44 L46 78 M90 44 L54 78 M50 44 L50 76", "none", { w: 2 }) + rct(42, 76, 16, 14, "#8A5A3C", 3);
  I.hourglass = rct(18, 8, 64, 8, "#A9744F", 2) + rct(18, 84, 64, 8, "#A9744F", 2) + pth("M24 16 H76 C76 40 58 46 58 50 C58 54 76 60 76 84 H24 C24 60 42 54 42 50 C42 46 24 40 24 16 Z", "#E4F2FB") + poly([[34, 80], [66, 80], [58, 66], [42, 66]], "#F6C343", 0) + poly([[42, 24], [58, 24], [52, 36], [48, 36]], "#F6C343", 0) + ln(50, 40, 50, 66, "#F6C343", 2.5);
  I.eraser = poly([[16, 56], [50, 22], [88, 42], [58, 80]], "#F7C6C6") + poly([[16, 56], [24, 66], [58, 80], [58, 72], [26, 56]], "#E8788A", 0) + pth("M28 54 L44 40 L74 56 L56 72 Z", "#F5A9B8", { w: 0 });
  I.graduation = poly([[50, 18], [94, 38], [50, 58], [6, 38]], "#3A322C") + pth("M26 48 V68 C34 78 66 78 74 68 V48 L50 60 Z", "#4A4038") + ln(88, 40, 88, 66, "#F6C343", 3) + circ(88, 68, 4, "#F6C343");
  I.notebook = rct(18, 8, 66, 84, "#5F9BC7", 6) + [20, 34, 48, 62, 76].map(function(y){ return rct(12, y, 14, 6, "#FFFFFF", 3, 2.5); }).join("") + rct(34, 22, 40, 20, "#FFFFFF", 3, 2.5) + ln(38, 56, 74, 56, "#FFFFFF", 3) + ln(38, 68, 66, 68, "#FFFFFF", 3);
  I.clipboard = rct(18, 14, 64, 78, "#C98A4F", 6) + rct(26, 24, 48, 62, "#FFFFFF", 3, 2.5) + rct(36, 6, 28, 14, "#B8BEC4", 4) + [38, 52, 66].map(function(y){ return pth("M32 " + y + " L36 " + (y + 4) + " L42 " + (y - 4), "none", { stroke: "#4F9D78", w: 3 }) + ln(48, y, 68, y, INK, 2.5); }).join("");
  I.school = rct(14, 36, 72, 54, "#D9674B", 2) + poly([[8, 38], [50, 12], [92, 38]], "#B24B34") + rct(40, 60, 20, 30, "#F3E4BD", 2) + [20, 68].map(function(x){ return rct(x, 48, 12, 12, "#BFE3F5", 1, 2.5); }).join("") + ln(50, 12, 50, 2, INK, 3) + poly([[50, 2], [64, 6], [50, 10]], "#F6C343", 2);
  I.treasure = rct(10, 44, 80, 46, "#A9744F", 4) + pth("M10 48 C10 18 90 18 90 48 Z", "#C98A4F") + ln(10, 50, 90, 50, INK, 3.5) + rct(42, 44, 16, 18, "#F6C343", 3) + circ(50, 54, 3, INK, 0) + circ(30, 30, 5, "#F6C343", 2) + circ(70, 28, 5, "#F6C343", 2);
  I.stamp = rct(30, 52, 40, 22, "#8A5A3C", 4) + rct(22, 72, 56, 10, "#C98A4F", 3) + pth("M44 52 V36 C44 28 36 26 36 18 C36 10 64 10 64 18 C64 26 56 28 56 36 V52 Z", "#D9674B");
  I.mailbox = rct(14, 22, 66, 40, "#5F9BC7", 14) + rct(66, 24, 14, 36, "#3F7FB0", 0, 0) + ln(46, 62, 46, 94, INK, 6) + rct(46, 12, 6, 20, "#D9674B", 1) + poly([[52, 12], [66, 16], [52, 20]], "#D9674B", 2) + ln(24, 42, 52, 42, "#FFFFFF", 3);
  I.microphone = rct(36, 8, 28, 46, "#8E9AA6", 14) + [18, 26, 34, 42].map(function(y){ return ln(36, y, 64, y, "#5A6572", 2); }).join("") + pth("M24 42 C24 70 76 70 76 42", "none", { w: 4.5 }) + ln(50, 66, 50, 84, INK, 4.5) + ln(34, 86, 66, 86, INK, 5);
  I.flashlight = pth("M30 14 H62 L68 30 H24 Z", "#F6C343") + rct(28, 30, 36, 56, "#5A6572", 6) + rct(40, 42, 12, 8, "#D9674B", 2, 2.5) + ln(26, 12, 14, 6, "#F6C343", 3.5) + ln(46, 8, 46, 2, "#F6C343", 3.5) + ln(66, 12, 78, 6, "#F6C343", 3.5);
  I.toolbox = rct(10, 38, 80, 52, "#D9674B", 6) + pth("M34 38 V28 C34 24 38 22 42 22 H58 C62 22 66 24 66 28 V38", "none", { w: 5 }) + ln(10, 58, 90, 58, INK, 3.5) + rct(42, 52, 16, 12, "#F6C343", 3);
  // ---------- pack 2: science, earth, history ----------
  I.testtube = pth("M34 8 H66 M38 8 V70 C38 90 62 90 62 70 V8", "none", { w: 6 }) + pth("M38 46 H62 V70 C62 90 38 90 38 70 Z", "#6BBF8A", { w: 0 }) + pth("M38 8 V70 C38 90 62 90 62 70 V8", "none", { stroke: "#E4F2FB", w: 2, op: 0.9 }) + circ(46, 64, 3, "#FFFFFF", 0) + circ(55, 54, 2.5, "#FFFFFF", 0);
  I.petri = ell(50, 62, 40, 14, "#E4F2FB", 3) + pth("M10 46 V62 C10 78 90 78 90 62 V46", "#E4F2FB") + ell(50, 46, 40, 14, "#F1F8FC", 3) + circ(40, 46, 5, "#6BBF8A", 0) + circ(56, 44, 4, "#6BBF8A", 0) + circ(64, 50, 3, "#6BBF8A", 0) + circ(48, 52, 3, "#E9A23B", 0);
  I.solar = poly([[14, 84], [28, 28], [88, 28], [74, 84]], "#3F6FA8") + pth("M20 56 H82 M25 42 H85 M33 28 L22 84 M54 28 L48 84 M72 28 L62 84", "none", { stroke: "#BFE3F5", w: 2 }) + ln(44, 84, 44, 94, INK, 4) + ln(24, 94, 64, 94, INK, 4) + circ(86, 12, 8, "#F6C343");
  I.turbine = ln(50, 46, 50, 94, INK, 7) + ln(50, 46, 50, 94, "#FFFFFF", 3.5) + pth("M50 46 L44 6 L56 6 Z M50 46 L88 66 L84 76 Z M50 46 L12 66 L16 76 Z", "#FFFFFF", { w: 3 }) + circ(50, 46, 6, "#B8BEC4");
  I.dam = pth("M6 24 H94 V40 L78 90 H22 L6 40 Z", "#B8BEC4") + pth("M6 40 H94", "none", { w: 3 }) + pth("M24 56 H76 M30 72 H70", "none", { stroke: "#8E9AA6", w: 3 }) + rct(6, 14, 88, 10, "#8E9AA6", 2) + pth("M22 90 C30 80 34 94 42 84 C50 94 58 80 66 90 C70 84 74 92 78 90", "none", { stroke: "#6FB3E0", w: 4 });
  I.recycle = [0, 120, 240].map(function(rot){ return '<g transform="rotate(' + rot + ' 50 50)">' + pth("M30 30 C38 18 56 14 66 22", "none", { w: 11 }) + pth("M30 30 C38 18 56 14 66 22", "none", { stroke: "#4F9D78", w: 6 }) + poly([[60, 10], [78, 24], [58, 32]], "#4F9D78", 2.5) + '</g>'; }).join("");
    pth("M36 38 L50 14 L58 28", "none", { stroke: "#4F9D78", w: 9 }) + poly([[68, 32], [58, 18], [48, 34]], "#4F9D78", 0) + pth("M70 44 L82 70 L66 70", "none", { stroke: "#4F9D78", w: 9 }) + poly([[72, 78], [50, 78], [62, 62]], "#4F9D78", 0) + pth("M54 76 H30 L22 56", "none", { stroke: "#4F9D78", w: 9 }) + poly([[10, 56], [34, 56], [22, 74]], "#4F9D78", 0);
  I.trash = pth("M22 26 H78 L72 92 H28 Z", "#8E9AA6") + rct(16, 18, 68, 8, "#B8BEC4", 3) + rct(40, 10, 20, 8, "#B8BEC4", 3) + ln(40, 36, 42, 82, "#5A6572", 3.5) + ln(50, 36, 50, 82, "#5A6572", 3.5) + ln(60, 36, 58, 82, "#5A6572", 3.5);
  I.pendulum = ln(50, 6, 50, 16, INK, 3) + ln(50, 16, 72, 66, INK, 2.5) + circ(72, 70, 12, "#F6C343") + pth("M20 84 C36 92 64 92 80 84", "none", { stroke: INK, w: 2, dash: "3 4" }) + ln(26, 6, 74, 6, INK, 5);
  I.lens = circ(44, 44, 30, "#DFF0FA", 5) + pth("M26 34 C30 26 38 22 46 22", "none", { stroke: "#FFFFFF", w: 4 }) + ln(66, 66, 90, 90, "#8A5A3C", 10);
  I.earthlayers = circ(50, 50, 42, "#B8774B") + circ(50, 50, 34, "#E05A5A", 2.5) + circ(50, 50, 22, "#F08A4B", 2.5) + circ(50, 50, 10, "#F6C343", 2.5);
  I.skeleton = (function(){ function bone(a, b, c, d, w){ return ln(a, b, c, d, INK, w + 4) ; } function bonew(a, b, c, d, w){ return ln(a, b, c, d, "#F4F1E8", w); } var B = [[50, 24, 50, 62, 7], [36, 32, 64, 32, 5], [38, 42, 62, 42, 5], [40, 52, 60, 52, 5], [50, 62, 36, 92, 6], [50, 62, 64, 92, 6], [36, 30, 20, 54, 5], [64, 30, 80, 54, 5]]; return B.map(function(b){ return bone.apply(null, b); }).join("") + B.map(function(b){ return bonew.apply(null, b); }).join("") + circ(50, 14, 11, "#F4F1E8") + circ(46, 13, 2.4, INK, 0) + circ(54, 13, 2.4, INK, 0) + rct(38, 60, 24, 9, "#F4F1E8", 3); })();
  I.skull = pth("M18 46 C18 10 82 10 82 46 C82 58 74 62 72 70 V82 H28 V70 C26 62 18 58 18 46 Z", "#F4F1E8") + circ(36, 46, 9, INK, 0) + circ(64, 46, 9, INK, 0) + poly([[46, 62], [54, 62], [50, 54]], INK, 0) + ln(38, 82, 38, 70, INK, 2.5) + ln(50, 82, 50, 70, INK, 2.5) + ln(62, 82, 62, 70, INK, 2.5);
  I.syringe = '<g transform="rotate(-40 50 50)">' + ln(4, 50, 22, 50, INK, 4) + rct(22, 38, 46, 24, "#E4F2FB", 4, 3.5) + rct(26, 42, 18, 16, "#6BBF8A", 0, 0) + ln(52, 38, 52, 62, INK, 2) + ln(60, 38, 60, 62, INK, 2) + ln(68, 50, 84, 50, INK, 5) + rct(82, 38, 8, 24, "#B8BEC4", 2) + '</g>';
  I.stethoscope = pth("M28 8 V34 C28 52 54 52 54 34 V8 M41 50 V66 C41 80 76 80 76 66", "none", { w: 5 }) + circ(76, 60, 10, "#B8BEC4") + circ(76, 60, 4, "#5A6572", 0) + circ(28, 8, 4, "#D9674B") + circ(54, 8, 4, "#D9674B");
  I.bandage = pth("M12 28 L72 8 L88 56 L28 76 Z", "#F3C9A0") + pth("M40 20 L56 52 L40 56 L28 24 Z", "#F5E3C8", { w: 2.5 }) + circ(44, 38, 1.5, "#C98A4F", 0) + circ(50, 42, 1.5, "#C98A4F", 0);
  I.kidneys = pth("M24 18 C6 28 6 62 24 82 C34 94 46 80 34 66 C30 58 34 48 42 44 C52 36 40 10 24 18 Z", "#C0504A") + pth("M76 18 C94 28 94 62 76 82 C66 94 54 80 66 66 C70 58 66 48 58 44 C48 36 60 10 76 18 Z", "#C0504A");
  I.footprint = ell(40, 62, 14, 22, "#8A5A3C", 2.5, ' transform="rotate(-10 40 62)"') + [[22, 34, 5], [32, 26, 5], [43, 24, 5], [54, 28, 5]].map(function(t){ return circ(t[0] + 6, t[1] + 4, t[2], "#8A5A3C", 2); }).join("") + ell(72, 80, 8, 12, "#8A5A3C", 2.5);
  I.waterfall = poly([[6, 6], [40, 6], [40, 40], [6, 56]], "#8A7A66") + poly([[60, 6], [94, 6], [94, 60], [60, 40]], "#8A7A66") + rct(40, 6, 20, 56, "#BFE3F5", 0, 2.5) + ln(46, 10, 46, 58, "#FFFFFF", 3) + ln(54, 14, 54, 58, "#FFFFFF", 3) + ell(50, 76, 36, 12, "#6FB3E0", 3) + pth("M30 74 Q40 70 50 74 T70 74", "none", { stroke: "#FFFFFF", w: 2.5 });
  I.lake = ell(50, 58, 42, 24, "#6FB3E0", 3) + pth("M22 58 Q32 52 42 58 T62 58", "none", { stroke: "#FFFFFF", w: 2.5 }) + pth("M30 70 Q40 64 50 70 T70 70", "none", { stroke: "#D6ECF8", w: 2.5 }) + pth("M4 40 l8 -14 l8 14 Z", "#4F9D78") + pth("M80 38 l8 -14 l8 14 Z", "#4F9D78");
  I.iceberg = pth("M4 56 H96", "none", { stroke: "#6FB3E0", w: 3 }) + poly([[26, 56], [36, 30], [46, 20], [56, 38], [66, 28], [76, 56]], "#FFFFFF") + poly([[24, 58], [76, 58], [64, 84], [44, 92], [32, 78]], "#B8DCEF") + rct(0, 56, 100, 44, "#8EC5E4", 0, 0) + poly([[26, 56], [36, 30], [46, 20], [56, 38], [66, 28], [76, 56]], "#FFFFFF") + poly([[28, 60], [72, 60], [62, 82], [44, 90], [34, 78]], "#B8DCEF", 2.5);
  I.igloo = pth("M8 80 C8 28 92 28 92 80 Z", "#FFFFFF") + pth("M8 80 H92", "none", { w: 3 }) + pth("M18 62 H82 M26 46 H74 M50 30 V46 M36 46 V62 M64 46 V62 M26 62 V80 M50 62 V80 M74 62 V80", "none", { stroke: "#B8DCEF", w: 2.5 }) + pth("M38 80 C38 64 62 64 62 80 Z", "#5A6572");
  I.cave = pth("M4 90 C4 30 24 10 50 10 C76 10 96 30 96 90 Z", "#8A7A66") + pth("M26 90 C26 56 36 44 50 44 C64 44 74 56 74 90 Z", "#3A322C") + poly([[34, 12], [38, 28], [42, 12]], "#A89A84", 2) + poly([[58, 12], [62, 24], [66, 12]], "#A89A84", 2) + poly([[40, 90], [46, 76], [52, 90]], "#6B5E4E", 2);
  I.canyon = poly([[2, 20], [40, 20], [30, 60], [42, 96], [2, 96]], "#D98A4F") + poly([[98, 20], [60, 20], [70, 60], [58, 96], [98, 96]], "#C97A3F") + pth("M10 44 H32 M10 66 H36 M90 44 H68 M90 70 H62", "none", { stroke: "#F3C48E", w: 2.5 }) + pth("M40 96 C46 72 38 60 44 20 H56 C60 60 54 72 58 96 Z", "#6FB3E0");
  I.sandy = pth("M2 78 C24 40 44 52 60 64 C74 74 88 60 98 52 V96 H2 Z", "#F3D796") + pth("M2 90 C26 76 50 92 98 84", "none", { stroke: "#E4BC6A", w: 3 }) + circ(78, 22, 12, "#F6C343");
  I.forest = [[22, 62], [50, 66], [78, 62]].map(function(p){ return ln(p[0], p[1], p[0], 90, "#8A5A3C", 7) + poly([[p[0], p[1] - 52], [p[0] + 20, p[1] - 8], [p[0] - 20, p[1] - 8]], "#4F9D78") + poly([[p[0], p[1] - 34], [p[0] + 24, p[1] + 6], [p[0] - 24, p[1] + 6]], "#6BBF8A"); }).join("");
  I.jungle = ln(30, 38, 30, 94, "#8A5A3C", 7) + pth("M30 38 C10 26 8 40 12 46 M30 38 C48 24 56 34 50 44 M30 38 C28 18 40 8 46 14", "none", { stroke: "#4F9D78", w: 12 }) + pth("M30 38 C10 26 8 40 12 46 M30 38 C48 24 56 34 50 44 M30 38 C28 18 40 8 46 14", "none", { stroke: "#6BBF8A", w: 7 }) + pth("M72 6 C70 30 80 44 72 62 C68 74 76 82 72 94", "none", { w: 6 }) + pth("M72 6 C70 30 80 44 72 62 C68 74 76 82 72 94", "none", { stroke: "#4F9D78", w: 3 }) + pth("M72 34 C86 30 92 38 86 46 M72 56 C58 54 54 62 62 68", "#6BBF8A", { w: 3 });
  I.statue = rct(30, 78, 40, 14, "#B8BEC4", 2) + pth("M38 78 V54 C38 40 62 40 62 54 V78 Z", "#9ACDB4") + circ(50, 30, 10, "#9ACDB4") + pth("M62 46 L76 20", "none", { stroke: "#9ACDB4", w: 7 }) + pth("M72 22 L82 10 L86 24 Z", "#F6C343", { w: 2.5 }) + pth("M42 22 L36 10 M50 20 V8 M58 22 L64 10", "none", { stroke: "#9ACDB4", w: 4 });
  I.torch = ln(50, 46, 50, 92, "#8A5A3C", 10) + pth("M50 8 C72 26 68 40 58 46 H42 C32 40 28 26 50 8 Z", "#F08A4B") + pth("M50 22 C60 32 58 40 54 44 H46 C42 40 40 32 50 22 Z", "#F6C343", { w: 0 }) + rct(36, 44, 28, 8, "#5A6572", 2);
  I.amphora = pth("M36 10 H64 C62 22 74 32 76 56 C78 80 64 92 50 92 C36 92 22 80 24 56 C26 32 38 22 36 10 Z", "#D98A4F") + pth("M36 14 C14 18 14 46 30 44 M64 14 C86 18 86 46 70 44", "none", { w: 4 }) + pth("M28 40 H72 M26 66 H74", "none", { stroke: "#3A322C", w: 3 }) + pth("M34 52 L42 56 L50 52 L58 56 L66 52", "none", { stroke: "#3A322C", w: 2 });
  I.helmet = pth("M16 62 C16 24 84 24 84 62 V74 H16 Z", "#B8BEC4") + rct(10, 70, 80, 10, "#8E9AA6", 3) + pth("M50 26 C44 6 66 2 78 16 C68 12 60 22 50 26 Z", "#D9674B") + pth("M34 52 H66 V70 H34 Z", INK, { w: 0 }) + ln(50, 52, 50, 70, "#8E9AA6", 3) + pth("M24 78 L28 92 H40 L38 80 M76 78 L72 92 H60 L62 80", "#8E9AA6", { w: 3 });
  I.cannon = pth("M14 38 L74 52 L70 70 L10 56 Z", "#5A6572") + circ(36, 74, 16, "#A9744F") + circ(36, 74, 5, "#3A322C", 0) + circ(82, 42, 6, INK, 0) + ln(80, 36, 92, 24, "#F6C343", 3) + ln(84, 40, 96, 38, "#F6C343", 3);
  I.bowarrow = pth("M24 12 C70 24 70 76 24 88", "none", { stroke: "#8A5A3C", w: 6 }) + ln(24, 12, 24, 88, INK, 2) + ln(14, 50, 92, 50, "#A9744F", 4) + poly([[92, 50], [78, 42], [78, 58]], "#8E9AA6") + poly([[14, 50], [6, 42], [20, 46]], "#D9674B", 2) + poly([[14, 50], [6, 58], [20, 54]], "#D9674B", 2);
  I.windmill = ln(50, 36, 50, 92, INK, 0) + poly([[34, 92], [42, 38], [58, 38], [66, 92]], "#F3E4BD") + poly([[40, 38], [50, 22], [60, 38]], "#8A5A3C") + pth("M50 38 L20 10 L28 6 L54 34 Z M50 38 L90 20 L92 28 L56 40 Z M50 38 L80 68 L74 74 L46 42 Z M50 38 L12 56 L10 48 L44 34 Z", "#FFFFFF", { w: 2.5 }) + circ(50, 38, 5, "#8A5A3C") + rct(44, 74, 12, 18, "#8A5A3C", 2);
  I.wagon = pth("M16 40 H84 L80 62 H20 Z", "#F3E4BD") + pth("M20 40 C20 14 80 14 80 40", "#FFFFFF") + circ(30, 74, 14, "none", 4.5) + circ(72, 74, 14, "none", 4.5) + circ(30, 74, 3, INK, 0) + circ(72, 74, 3, INK, 0) + ln(30, 60, 30, 88, INK, 2) + ln(16, 74, 44, 74, INK, 2) + ln(72, 60, 72, 88, INK, 2) + ln(58, 74, 86, 74, INK, 2);
  I.throne = rct(26, 8, 48, 50, "#D9674B", 6) + rct(20, 50, 60, 16, "#B24B34", 4) + rct(14, 40, 12, 40, "#F6C343", 3) + rct(74, 40, 12, 40, "#F6C343", 3) + rct(24, 66, 52, 26, "#F6C343", 3) + circ(50, 22, 5, "#F6C343", 2) + poly([[40, 8], [44, 0], [50, 6], [56, 0], [60, 8]], "#F6C343", 2);
  I.knight = pth("M26 50 C26 20 74 20 74 50 V76 C74 86 26 86 26 76 Z", "#B8BEC4") + rct(34, 42, 32, 10, INK, 2, 0) + ln(50, 52, 50, 70, "#8E9AA6", 3) + pth("M50 22 C62 6 74 8 80 16 C70 14 64 22 60 28 Z", "#D9674B", { w: 2.5 }) + ln(44, 62, 44, 70, "#8E9AA6", 2.5) + ln(56, 62, 56, 70, "#8E9AA6", 2.5);
  I.vikingship = pth("M6 56 C16 60 16 70 22 70 H78 C84 70 84 60 94 56 L90 52 C86 62 80 64 74 64 H26 C20 64 14 62 10 52 Z", "#A9744F") + pth("M6 56 C4 44 12 40 14 34 M94 56 C96 44 88 40 86 34", "none", { w: 5 }) + ln(50, 14, 50, 64, INK, 4) + poly([[50, 14], [80, 24], [76, 52], [50, 52]], "#D9674B") + pth("M60 18 V52 M70 22 V52", "none", { stroke: "#FFFFFF", w: 3, op: 0.8 }) + pth("M4 86 Q14 80 24 86 T44 86 T64 86 T84 86 T98 86", "none", { stroke: "#6FB3E0", w: 3.5 });
  I.printing = rct(14, 66, 72, 24, "#8A5A3C", 3) + rct(24, 44, 52, 22, "#B8BEC4", 3) + ln(50, 44, 50, 14, INK, 5) + rct(28, 8, 44, 8, "#8A5A3C", 3) + rct(30, 36, 40, 8, "#F4F1E8", 1, 2) + ln(30, 78, 70, 78, "#C98A4F", 3);
  I.telegraph = rct(14, 56, 72, 30, "#8A5A3C", 4) + ln(34, 56, 34, 34, INK, 4) + ln(34, 34, 60, 28, "#B8BEC4", 6) + circ(34, 34, 5, "#F6C343") + circ(30, 72, 4.5, "#F6C343") + circ(70, 72, 4.5, "#F6C343") + pth("M62 28 L86 20 M66 36 L92 32", "none", { stroke: INK, w: 2.5, dash: "3 4" });
  I.oilrig = poly([[50, 8], [72, 90], [28, 90]], "none", 4) + ln(36, 56, 64, 56, INK, 3) + ln(42, 32, 58, 32, INK, 3) + ln(30, 76, 70, 76, INK, 3) + ln(50, 8, 50, 90, INK, 2.5) + rct(10, 90, 80, 6, "#A9744F", 2) + circ(50, 8, 4, "#D9674B");
  I.liberty = rct(32, 82, 36, 12, "#B8BEC4", 2) + pth("M36 82 V56 C36 42 64 42 64 56 V82 Z", "#9ACDB4") + circ(50, 34, 10, "#9ACDB4") + poly([[38, 28], [30, 18], [42, 24]], "#9ACDB4", 2.5) + poly([[50, 22], [50, 10], [56, 22]], "#9ACDB4", 2.5) + poly([[62, 28], [70, 18], [58, 24]], "#9ACDB4", 2.5) + pth("M62 48 L74 18", "none", { stroke: "#9ACDB4", w: 7 }) + pth("M70 20 C70 10 80 6 78 18 Z", "#F6C343", { w: 2.5 });
  I.wheelbarrow = pth("M14 28 H62 L54 62 H28 Z", "#D9674B") + ln(54, 62, 90, 72, "#A9744F", 5) + circ(24, 72, 11, "#3A322C") + circ(24, 72, 3, "#B8BEC4", 0) + ln(34, 62, 30, 86, INK, 3) + ln(52, 62, 58, 86, INK, 3);
  // ---------- pack 2: food, maths, feelings, extras ----------
  I.bread = pth("M10 58 C6 36 24 22 50 22 C76 22 94 36 90 58 C90 70 84 80 76 80 H24 C16 80 10 70 10 58 Z", "#D9A06F") + pth("M30 38 L38 52 M48 34 L56 50 M66 38 L72 52", "none", { stroke: "#B8774B", w: 3.5 });
  I.cheese = pth("M8 58 L92 38 V76 H8 Z", "#F6C343") + pth("M8 58 L40 22 L92 38 Z", "#F9E07F") + circ(30, 66, 6, "#E9A23B", 2) + circ(58, 58, 5, "#E9A23B", 2) + circ(76, 66, 4, "#E9A23B", 2);
  I.milk = pth("M30 8 H70 V24 L78 38 V92 H22 V38 L30 24 Z", "#FFFFFF") + poly([[30, 8], [70, 8], [70, 24], [30, 24]], "#5F9BC7") + rct(32, 46, 36, 24, "#BFE3F5", 3, 2.5) + circ(50, 58, 6, "#FFFFFF", 0);
  I.banana = pth("M18 22 C20 64 54 90 90 74 C72 74 44 62 36 22 Z", "#F6C343") + pth("M18 22 L24 12 L38 20 L36 22", "#8A5A3C", { w: 2.5 });
  I.orange = circ(50, 54, 36, "#F08A4B") + pth("M50 18 C48 8 56 6 64 10 C58 14 54 16 50 18 Z", "#4F9D78", { w: 2.5 }) + pth("M30 40 C34 34 40 32 44 32", "none", { stroke: "#FAD1A6", w: 4 });
  I.grapes = [[34, 40], [54, 40], [74, 40], [44, 56], [64, 56], [54, 72]].map(function(p){ return circ(p[0], p[1], 11, "#8E5FB5"); }).join("") + pth("M50 22 C52 14 58 10 66 10", "none", { stroke: "#8A5A3C", w: 4 }) + pth("M56 14 C60 6 72 8 76 16 C70 20 62 20 56 14 Z", "#6BBF8A", { w: 2.5 });
  I.strawberry = pth("M50 92 C22 78 14 50 22 34 C30 24 70 24 78 34 C86 50 78 78 50 92 Z", "#E05A5A") + pth("M30 28 L40 40 L50 28 L60 40 L70 28 L62 20 L50 26 L38 20 Z", "#4F9D78", { w: 2.5 }) + [[38, 52], [52, 48], [62, 60], [44, 68], [54, 78], [32, 64]].map(function(p){ return ell(p[0], p[1], 1.8, 2.6, "#F9E07F", 0); }).join("");
  I.tomato = circ(50, 56, 34, "#E05A5A") + pth("M30 30 L42 36 L50 24 L58 36 L70 30 L62 42 L50 40 L38 42 Z", "#4F9D78", { w: 2.5 }) + pth("M34 48 C36 42 40 40 44 40", "none", { stroke: "#F5A9A9", w: 4 });
  I.corn = pth("M50 8 C72 18 76 56 62 82 C58 90 42 90 38 82 C24 56 28 18 50 8 Z", "#F6C343") + [[40, 30], [50, 26], [60, 30], [38, 44], [50, 42], [62, 44], [40, 58], [50, 58], [60, 58], [44, 72], [56, 72]].map(function(p){ return circ(p[0], p[1], 4, "#F9E07F", 1.5); }).join("") + pth("M50 94 C20 90 14 56 36 48 C30 66 38 80 50 94 Z M50 94 C80 90 86 56 64 48 C70 66 62 80 50 94 Z", "#6BBF8A", { w: 2.5 });
  I.ricebowl = pth("M10 52 H90 C90 76 72 90 50 90 C28 90 10 76 10 52 Z", "#5F9BC7") + pth("M14 52 C14 28 86 28 86 52 Z", "#FFFFFF") + [[34, 42], [46, 38], [58, 40], [68, 44], [40, 46], [54, 46]].map(function(p){ return ell(p[0], p[1], 3.5, 2, "#F4F1E8", 1.5); }).join("");
  I.cake = rct(14, 50, 72, 40, "#F5A9B8", 4) + pth("M14 50 C20 62 26 50 32 62 C38 50 46 62 50 50 C56 62 62 50 68 62 C74 50 80 62 86 50 V46 H14 Z", "#FFFFFF", { w: 3 }) + [28, 50, 72].map(function(x){ return rct(x - 3, 28, 6, 18, "#5F9BC7", 2, 2.5) + pth("M" + x + " 14 C" + (x + 6) + " 20 " + (x + 4) + " 26 " + x + " 26 C" + (x - 4) + " 26 " + (x - 6) + " 20 " + x + " 14 Z", "#F6C343", { w: 2 }); }).join("");
  I.cookie = circ(50, 50, 38, "#D9A06F") + [[36, 38], [60, 34], [64, 58], [40, 64], [50, 48]].map(function(p){ return circ(p[0], p[1], 5, "#5A3A24", 0); }).join("");
  I.soup = pth("M10 44 H90 C90 72 72 90 50 90 C28 90 10 72 10 44 Z", "#D9674B") + ell(50, 44, 40, 10, "#F08A4B", 3) + circ(38, 44, 4, "#F6C343", 0) + circ(54, 42, 3, "#6BBF8A", 0) + circ(64, 46, 3.5, "#F6C343", 0) + pth("M34 22 C28 28 40 30 34 36 M50 18 C44 24 56 26 50 32 M66 22 C60 28 72 30 66 36", "none", { stroke: "#B8BEC4", w: 2.5 });
  I.meat = pth("M20 34 C14 54 28 84 56 84 C80 84 90 64 82 44 C76 28 50 14 34 22 C28 24 22 28 20 34 Z", "#C0504A") + pth("M30 36 C36 30 50 30 56 38", "none", { stroke: "#F5A9A9", w: 3.5 }) + circ(64, 62, 9, "#F4F1E8", 3) + circ(64, 62, 3, "#E4D9C4", 0);
  I.plus = rct(40, 12, 20, 76, "#6BBF8A", 4) + rct(12, 40, 76, 20, "#6BBF8A", 4) + rct(40, 40, 20, 20, "#6BBF8A", 0, 0);
  I.minus = rct(12, 38, 76, 24, "#D9674B", 5);
  I.times = '<g transform="rotate(45 50 50)">' + rct(40, 10, 20, 80, "#5F9BC7", 4) + rct(10, 40, 80, 20, "#5F9BC7", 4) + rct(40, 40, 20, 20, "#5F9BC7", 0, 0) + '</g>';
  I.divide = rct(12, 40, 76, 20, "#F08A4B", 4) + circ(50, 18, 11, "#F08A4B") + circ(50, 82, 11, "#F08A4B");
  I.equals = rct(12, 24, 76, 20, "#8E5FB5", 5) + rct(12, 56, 76, 20, "#8E5FB5", 5);
  I.percent = circ(28, 28, 14, "#F6C343") + circ(72, 72, 14, "#F6C343") + ln(76, 16, 24, 84, INK, 9) + ln(76, 16, 24, 84, "#5F9BC7", 4.5);
  I.angle = pth("M14 84 H88", "none", { w: 5 }) + pth("M14 84 L70 22", "none", { w: 5 }) + pth("M44 84 A30 30 0 0 0 36 62", "none", { stroke: "#D9674B", w: 4 }) + circ(14, 84, 4, INK, 0);
  I.numberline = ln(8, 54, 92, 54, INK, 4) + [16, 34, 52, 70, 88].map(function(x){ return ln(x, 46, x, 62, INK, 3); }).join("") + poly([[92, 54], [82, 47], [82, 61]], INK, 0) + circ(52, 54, 7, "#D9674B") + pth("M34 40 C40 26 50 26 52 40", "none", { stroke: "#5F9BC7", w: 3.5 });
  I.hexagon = poly([[50, 10], [86, 30], [86, 70], [50, 90], [14, 70], [14, 30]], "#F6C343");
  I.pentagon = poly([[50, 10], [90, 40], [74, 88], [26, 88], [10, 40]], "#8E5FB5");
  I.diamond = poly([[50, 8], [86, 50], [50, 92], [14, 50]], "#E05A5A") + pth("M30 38 L40 30", "none", { stroke: "#FFFFFF", w: 3, op: 0.8 });
  I.oval = ell(50, 50, 40, 26, "#5F9BC7") + pth("M24 42 C28 36 34 34 40 34", "none", { stroke: "#FFFFFF", w: 3, op: 0.8 });
  I.cylinder = pth("M20 24 V74 C20 90 80 90 80 74 V24", "#5F9BC7") + ell(50, 24, 30, 11, "#7DB3DA", 3);
  I.cone = pth("M50 8 L84 76 C84 92 16 92 16 76 Z", "#F08A4B") + pth("M30 62 C36 66 64 66 70 62", "none", { stroke: "#FAD1A6", w: 3 });
  I.sphere = circ(50, 50, 38, "#8E5FB5") + pth("M26 38 C30 28 38 22 48 20", "none", { stroke: "#FFFFFF", w: 5, op: 0.7 });
  I.piechart = circ(50, 50, 38, "#5F9BC7") + pth("M50 50 L50 12 A38 38 0 0 1 88 50 Z", "#F6C343", { w: 3 }) + pth("M50 50 L88 50 A38 38 0 0 1 36 85 Z", "#D9674B", { w: 3 });
  I.happy = circ(50, 50, 40, "#F6C343") + circ(36, 40, 5, INK, 0) + circ(64, 40, 5, INK, 0) + pth("M28 58 C34 80 66 80 72 58 Z", "#FFFFFF", { w: 3 });
  I.sad = circ(50, 50, 40, "#F6C343") + circ(36, 42, 5, INK, 0) + circ(64, 42, 5, INK, 0) + pth("M32 72 C40 60 60 60 68 72", "none", { w: 4 }) + pth("M30 52 C28 60 34 62 32 68", "none", { stroke: "#6FB3E0", w: 4 });
  I.angry = circ(50, 50, 40, "#E57B5A") + pth("M26 34 L44 42 M74 34 L56 42", "none", { w: 4.5 }) + circ(38, 50, 4.5, INK, 0) + circ(62, 50, 4.5, INK, 0) + pth("M34 74 C42 64 58 64 66 74", "none", { w: 4.5 });
  I.surprised = circ(50, 50, 40, "#F6C343") + circ(36, 40, 6, "#FFFFFF", 2.5) + circ(64, 40, 6, "#FFFFFF", 2.5) + circ(36, 40, 2.6, INK, 0) + circ(64, 40, 2.6, INK, 0) + ell(50, 68, 8, 11, INK, 0);
  I.sleepy = circ(50, 50, 40, "#F6C343") + pth("M28 44 Q36 50 44 44 M56 44 Q64 50 72 44", "none", { w: 4 }) + ell(50, 70, 7, 5, INK, 0) + txt("z", 78, 24, 18, INK) + txt("z", 88, 12, 12, INK);
  I.idea2 = pth("M50 10 C28 10 20 32 30 46 C36 54 36 60 36 66 H64 C64 60 64 54 70 46 C80 32 72 10 50 10 Z", "#F6C343") + rct(38, 66, 24, 8, "#B8BEC4", 2) + rct(42, 74, 16, 6, "#8E9AA6", 2);
  I.thumbsup = pth("M14 46 H30 V88 H14 Z", "#5F9BC7") + pth("M30 50 L46 26 C48 14 62 16 60 30 L58 40 H82 C90 40 90 52 84 54 C88 58 86 66 80 68 C84 72 82 80 76 82 H34 C30 82 30 52 30 50 Z", "#F2C9A0");
  I.heartbeat = pth("M50 88 C14 60 6 36 22 22 C34 12 46 20 50 30 C54 20 66 12 78 22 C94 36 86 60 50 88 Z", "#F5A9A9") + pth("M10 52 H34 L42 34 L54 70 L62 48 H90", "none", { stroke: "#B03030", w: 4 });
  I.nose = pth("M46 8 C44 30 40 48 30 60 C20 70 34 84 50 80 C66 84 80 70 70 60 C60 48 56 30 54 8", "#F2C9A0") + circ(42, 74, 3.5, INK, 0) + circ(58, 74, 3.5, INK, 0);
  I.mouth = pth("M8 54 C26 30 74 30 92 54 C74 82 26 82 8 54 Z", "#E05A5A") + pth("M18 52 C40 44 60 44 82 52 C60 60 40 60 18 52 Z", "#FFFFFF", { w: 2.5 }) + pth("M34 64 C44 72 56 72 66 64", "none", { stroke: "#F5A9A9", w: 6 });
  I.sunrise = pth("M2 70 H98", "none", { w: 3 }) + circ(50, 70, 24, "#F6C343") + rct(0, 70, 100, 30, "#8EC5E4", 0, 0) + ln(2, 70, 98, 70, INK, 3) + [[50, 24], [20, 36], [80, 36], [10, 58], [90, 58]].map(function(p){ return ln(p[0], p[1], p[0] + (p[0] - 50) * 0.15, p[1] - 6 - (p[0] === 50 ? 4 : 0), "#E9A23B", 4); }).join("");
  I.stars = poly([[30, 16], [36, 32], [54, 34], [40, 44], [46, 62], [30, 52], [14, 62], [20, 44], [6, 34], [24, 32]], "#F6C343") + poly([[72, 44], [77, 58], [92, 60], [80, 68], [84, 84], [72, 76], [60, 84], [64, 68], [52, 60], [67, 58]], "#F6C343");
  I.newmoon = circ(50, 50, 38, "#3A322C") + pth("M50 12 A38 38 0 0 0 50 88", "none", { stroke: "#E8D9A0", w: 3.5, op: 0.8 });
  I.fullmoon = circ(50, 50, 38, "#F3E9B8") + circ(36, 38, 6, "#E4D794", 0) + circ(62, 60, 8, "#E4D794", 0) + circ(58, 32, 4, "#E4D794", 0);
  I.crescent = pth("M64 10 C34 12 18 40 28 66 C38 90 70 94 86 78 C56 78 46 44 64 10 Z", "#F3E9B8");
  I.nest = ell(50, 66, 38, 14, "#A9744F", 3) + pth("M14 62 C14 78 86 78 86 62 C86 70 14 70 14 62 Z", "#8A5A3C", { w: 2.5 }) + ell(36, 56, 9, 12, "#BFE3F5", 2.5) + ell(54, 54, 9, 12, "#BFE3F5", 2.5) + ell(70, 58, 8, 11, "#BFE3F5", 2.5) + pth("M16 66 L84 66", "none", { stroke: "#C98A4F", w: 3 });
  I.web = pth("M50 50 L50 6 M50 50 L88 28 M50 50 L88 72 M50 50 L50 94 M50 50 L12 72 M50 50 L12 28", "none", { stroke: "#8E9AA6", w: 2.5 }) + pth("M50 22 L70 38 L70 62 L50 78 L30 62 L30 38 Z M50 36 L60 44 L60 56 L50 64 L40 56 L40 44 Z M50 10 L82 30 L82 70 L50 90 L18 70 L18 30 Z", "none", { stroke: "#8E9AA6", w: 2.5 });
  I.crystal = poly([[50, 6], [76, 30], [66, 92], [34, 92], [24, 30]], "#9AD3E8") + pth("M24 30 H76 M50 6 L40 30 L34 92 M50 6 L60 30 L66 92", "none", { stroke: "#FFFFFF", w: 2.5, op: 0.8 });
  I.coral = pth("M50 94 V52 M50 70 C36 66 30 54 32 40 M50 58 C62 54 68 44 66 30 M50 82 C64 80 72 72 74 62 M50 66 C42 76 30 78 22 70", "none", { stroke: "#E39BD6", w: 8 }) + pth("M50 94 V52", "none", { stroke: "#E57B9A", w: 4 });

  // ---------- drawings, pack 3 (gaps found by testing common classroom words) ----------
  I.glue = poly([[42, 38], [58, 38], [54, 12], [46, 12]], "#F28C38") + rct(30, 38, 40, 52, "#FFFFFF", 8) + rct(30, 56, 40, 22, "#7BB662", 0, 2.5) + circ(50, 67, 5, "#FFFFFF", 0);
  I.playground = rct(8, 34, 28, 7, "#C98F5B", 2) + ln(12, 41, 12, 90, INK, 4) + ln(32, 41, 32, 90, INK, 4) + pth("M36 38 C60 42 74 62 90 84 L80 90 C66 72 54 56 36 50 Z", "#F6C343") + ln(14, 34, 14, 18, INK, 3) + ln(30, 34, 30, 18, INK, 3) + pth("M10 18 H34", "none", { w: 4 });
  I.locker = rct(12, 8, 34, 84, "#6FA8D6", 3) + rct(54, 8, 34, 84, "#6FA8D6", 3) + [20, 24, 28].map(function(y){ return ln(20, y, 38, y, INK, 2); }).join("") + [20, 24, 28].map(function(y){ return ln(62, y, 80, y, INK, 2); }).join("") + rct(36, 52, 6, 12, "#F5F1E6", 2, 2) + rct(58, 52, 6, 12, "#F5F1E6", 2, 2);
  I.stairs = poly([[8, 92], [92, 92], [92, 76], [76, 76], [76, 60], [60, 60], [60, 44], [44, 44], [44, 28], [28, 28], [28, 12], [8, 12]], "#D9C7A3") + pth("M8 92 V12 M28 28 H44 M44 44 H60 M60 60 H76 M76 76 H92", "none", { w: 3 });
  I.roof = rct(66, 10, 12, 28, "#A9744F", 0, 3) + poly([[6, 62], [50, 16], [94, 62]], "#C8553D") + pth("M20 62 L50 30 L80 62 M34 62 L50 46 L66 62", "none", { stroke: "#E58A74", w: 2.5 });
  I.fence = rct(4, 44, 92, 7, "#C98F5B", 1, 2.5) + rct(4, 68, 92, 7, "#C98F5B", 1, 2.5) + [8, 26, 44, 62, 80].map(function(x){ return poly([[x, 30], [x + 7, 18], [x + 14, 30], [x + 14, 90], [x, 90]], "#F3E6C8"); }).join("");
  I.pillow = pth("M12 28 C40 20 60 20 88 28 C94 46 94 54 88 72 C60 80 40 80 12 72 C6 54 6 46 12 28 Z", "#BFE3F5") + pth("M20 34 C40 28 60 28 80 34", "none", { stroke: "#8EC5E4", w: 2.5, dash: "4 4" }) + circ(14, 30, 2.5, INK, 0) + circ(86, 30, 2.5, INK, 0) + circ(14, 70, 2.5, INK, 0) + circ(86, 70, 2.5, INK, 0);
  I.blanket = rct(10, 28, 80, 46, "#E8A0A0", 6) + [30, 50, 70].map(function(x){ return ln(x, 30, x, 72, "#FFFFFF", 4, { op: 0.7 }); }).join("") + [42, 60].map(function(y){ return ln(12, y, 88, y, "#FFFFFF", 4, { op: 0.7 }); }).join("") + [18, 30, 42, 54, 66, 78].map(function(x){ return ln(x, 74, x, 84, INK, 2.5); }).join("");
  I.towel = ln(12, 14, 88, 14, INK, 4) + rct(26, 14, 48, 72, "#7FC8C8", 4) + rct(26, 60, 48, 8, "#FFFFFF", 0, 0) + rct(26, 72, 48, 5, "#FFFFFF", 0, 0) + [30, 38, 46, 54, 62, 70].map(function(x){ return ln(x, 86, x, 94, INK, 2.5); }).join("");
  I.mittens = ell(23, 56, 10, 14, "#E05A5A", 3, ' transform="rotate(-25 23 56)"') + pth("M28 92 V42 C28 22 40 10 54 10 C68 10 76 22 76 42 V92 Z", "#E05A5A") + rct(26, 74, 52, 18, "#F5F1E6", 3) + pth("M34 80 V88 M44 80 V88 M54 80 V88 M64 80 V88", "none", { w: 2, stroke: "#B8B09A" });
  I.pajamas = pth("M30 12 L10 30 L22 46 L30 40 V90 H70 V40 L78 46 L90 30 L70 12 C62 22 38 22 30 12 Z", "#8EC5E4") + circ(44, 42, 3, "#F6C343", 0) + circ(58, 54, 3, "#F6C343", 0) + circ(42, 66, 3, "#F6C343", 0) + circ(60, 76, 3, "#F6C343", 0) + pth("M46 12 L50 20 L54 12", "none", { w: 2.5 });
  I.nail = ell(50, 14, 17, 6, "#9AA3AD", 3) + poly([[45, 18], [55, 18], [52, 86], [50, 96], [48, 86]], "#B8C0C8") + ln(51, 24, 51, 78, "#FFFFFF", 2, { op: 0.8 });
  I.drill = rct(14, 22, 54, 26, "#F6C343", 7) + rct(68, 28, 14, 14, "#9AA3AD", 2) + ln(82, 35, 96, 35, INK, 3) + pth("M36 48 L40 82 H58 L54 48 Z", "#4A4540") + rct(34, 82, 34, 10, "#6B665F", 3) + circ(46, 35, 5, "#E05A5A", 2.5);
  I.submarine = pth("M40 28 V14 H58", "none", { w: 4 }) + rct(36, 26, 24, 16, "#F6C343", 4) + ell(50, 58, 40, 18, "#F6C343", 3) + poly([[10, 46], [18, 58], [10, 70]], "#C9A227") + [32, 50, 68].map(function(x){ return circ(x, 58, 5.5, "#BFE3F5", 2.5); }).join("") + pth("M4 86 C16 80 24 92 36 86 C48 80 56 92 68 86 C80 80 88 92 96 86", "none", { stroke: "#6FA8D6", w: 4 });
  I.dragonfly = ell(27, 36, 22, 7, "#CFEAF7", 2.5, ' transform="rotate(-12 27 36)"') + ell(73, 36, 22, 7, "#CFEAF7", 2.5, ' transform="rotate(12 73 36)"') + ell(29, 50, 20, 6, "#CFEAF7", 2.5, ' transform="rotate(8 29 50)"') + ell(71, 50, 20, 6, "#CFEAF7", 2.5, ' transform="rotate(-8 71 50)"') + ell(50, 56, 4.5, 32, "#2E9A9A", 3) + circ(50, 20, 7, "#2E9A9A") + circ(47, 18, 1.8, "#FFFFFF", 0) + circ(53, 18, 1.8, "#FFFFFF", 0);
  I.bat = pth("M43 44 C32 32 16 34 6 46 C14 44 18 50 20 58 C26 54 32 56 36 64 C38 56 41 52 44 52 Z", "#7A6590") + pth("M57 44 C68 32 84 34 94 46 C86 44 82 50 80 58 C74 54 68 56 64 64 C62 56 59 52 56 52 Z", "#7A6590") + ell(50, 52, 9, 15, "#5B4A6B", 3) + circ(50, 34, 9, "#5B4A6B") + poly([[42, 30], [41, 18], [48, 26]], "#5B4A6B") + poly([[58, 30], [59, 18], [52, 26]], "#5B4A6B") + circ(46, 34, 2, "#FFFFFF", 0) + circ(54, 34, 2, "#FFFFFF", 0);
  I.easel = ln(34, 56, 20, 94, INK, 4) + ln(66, 56, 80, 94, INK, 4) + ln(50, 50, 50, 94, INK, 4) + rct(18, 8, 64, 50, "#FFFFFF", 2) + pth("M20 56 C32 38 42 46 54 36 C64 28 72 40 80 36 V56 Z", "#7BB662", { w: 2.5 }) + circ(66, 20, 6, "#F6C343", 2.5) + rct(14, 58, 72, 5, "#C98F5B", 1, 2.5);
  I.stage = rct(8, 72, 84, 18, "#A9744F", 2) + pth("M50 12 L26 72 H74 Z", "#F6E7A0", { w: 0, op: 0.75 }) + pth("M8 10 H36 C30 30 32 52 22 72 H8 Z", "#C8553D") + pth("M92 10 H64 C70 30 68 52 78 72 H92 Z", "#C8553D") + rct(8, 6, 84, 10, "#A63D2B", 2) + circ(50, 62, 6, "#F2C9A0", 2.5);
  I.mask = pth("M16 22 C34 14 66 14 84 22 C86 54 76 82 50 90 C24 82 14 54 16 22 Z", "#F6C343") + pth("M26 40 C32 34 40 34 44 42 C38 46 30 46 26 40 Z", INK, { w: 2 }) + pth("M74 40 C68 34 60 34 56 42 C62 46 70 46 74 40 Z", INK, { w: 2 }) + pth("M34 66 C42 78 58 78 66 66", "none", { w: 4 });
  I.puppet = pth("M24 92 V50 C24 24 38 10 50 10 C62 10 76 24 76 50 V92 Z", "#7BB662") + circ(38, 34, 8, "#FFFFFF", 2.5) + circ(62, 34, 8, "#FFFFFF", 2.5) + circ(39, 35, 3, INK, 0) + circ(61, 35, 3, INK, 0) + ell(50, 62, 14, 8, "#E05A5A", 3);
  I.choir = [24, 50, 76].map(function(x){ return ell(x, 74, 14, 20, "#6B5BA8", 3); }).join("") + [24, 50, 76].map(function(x){ return circ(x, 40, 11, "#F2C9A0") + ell(x, 44, 3.5, 4.5, "#8A2F2F", 0); }).join("") + pth("M44 14 V4 H56 V12", "none", { w: 0 });
  I.orchestra = rct(14, 12, 44, 62, "#FFFFFF", 3) + [26, 34, 42, 50, 58].map(function(y){ return ln(20, y, 52, y, "#9AA3AD", 1.8); }).join("") + circ(28, 46, 4, INK, 0) + ln(32, 46, 32, 28, INK, 2.5) + circ(44, 38, 4, INK, 0) + ln(48, 38, 48, 22, INK, 2.5) + ln(62, 88, 88, 24, "#8A5A3C", 5) + circ(88, 24, 3.5, "#FFFFFF", 2) + rct(24, 74, 24, 18, "#8A5A3C", 2);
  I.mailbag = pth("M30 36 C30 14 70 14 70 36", "none", { w: 5 }) + pth("M20 36 H80 L86 90 H14 Z", "#B07A4F") + pth("M20 36 H80 L76 52 H24 Z", "#8A5A3C") + rct(40, 44, 20, 14, "#FFFFFF", 2, 2.5) + pth("M40 44 L50 52 L60 44", "none", { w: 2 }) + rct(44, 56, 12, 10, "#F6C343", 2);
  I.compost = pth("M22 40 H78 L72 92 H28 Z", "#8A5A3C") + [52, 64, 76].map(function(y){ return ln(26, y, 74, y, "#6B4430", 3); }).join("") + rct(18, 34, 64, 8, "#A9744F", 2) + pth("M32 34 C26 20 40 12 46 24 C52 14 64 18 60 34", "#7BB662", { w: 2.5 }) + circ(66, 26, 7, "#E05A5A", 2.5) + pth("M54 34 L70 22", "none", { stroke: "#F6C343", w: 4 });
  I.shadow = circ(18, 18, 9, "#F6C343") + ln(18, 6, 18, 2, "#F6C343", 3) + ln(6, 18, 2, 18, "#F6C343", 3) + ell(66, 88, 26, 5, "#3A322C", 0, ' opacity="0.35"') + rct(41, 32, 7, 56, "#8A5A3C", 1, 3) + circ(44, 26, 16, "#7BB662");
  I.echo = poly([[56, 90], [76, 30], [98, 90]], "#9AA3AD") + pth("M46 40 C38 46 38 58 46 64", "none", { w: 4, stroke: "#6FA8D6" }) + pth("M34 32 C22 44 22 62 34 74", "none", { w: 4, stroke: "#6FA8D6" }) + pth("M22 24 C6 40 6 68 22 84", "none", { w: 4, stroke: "#6FA8D6" }) + ell(60, 50, 6, 9, "#F2C9A0", 2.5);
  I.switch = rct(26, 10, 48, 80, "#F5F1E6", 8) + rct(41, 30, 18, 40, "#C9CED4", 4) + rct(41, 30, 18, 20, "#FFFFFF", 4) + circ(50, 18, 2.5, "#9AA3AD", 1.5) + circ(50, 82, 2.5, "#9AA3AD", 1.5);
  I.speedometer = pth("M10 72 A40 40 0 0 1 90 72", "none", { stroke: "#7BB662", w: 12 }) + pth("M62 36 A40 40 0 0 1 90 72", "none", { stroke: "#E05A5A", w: 12 }) + pth("M10 72 A40 40 0 0 1 90 72", "none", { w: 3, stroke: INK, op: 0.0 }) + ln(50, 72, 72, 44, INK, 5) + circ(50, 72, 8, INK, 0) + ln(10, 84, 90, 84, INK, 3);
  I.vitamin = rct(8, 34, 84, 32, "#F28C38", 16, 3) + pth("M50 34 H76 A16 16 0 0 1 76 66 H50 Z", "#F6C343") + ln(50, 34, 50, 66, INK, 3) + ln(24, 42, 36, 42, "#FFFFFF", 3, { op: 0.8 });
  I.seatbelt = rct(10, 8, 52, 84, "#6FA8D6", 8) + rct(44, 66, 46, 24, "#6FA8D6", 6) + ln(18, 10, 62, 66, "#3A322C", 9) + rct(54, 58, 16, 16, "#C9CED4", 3, 3) + ln(64, 66, 82, 66, "#3A322C", 8);
  I.siren = rct(26, 70, 48, 14, "#6B665F", 3) + pth("M32 70 V46 C32 28 68 28 68 46 V70 Z", "#E05A5A") + ln(50, 14, 50, 6, "#E05A5A", 4) + ln(22, 28, 14, 20, "#E05A5A", 4) + ln(78, 28, 86, 20, "#E05A5A", 4) + ln(16, 48, 6, 48, "#E05A5A", 4) + ln(84, 48, 94, 48, "#E05A5A", 4) + pth("M42 62 V46 C42 40 46 36 50 36", "none", { stroke: "#FFFFFF", w: 3, op: 0.8 });
  I.video = rct(8, 20, 84, 58, "#3A322C", 8) + poly([[40, 34], [40, 64], [66, 49]], "#FFFFFF", 2.5) + rct(30, 82, 40, 6, "#9AA3AD", 3, 2.5);
  I.website = rct(8, 14, 84, 72, "#FFFFFF", 6) + rct(8, 14, 84, 14, "#8EC5E4", 6) + circ(18, 21, 2.5, "#E05A5A", 0) + circ(26, 21, 2.5, "#F6C343", 0) + circ(34, 21, 2.5, "#7BB662", 0) + rct(16, 36, 34, 22, "#F6C343", 3, 2) + ln(58, 40, 84, 40, "#9AA3AD", 3) + ln(58, 50, 82, 50, "#9AA3AD", 3) + ln(16, 68, 84, 68, "#9AA3AD", 3) + ln(16, 76, 70, 76, "#9AA3AD", 3);
  I.orbit = ell(50, 50, 42, 18, "none", 2.5, ' transform="rotate(-20 50 50)" stroke-dasharray="5 4"') + circ(50, 50, 15, "#6FA8D6") + pth("M40 44 C46 40 54 42 58 48", "none", { stroke: "#7BB662", w: 4 }) + circ(80, 36, 6, "#F3E9B8", 2.5);
  I.rotation = pth("M50 18 A32 32 0 1 1 18 50", "none", { w: 7, stroke: "#6FA8D6" }) + poly([[6, 52], [30, 52], [18, 32]], "#6FA8D6") + circ(50, 50, 10, "#7BB662");
  I.symmetry = poly([[50, 12], [14, 50], [50, 88]], "#8EC5E4") + pth("M50 12 L86 50 L50 88", "none", { stroke: "#8EC5E4", w: 3, dash: "4 4" }) + ln(50, 4, 50, 96, INK, 2.5, { dash: "5 4" });
  I.pattern = circ(16, 34, 10, "#E05A5A") + rct(30, 24, 20, 20, "#F6C343", 2) + poly([[66, 44], [76, 24], [86, 44]], "#7BB662") + circ(16, 72, 10, "#E05A5A") + rct(30, 62, 20, 20, "#F6C343", 2) + poly([[66, 82], [76, 62], [86, 82]], "#7BB662");
  I.decimal = circ(50, 50, 40, "#FFFFFF", 3) + txt("0.5", 50, 62, 34, INK);
  I.quiz = rct(20, 8, 60, 84, "#FFFFFF", 3) + ln(30, 70, 70, 70, "#9AA3AD", 2.5) + ln(30, 80, 58, 80, "#9AA3AD", 2.5) + circ(50, 34, 20, "none", 0) + txt("A+", 50, 46, 30, "#C8402F") + pth("M32 54 H68", "none", { stroke: "#C8402F", w: 3 });
  I.drought = rct(0, 62, 100, 38, "#C9A66B", 0, 0) + pth("M4 62 H96", "none", { w: 3 }) + pth("M20 66 L28 78 L22 90 M50 66 L44 80 L54 92 M76 66 L84 80 L78 94 M28 78 L40 76 M54 92 L66 88", "none", { stroke: "#7A5A2E", w: 2.5 }) + circ(72, 24, 14, "#F6C343") + [[72, 4, 72, 0], [92, 24, 96, 24], [86, 10, 90, 6], [86, 38, 90, 42], [52, 24, 48, 24]].map(function(p){ return ln(p[0], p[1], p[2], p[3], "#F6C343", 3); }).join("");
  I.weather = circ(36, 36, 16, "#F6C343") + blob([[44, 62, 14], [62, 56, 17], [78, 64, 12], [58, 70, 14]], "#FFFFFF") + pth("M30 80 L26 90 M46 82 L42 92", "none", { stroke: "#6FA8D6", w: 4 });
  I.dumbbell = ln(24, 50, 76, 50, INK, 6) + rct(8, 30, 12, 40, "#4A4540", 3) + rct(20, 22, 12, 56, "#4A4540", 3) + rct(68, 22, 12, 56, "#4A4540", 3) + rct(80, 30, 12, 40, "#4A4540", 3);
  I.password = rct(8, 30, 84, 40, "#FFFFFF", 8) + [26, 40, 54, 68].map(function(x){ return circ(x, 50, 5, INK, 0); }).join("") + ln(78, 40, 78, 60, "#6FA8D6", 3);
  I.piggybank = pth("M18 66 C10 40 28 28 52 28 C78 28 92 44 86 66 C84 74 80 78 76 80 V90 H64 V84 H40 V90 H28 V80 C22 76 20 72 18 66 Z", "#F2A9BE") + pth("M30 36 L34 20 L46 30 Z", "#F2A9BE") + ell(14, 56, 7, 9, "#E88AA6", 3) + circ(34, 52, 3, INK, 0) + rct(46, 24, 20, 5, INK, 2, 0) + circ(56, 14, 7, "#F6C343", 2.5) + pth("M88 52 C94 50 94 60 88 58", "none", { w: 3 });

  // ---------- drawings, pack 5 (gaps found by testing a K-12 vocabulary list) ----------
  I.feelings = circ(34, 50, 24, "#F6C343") + circ(26, 44, 2.6, INK, 0) + circ(42, 44, 2.6, INK, 0) + pth("M24 56 Q34 66 44 56", "none", { w: 3 }) +
    circ(68, 50, 24, "#8EC5E4") + circ(60, 44, 2.6, INK, 0) + circ(76, 44, 2.6, INK, 0) + pth("M58 62 Q68 54 78 62", "none", { w: 3 });
  I.soil = pth("M50 40 V24 M50 32 C44 22 36 24 34 30 M50 30 C56 20 64 22 66 28", "none", { stroke: "#4F9D78", w: 3.5 }) +
    pth("M6 86 C12 56 34 40 50 40 C66 40 88 56 94 86 Z", "#8A5A3C") + [[30, 72], [54, 60], [70, 76], [42, 80], [62, 52]].map(function(p){ return circ(p[0], p[1], 3, "#C9A27A", 1.5); }).join("") +
    pth("M30 60 C36 54 42 64 48 58", "none", { stroke: "#F29BB5", w: 4 });
  I.liver = pth("M10 46 C10 28 40 22 72 26 C90 28 94 40 88 50 C80 64 54 74 32 72 C18 70 10 60 10 46 Z", "#A84B3F") + pth("M50 30 C48 44 46 56 40 70", "none", { stroke: "#7E3329", w: 2.5 }) +
    ell(28, 42, 8, 5, "#C46A5C", 0);
  I.friction = rct(28, 36, 42, 32, "#E8B46A", 4) + rct(2, 72, 96, 14, "#C9A27A", 0, 0) +
    pline([[2, 72], [10, 66], [18, 72], [26, 66], [34, 72], [42, 66], [50, 72], [58, 66], [66, 72], [74, 66], [82, 72], [90, 66], [98, 72]], INK, 3) +
    ln(74, 52, 86, 52, INK, 4) + poly([[96, 52], [86, 45], [86, 59]], INK, 0) + pth("M20 46 Q15 40 20 34 M12 52 Q7 46 12 40", "none", { stroke: "#E06D3A", w: 3 });
  I.wedge = rct(12, 50, 76, 38, "#C98F5B", 6) + pth("M50 88 V64", "none", { w: 2.5 }) + ell(26, 69, 6, 12, "#E3B887", 1.5) + poly([[34, 10], [66, 10], [50, 66]], "#C9CED4");
  I.tally = [24, 40, 56, 72].map(function(x){ return ln(x, 22, x, 78, INK, 5.5); }).join("") + ln(12, 70, 84, 30, "#D9674B", 5.5);
  I.shapes = circ(30, 34, 19, "#F29BB5") + rct(54, 16, 34, 34, "#7FB8DE", 3) + poly([[50, 52], [76, 90], [24, 90]], "#9CCB7A");
  I.lines = ln(10, 32, 90, 32, INK, 5) + ln(10, 58, 90, 58, INK, 5) + ln(56, 10, 56, 90, "#D9674B", 5) + pth("M56 70 H68 V58", "none", { w: 2.5 }) +
    ln(24, 26, 28, 38, "#4A84B8", 2.5) + ln(24, 52, 28, 64, "#4A84B8", 2.5);
  I.pi = circ(50, 50, 40, "#FFF1C9") + txt("π", 50, 70, 58, INK);
  I.punctuation = rct(6, 24, 88, 52, "#FFFFFF", 10) + txt(". , ? !", 50, 63, 32, INK);
  I.chalkboard = rct(4, 12, 92, 66, "#8A5A3C", 6) + rct(11, 19, 78, 52, "#2F5D50", 3, 0) + txt("ABC", 50, 46, 18, "#F3EFE2") +
    pth("M22 58 H64", "none", { stroke: "#F3EFE2", w: 2.5 }) + ln(30, 78, 24, 92, INK, 3) + ln(70, 78, 76, 92, INK, 3);
  I.migration = [[70, 44], [56, 34], [42, 24], [56, 58], [42, 68]].map(function(p){
    return pth("M" + (p[0] - 8) + " " + (p[1] + 2) + " Q" + (p[0] - 4) + " " + (p[1] - 6) + " " + p[0] + " " + p[1] + " Q" + (p[0] + 4) + " " + (p[1] - 6) + " " + (p[0] + 8) + " " + (p[1] + 2), "none", { w: 3 });
  }).join("") + ln(14, 84, 80, 84, "#4A84B8", 3, { dash: "6 5" }) + poly([[92, 84], [80, 78], [80, 90]], "#4A84B8", 0);
  I.hibernate = pth("M6 90 C6 26 94 26 94 90 Z", "#9AA3AD") + pth("M20 90 C20 46 80 46 80 90 Z", "#4A4540", { w: 2 }) +
    ell(52, 78, 22, 12, "#8A5A3C", 2.5) + circ(34, 72, 9, "#8A5A3C", 2.5) + circ(29, 64, 3.5, "#8A5A3C", 2) + pth("M30 74 h5", "none", { w: 2 }) +
    txt("z", 64, 58, 14, "#F3EFE2") + txt("z", 74, 48, 11, "#F3EFE2");
  I.atmosphere = pth("M4 80 A46 46 0 0 1 96 80", "none", { stroke: "#BFE3F5", w: 7 }) + pth("M14 80 A36 36 0 0 1 86 80", "none", { stroke: "#8EC5E4", w: 6 }) +
    circ(50, 80, 26, "#6FA8D6") + pth("M36 70 C44 62 54 70 48 80 C42 88 32 82 36 70 Z", "#7BB662", { w: 2 }) + blob([[74, 30, 7], [82, 28, 6]], "#FFFFFF");
  I.dissolve = pth("M22 18 L30 90 H70 L78 18 Z", "#D6ECFA") + ln(26, 40, 74, 40, "#8EC5E4", 2) + rct(38, 66, 13, 13, "#FFFFFF", 2, 2) +
    circ(60, 74, 2.5, "#FFFFFF", 1.5) + circ(56, 60, 2, "#FFFFFF", 1.5) + circ(46, 52, 1.8, "#FFFFFF", 1.2) + pth("M34 50 C42 44 56 56 66 48", "none", { stroke: "#4A90C8", w: 2.5 });
  I.variable = rct(18, 18, 64, 64, "#FFF1C9", 12) + txt("x", 50, 66, 50, "#4A84B8");
  I.intestines = pth("M22 20 H74 C88 20 88 40 74 40 H28 C14 40 14 60 28 60 H72 C86 60 86 80 72 80 H30", "none", { stroke: INK, w: 13 }) +
    pth("M22 20 H74 C88 20 88 40 74 40 H28 C14 40 14 60 28 60 H72 C86 60 86 80 72 80 H30", "none", { stroke: "#E89A7A", w: 8 });
  I.choice = rct(46, 30, 8, 62, "#8A5A3C", 2) + poly([[14, 20], [52, 20], [52, 42], [14, 42], [4, 31]], "#7FB8DE") +
    poly([[48, 50], [86, 50], [96, 61], [86, 72], [48, 72]], "#F6C343") + pth("M28 92 H72", "none", { w: 3 });
  I.sorting = rct(6, 62, 40, 30, "#F29BB5", 5) + rct(54, 62, 40, 30, "#7FB8DE", 5) + circ(26, 40, 9, "#F29BB5") + rct(65, 30, 18, 18, "#7FB8DE", 3) +
    pth("M26 51 V58 M74 50 V58", "none", { w: 2.5 }) + circ(50, 14, 6, "#F29BB5", 2) + rct(42, 6, 0, 0, "none", 0, 0) + pth("M44 18 L30 30 M56 18 L68 26", "none", { w: 2.5, dash: "3 3" });
  I.habitat = circ(50, 50, 44, "#DDF0FA") + pth("M8 66 C30 58 70 58 92 66 A44 44 0 0 1 8 66 Z", "#B9DBA0", { w: 2 }) +
    ell(66, 76, 14, 5, "#8CC4E8", 1.5) + rct(26, 40, 6, 26, "#8A5A3C", 1, 2) + blob([[29, 34, 12], [20, 40, 8], [38, 40, 8]], "#5FAE57") +
    pth("M50 64 C50 58 58 56 60 60 C64 56 68 60 66 64 Z", "#8A5A3C", { w: 1.8 }) + circ(72, 30, 7, "#F6C343", 2);
  I.greenhouse = pth("M8 90 V46 L50 14 L92 46 V90 Z", "#DFF2EA") + ln(50, 14, 50, 90, "#7FB8A4", 2) + ln(8, 62, 92, 62, "#7FB8A4", 2) + ln(29, 30, 29, 90, "#7FB8A4", 2) + ln(71, 30, 71, 90, "#7FB8A4", 2) +
    pth("M8 90 V46 L50 14 L92 46 V90 Z", "none") + [22, 40, 60, 78].map(function(x){ return pth("M" + x + " 88 V76 M" + x + " 80 C" + (x - 6) + " 74 " + (x - 8) + " 70 " + (x - 6) + " 68 M" + x + " 78 C" + (x + 6) + " 72 " + (x + 8) + " 68 " + (x + 6) + " 66", "none", { stroke: "#4F9D78", w: 2.5 }); }).join("");

  // ---------- vocabulary ----------
  var VOCAB = {
    sun: ["sun", "sunlight", "sunshine"],
    cloud: ["cloud"],
    rain: ["rain", "rainfall", "precipitation", "raindrop", "shower"],
    drop: ["water", "droplet", "drop", "liquid", "moisture"],
    wave: ["ocean", "sea", "wave", "lake", "pond"],
    river: ["river", "stream", "creek", "nile", "flood"],
    mountain: ["mountain", "hill"],
    tree: ["tree", "forest", "wood"],
    sprout: ["plant", "seed", "seedling", "sprout", "crop", "root"],
    flower: ["flower", "blossom", "bloom"],
    leaf: ["leaf", "leaves", "photosynthesis"],
    cell: ["cell", "organism", "microbe"],
    dna: ["dna", "gene", "genetic", "chromosome"],
    virus: ["virus", "germ", "bacteria", "bacterium", "infection", "disease", "sickness"],
    atom: ["atom", "molecule", "particle", "matter", "element"],
    magnet: ["magnet", "magnetic", "magnetism"],
    bolt: ["energy", "electricity", "electric", "power", "lightning", "current"],
    flame: ["fire", "heat", "flame", "hot", "magma"],
    snowflake: ["ice", "snow", "cold", "frozen", "snowflake"],
    rocket: ["rocket", "spaceship"],
    planet: ["planet", "saturn", "jupiter", "mars", "venus"],
    moon: ["moon"],
    star: ["star", "galaxy"],
    globe: ["earth", "world", "globe", "country"],
    crown: ["king", "queen", "crown", "monarch", "emperor", "ruler", "royal", "prince", "princess", "pharaoh"],
    castle: ["castle", "kingdom", "palace", "fortress"],
    person: ["person", "teacher", "student", "child", "man", "woman", "farmer", "scientist", "worker", "leader", "astronaut", "president", "inventor", "character", "hero"],
    group: ["people", "citizen", "crowd", "team", "soldier", "army", "population", "community", "settler", "colonist", "family", "worker", "voter", "class"],
    ship: ["ship", "boat", "sailor", "navy", "explorer"],
    gear: ["machine", "gear", "wheel", "engine", "motor", "mechanism"],
    lever: ["lever", "seesaw"],
    robot: ["robot"],
    book: ["book", "story", "reading", "library", "novel"],
    brain: ["brain", "mind", "memory", "thinking"],
    heart: ["heart", "love"],
    apple: ["food", "apple", "fruit", "meal", "nutrient"],
    gravity: ["gravity"],
    columns: ["government", "democracy", "law", "court", "congress", "parliament", "senate", "republic", "temple"],
    ballot: ["vote", "election", "ballot", "voting"],
    bird: ["bird", "eagle"],
    fish: ["fish"],
    volcano: ["volcano", "lava", "magma", "eruption"],
    vapor: ["vapor", "vapour", "steam", "gas", "evaporation", "humidity"],
    bulb: ["idea", "invention", "light", "lightbulb", "discovery", "glow"],
    scroll: ["history", "document", "declaration", "treaty", "papyrus", "record", "constitution"],
    swords: ["war", "battle", "warrior"],
    dove: ["freedom", "peace", "liberty", "independence"],
    coins: ["money", "trade", "gold", "coin", "tax", "price", "economy", "wealth", "pay", "goods", "spice"],
    flag: ["flag", "nation"],
    fist: ["revolution", "protest", "rebellion", "revolt"],
    clock: ["time", "clock", "hour", "minute"],
    chart: ["graph", "chart", "data", "statistics"],
    flask: ["experiment", "science", "chemistry", "chemical", "laboratory", "reaction"]
  };
  var VOCAB_MORE = {
    rainbow: ["rainbow", "spectrum"], wind: ["wind", "breeze", "air"], tornado: ["tornado", "hurricane", "twister"],
    thermometer: ["temperature", "thermometer", "degree"], storm: ["storm", "thunder", "thunderstorm"],
    rock: ["rock", "stone", "mineral", "crust", "boulder", "coal", "plate"], fossil: ["fossil", "shell", "ammonite"],
    cactus: ["desert", "cactus"], island: ["island", "beach", "coast"], earthquake: ["earthquake", "fault", "quake"],
    bee: ["bee", "insect", "pollinator", "pollen", "honey"], butterfly: ["butterfly", "moth"], caterpillar: ["caterpillar", "larva", "worm", "earthworm"],
    cocoon: ["chrysalis", "cocoon", "pupa"], egg: ["egg"], frog: ["frog", "tadpole", "amphibian", "toad"], dinosaur: ["dinosaur", "reptile", "dino"],
    bone: ["bone", "skeleton"], tooth: ["tooth", "teeth", "dentist"], eye: ["eye", "sight", "vision"], ear: ["ear", "hearing"],
    hand: ["hand", "finger", "touch"], lungs: ["lung", "breath", "breathing"], stomach: ["stomach", "digestion", "gut"],
    muscle: ["muscle", "force", "strength"], rabbit: ["rabbit", "bunny", "prey", "herbivore"], fox: ["fox", "predator", "carnivore", "wolf"],
    grass: ["grass", "producer", "meadow", "lawn"], mushroom: ["mushroom", "fungus", "fungi", "decomposer", "mold"], whale: ["whale", "dolphin"],
    comet: ["comet", "asteroid", "meteor", "meteorite"], telescope: ["telescope", "astronomer"], satellite: ["satellite"],
    battery: ["battery"], plug: ["plug", "wire", "outlet", "cord", "circuit"], sound: ["sound", "noise", "vibration", "loudspeaker"],
    note: ["music", "song", "note", "melody", "rhythm"], prism: ["prism"], microscope: ["microscope"],
    beaker: ["beaker", "solution", "mixture"], scale: ["scale", "balance", "weight", "mass", "justice"],
    ramp: ["ramp", "slope", "incline"], pulley: ["pulley", "rope"], spring: ["spring", "elastic"],
    car: ["car", "vehicle", "truck"], train: ["train", "railroad", "railway", "locomotive"], plane: ["plane", "airplane", "aircraft", "flight"],
    computer: ["computer", "laptop", "code", "program", "software", "internet"], phone: ["phone", "telephone", "smartphone"],
    envelope: ["letter", "mail", "message", "email"], pizza: ["fraction", "pizza"], slice: ["slice", "quarter"], half: ["half"], whole: ["whole"],
    triangle: ["triangle"], square: ["square", "rectangle"], circle: ["circle"], cube: ["cube", "box", "block"],
    ruler: ["ruler", "measure", "measurement", "length", "inch", "centimeter", "meter"], numbers: ["number", "numeral", "digit", "math", "mathematics", "sum", "total"],
    sugar: ["sugar", "glucose"], pyramid: ["pyramid", "egypt", "tomb"], house: ["house", "home", "shelter"],
    city: ["city", "town", "village", "building"], factory: ["factory", "industry", "mill", "industrial"], farm: ["farm", "barn", "agriculture", "ranch"],
    wheat: ["wheat", "grain", "corn", "harvest"], bridge: ["bridge"], wall: ["wall", "border", "barrier"],
    map: ["map", "territory", "route", "region", "setting"], compass: ["compass", "direction", "north", "navigation"],
    quill: ["pen", "quill", "writer", "author", "poem", "poet", "writing", "scribe"], newspaper: ["newspaper", "news", "journalist", "press", "article"],
    handshake: ["agreement", "deal", "friendship", "alliance", "partner", "union", "cooperation"], pencil: ["pencil", "drawing", "sketch"],
    speech: ["speech", "talk", "conversation", "dialogue", "word", "opinion"], question: ["question", "mystery", "problem", "conflict"],
    magnifier: ["clue", "evidence", "detail", "investigation", "detective", "observation"], puzzle: ["puzzle", "piece", "plot"],
    trophy: ["trophy", "prize", "victory", "champion", "award", "goal", "climax"], calendar: ["calendar", "date", "day", "week", "month", "year", "season"],
    palette: ["art", "paint", "color", "colour", "artist", "painting"], carrot: ["vegetable", "carrot"], bed: ["sleep", "bed", "rest", "nap"],
    soap: ["soap", "hygiene"], shield: ["shield", "immunity", "protection", "defense", "armor", "knight", "immune"],
    pill: ["medicine", "pill", "vaccine", "drug", "antibiotic"], oxygen: ["oxygen"], co2: ["carbon", "dioxide"]
  };
  Object.keys(VOCAB_MORE).forEach(function(k){ VOCAB[k] = VOCAB_MORE[k]; });

  // pack 2 vocabulary (words already claimed by an earlier drawing keep that drawing)
  var VOCAB_PACK2 = {
    dog: "dog puppy canine pet", cat: "cat kitten feline", horse: "horse pony stallion mare foal", cow: "cow cattle calf bull ox", pig: "pig hog piglet boar",
    sheep: "sheep lamb ram", chicken: "chicken hen rooster chick poultry", duck: "duck duckling goose swan", elephant: "elephant", lion: "lion lioness mane",
    bear: "bear cub panda koala", monkey: "monkey ape chimpanzee gorilla primate", snake: "snake serpent cobra python", turtle: "turtle tortoise",
    spider: "spider arachnid tarantula cobweb spiderweb", ant: "ant anthill", shark: "shark", octopus: "octopus squid tentacle", crab: "crab lobster shrimp crustacean",
    penguin: "penguin", owl: "owl", giraffe: "giraffe", deer: "deer antler moose reindeer elk", mouse: "mouse mice rat rodent hamster", squirrel: "squirrel chipmunk",
    snail: "snail slug", jellyfish: "jellyfish jelly", dolphin: "dolphin porpoise",
    key: "keys", lock: "padlock", umbrella: "umbrella", scissors: "scissors", hammer: "hammer mallet", wrench: "wrench spanner", ladder: "ladder", bucket: "bucket pail",
    lamp: "lamp lantern", candle: "candle", door: "door doorway gate", window: "window", chair: "chair seat stool", table: "desk", cup: "cup mug", bottle: "bottle jar",
    bowl: "bowl dish", fork: "fork spoon knife cutlery utensil", shoe: "shoe sneaker boot sock", shirt: "shirt clothes clothing jacket coat dress sweater",
    hat: "hat", glasses: "glasses spectacles eyeglasses", backpack: "backpack bag schoolbag", balloon: "balloon", gift: "gift gifts birthday", kite: "kite",
    bicycle: "bicycle bike cycling", bus: "bus minibus", helicopter: "helicopter", tractor: "tractor", sailboat: "sailboat sail canoe kayak yacht", anchor: "anchor harbor harbour",
    lighthouse: "lighthouse", tent: "tent camp camping", campfire: "campfire bonfire", bell: "bell bells", camera: "camera photograph photo photography",
    headphones: "headphones earphones podcast", guitar: "guitar banjo ukulele", piano: "piano", drum: "drum drums percussion", trumpet: "trumpet horn bugle", violin: "violin fiddle cello",
    paintbrush: "paintbrush brush", parachute: "parachute skydiving", hourglass: "hourglass sandglass", eraser: "eraser", graduation: "graduation graduate diploma university college",
    notebook: "notebook journal diary binder", clipboard: "clipboard checklist", school: "school classroom schoolhouse", treasure: "treasure", stamp: "stamp postage",
    mailbox: "mailbox", microphone: "microphone mic interview", flashlight: "flashlight torchlight", toolbox: "toolbox tool tools",
    testtube: "testtube tube", petri: "petri", solar: "solarpanel panels", turbine: "turbine", windmill: "windmill", dam: "dam reservoir", recycle: "recycle recycling reuse",
    trash: "trash garbage waste litter rubbish", pendulum: "pendulum", lens: "lens magnifying", earthlayers: "core mantle earthlayers", crystal: "crystal crystals gem",
    skeleton: "skeleton", skull: "skull", syringe: "syringe injection", stethoscope: "stethoscope doctor nurse checkup", bandage: "bandage injury", kidneys: "kidney kidneys",
    footprint: "footprint footprints", waterfall: "waterfall cascade", lake: "lake pond lagoon", iceberg: "iceberg glacier", igloo: "igloo", cave: "cave cavern tunnel", canyon: "canyon gorge",
    sandy: "dune dunes sand", forest: "woodland woods grove taiga", jungle: "jungle rainforest tropical", statue: "statue sculpture monument", torch: "torch olympic",
    amphora: "amphora vase pottery urn", helmet: "helmet", cannon: "cannon cannonball", bowarrow: "bow arrow archer archery", wagon: "wagon cart carriage pioneer", throne: "throne",
    knight: "knight knights", vikingship: "viking vikings longship longboat", printing: "printingpress printing", telegraph: "telegraph morse", oilrig: "oil petroleum derrick",
    liberty: "statueofliberty", wheelbarrow: "wheelbarrow", coral: "coral reef", nest: "nest", web: "web",
    bread: "bread loaf toast baker bakery sandwich", cheese: "cheese", milk: "milk dairy", banana: "banana", orange: "tangerine citrus mandarin clementine", grapes: "grape grapes",
    strawberry: "strawberry berry berries", tomato: "tomato", corn: "maize cornfield popcorn", ricebowl: "rice porridge", cake: "cake cupcake dessert", cookie: "cookie biscuit",
    soup: "soup stew broth", meat: "meat steak beef pork protein",
    plus: "plus addition", minus: "minus subtraction subtract", times: "multiplication multiply", divide: "division", equals: "equation", percent: "percent percentage",
    angle: "angle angles acute obtuse", numberline: "numberline", hexagon: "hexagon", pentagon: "pentagon", diamond: "diamond rhombus", oval: "oval ellipse",
    cylinder: "cylinder", cone: "cone", sphere: "sphere", piechart: "piechart",
    happy: "happy happiness glad smile", sad: "sad unhappy cry crying", angry: "angry furious anger", surprised: "surprised shocked", sleepy: "sleepy tired yawn",
    idea2: "brainstorm", thumbsup: "approve approval thumbsup", heartbeat: "heartbeat pulse", nose: "nose nostril smell", mouth: "mouth lips tongue taste",
    sunrise: "sunrise sunset dawn dusk", stars: "stars starry constellation", newmoon: "newmoon eclipse", fullmoon: "fullmoon", crescent: "crescent"
  };
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
  var VOCAB_PACK3 = {
    glue: "glue", playground: "playground", locker: "locker lockers", stairs: "stairs staircase steps", roof: "roof rooftop", fence: "fence fences",
    pillow: "pillow pillows", blanket: "blanket blankets quilt", towel: "towel towels", mittens: "mittens mitten gloves", pajamas: "pajamas pyjamas",
    nail: "toenail", drill: "powerdrill", submarine: "submarine submarines", dragonfly: "dragonfly dragonflies", bat: "bats",
    easel: "easel canvas", stage: "curtain curtains", mask: "mask masks", puppet: "puppet puppets", choir: "choir chorus", orchestra: "orchestra symphony",
    wrench: "plumber plumbers spanner", plug: "electrician electricians socket", mailbag: "mailman mailwoman postman postwoman mailcarrier",
    compost: "compost composting", shadow: "shadow shadows", echo: "echo echoes", switch: "switch switches", speedometer: "speedometer speed",
    vitamin: "vitamin vitamins supplement supplements pill pills", seatbelt: "seatbelt seatbelts", siren: "siren sirens emergency",
    video: "video videos movie movies", website: "website websites webpage browser", orbit: "orbit orbits orbiting", rotation: "rotation rotate rotates rotating spin spins",
    symmetry: "symmetry symmetrical symmetric", pattern: "pattern patterns", decimal: "decimal decimals", quiz: "quiz quizzes exam exams",
    drought: "drought droughts", weather: "weather forecast", dumbbell: "dumbbell dumbbells gym weights", password: "password passwords passcode", piggybank: "piggybank savings"
  };
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
  var VOCAB_PACK5 = {
    feelings: "feeling feelings emotion emotions mood moods", soil: "soil dirt topsoil humus", liver: "liver", friction: "friction",
    wedge: "wedge wedges", tally: "tally tallies", shapes: "shape shapes", lines: "parallel perpendicular intersecting", pi: "pi",
    punctuation: "punctuation comma commas exclamation", chalkboard: "chalkboard blackboard whiteboard", migration: "migrate migrates migrated migrating migration",
    hibernate: "hibernate hibernates hibernation hibernating", atmosphere: "atmosphere", dissolve: "dissolve dissolves dissolved dissolving",
    variable: "variable variables", intestines: "intestine intestines gut", greenhouse: "greenhouse greenhouses", habitat: "habitat habitats environment environments",
    choice: "choice choices decision decisions", sorting: "sorting classify classifies classifying classification category categories categorize",
    bear: "mammal mammals omnivore omnivores", bread: "yeast", bulb: "predict predicts prediction predictions",
    bee: "pollinate pollinates pollinating pollination pollinator pollinators nectar", sprout: "germinate germinates germination seedling seedlings",
    flower: "petal petals", leaf: "chlorophyll", lungs: "respiration respiratory", cell: "membrane cytoplasm mitochondria chloroplast chloroplasts organelle organelles",
    shield: "antibody antibodies immunity immune", dna: "inherit inherited inheritance trait traits heredity genetics evolution", dinosaur: "extinct extinction",
    fish: "gills fins", bird: "beak beaks", horse: "hooves hoof", globe: "biome biomes", grass: "grassland grasslands prairie prairies",
    heart: "veins vein arteries artery vessels circulatory", bone: "joint joints backbone vertebrate vertebrates", brain: "nerves nerve nervous spinal",
    dumbbell: "exercise exercises workout fitness", solar: "solar", cloud: "condensation sky skies", drop: "groundwater", thermometer: "warming", weather: "climate climates",
    rock: "weathering", river: "delta deltas", testtube: "acid acids", speedometer: "velocity acceleration accelerate motion", sound: "frequency", lens: "refraction refract",
    flame: "thermal", numbers: "count counting integer integers digit digits", divide: "quotient remainder dividend divisor",
    coins: "penny pennies nickel nickels dime dimes cent cents", ruler: "mile miles kilometer kilometers", scale: "gram grams kilogram kilograms ounce ounces compare comparing contrast equality",
    bottle: "liter liters gallon gallons", chart: "pictograph pictographs median average", circle: "radius diameter circumference",
    quill: "poetry poet poets stanza stanzas rhyme rhymes rhyming", book: "fiction nonfiction fable fables tale tales myth myths legend legends biography biographies autobiography librarian librarians",
    notebook: "paragraph paragraphs summary summaries draft drafts", eraser: "edit editing revise revising", palette: "illustrator illustrators illustration illustrations",
    speech: "narrator persuade persuasive", newspaper: "magazine magazines", compass: "south east west", columns: "mayor governor civilization civilizations",
    crown: "empire empires", castle: "medieval feudal", scroll: "rights", clipboard: "rules", map: "exploration", amphora: "archaeologist archaeologists archaeology",
    statue: "landmark landmarks", bus: "transportation", phone: "communication communicate app apps", piggybank: "budget budgets", playground: "recess",
    guitar: "instrument instruments", note: "sing singing", mask: "costume costumes", computer: "coding algorithm algorithms programming", group: "teamwork"
  };
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
  var EMOJI_LIB_SRC = "🐶 dog puppy canine|🐱 cat kitten feline|🐴 horse pony stallion|🐄 cow cattle|🐖 pig hog|🐑 sheep lamb|🐐 goat|🐓 chicken hen rooster|🦆 duck|🦢 swan|🦉 owl|🦅 hawk falcon|🦜 parrot|🐧 penguin|🦩 flamingo|🕊️ pigeon|🦃 turkey|🐘 elephant|🦒 giraffe|🦓 zebra|🦁 lion|🐯 tiger|🐻 bear|🐼 panda|🐨 koala|🐒 monkey ape primate chimpanzee|🦍 gorilla|🦘 kangaroo|🐪 camel|🦌 deer|🐺 wolves|🦝 raccoon|🦔 hedgehog|🐿️ squirrel chipmunk|🐭 mouse rat rodent|🐹 hamster|🐁 mice|🐢 turtle tortoise|🐍 snake serpent|🦎 lizard gecko|🐊 crocodile alligator|🐙 octopus|🦑 squid|🦀 crab|🦞 lobster|🦐 shrimp|🐚 seashell|🐬 porpoise|🦈 shark|🐠 goldfish|🐡 pufferfish|🦭 walrus|🦦 otter|🐌 snail|🐜 ant|🪲 beetle|🦗 cricket grasshopper|🕷️ spider arachnid|🕸️ cobweb|🦟 mosquito|🐞 ladybug|🦂 scorpion|🪱 nematode|🦠 microorganism pathogen|🪺 nest|🐾 pawprint footprint|🦴 marrow|🦷 enamel|🐣 chick hatchling|🐥 duckling|🦄 unicorn|🐉 dragon|🧜 mermaid|🧚 fairy|🧙 wizard magician sorcerer|🧛 vampire|👻 ghost|🧟 zombie|🤖 android|👽 alien|🎃 pumpkin|🦖 trex|🦕 brontosaurus|🍎 apples|🍐 pear|🍊 tangerine citrus|🍋 lemon lime|🍌 banana|🍉 watermelon|🍇 grape grapes|🍓 strawberry berry berries|🫐 blueberry|🍒 cherry|🍑 peach|🥭 mango|🍍 pineapple|🥥 coconut|🥝 kiwi|🍅 tomato|🍆 eggplant|🥑 avocado|🥦 broccoli|🥬 lettuce cabbage spinach|🥒 cucumber|🌶️ pepper chili|🌽 maize|🥔 potato|🍠 yam|🧅 onion|🧄 garlic|🍞 bread loaf|🥐 croissant|🥖 baguette|🥞 pancake|🧇 waffle|🧀 cheese|🥚 eggs|🍳 breakfast|🥓 bacon|🍔 hamburger burger|🍟 fries|🌭 hotdog|🥪 sandwich|🌮 taco|🍝 pasta spaghetti noodle|🍜 soup ramen|🍚 rice|🍣 sushi|🥗 salad|🍰 cake|🧁 cupcake|🍪 cookie biscuit|🍩 donut|🍫 chocolate|🍬 candy|🍦 icecream dessert|🥛 milk dairy|🧃 juice|☕ coffee|🍵 tea|🥤 beverage soda|🍷 wine|🍺 beer|🧂 salt|🍯 syrup|🍽️ dinner lunch plate|🥄 spoon|🍴 fork knife|🥢 chopsticks|🥫 canned|🥜 peanut nuts|🌰 chestnut acorn|🍄 toadstool|🌳 oak pine maple|🌲 evergreen conifer fir|🌴 palm|🌵 succulent|🌾 rice paddy|🌿 herb|☘️ clover shamrock|🍁 autumn fall|🍂 foliage|🌱 germination|🌻 sunflower|🌹 rose|🌷 tulip|🌸 cherryblossom|🌺 hibiscus|🪴 houseplant|🪵 log timber lumber|🪨 pebble|🏔️ peak summit alps himalayas everest|⛰️ hill hills mountains|🏞️ valley canyon park|🏜️ sahara|🏖️ shore seaside|🌊 ocean sea waves tsunami|💧 water droplet|🌫️ fog mist|☁️ clouds|🌧️ rainfall rainy precipitation|🌨️ sleet hail|⛈️ thunderstorm|🌪️ cyclone|🌀 whirlpool vortex typhoon|🌈 arc|❄️ snowy blizzard winter|☃️ snowman|🔥 wildfire campfire bonfire|🌞 sunshine sunny daylight summer|🌅 sunrise dawn|🌇 sunset dusk|🌙 night crescent|🌑 eclipse|🌍 continent africa europe|🌎 america americas|🌏 asia australia|🌌 universe cosmos milkyway|☄️ meteoroid|🌋 crater|🏝️ archipelago|🧊 iceberg glacier|⛲ fountain|🌐 internet network|🛰️ orbiter|🛸 ufo|👨‍🚀 spaceman cosmonaut|⚡ voltage|💨 gust|👶 baby infant toddler|👦 boy|👧 girl|👨 father dad|👩 mother mom mum|👴 grandfather grandpa|👵 grandmother grandma|🧑 adult human|👨‍👩‍👧 parents|👨‍🏫 professor|👩‍⚕️ doctor nurse physician|👮 police officer policeman|👷 builder engineer construction|🧑‍🍳 chef cook baker|🧑‍🚒 firefighter fireman|🧑‍🌾 gardener|🧑‍🎨 painter|🧑‍🔬 researcher biologist chemist physicist|🧑‍✈️ pilot|🧑‍💻 programmer developer|🧑‍⚖️ judge lawyer|🕵️ spy|🦸 superhero|🦹 villain|🤴 emperor|👸 empress|🥷 ninja|🏴‍☠️ pirate|⚔️ sword knights|🏹 archer arrow bow|🪖 helmet|🎖️ medal veteran|👑 monarchy|🧑‍🤝‍🧑 friends friend|🙋 hands|😀 happy happiness|😢 sad sadness cry|😠 angry|😨 scared afraid|😊 kind|🙏 prayer pray|⛪ church|🕌 mosque|🕍 synagogue|🛕 shrine|🕉️ religion|✝️ christianity|☪️ islam|✡️ judaism|☸️ buddhism|🙌 celebrate celebration|🎉 party festival|🎂 birthday|🎄 christmas|🎆 fireworks|🏳️ surrender|🚩 banner|🧠 intelligence|🫀 organ|🫁 respiratory|🩸 blood|🦵 leg|🦶 foot feet|💪 biceps|👃 nose smell|👄 mouth lips|👅 tongue taste|👀 eyes|🧬 genes heredity|💉 injection syringe|🩺 stethoscope checkup|🩹 bandage wound|🏥 hospital clinic|🚑 ambulance|🧪 testtube|🔬 cells|🧫 petri culture|🧴 lotion|🛁 bath|🚿 shower|🪥 toothbrush|🥦 vegetables|🏊 swimming swim|🚴 cycling bicycle bike|🧘 yoga meditation|⚖️ justice|🍽️ diet nutrition|📚 books textbook|📖 page chapter|📝 essay homework assignment|✏️ pen|🖊️ marker|🖍️ crayon|📏 straightedge|📐 geometry angle|🧮 abacus calculator calculate|➕ addition|➖ subtraction subtract|✖️ multiplication multiply|➗ division|🟰 equation|📊 bargraph histogram|🥧 piechart|🎒 backpack|🏫 school classroom|🎓 graduation university college degree|📓 notebook journal diary|📋 clipboard list|🗂️ folder file|📎 paperclip|✂️ scissors|🖇️ stapler|🔖 bookmark|🔤 alphabet letters|🔡 lowercase|🔠 uppercase capital|🅰️ vowel|📜 manuscript|📰 headline|🔔 bell|🎤 microphone|📻 radio|📺 television tv|🎬 film movie cinema|📷 camera photograph photo|🖼️ painting picture|🎨 colors|🖌️ brush|🗿 statue sculpture|🏛️ museum|🎭 theater drama|🎪 circus|🎵 tune|🎶 songs|🎼 symphony|🎹 piano|🎸 guitar|🎺 trumpet|🎻 violin|🥁 drum drums|🪘 percussion|🎷 saxophone|🎧 headphones|💿 disc|📀 dvd|🌐 global|🔤 grammar|🔠 noun|🔡 verb|❗ exclamation|🧩 jigsaw|♟️ chess|🎲 dice|🎮 videogame|🕹️ joystick|🧸 toy teddy|🪁 kite|⚽ soccer football|🏀 basketball|🏈 rugby|⚾ baseball|🎾 tennis|🏐 volleyball|🏓 pingpong|🏸 badminton|🏒 hockey|🏏 cricketbat|⛳ golf|🥊 boxing|🥋 karate martial|⛸️ skating|🎿 ski skiing|🏂 snowboard|🏋️ weightlifting|🤸 gymnastics|🧗 climbing|🚣 rowing|🏄 surfing|🤿 diving|⛺ camping tent|🎣 fishing|🏅 olympics|🏠 homes|🏡 cottage|🏢 office skyscraper|🏬 store shop market mall|🏪 grocery|🏰 fort|🏯 pagoda|🗼 tower|🗽 liberty statueofliberty|🗻 fuji|🕋 kaaba|⛩️ torii|🧱 brick bricks|🪟 window|🚪 door|🛋️ sofa couch|🪑 chair|🛏️ mattress|🚽 toilet|🚰 faucet|🔓 unlock|🛠️ tools|🔨 hammer|🪓 axe|⛏️ pickaxe mining|🪚 saw|🔧 wrench|🔩 screw|⚙️ cog|🧰 toolbox|🪜 ladder|🔦 flashlight torch|🕯️ candle|🪔 lamp|🛢️ oil petroleum barrel|⛽ gasoline fuel|🧯 extinguisher|⚓ anchor|🧭 navigator|⏳ hourglass|⌛ sandglass|⏰ alarm|⌚ watch|🕰️ clockwork|📅 schedule|🗓️ agenda|🧺 basket laundry|🧹 broom|🧽 sponge|🎁 gift|📦 package parcel|📬 mailbox|📮 postbox|☎️ landline|📱 mobile|💻 laptops|🖥️ desktop monitor|⌨️ typing|🖱️ click|🖨️ printer|💾 floppy storage|📡 antenna signal|📶 wifi|🔎 zoom|🔭 stargazing|🧲 attract|🪞 mirror reflection|👓 glasses|🕶️ sunglasses|👕 shirt clothes clothing|👖 pants jeans|👗 dress|🧥 coat jacket|🧣 scarf|🧤 gloves|🧢 hat|👟 shoe shoes sneaker|👢 boots|🎽 uniform|💎 diamond gem jewel|👜 bag purse|🧳 luggage suitcase|☂️ umbrella|🌂 raincoat|🚗 cars|🚕 taxi cab|🚌 bus|🚎 trolley|🏎️ racecar|🚓 policecar|🚒 firetruck|🚚 lorry|🚜 tractor|🛻 pickup|🏍️ motorcycle|🛵 scooter|🚲 bicycles|🛴 skateboard|🚂 steam|🚆 railways|🚇 subway metro|🚊 tram|🚄 bullet|✈️ airplanes jet airport|🛩️ glider|🚁 helicopter|⛵ sailboat|🛶 canoe kayak|🚤 speedboat|⛴️ ferry|🛳️ cruise liner|🚢 steamship|🛣️ highway road|🛤️ railroad|🚦 traffic|🚧 construction|🚏 busstop|🗺️ atlas|📍 location pin place|🧭 orientation|🌉 viaduct|⛔ forbidden|🚸 crossing|🅿️ parking|🚉 station|🎡 ferriswheel|🎢 rollercoaster|🏟️ stadium|🏕️ campsite|🏘️ neighborhood suburb|🌆 skyline|🇺🇸 usa america american|🇬🇧 britain british england english|🇫🇷 france french|🇩🇪 germany german|🇮🇹 italy italian|🇪🇸 spain spanish|🇨🇳 china chinese|🇯🇵 japan japanese|🇮🇳 india indian|🇧🇷 brazil brazilian|🇲🇽 mexico mexican|🇨🇦 canada canadian|🇦🇺 australian|🇷🇺 russia russian|🇪🇬 egyptian|🇬🇷 greece greek|🇰🇷 korea|🇿🇦 southafrica|🏺 vase pottery ancient artifact urn amphora|🗿 moai|🗡️ dagger spear|🏹 hunter|⚱️ ashes|🪙 currency|💰 treasure rich riches|💵 dollar cash bill|💳 credit card|🧾 receipt invoice|🏧 atm|💹 stocks market|🏭 factories|🏗️ architecture|⚖️ fairness|📜 charter law|🗳️ elect|📣 campaign|🎙️ interview podcast|🕯️ memorial|🧱 fortification|🛤️ colony|🪶 feather|⚒️ labor labour|🌾 farming|🐎 cavalry|🛶 voyage|🧳 immigrant immigration migrate migration|🏴 rebels|📯 horn|🥁 beat|🏛️ greek senate forum|🏛️ capitol|🔶 rhombus|⬛ squares|♾️ infinity|〰️ zigzag|➡️ arrow|⚛️ nucleus proton neutron electron|🧪 compound|⚗️ distillation|🧫 bacterial|🌡️ celsius fahrenheit|🔥 combustion|❄️ freezing|🪨 sediment|🏔️ erosion|🪨 igneous sedimentary metamorphic|⛏️ ore quarry|🛢️ crude|💨 smoke pollution smog|♻️ recycle recycling reuse|🗑️ trash garbage waste litter|🌍 environment ecosystem|🌱 conservation|💨 turbine|🏭 emissions|🧯 safety|☢️ radiation nuclear radioactive|☣️ biohazard toxic poison|🧲 poles|🔌 socket|🧵 thread string yarn|🪡 needle sewing|🧶 wool knit|🪢 knot|🍽️ meal|🫖 teapot|🍼 bottle|🧈 butter|🥩 meat steak beef|🍗 poultry drumstick|🐟 salmon tuna cod trout|🥕 carrots|🫘 bean beans|🥣 cereal bowl|🍿 popcorn|🧆 falafel|🍕 pizzas|🌯 burrito|🥟 dumpling|🍙 riceball|🍡 skewer|🕐 oclock|🌓 phases|🔢 fractions|📐 perimeter area|📏 width height|🔼 maximum|🔽 minimum|❌ incorrect|🔗 connection|🧳 trip travel|🎈 balloon|🎊 confetti|🪅 pinata|🧨 firework|💥 explosion explode boom|💣 bomb|🔫 weapon|🪂 parachute|⚰️ coffin death|🪦 grave|🌫️ cloudy|🏞️ landscape scenery|🌅 horizon|🐕 beagle poodle labrador bulldog|🐈 tabby|🐎 mare foal|🦬 bison buffalo|🐃 ox oxen|🐂 bull|🦙 llama alpaca|🐏 ram|🦏 rhino rhinoceros|🦛 hippo hippopotamus|🐆 leopard cheetah jaguar panther|🐅 lynx|🦊 foxes|🦨 skunk|🦡 badger|🦫 beaver|🐀 rats|🦥 sloth|🦧 orangutan|🐕‍🦺 pets pet|🐇 hare rabbits|🦐 prawn|🦪 oyster clam mussel|🪼 jellyfish|🐋 humpback orca|🐳 beluga|🦞 crayfish|🪸 coral reef|🐟 minnow bass carp|🐠 clownfish|🦈 sharks|🐢 turtles|🐍 cobra python viper|🦎 iguana chameleon|🐸 frogs|🐲 dragons|🦤 dodo|🦚 peacock|🦜 macaw|🦅 eagles|🦆 ducks|🐦 sparrow robin songbird finch|🐤 chicks|🦢 swans|🪿 goose geese|🐓 chickens|🪽 wing wings|🦋 butterflies|🐛 larvae|🐝 bees|🐜 ants|🪳 cockroach|🦟 mosquitoes|🪰 flies|🐌 snails|🦗 crickets|🪲 beetles|🐞 ladybird|🕷️ tarantula|🦂 scorpions|🪱 earthworms|🐾 paw|🐿️ squirrels|🦔 hedgehogs|🦇 bats|🐻‍❄️ polarbear|🐨 koalas|🐼 pandas|🦘 kangaroos|🐘 elephants|🦒 giraffes|🦓 zebras|🦁 lions|🐯 tigers|🐒 monkeys|🦍 gorillas|🌳 trees|🌲 pinetree redwood sequoia|🌴 palmtree|🎋 bamboo|🎍 reeds|🌾 barley oats rye|🌽 cornfield|🌿 ferns fern moss|🌼 daisy dandelion|🌻 sunflowers|🪷 lotus waterlily|🌺 orchid|🥀 wilted|💐 bouquet|🌱 sapling|🪹 burrow|🪨 gravel|🪵 branch twig trunk bark|🍂 deciduous|🍁 mapleleaf|🍄 mushrooms|🫒 olive|🍋 lemons|🍎 orchard|🍏 greenapple|🍇 vineyard|🥭 mangoes|🫛 pea peas|🍠 sweetpotato|🥜 peanuts|🌰 chestnuts|🍯 honeycomb|🥐 pastry|🥨 pretzel|🥯 bagel|🍘 cracker|🍥 fishcake|🥠 fortunecookie|🍧 shavedice|🍨 gelato|🍮 pudding custard|🍭 lollipop|🍿 popcorns|🧋 bubbletea|🍹 smoothie|🍾 champagne|🥃 whiskey|🍸 cocktail|🍶 sake|🧊 icecube|🥡 takeout|🍱 bento|🍛 curry|🍢 kebab|🥙 pita|🥞 pancakes|🥔 potatoes|🍅 tomatoes|🍌 bananas|🍇 grapevine|🍉 melon|🍈 cantaloupe|🍒 cherries|🍓 strawberries|🥑 avocados|🏔️ plateau mesa butte|🏜️ dune dunes savanna steppe tundra|🌲 taiga|🌴 rainforest jungle tropics|🏞️ meadows wetland swamp marsh pond lake lagoon|🌊 gulf bay strait|🏝️ atoll peninsula cape|🧊 icecap polar arctic antarctic antarctica|🌋 caldera|🪨 granite basalt limestone marble sandstone quartz|💎 crystal crystals|🪙 pennies|🌍 equator latitude longitude|🧭 meridian|🗺️ cartography mapmaking|🌐 gridlines|🌍 europeans|🏜️ oasis|🌥️ cloudcover|☔ raindrops|❄️ snowfall snowflakes|🌎 southamerica northamerica|🇲🇽 aztec|🌴 caribbean|🌋 hawaii|🗻 volcanic|🪐 neptune uranus|☄️ asteroids meteors|🌑 newmoon|🌕 fullmoon|🌒 waxing|🌘 waning|🌗 lunar|🌟 stars|🔭 observatory|🛰️ satellites|🚀 spacecraft shuttle|🧑‍🚀 astronauts|🌌 nebula blackhole|🧑‍🏫 tutor instructor|👩‍🏫 educator|🧑‍🍳 chefs|🧑‍🔧 mechanic|🧑‍🏭 factoryworker|👨‍🌾 farmers|🧑‍💼 businessman manager boss|🧑‍⚕️ surgeon|🧑‍🚀 spaceexplorer|🕵️‍♀️ detectives|🤵 groom|👰 bride|🎅 santa|🧝 elf|🧞 genie|🧌 troll|🦸‍♀️ heroine|🥷 samurai|🧑‍🦯 blindperson|🧑‍🦽 wheelchair|🧑‍🦼 disabled|👪 families|👥 crowds|☝️ pointing|🦾 prosthetic|🧑‍🤝‍🧑 neighbors|🤰 pregnancy|🍼 newborn|💒 wedding|⚰️ funeral|🕊️ doves|🧠 neuron neurons|🧠 cerebellum cortex|🦴 skull spine ribs rib femur|🫀 heartbeat|🫁 diaphragm|🩸 plasma platelets|🩻 xray|🧬 helix|🦠 germs|💊 pills tablet|💉 vaccination|🤮 vomit|🧴 sunscreen|🧼 handwashing|🪥 brushing|🦷 cavity|👁️ retina|👂 eardrum|👃 nostril|🖐️ fingers|🦶 toes|🦵 knee|🦿 limb|💪 muscles|🏃‍♀️ jogging|💃 dancing|🕺 dancer|🤸‍♀️ cartwheel|🧘‍♀️ stretching|🥛|🍞 carbohydrate|🥑 fats|📃 worksheet|📕 hardcover|📗 greenbook|📘 bluebook|📙 orangebook|📓 notebooks|📔 sketchbook|📖 dictionary encyclopedia|✍️ handwriting signature|🖋️ fountainpen ink|🖌️ paintbrush|🖍️ crayons|🎨 watercolor|🎭 actor actress|🎬 director clapperboard|🎤 singer|🎙️ broadcaster|🎧 listening|📻 broadcast|🎼 composer|🎵 lyrics|🎹 pianist|🪕 banjo|🪗 accordion|🪈 flute|🥁 drummer|🎻 cello|🪘 bongo|🔔 chime|🛎️ doorbell|📯 bugle|🎺 horns|🎷 sax|🪇 maracas|🎤 karaoke|🎡 carnival|🎠 carousel|🎢 coaster|🎳 bowling|🎱 billiards|🏑 fieldhockey|🥍 lacrosse|🏹 archery|🛹 skateboarding|🛼 rollerskate|⛷️ skier|🏂 snowboarder|🤺 fencing|🤼 wrestling|🤾 handball|🏌️ golfer|🏊‍♀️ swimmer|🚴‍♀️ cyclist|🧗‍♀️ climber|🪃 boomerang|🧩 puzzles|🪀 yoyo|🎴 cards|🃏 joker|🀄 mahjong|♠️ spades|🧱 masonry|🪨 stonework|🏚️ ruins ruin|🛖 hut|🏠 cabin|🏙️ downtown|🏢 skyscrapers|🏤 postoffice|🏫 schoolhouse|🏛️ parthenon colosseum acropolis|🗼 eiffel|🕌 minaret|🏯 pagodas|🎪 bigtop|🌉 suspension|🛗 elevator|🪞 mirrors|🛏️ bedroom|🍳 kitchen|🛋️ livingroom|🚽 bathroom restroom|🧸 toys|🪆 nesting|🛁 tub|🧺 hamper|🧴 shampoo|🪒 razor|🧷 safetypin|🧹 mop|🪣 bucket|🧻 tissue|🪠 plunger|🧲 magnets|⚖️ scales|🔭 spyglass|⛓️ shackles|🧰 toolkit|🔧 spanner|🪛 screwdriver|⚙️ cogs|🧯 firefighting|🪚 carpenter carpentry|🪓 hatchet lumberjack|🪵 firewood|🚗 automobile sedan|🚙 suv|🚐 van minivan|🚛 semitruck|🚜 farmtractor|🛞 tire tyre|🚨 siren|🚥 stoplight|🛑 stopsign|🛴 kickscooter|🛺 rickshaw|🚡 cablecar|🚠 gondola|🚟 monorail|🚝 maglev|🚃 railcar|🚋 streetcar|🚞 mountainrailway|🚈 lightrail|✈️ airliner|🛫 takeoff|🛬 landing|🛩️ biplane|🪂 skydiving|🚁 chopper|🛶 dugout|🛥️ yacht|⛵ sailing|🚢 steamer|🛟 lifebuoy|⚓ harbor harbour|🧭 northstar|🏗️ cranes|🚧 roadwork|🏺 sarcophagus mummy hieroglyphics hieroglyph|🗿 easterisland|⚔️ gladiator legion legions|🏛️ roman romans rome|🏛️ athens sparta|🏴‍☠️ buccaneer|⛵ mayflower|🏕️ tipi tepee wigwam|🛶 longboat|🪓 viking vikings|⚒️ blacksmith smith|⚖️ courtroom|🗳️ ballots|🏛️ legislature|🏛️ whitehouse|🔔 bellringing|💣 grenade|💥 cannon|🔫 musket rifle|✈️ bomber|🚢 battleship|🪦 tombstone|🎖️ medals|🏛️ monument|🗿 monuments|🏺 relic relics|🛒 groceries|🏪 convenience|🏬 department|🏭 smokestack|⛏️ miner|🔨 craftsman|🧵 textile textiles|🧶 cotton|⚗️ alchemy retort|🧪 reagent|🧫 agar|🔬 magnification|🧬 mutation|🧬 nucleotide|🦠 amoeba paramecium|🦠 plankton|🔌 wires|🔋 batteries|🌩️ thunderbolt|📡 radar|🛰️ gps|🖥️ pc|📠 fax|☎️ rotary|🎞️ filmstrip|📽️ projector|📹 camcorder|🌡️ barometer|⏲️ timer stopwatch|🧮 abacuses|📏 rulers|📐 protractor|🧭 compasses|⚖️ weights|🪝 pendulum|⚙️ flywheel|🛞 axle|🌡️ thermostat|🔥 furnace|🧯 sprinkler|🚰 plumbing pipe pipes|💦 splash|💧 dripping|🌊 flood floods|🪨 clay|🪣 sandbox|🧱 concrete|🏗️ girder|🔩 rivet|🕳️ tunnel|🚇 subway|🚧 barricade|🔢 algebra|📐 trigonometry|📏 centimeters|🧮 arithmetic|📈 graphs|🥧 pie|🔺 triangles|⬛ squareshape|🔷 polygon|⭕ circles|🛑 octagon|⬡ hexagon|⬢ hexagons|🔶 trapezoid|🧊 cubes|🥫 cylinder|🍦 cone|⚽ sphere|🥚 oval|💎 diamonds|🎰 jackpot|🪙 coinflip|📆 datebook|🕑 clockface|⌨️ keyboard|🖱️ trackpad|👲 skullcap|🧕 headscarf|👰 veil|🫏 burro donkey mule|🦣 mammoth|🐦‍🔥 phoenix|🦕 brachiosaurus diplodocus sauropod|🦭 seal|🐡 blowfish|🐝 bumblebee honeybee|🌹 rose|🪻 hyacinth lavender lilac|🫓 flatbread naan|🫔 tamale|🫕 fondue|🍩 doughnut|🍰 shortcake|🥤 straw|🏨 hotel|🌁 foggy|🚎 trolleybus|🛼 skate|🛣️ motorway|🛟 buoy|🛫 departure|🛬 arrival|🚡 tramway|🛸 saucer|🧨 firecracker|🎉 popper|🎎 dolls|🎀 ribbon|🥎 softball|🏓 pong|🛷 sled sleigh|🎯 bullseye target|🎨 palette|👔 necktie|👕 t-shirt|👘 kimono|🥻 sari|💄 lipstick|🔇 speaker|📣 megaphone|🎚️ slider|🎧️ headphone|🪊 trombone|🪉 harp|🖲️ trackball|💡 bulb|📒 ledger|📜 scroll|💴 banknote|📝 memo|💼 briefcase|🗂️ dividers|🗒️ notepad|📈 increasing|📉 decreasing|📌 pushpin|🗑️ wastebasket|🔒️ locked|🔓️ unlocked|🦯 cane|🪏 shovel|🩼 crutch|🛁 bathtub|🫧 bubbles|🇦🇩 andorra|🇦🇫 afghanistan|🇦🇮 anguilla|🇦🇱 albania|🇦🇲 armenia|🇦🇴 angola|🇦🇷 argentina|🇦🇹 austria|🇦🇼 aruba|🇦🇿 azerbaijan|🇧🇧 barbados|🇧🇩 bangladesh|🇧🇪 belgium|🇧🇬 bulgaria|🇧🇭 bahrain|🇧🇮 burundi|🇧🇯 benin|🇧🇲 bermuda|🇧🇳 brunei|🇧🇴 bolivia|🇧🇸 bahamas|🇧🇹 bhutan|🇧🇼 botswana|🇧🇾 belarus|🇧🇿 belize|🇨🇭 switzerland|🇨🇱 chile|🇨🇲 cameroon|🇨🇴 colombia|🇨🇺 cuba|🇨🇾 cyprus|🇨🇿 czechia|🇩🇯 djibouti|🇩🇰 denmark|🇩🇲 dominica|🇩🇿 algeria|🇪🇨 ecuador|🇪🇪 estonia|🇪🇷 eritrea|🇪🇹 ethiopia|🇫🇮 finland|🇫🇯 fiji|🇫🇲 micronesia|🇬🇦 gabon|🇬🇩 grenada|🇬🇬 guernsey|🇬🇭 ghana|🇬🇮 gibraltar|🇬🇱 greenland|🇬🇲 gambia|🇬🇵 guadeloupe|🇬🇹 guatemala|🇬🇺 guam|🇬🇾 guyana|🇭🇳 honduras|🇭🇷 croatia|🇭🇹 haiti|🇭🇺 hungary|🇮🇩 indonesia|🇮🇪 ireland|🇮🇱 israel|🇮🇶 iraq|🇮🇷 iran|🇮🇸 iceland|🇯🇲 jamaica|🇰🇪 kenya|🇰🇬 kyrgyzstan|🇰🇭 cambodia|🇰🇮 kiribati|🇰🇲 comoros|🇰🇼 kuwait|🇰🇿 kazakhstan|🇱🇦 laos|🇱🇧 lebanon|🇱🇮 liechtenstein|🇱🇷 liberia|🇱🇸 lesotho|🇱🇹 lithuania|🇱🇺 luxembourg|🇱🇻 latvia|🇱🇾 libya|🇲🇦 morocco|🇲🇨 monaco|🇲🇩 moldova|🇲🇪 montenegro|🇲🇬 madagascar|🇲🇱 mali|🇲🇳 mongolia|🇲🇶 martinique|🇲🇷 mauritania|🇲🇸 montserrat|🇲🇹 malta|🇲🇺 mauritius|🇲🇻 maldives|🇲🇼 malawi|🇲🇾 malaysia|🇲🇿 mozambique|🇳🇦 namibia|🇳🇬 nigeria|🇳🇮 nicaragua|🇳🇱 netherlands|🇳🇴 norway|🇳🇵 nepal|🇳🇷 nauru|🇳🇺 niue|🇴🇲 oman|🇵🇦 panama|🇵🇪 peru|🇵🇭 philippines|🇵🇰 pakistan|🇵🇱 poland|🇵🇹 portugal|🇵🇼 palau|🇵🇾 paraguay|🇶🇦 qatar|🇷🇴 romania|🇷🇸 serbia|🇷🇼 rwanda|🇸🇨 seychelles|🇸🇩 sudan|🇸🇪 sweden|🇸🇬 singapore|🇸🇮 slovenia|🇸🇰 slovakia|🇸🇳 senegal|🇸🇴 somalia|🇸🇷 suriname|🇸🇾 syria|🇸🇿 eswatini|🇹🇬 togo|🇹🇭 thailand|🇹🇯 tajikistan|🇹🇰 tokelau|🇹🇲 turkmenistan|🇹🇳 tunisia|🇹🇴 tonga|🇹🇻 tuvalu|🇹🇼 taiwan|🇹🇿 tanzania|🇺🇦 ukraine|🇺🇬 uganda|🇺🇾 uruguay|🇺🇿 uzbekistan|🇻🇪 venezuela|🇻🇳 vietnam|🇻🇺 vanuatu|🇼🇸 samoa|🇽🇰 kosovo|🇾🇪 yemen|🇾🇹 mayotte|🇿🇲 zambia|🇿🇼 zimbabwe|🌰 almond|🍆 aubergine|🐫 bactrian|🎱 billiard|🧫 biology|👚 blouse|🧋 boba|🥉 bronze|🧮 calculation|🫑 capsicum|🧆 chickpea meatball|🪮 comb|🐚 conch|🐦‍⬛ crow raven|🪥 dental|👖 denim trousers|🐪 dromedary|🫛 edamame|🐌 escargot|🎡 ferris|🌭 frankfurter|🫚 ginger|🥙 gyro|🐣 hatching|🦘 joey|🥋 judo|🥬 kale|🦟 malaria|💰️ moneybag|🕌 masjid|🗿 moyai|📿 necklace|🥣 oatmeal|🥘 paella|🥒 pickle|🧺 picnic|🪶 plumage|🫜 radish turnip|🎒 rucksack satchel|📷️ selfie|🦐 shellfish|🏸 shuttlecock|🤿 snorkeling|🧵 spool|🧦 stocking|🍵 teacup|🗼 tokyo|🎩 tophat|🦖 tyrannosaurus|🌪️ whirlwind|🛖 yurt|🦢 cygnet|☕️ cafe caffeine|🐾 animal animals wildlife creature creatures|🤧 sneeze sneezing sneezes cough coughing coughs allergy allergies|🤒 fever sick sickness illness|😟 worried worry nervous anxious|😌 calm relaxed peaceful|🧘 mindfulness meditation meditate yoga|💗 kindness caring|🎲 game games dice probability|⚽ sport sports soccer|🏀 basketball|⚾ baseball|🏈 football|🎾 tennis|🏊 swimming swim swimmer|🏃 running runner jogging|💃 dance dancing dancer dancers|📄 paper worksheet worksheets|👦 brother brothers|👧 sister sisters|💼 job jobs career careers|🛒 consumer consumers shopping shopper customer customers|🎉 holiday holidays celebration celebrations|🔤 spelling vocabulary|💥 onomatopoeia|🌻 garden gardens sunflower sunflowers|🪲 exoskeleton beetle beetles|🐣 hatch hatches hatched hatching hatchling hatchlings|⛽ fuel fuels gasoline|🦎 camouflage lizard lizards|🧲 attract attraction|🦴 skeletal|🩸 blood|🌋 eruption";
  var EMOJI_LIB = {};
  EMOJI_LIB_SRC.split("|").forEach(function(row){
    var p = row.split(" "), e = p[0];
    for (var i = 1; i < p.length; i++) if (!EMOJI_LIB[p[i]]) EMOJI_LIB[p[i]] = e;
  });
  // Found by replaying recorded lessons through the app. These words are nearly always meant another way in real teaching
  // ("kind of", "I saw", "good job", "watch this", "one more time", "the steps"), so they get no picture unless a teacher picks one.
  var NEVER = {};
  ("time kind kinds saw job deal deals watch minimum maximum rich department religion religions culture cultures crossing bronze mechanics " +
   "death card cards steps plate plates").split(" ").forEach(function(w){ NEVER[w] = 1; delete WORD_TO_ICON[w]; delete EMOJI_LIB[w]; });
  Object.keys(VOCAB).forEach(function(k){ VOCAB[k] = VOCAB[k].filter(function(w){ return !NEVER[w]; }); });
  // ...and better pictures for words real lessons use a lot ("letter" in phonics is the ABC, not mail)
  var REMAP = {
    letter: "m:🔤", letters: "m:🔤", spell: "m:🔤", spells: "m:🔤", colonies: "i:map", colony: "i:map", colonial: "i:map", tablet: "i:phone", tablets: "i:phone",
    lake: "i:lake", lakes: "i:lake", pond: "i:lake", ponds: "i:lake", shell: "m:🐚", shells: "m:🐚", seashell: "m:🐚", screen: "i:computer", screens: "i:computer",
    ground: "i:soil", physics: "i:atom", pluto: "i:planet", syllable: "m:👏", syllables: "m:👏", clap: "m:👏", clapping: "m:👏",
    military: "i:helmet", society: "i:group", societies: "i:group", bond: "m:🔗", bonds: "m:🔗", magic: "m:🪄", distance: "i:ruler", zero: "i:numbers",
    species: "m:🐾", electrical: "i:bolt", container: "i:bottle", containers: "i:bottle", bubble: "m:🫧", chimp: "i:monkey", chimps: "i:monkey",
    dream: "m:💭", dreams: "m:💭", male: "m:♂️", males: "m:♂️", female: "m:♀️", females: "m:♀️", research: "i:magnifier", researching: "i:magnifier",
    weigh: "i:scale", weighs: "i:scale", weighing: "i:scale", displacement: "i:beaker",
    discussion: "i:speech", discussions: "i:speech", discuss: "i:speech", claim: "i:speech", claims: "i:speech", language: "i:speech", languages: "i:speech",
    nitrogen: "i:atom", hydrogen: "i:atom", helium: "i:atom", valence: "i:atom", octet: "i:atom", octets: "i:atom",
    gamete: "i:dna", gametes: "i:dna", meiosis: "i:dna", haploid: "i:dna", diploid: "i:dna", genotype: "i:dna", genotypes: "i:dna", phenotype: "i:dna",
    phenotypes: "i:dna", allele: "i:dna", alleles: "i:dna", genome: "i:dna", genomes: "i:dna", codon: "i:dna", codons: "i:dna", offspring: "m:👶",
    bonobo: "i:monkey", bonobos: "i:monkey", compete: "i:trophy", competition: "i:trophy", competing: "i:trophy",
    dendrite: "m:🧠", dendrites: "m:🧠", neurotransmitter: "m:🧠", neurotransmitters: "m:🧠", psychology: "i:brain", mental: "i:brain",
    aristocracy: "i:crown", gentry: "i:crown", nobility: "i:crown", elite: "i:crown", elites: "i:crown", succession: "i:crown", inflation: "m:📈",
    taxation: "i:coins", silver: "i:coins", coinage: "i:coins", economics: "i:coins", payoff: "i:coins", payoffs: "i:coins", frontier: "i:map", edict: "i:scroll",
    contract: "i:scroll", contracts: "i:scroll", bureaucracy: "i:columns", administration: "i:columns", invasion: "i:swords", invasions: "i:swords",
    invade: "i:swords", invaded: "i:swords", invaders: "i:swords", troops: "i:helmet", barbarian: "i:helmet", barbarians: "i:helmet",
    rhine: "i:river", danube: "i:river", nile: "i:river", amazon: "i:river", mississippi: "i:river", thames: "i:river", yangtze: "i:river", ganges: "i:river",
    wilderness: "i:forest", verse: "i:quill", verses: "i:quill", firms: "i:factory", strategy: "m:♟️", strategies: "m:♟️", strategic: "m:♟️",
    rings: "m:🪐", voyager: "i:satellite", units: "i:ruler", formula: "i:equals", formulas: "i:equals", position: "m:📍", upset: "i:sad", mowing: "i:grass"
  };
  Object.keys(REMAP).forEach(function(w){
    var v = REMAP[w];
    delete WORD_TO_ICON[w]; delete EMOJI_LIB[w];
    if (v.slice(0, 2) === "i:" && I[v.slice(2)]) WORD_TO_ICON[w] = v.slice(2);
    else if (v.slice(0, 2) === "m:") EMOJI_LIB[w] = v.slice(2);
  });
  // Generic words ("people", "a good question", "great idea", "I'd love to") can join a picture of something else, but never make one alone.
  var WEAK = {};
  ("people person persons man men woman women guy guys kid kids child children boy boys girl girls student students teacher teachers friend friends " +
   "everybody everyone human humans adult adults mom dad mother father parents family families professor question questions problem problems " +
   "idea ideas thinking think mind minds number numbers story stories game games school classroom hand hands love loves page pages paper list " +
   "picture pictures book books region community choose chose choosing image images").split(" ").forEach(function(w){ WEAK[w] = 1; });

  var ICON_SETTING = {};
  [["sky", "sun cloud rain vapor bird"], ["sea", "drop wave fish ship"], ["land", "river mountain tree sprout flower leaf volcano apple gravity"],
   ["space", "rocket planet moon star"], ["bio", "cell dna virus brain heart"],
   ["lab", "atom magnet bolt gear lever robot bulb flask chart clock snowflake flame"],
   ["history", "crown castle scroll swords dove coins flag fist columns ballot pyramid map compass quill newspaper handshake"],
   ["sky", "rainbow wind tornado storm plane"], ["sea", "island whale"],
   ["land", "rock fossil cactus earthquake bee butterfly caterpillar cocoon egg frog dinosaur rabbit fox grass mushroom wheat farm bridge carrot"],
   ["space", "comet telescope satellite"], ["bio", "bone tooth eye ear hand lungs stomach muscle pill shield"],
   ["lab", "thermometer battery plug sound prism microscope beaker scale ramp pulley spring oxygen co2 sugar"],
   ["town", "car train city factory house wall"], ["math", "pizza whole half slice triangle square circle cube ruler numbers"],
   ["class", "pencil speech question magnifier puzzle trophy calendar palette note computer phone envelope bed soap book"]].forEach(function(row){
    row[1].split(" ").forEach(function(k){ ICON_SETTING[k] = row[0]; });
  });
  [["land", "dog cat horse cow pig sheep chicken duck elephant lion bear monkey snake turtle spider ant owl giraffe deer mouse squirrel snail nest forest jungle lake waterfall cave canyon sandy tent campfire web stars"],
   ["sea", "shark octopus crab penguin jellyfish dolphin coral iceberg igloo lighthouse sailboat anchor vikingship"],
   ["sky", "parachute helicopter kite balloon sunrise newmoon fullmoon crescent"],
   ["lab", "testtube petri solar turbine dam recycle trash pendulum lens earthlayers crystal syringe stethoscope bandage kidneys skeleton skull heartbeat nose mouth"],
   ["history", "knight throne helmet cannon bowarrow wagon statue torch amphora printing telegraph oilrig liberty treasure windmill wheelbarrow"],
   ["town", "bus bicycle tractor school door window mailbox bucket"],
   ["math", "plus minus times divide equals percent angle numberline hexagon pentagon diamond oval cylinder cone sphere piechart"],
   ["class", "key lock umbrella scissors hammer wrench ladder lamp candle chair table cup bottle bowl fork shoe shirt hat glasses backpack gift bell camera headphones guitar piano drum trumpet violin paintbrush hourglass eraser graduation notebook clipboard stamp microphone flashlight toolbox thread bread cheese milk banana orange grapes strawberry tomato corn ricebowl cake cookie soup meat happy sad angry surprised sleepy idea2 thumbsup"]].forEach(function(row){
    row[1].split(" ").forEach(function(k){ ICON_SETTING[k] = row[0]; });
  });
  var SETTING_ORDER = ["space", "bio", "history", "sea", "land", "town", "sky", "math", "class", "lab"];
  var SETTINGS = ["sky", "land", "sea", "space", "bio", "lab", "history", "town", "math", "class", "plain"];
  [["class", "glue locker stairs pillow blanket towel mittens pajamas nail drill easel stage mask puppet choir orchestra quiz video website password switch dumbbell"],
   ["town", "playground roof fence submarine mailbag siren seatbelt"],
   ["land", "dragonfly bat drought shadow"], ["math", "symmetry pattern decimal speedometer"],
   ["lab", "compost vitamin echo"], ["space", "orbit rotation"], ["sky", "weather"], ["town", "piggybank"],
   ["class", "punctuation chalkboard variable tally"], ["math", "shapes lines pi"], ["land", "soil migration hibernate greenhouse"], ["bio", "liver intestines feelings"],
   ["lab", "friction dissolve wedge"], ["sky", "atmosphere"]].forEach(function(row){
    row[1].split(" ").forEach(function(k){ ICON_SETTING[k] = row[0]; });
  });

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
  ("home homes shelter place places setting settings day days week weeks month months year years season seasons date " +
   "word words opinion talk talks piece pieces air class rest record").split(" ").forEach(function(w){ LOOSE[w] = 1; });
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
    return null;
  }
  function labelOf(raw){
    var t = String(raw).replace(/[^A-Za-z0-9'\-]/g, "").replace(/'s$/i, "");
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
      var copy = { icon: c.icon, emoji: c.emoji, key: c.key, label: c.label, at: c.at != null ? c.at : c.i };
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
  function ruleCaption(sc, raw){
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
  // A word whose picture depends on the rest of the lesson: "brush your teeth", "spring" the season or the coil, "3 times 4".
  function cueSet(s){ var o = {}; s.split(" ").forEach(function(w){ o[w] = 1; }); return o; }
  var TEETH = cueSet("teeth tooth toothbrush toothpaste floss dentist"),
      PHYS = cueSet("force forces stretch stretched compress compressed mass bounce coil push pull weight newton energy"),
      CHEM = cueSet("dissolve dissolves dissolved mixture mixtures liquid liquids salt sugar chemical chemicals acid concentration"),
      LOUD = cueSet("loud louder quiet quieter sound sounds music speaker hear hearing noise"),
      SKY = cueSet("planet planets star stars rocket rockets astronaut astronauts orbit moon sun galaxy outer satellite"),
      MUSIC = cueSet("music song songs sing singing melody piano notes rhythm instrument"),
      // speech recognizers sometimes write the wrong homophone; where it sits in the sentence usually gives it away
      MODAL = cueSet("to will can could would should must might may gonna wanna not never always just also cant wont dont didnt ill youll well theyll lets"),
      WHO = cueSet("i you he she it we they who everybody nobody somebody someone everyone"),
      PREP = cueSet("of in to for with around from on at about into"), BE = cueSet("is are was were be been am"),
      BONDS = cueSet("lone unshared shared electron electrons bond bonds atom atoms carbon nitrogen oxygen hydrogen"),
      HOMO_NEXT = cueSet("a an the you your it its we they i he she that this what how if or to not careful patient positive kind nice happy quiet ready able sure"),
      BRAIN = cueSet("brain brains neuron neurons mental psychology cortex nerve nerves"),
      STORY = cueSet("story stories character characters book books setting author chapter climax conflict resolution events reader readers ending"),
      NUM_WORD = cueSet("zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty thirty forty fifty hundred");
  function isNum(t){ return t != null && (/^\d/.test(t) || !!NUM_WORD[normalize(t)]); }
  function contextual(w, i, raw, cues){
    var pv = normalize(raw[i - 1] || ""), nx = normalize(raw[i + 1] || "");
    function em(e){ return { emoji: e, key: "m:" + e }; }
    function ic(k){ return { icon: k, key: "i:" + k }; }
    switch (w){
      case "brush": case "brushing": return hasCue(cues, TEETH) ? em("🪥") : undefined;
      case "spring": case "springs": return hasCue(cues, PHYS) ? undefined : em("🌸");
      case "solution": case "solutions": return hasCue(cues, CHEM) ? undefined : null;
      case "volume": return hasCue(cues, LOUD) ? em("🔊") : ic("beaker");
      case "space": return hasCue(cues, SKY) ? ic("rocket") : null;
      case "note": return hasCue(cues, MUSIC) ? undefined : null;
      case "plot": return hasCue(cues, STORY) ? undefined : null;
      case "capital": return raw[i + 1] && (/^[a-z]$/i.test(raw[i + 1]) || /^letters?$/i.test(raw[i + 1])) ? em("🔠") : null;
      case "times": return isNum(raw[i - 1]) && isNum(raw[i + 1]) ? ic("times") : null;
      case "feet": case "foot": case "inch": case "inches": case "yard": case "yards": return isNum(raw[i - 1]) ? ic("ruler") : undefined;
      case "pound": case "pounds": return isNum(raw[i - 1]) ? ic("scale") : null;
      case "bee": case "bees": return MODAL[pv] || HOMO_NEXT[nx] ? null : undefined;                  // "to bee positive"
      case "sea": return MODAL[pv] || WHO[pv] || HOMO_NEXT[nx] ? null : undefined;                    // "i'll sea you"
      case "wood": return WHO[pv] || WHO[nx] || nx === "like" || nx === "be" ? null : undefined;         // "wood you like", "we wood say"
      case "hour": return PREP[pv] ? null : undefined;                                                   // "outside of hour window"
      case "mail": return BE[pv] ? null : undefined;                                                     // "if you were mail"
      case "knight": return pv === "good" ? null : undefined;                                            // "good knight"
      case "pear": case "pears": return nx === "of" || hasCue(cues, BONDS) ? null : undefined;           // "a pear of shoes", "a lone pear"
      case "weather": return HOMO_NEXT[nx] || nx === "your" || nx === "or" ? null : undefined;          // "weather you like it"
      case "peace": return nx === "of" ? null : undefined;                                               // "a peace of paper"
      case "nose": return WHO[pv] || HOMO_NEXT[nx] ? null : undefined;                                  // "jill nose that"
      case "charge": case "charges": case "charged": return normalize(raw[i - 1] || "") === "in" ? null : ic("bolt");
      case "hemisphere": case "hemispheres": return hasCue(cues, BRAIN) ? ic("brain") : ic("globe");
    }
    return undefined;
  }
  // Fraction pictures (pizza, halves...) only make sense in a maths sentence; "the whole cycle" must not show a pizza.
  var MATH_ONLY = { whole: 1, half: 1, slice: 1, pizza: 1 };
  var MATH_CUES = { fraction: 1, fractions: 1, equal: 1, equally: 1, parts: 1, part: 1, numerator: 1, denominator: 1, divide: 1, divided: 1, pizza: 1, pie: 1, cut: 1, third: 1, thirds: 1, fourth: 1, fourths: 1, fifth: 1, fifths: 1, eighth: 1, eighths: 1, quarter: 1, quarters: 1, halves: 1, slices: 1 };
  function hasMathCue(norm){ for (var k = 0; k < norm.length; k++) if (MATH_CUES[norm[k]] || MATH_CUES[norm[k].replace(/s$/, "")]) return true; return false; }
  var COMPUTER_CUES = { computer: 1, keyboard: 1, screen: 1, click: 1, laptop: 1, cursor: 1, code: 1, internet: 1, monitor: 1, tablet: 1 };
  function hasCue(norm, cues){ for (var k = 0; k < norm.length; k++) if (cues[norm[k]]) return true; return false; }
  // "Rosa Parks" must not draw a park and "Martin Luther King" must not draw a crown: runs of capitalised words are names.
  var NAME_SKIP = { the: 1, a: 1, an: 1, in: 1, on: 1, at: 1, of: 1, and: 1, ancient: 1, modern: 1, early: 1, great: 1, many: 1, some: 1, when: 1, then: 1, today: 1, now: 1, this: 1, that: 1, these: 1, those: 1, every: 1, each: 1, after: 1, before: 1, during: 1, as: 1, if: 1, but: 1, so: 1, with: 1, for: 1, from: 1 };
  var TOPIC_WORD = /(ial|ian|ish|ese|ern|ic|al)$|^(civil|cold|world|great|new|old|ancient|solar|middle|dark|stone|bronze|iron|ice|gold)$/;
  function isCap(raw, norm, i){ return i >= 0 && i < raw.length && /^[A-Z]/.test(raw[i].replace(/^[^A-Za-z]+/, "")) && !NAME_SKIP[norm[i]]; }
  function isName(raw, norm, i){
    if (!isCap(raw, norm, i)) return false;
    var a = i, z = i;
    while (isCap(raw, norm, a - 1)) a--;
    while (isCap(raw, norm, z + 1)) z++;
    if (z === a) return false;
    // topic phrases ("Industrial Revolution", "French Revolution", "Cold War") are not people
    for (var j = a; j <= z; j++) if (TOPIC_WORD.test(norm[j])) return false;
    return true;
  }
  // Speech-to-text often loses capitals ("rosa parks"), so also treat a known first name, or a title like "mr",
  // and the one or two words after it as a name. A middle name or initial carries on ("martin luther king", "susan b anthony").
  var FIRST_NAMES = {}, NAME_TITLES = { mr: 1, mrs: 1, ms: 1, miss: 1, dr: 1 }, NAME_STOP = {};
  ("abigail abraham ada addison ahmed aiden aisha albert alejandro alexander alexandre ali amara amelia amir ana andrew anne anthony antonio arjun aubrey ava barack benjamin betsy booker caleb camila carlos cesar charles charlotte chiara chloe christopher clara claudette daniel darnell david deshawn diego dolores dylan edgar eleanor elijah elizabeth ella emily emma emmanuel eric ethan evelyn fatima florence francis frederick frida gabriel gabriela george giulia graham greta hannah hans harper harriet helen henry hiroshi ida imani isaac isabella isaiah jackie jacob jacques jamal james jane jayden jean jesse joan johann john jonathan jose joseph joshua juan julius katherine keisha kenji kofi kwame langston latoya layla leah leonardo liam logan lorenzo louis lucas lucia lucy ludwig luis luke luther madison mahatma malala malcolm margaret maria marie martin mary matteo mei mia michael miguel mohammed mohandas muhammad natalie nathan neil nelson nikola noah nora oliver olivia omar orville owen pablo patrick paul peter phillis pierre priya richard robert ronald rosa ruby ruth ryan sally salvador samuel sandra sarah shanice sofia sojourner sonia sophia stella steve susan theodore thomas thurgood tyrone ulysses valentina vincent walt wangari wei wilbur william winston wolfgang yusuf zoe zora").split(" ").forEach(function(w){ FIRST_NAMES[w] = 1; });
  ("he she they it we you i his her their our my me him them who whose which what where why how is was were are be been am has have had " +
   "do does did can could will would should may might must said says went goes got saw came comes lived lives born also not never always just " +
   "very too so but or because with to for from by as if than about like up down out over under into and the a an in on at of when then " +
   "this that these those today now there here look see").split(" ").forEach(function(w){ NAME_STOP[w] = 1; });
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
    var cues = context && context.words ? norm.concat(context.words) : norm, names = spokenNames(raw, norm);
    var concepts = [], rels = [];
    for (i = 0; i < n; i++){
      var w = norm[i];
      if (w === "into") continue;
      if (RELATION[w]){ rels.push({ i: i, type: RELATION[w] }); continue; }
      if (names[i] || isName(raw, norm, i)) continue;
      var c = conceptFor(w, extra), cx = extraConcept(w, extra) === undefined ? contextual(w, i, raw, cues) : undefined;
      if (cx !== undefined) c = cx;
      if (c && (c.emoji === "🐭" || c.icon === "mouse") && hasCue(cues, COMPUTER_CUES)) c = { emoji: "🖱️", key: "m:🖱️" };
      if (c && MATH_ONLY[c.icon] && !hasMathCue(cues)) c = null;
      if (c) concepts.push({ i: i, icon: c.icon, emoji: c.emoji, key: c.key, label: labelOf(raw[i]), weak: !!WEAK[w] && extraConcept(w, extra) === undefined });
    }
    for (i = 0; i < n; i++){
      if (norm[i] !== "into") continue;
      var pb = null;
      rels.forEach(function(r){ if (r.type === "becomes" && r.i < i && i - r.i <= 5) pb = r; });
      if (pb){ pb.objStart = i + 1; pb.into = true; }
      else if (!rels.some(function(r){ return r.i < i && i - r.i <= 3; })) rels.push({ i: i, type: "becomes", bare: true });
    }
    rels.sort(function(a, b){ return a.i - b.i; });

    var scene = emptyScene();
    if (!concepts.some(function(c){ return !c.weak; })) return scene;
    scene.show = true;
    function verbText(r){ return r.bare ? "turns into" : labelOf(raw[r.i]).toLowerCase() + (r.into ? " into" : ""); }
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
          objs = uniq(objWin).slice(0, 2);
          // live talk: "...and then it makes a chrysalis" - "it" is the last thing talked about
          if (!subs.length && context && context.subject){
            for (var p = prevI + 1; p < r.i; p++) if (PRONOUN[norm[p]]){
              var cs = context.subject;
              subs = [{ icon: cs.icon, emoji: cs.emoji, key: cs.key, label: cs.label, at: p }];
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
      else { var c = conceptFor(normalize(key), extra); if (c) item = { icon: c.icon, emoji: c.emoji, key: c.key }; }
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
  // OpenMoji artwork (CC BY-SA 4.0), loaded after first paint; until then, or if it cannot load, the system emoji is used.
  var OM = null;
  function omKey(e){ return String(e).replace(/\uFE0F/g, ""); }
  function emojiBadge(e){
    var art = OM && OM[omKey(e)];
    if (art) return circ(50, 50, 40, "#FFFDF6", 2) + '<g transform="translate(13,13) scale(1.03)">' + art + '</g>';
    return circ(50, 50, 38, "#FFFDF6") + '<text x="50" y="53" text-anchor="middle" dominant-baseline="middle" font-size="44" font-family="' + EMOJI_FONT + '">' + esc(e) + '</text>';
  }
  function iconArt(item){ return item.icon && I[item.icon] ? I[item.icon] : emojiBadge(item.emoji || "❓"); }
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
  function dI(k, x, y, s){ return I[k] ? sub(I[k], x, y, s / 100) : ""; }
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

  // ----- science -----
  dgm("watercycle", "The water cycle", "sky", ["water cycle", "hydrologic cycle"], {
    evaporation: [[44, 80, 112, 76], "evaporation,evaporate,evaporates,evaporated,evaporating"],
    condensation: [[64, 4, 200, 78], "condensation,condense,condenses,condensed,cloud,clouds"],
    precipitation: [[200, 60, 118, 76], "precipitation,rain,rains,raining,snow,sleet,hail"],
    collection: [[96, 158, 170, 42], "collection,collects,collect,runoff,groundwater"]
  }, function(){
    return [
      pth("M0 160 Q20 154 40 160 T80 160 T120 160 T160 162 V200 H0 Z", "#8CC4E8", { w: 2.5 }) +
        pth("M150 200 V166 Q182 158 214 160 L268 102 L314 160 Q318 161 320 161 V200 Z", "#B9DBA0", { w: 2.5 }) +
        poly([[268, 102], [258, 114], [268, 110], [278, 114]], "#FFFFFF", 2) +
        pth("M262 132 C250 156 218 170 166 178", "none", { stroke: "#8CC4E8", w: 5 }),
      dI("sun", 36, 36, 58),
      dA(92, 152, 150, 72, "#E06D3A", -14) + dA(70, 152, 120, 82, "#E06D3A", -10, 2.5) + dL("evaporation", 58, 124, 14),
      dI("cloud", 196, 42, 74) + dL("condensation", 118, 20, 14),
      [210, 224, 238].map(function(x){ return ln(x, 66, x - 5, 84, "#3F7FAF", 2.5); }).join("") + dA(250, 70, 270, 96, "#3F7FAF", 6) + dL("precipitation", 262, 128, 14),
      dA(214, 182, 128, 186, "#3F7FAF", 0, 3) + dL("collection", 168, 198, 13)
    ];
  });
  dgm("plantparts", "Parts of a plant", "plain", ["parts of a plant", "plant parts", "parts of the plant", "parts of plants"], {
    flower: [[116, 6, 150, 62], "flower,flowers,petal,petals,bloom"],
    leaf: [[34, 66, 150, 50], "leaf,leaves"],
    stem: [[138, 92, 120, 32], "stem,stems,stalk"],
    roots: [[110, 146, 150, 52], "root,roots"]
  }, function(){
    var petals = "";
    for (var k = 0; k < 6; k++){ var pp = polar(150, 38, 13, k * Math.PI / 3); petals += circ(pp[0], pp[1], 10, "#F29BB5", 2.5); }
    return [
      rct(0, 136, 320, 64, "#C9A27A", 0, 0) + ln(0, 136, 320, 136, INK, 2.5),
      pth("M150 136 C150 150 140 162 126 178 M150 140 C152 160 152 172 150 190 M150 138 C158 152 170 160 180 176 M140 156 L130 160 M154 170 L164 172", "none", { stroke: "#8A5A3C", w: 3.5 }) + dLead(172, 170, 210, 176) + dL("roots", 232, 182, 15),
      pth("M150 136 V50", "none", { stroke: "#4F9D78", w: 6 }) + dLead(153, 108, 206, 108) + dL("stem", 226, 113, 15),
      pth("M150 104 C130 84 104 86 92 96 C108 110 132 112 150 104 Z", "#7BB662") + pth("M150 84 C170 64 196 66 206 76 C190 90 168 92 150 84 Z", "#7BB662") + dLead(108, 96, 74, 92) + dL("leaf", 56, 96, 15),
      petals + circ(150, 38, 9, "#F6C343", 2.5) + dLead(166, 30, 212, 26) + dL("flower", 236, 31, 15)
    ];
  });
  dgm("butterflylife", "Life cycle of a butterfly", "land", ["life cycle of a butterfly", "butterfly life cycle", "butterfly's life cycle", "metamorphosis"], {
    egg: [[118, 6, 84, 84], "egg,eggs"], caterpillar: [[216, 60, 100, 84], "caterpillar,caterpillars,larva,larvae"],
    chrysalis: [[118, 118, 84, 82], "chrysalis,pupa,cocoon"], butterfly: [[6, 60, 104, 84], "butterfly,butterflies,adult"]
  }, function(){
    return loop4([[dI("egg", 160, 38, 44), "egg"], [dI("caterpillar", 262, 98, 56), "caterpillar"], [dI("cocoon", 160, 154, 50), "chrysalis"], [dI("butterfly", 58, 98, 58), "butterfly"]]);
  });
  dgm("froglife", "Life cycle of a frog", "sea", ["life cycle of a frog", "frog life cycle", "frog's life cycle"], {
    eggs: [[118, 6, 84, 84], "egg,eggs,frogspawn"], tadpole: [[216, 60, 100, 84], "tadpole,tadpoles"],
    froglet: [[118, 118, 84, 82], "froglet,froglets,legs"], frog: [[6, 60, 104, 84], "frog,frogs,adult"]
  }, function(){
    var eggs = "";
    [[150, 30], [162, 26], [172, 34], [156, 42], [168, 46], [146, 46], [178, 46]].forEach(function(p){ eggs += circ(p[0], p[1], 6, "#DDEFF7", 2) + circ(p[0], p[1], 2.2, INK, 0); });
    var tad = ell(254, 98, 12, 9, "#5B6B4A") + pth("M266 98 C278 90 284 104 296 96", "none", { stroke: "#5B6B4A", w: 4 }) + circ(250, 95, 2, "#FFFFFF", 0);
    var froglet = ell(160, 152, 14, 10, "#7BB662") + pth("M172 156 C182 158 186 166 196 162", "none", { stroke: "#7BB662", w: 3 }) + pth("M150 160 L144 170 M168 160 L172 170", "none", { stroke: INK, w: 2.5 }) + circ(154, 146, 3, "#FFFFFF", 1.5) + circ(164, 146, 3, "#FFFFFF", 1.5);
    return loop4([[eggs, "eggs"], [tad, "tadpole"], [froglet, "froglet"], [dI("frog", 58, 98, 56), "frog"]]);
  });
  dgm("plantlife", "Life cycle of a plant", "land", ["life cycle of a plant", "plant life cycle", "plant's life cycle", "life cycle of plants"], {
    seed: [[118, 6, 84, 84], "seed,seeds"], sprout: [[216, 60, 100, 84], "sprout,sprouts,seedling,germinate,germination"],
    plant: [[118, 118, 84, 82], "plant,grows,adult"], flower: [[6, 60, 104, 84], "flower,flowers,fruit,pollination"]
  }, function(){
    var seed = ell(160, 34, 14, 9, "#B07A3C", 2.5, ' transform="rotate(-20 160 34)"') + pth("M152 36 C158 30 166 30 170 32", "none", { stroke: "#7A4F28", w: 1.5 });
    return loop4([[seed, "seed"], [dI("sprout", 262, 96, 58), "sprout"], [dI("tree", 160, 150, 56), "plant"], [dI("flower", 58, 96, 58), "flower"]]);
  });
  dgm("foodchain", "A food chain", "land", ["food chain", "food web", "food chains", "food webs"], {
    sun: [[4, 30, 64, 92], "sun,energy,sunlight"], producer: [[68, 30, 76, 104], "producer,producers,plant,plants,grass"],
    herbivore: [[146, 30, 78, 104], "herbivore,herbivores,consumer,consumers,prey,rabbit"],
    carnivore: [[226, 30, 92, 104], "carnivore,carnivores,predator,predators,fox"],
    decomposer: [[200, 132, 118, 66], "decomposer,decomposers,fungi,fungus,mushroom,decompose"]
  }, function(){
    return [
      dI("sun", 36, 70, 50) + dL("sun", 36, 112, 14),
      dA(62, 70, 80, 70, "#E9A23B", 0, 3) + dI("grass", 108, 72, 52) + dL("producer", 108, 116, 13),
      dA(134, 70, 156, 70, INK, 0, 3) + dI("rabbit", 186, 70, 54) + dL("herbivore", 186, 116, 13),
      dA(212, 70, 234, 70, INK, 0, 3) + dI("fox", 270, 70, 58) + dL("carnivore", 270, 116, 13),
      dA(268, 112, 252, 146, "#8A5A3C", 6, 2.5) + dI("mushroom", 236, 168, 40) + dL("decomposer", 280, 192, 13)
    ];
  });
  dgm("solarsystem", "The solar system", "space", ["solar system", "eight planets", "planets in order", "order of the planets", "planets of the solar system"], {
    mercury: [[58, 50, 26, 70], "mercury"], venus: [[80, 50, 28, 70], "venus"], earth: [[104, 50, 30, 70], "earth"], mars: [[128, 50, 28, 70], "mars"],
    jupiter: [[154, 40, 48, 90], "jupiter"], saturn: [[200, 44, 50, 84], "saturn"], uranus: [[246, 50, 30, 70], "uranus"], neptune: [[278, 50, 34, 70], "neptune"]
  }, function(){
    var y = 92, P = [["mercury", 70, 4, "#B9B2A8"], ["venus", 93, 6, "#E8C27A"], ["earth", 118, 6.5, "#6FA8D6"], ["mars", 141, 5, "#D9674B"],
      ["jupiter", 177, 16, "#D9A877"], ["saturn", 224, 12, "#E8C98A"], ["uranus", 261, 9, "#9AD6DF"], ["neptune", 294, 9, "#5F8FD6"]];
    var out = [circ(-6, y, 54, "#F6C343", 2.5) + dL("sun", 22, 160, 14)];
    var row = "", labels = "";
    P.forEach(function(p, i){
      row += (p[0] === "saturn" ? ell(p[1], y, 22, 5, "none", 2.5) : "") + circ(p[1], y, p[2], p[3], 2) + (p[0] === "jupiter" ? ln(p[1] - 14, y + 4, p[1] + 14, y + 4, "#B9855A", 2) : "");
      labels += dL(p[0], p[1], i % 2 ? y + 40 : y - 30, 12);
    });
    out.push(row, labels);
    return out;
  });
  dgm("earthlayers", "Layers of the Earth", "plain", ["layers of the earth", "earth's layers", "earths layers", "layers of earth", "inside the earth", "earth layers"], {
    crust: [[176, 26, 140, 34], "crust"], mantle: [[176, 62, 140, 34], "mantle"], outercore: [[176, 98, 140, 34], "outer core"], innercore: [[176, 134, 140, 34], "inner core,core"]
  }, function(){
    return [
      circ(96, 100, 84, "#8A5A3C", 2.5),
      circ(96, 100, 76, "#E58A4E", 2),
      circ(96, 100, 48, "#F2B441", 2),
      circ(96, 100, 24, "#FFE9A6", 2),
      dLead(150, 38, 196, 44) + dL("crust", 230, 49, 15) + dLead(156, 70, 196, 80) + dL("mantle", 232, 85, 15) +
        dLead(128, 112, 196, 116) + dL("outer core", 248, 121, 15) + dLead(104, 104, 196, 152) + dL("inner core", 248, 157, 15)
    ];
  });
  dgm("matterstates", "States of matter", "lab", ["states of matter", "three states of matter", "solids liquids and gases", "solid liquid and gas", "solid liquid gas", "phases of matter"], {
    solid: [[6, 26, 100, 128], "solid,solids,ice"], liquid: [[110, 26, 100, 128], "liquid,liquids,water"], gas: [[214, 26, 100, 128], "gas,gases,vapor,steam,air"],
    melting: [[80, 2, 70, 30], "melt,melts,melting,melted"], evaporation: [[176, 2, 76, 30], "evaporate,evaporates,evaporation,boil,boils,boiling"],
    freezing: [[78, 156, 74, 40], "freeze,freezes,freezing,froze,frozen"], condensation: [[170, 156, 92, 40], "condense,condenses,condensation"]
  }, function(){
    var solid = "", liquid = "", gas = "";
    for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) solid += circ(34 + c * 14, 72 + r * 14, 6, "#6FA8D6", 1.5);
    [[132, 118], [146, 112], [160, 120], [174, 114], [188, 120], [138, 104], [154, 100], [170, 104], [184, 100], [146, 126], [178, 126]].forEach(function(p){ liquid += circ(p[0], p[1], 6, "#6FA8D6", 1.5); });
    [[236, 60], [270, 52], [292, 80], [250, 96], [282, 116], [240, 128]].forEach(function(p){ gas += circ(p[0], p[1], 6, "#6FA8D6", 1.5) + ln(p[0] - 14, p[1] + 2, p[0] - 9, p[1] + 1, "#9AA3AD", 1.5); });
    return [
      rct(16, 52, 76, 86, "#FFFFFF", 6, 2.5) + solid + dL("solid", 54, 152, 15),
      rct(120, 52, 76, 86, "#FFFFFF", 6, 2.5) + rct(122, 94, 72, 42, "#D6ECFA", 4, 0) + liquid + dL("liquid", 158, 152, 15),
      rct(224, 40, 76, 98, "#FFFFFF", 6, 2.5) + gas + dL("gas", 262, 152, 15),
      dA(70, 40, 138, 40, "#E06D3A", -10, 3) + dL("melting", 104, 22, 13) + dA(176, 40, 236, 32, "#E06D3A", -10, 3) + dL("evaporation", 206, 18, 13),
      dA(138, 166, 70, 166, "#4A90C8", -10, 3) + dL("freezing", 104, 194, 13) + dA(244, 166, 176, 166, "#4A90C8", -10, 3) + dL("condensation", 210, 194, 13)
    ];
  });
  dgm("photosynthesis", "Photosynthesis", "land", ["photosynthesis"], {
    sunlight: [[4, 4, 120, 70], "sunlight,light,sun,energy"], co2: [[4, 86, 110, 66], "carbon dioxide,co2"],
    water: [[40, 150, 126, 50], "water,roots"], oxygen: [[220, 54, 98, 72], "oxygen,o2"], sugar: [[214, 128, 104, 70], "sugar,sugars,glucose,food"]
  }, function(){
    return [
      dI("sprout", 160, 108, 120),
      dI("sun", 34, 32, 50) + dA(62, 46, 128, 82, "#E9A23B", -8) + dL("sunlight", 92, 44, 13),
      dI("co2", 36, 116, 44) + dA(60, 116, 124, 104, INK, 4) + dL("carbon dioxide", 60, 148, 12),
      dI("drop", 92, 176, 30) + dA(108, 176, 150, 162, "#3F7FAF", 4) + dL("water", 66, 194, 13),
      dA(196, 96, 248, 90, INK, -4) + dI("oxygen", 276, 88, 46) + dL("oxygen", 276, 122, 13),
      dA(184, 128, 244, 156, INK, 6) + dI("sugar", 274, 160, 40) + dL("sugar", 274, 192, 13)
    ];
  });
  dgm("animalcell", "An animal cell", "bio", ["animal cell", "animal cells", "parts of a cell", "parts of the cell", "cell parts", "inside a cell"], {
    membrane: [[194, 14, 124, 34], "membrane,cell membrane"], nucleus: [[194, 52, 124, 34], "nucleus"],
    cytoplasm: [[194, 90, 124, 34], "cytoplasm"], mitochondria: [[194, 128, 124, 38], "mitochondria,mitochondrion,energy"]
  }, function(){
    return [
      pth("M28 100 C24 52 70 22 112 26 C158 30 186 58 180 104 C176 150 140 178 98 174 C52 170 32 146 28 100 Z", "#FCE1E4", { w: 3 }),
      [[60, 80], [76, 140], [140, 150], [150, 64], [118, 44], [58, 120]].map(function(p){ return circ(p[0], p[1], 2.4, "#B5838D", 0); }).join(""),
      circ(104, 98, 26, "#B79CD9", 2.5) + circ(110, 94, 8, "#7E5DB0", 0),
      ell(146, 122, 15, 8, "#F2A65A", 2, ' transform="rotate(-25 146 122)"') + pth("M136 126 Q141 116 146 124 T156 118", "none", { stroke: INK, w: 1.5 }) +
        ell(64, 66, 13, 7, "#F2A65A", 2, ' transform="rotate(30 64 66)"') + pth("M56 62 Q61 72 66 64 T74 70", "none", { stroke: INK, w: 1.5 }),
      dLead(168, 54, 204, 32) + dL("membrane", 254, 37, 14) + dLead(128, 90, 204, 70) + dL("nucleus", 248, 75, 14) +
        dLead(150, 98, 204, 108) + dL("cytoplasm", 254, 113, 14) + dLead(158, 128, 204, 146) + dL("mitochondria", 258, 151, 14)
    ];
  });
  dgm("plantcell", "A plant cell", "bio", ["plant cell", "plant cells"], {
    wall: [[194, 10, 124, 34], "cell wall,wall"], chloroplast: [[194, 48, 124, 34], "chloroplast,chloroplasts,chlorophyll"],
    vacuole: [[194, 86, 124, 34], "vacuole"], nucleus: [[194, 124, 124, 34], "nucleus"], membrane: [[194, 160, 124, 36], "membrane,cell membrane"]
  }, function(){
    var chl = "";
    [[50, 44], [150, 46], [44, 156], [154, 156], [40, 100]].forEach(function(p){ chl += ell(p[0], p[1], 11, 6, "#6DBB5D", 2) + ln(p[0] - 6, p[1], p[0] + 6, p[1], "#3F7F35", 1.5); });
    return [
      rct(20, 20, 160, 160, "#9CCB7A", 18, 3),
      rct(30, 30, 140, 140, "#EAF6DC", 12, 2),
      rct(70, 60, 82, 84, "#CFE8F6", 22, 2),
      circ(52, 126, 16, "#B79CD9", 2.5) + circ(55, 123, 5, "#7E5DB0", 0),
      chl + dLead(176, 30, 204, 27) + dL("cell wall", 254, 32, 14) + dLead(154, 50, 204, 65) + dL("chloroplast", 256, 70, 14) +
        dLead(140, 100, 204, 103) + dL("vacuole", 250, 108, 14) + dLead(66, 130, 204, 141) + dL("nucleus", 248, 146, 14) + dLead(166, 166, 204, 178) + dL("membrane", 254, 183, 14)
    ];
  });
  dgm("bodyorgans", "Organs of the body", "bio", ["human body", "body systems", "organs of the body", "organ systems", "digestive system", "circulatory system", "respiratory system", "nervous system", "major organs"], {
    brain: [[6, 6, 150, 46], "brain,nervous,nerves,think"], lungs: [[6, 64, 146, 42], "lung,lungs,respiratory,breathe,breathing,oxygen"],
    heart: [[170, 64, 146, 42], "heart,circulatory,blood,pumps"], stomach: [[170, 110, 146, 42], "stomach,digestive,digest,digestion,food"],
    intestines: [[6, 120, 150, 48], "intestine,intestines,digestive,gut"]
  }, function(){
    return [
      circ(160, 30, 22, "#F2C9A0", 2.5) + pth("M128 196 V86 C128 66 140 56 160 56 C180 56 192 66 192 86 V196", "#F2C9A0", { w: 2.5 }),
      pth("M146 22 C146 12 174 12 174 22 C178 30 172 38 160 38 C148 38 142 30 146 22 Z", "#F2A7B8", { w: 2 }) + dLead(146, 24, 96, 28) + dL("brain", 72, 33, 15),
      ell(148, 88, 9, 16, "#F4A1A1", 2) + ell(172, 88, 9, 16, "#F4A1A1", 2) + dLead(140, 88, 96, 86) + dL("lungs", 72, 91, 15),
      dI("heart", 160, 96, 22) + dLead(166, 98, 214, 86) + dL("heart", 240, 91, 15),
      ell(168, 122, 12, 9, "#E8B04B", 2) + dLead(178, 124, 214, 130) + dL("stomach", 248, 135, 15),
      pth("M144 140 C150 132 172 132 176 140 C180 150 164 150 160 144 C156 152 142 156 144 166 C146 176 172 176 176 166", "none", { stroke: "#D9876B", w: 5 }) + dLead(142, 152, 96, 148) + dL("intestines", 62, 153, 15)
    ];
  });
  dgm("fivesenses", "The five senses", "plain", ["five senses", "5 senses", "our five senses"], {
    sight: [[2, 40, 64, 110], "sight,see,eye,eyes,seeing"], hearing: [[66, 40, 64, 110], "hearing,hear,ear,ears"],
    smell: [[130, 40, 62, 110], "smell,nose,smelling"], taste: [[192, 40, 64, 110], "taste,tongue,tasting,mouth"], touch: [[256, 40, 62, 110], "touch,skin,feel,hand,hands"]
  }, function(){
    var K = [["eye", "sight"], ["ear", "hearing"], ["nose", "smell"], ["mouth", "taste"], ["hand", "touch"]];
    return K.map(function(k, i){ var x = 34 + i * 63; return dI(k[0], x, 90, 52) + dL(k[1], x, 136, 15); });
  });
  dgm("moonphases", "Phases of the moon", "space", ["phases of the moon", "moon phases", "moon's phases", "lunar phases", "phases of moon"], {
    newmoon: [[6, 40, 60, 110], "new moon,new"], crescent: [[68, 40, 60, 110], "crescent"], quarter: [[130, 40, 60, 110], "quarter,half moon,first quarter"],
    gibbous: [[192, 40, 60, 110], "gibbous"], full: [[254, 40, 62, 110], "full moon,full"]
  }, function(){
    var L = [[0, "new"], [0.22, "crescent"], [0.5, "quarter"], [0.78, "gibbous"], [1, "full"]];
    return L.map(function(p, i){ var x = 36 + i * 62; return moonPhase(x, 92, 24, p[0]) + dL(p[1], x, 140, 14); });
  });
  dgm("daynight", "Day and night", "space", ["day and night", "earth rotates", "earth spins", "rotation of the earth", "earth's rotation", "earth rotating"], {
    day: [[150, 40, 80, 120], "day,daytime,sunlight"], night: [[230, 40, 88, 120], "night,nighttime,dark"]
  }, function(){
    return [
      circ(30, 100, 40, "#F6C343", 2.5) + dL("sun", 30, 160, 14),
      [70, 86, 100, 114, 130].map(function(y){ return ln(78, y, 160, y, "#F6C343", 2.5, { dash: "6 6" }); }).join(""),
      circ(230, 100, 56, "#6FA8D6", 2.5) + pth("M230 44 A56 56 0 0 1 230 156 Z", "#2E3D5C", { w: 2.5 }) + pth("M200 76 C214 66 226 80 216 92 C208 100 196 92 200 76 Z", "#7BB662", { w: 2 }),
      dL("day", 196, 104, 16) + dL("night", 262, 104, 16),
      dA(196, 34, 266, 36, "#F3EFE2", -12, 3) + dL("spins", 230, 20, 13)
    ];
  });
  dgm("seasons", "The four seasons", "plain", ["four seasons", "seasons of the year", "seasons change", "the seasons change"], {
    spring: [[2, 24, 78, 150], "spring"], summer: [[82, 24, 78, 150], "summer"], fall: [[162, 24, 78, 150], "fall,autumn"], winter: [[242, 24, 76, 150], "winter"]
  }, function(){
    function tree(x, crown, extra){ return rct(x - 4, 96, 8, 40, "#8A5A3C", 2, 2) + (crown ? blob([[x, 78, 22], [x - 14, 90, 14], [x + 14, 90, 14]], crown) : pth("M" + x + " 100 L" + (x - 14) + " 74 M" + x + " 96 L" + (x + 14) + " 70 M" + x + " 88 L" + (x + 4) + " 66", "none", { stroke: "#8A5A3C", w: 3 })) + (extra || ""); }
    var blossoms = [[34, 74], [46, 84], [28, 90], [42, 68], [52, 76]].map(function(p){ return circ(p[0], p[1], 3, "#F29BB5", 1); }).join("");
    var falling = [[190, 140], [214, 128], [222, 146]].map(function(p){ return ell(p[0], p[1], 4, 2.5, "#E58A4E", 1); }).join("");
    var snow = [[262, 60], [284, 50], [300, 70], [270, 86], [292, 96]].map(function(p){ return circ(p[0], p[1], 2.5, "#FFFFFF", 1.2); }).join("");
    return [
      rct(0, 136, 320, 64, "#D9EBC8", 0, 0) + ln(80, 20, 80, 180, "#D3C8A8", 1.5) + ln(160, 20, 160, 180, "#D3C8A8", 1.5) + ln(240, 20, 240, 180, "#D3C8A8", 1.5),
      tree(40, "#BFE3A6", blossoms) + dL("spring", 40, 166, 15),
      tree(120, "#5FAE57", circ(146, 40, 9, "#F6C343", 2)) + dL("summer", 120, 166, 15),
      tree(200, "#E58A4E", falling) + dL("fall", 200, 166, 15),
      rct(240, 136, 80, 64, "#FFFFFF", 0, 0) + tree(280, null, snow) + dL("winter", 280, 166, 15)
    ];
  });
  dgm("rockcycle", "The rock cycle", "plain", ["rock cycle", "types of rocks", "three types of rock", "three kinds of rocks"], {
    igneous: [[110, 2, 100, 82], "igneous"], sedimentary: [[2, 110, 116, 88], "sedimentary,sediment,sediments,layers"],
    metamorphic: [[202, 110, 116, 88], "metamorphic,heat and pressure,pressure"], magma: [[116, 104, 88, 60], "magma,lava,melt,melting,melts"]
  }, function(){
    var sedi = rockBlob(58, 146, "#E3C48F") + ln(32, 140, 86, 140, "#B08A55", 2) + ln(30, 150, 88, 150, "#B08A55", 2) + ln(34, 158, 82, 158, "#B08A55", 2);
    var meta = rockBlob(262, 146, "#A8A3B8") + pth("M236 142 Q248 134 260 142 T286 140 M234 152 Q246 144 258 152 T288 150", "none", { stroke: "#6D6782", w: 2 });
    var ign = rockBlob(160, 40, "#6B665F") + [[150, 36], [166, 44], [172, 32], [156, 50], [144, 46]].map(function(p){ return circ(p[0], p[1], 2, "#E8E1D4", 0); }).join("");
    return [
      ign + dL("igneous", 196, 30, 14, "start"),
      sedi + dL("sedimentary", 58, 192, 14),
      meta + dL("metamorphic", 262, 192, 14),
      blob([[160, 126, 16], [148, 132, 10], [172, 132, 10]], "#E0603A") + dL("magma", 160, 156, 13),
      dA(126, 50, 70, 116, INK, -10, 3) + dL("weathering", 70, 80, 12) + dA(98, 172, 222, 172, INK, 6, 3) + dL("heat & pressure", 160, 196, 12) +
        dA(236, 126, 182, 126, "#E0603A", -6, 3) + dA(160, 108, 160, 66, "#E0603A", 0, 3) + dL("melting", 214, 112, 12) + dL("cooling", 172, 90, 12, "start")
    ];
  });
  dgm("circuit", "An electric circuit", "lab", ["electric circuit", "simple circuit", "complete circuit", "closed circuit", "series circuit", "parts of a circuit", "electrical circuit"], {
    battery: [[16, 60, 100, 80], "battery,batteries,power source,energy"], bulb: [[110, 4, 100, 76], "bulb,light,lamp"],
    switch: [[200, 132, 116, 66], "switch"], wire: [[204, 40, 112, 60], "wire,wires,current,electricity"]
  }, function(){
    return [
      pth("M60 76 V40 H260 V160 H210 M180 160 H60 V124", "none", { stroke: "#B5651D", w: 4 }),
      rct(46, 76, 28, 48, "#4A4540", 4, 2.5) + rct(54, 70, 12, 6, "#9AA3AD", 1, 2) + txt("+", 60, 92, 14, "#F6C343") + txt("–", 60, 118, 14, "#FFFFFF") + dL("battery", 100, 104, 14, "start"),
      dI("bulb", 160, 38, 52) + dL("bulb", 160, 76, 14),
      circ(180, 160, 4, INK, 0) + circ(210, 160, 4, INK, 0) + ln(180, 160, 208, 152, INK, 3.5) + dL("switch", 248, 180, 14),
      dA(150, 40, 190, 40, "#E9A23B", 0, 2.5) + dA(260, 90, 260, 120, "#E9A23B", 0, 2.5) + dL("wire", 288, 72, 14)
    ];
  });
  dgm("volcanoparts", "Inside a volcano", "sky", ["parts of a volcano", "inside a volcano", "magma chamber", "volcano diagram", "how volcanoes form", "how a volcano erupts"], {
    ash: [[180, 4, 136, 58], "ash,ash cloud,smoke,gas"], crater: [[96, 40, 128, 40], "crater"], vent: [[180, 86, 136, 40], "vent,conduit"],
    lava: [[4, 64, 100, 58], "lava,erupt,erupts,eruption"], magma: [[96, 150, 222, 48], "magma,magma chamber,chamber"]
  }, function(){
    return [
      rct(0, 160, 320, 40, "#C9A27A", 0, 0),
      pth("M30 160 L136 62 H184 L290 160 Z", "#A0846A", { w: 2.5 }),
      ell(160, 176, 60, 16, "#E0603A", 2.5) + dL("magma chamber", 262, 190, 13),
      pth("M152 166 L156 64 H164 L168 166 Z", "#E0603A", { w: 2 }) + dLead(166, 110, 206, 106) + dL("vent", 226, 111, 14),
      pth("M138 64 C120 90 100 100 84 128", "none", { stroke: "#E0603A", w: 6 }) + dL("lava", 60, 112, 14) + dL("crater", 112, 58, 13, "end"),
      blob([[160, 34, 16], [182, 26, 14], [204, 34, 12], [140, 28, 12]], "#9AA3AD") + dL("ash cloud", 250, 30, 13)
    ];
  });
  dgm("atomparts", "Parts of an atom", "lab", ["parts of an atom", "structure of an atom", "protons neutrons and electrons", "protons and neutrons", "inside an atom"], {
    nucleus: [[110, 70, 100, 60], "nucleus"], proton: [[214, 48, 104, 34], "proton,protons,positive"],
    neutron: [[214, 86, 104, 34], "neutron,neutrons,neutral"], electron: [[214, 124, 104, 34], "electron,electrons,negative,shell,shells"]
  }, function(){
    var nuc = "";
    [[152, 94, "#E05A5A"], [166, 94, "#9AA3AD"], [158, 106, "#E05A5A"], [146, 106, "#9AA3AD"], [170, 106, "#E05A5A"], [158, 84, "#9AA3AD"]].forEach(function(p){ nuc += circ(p[0], p[1], 7, p[2], 1.8); });
    return [
      ell(158, 98, 92, 34, "none", 2) + ell(158, 98, 92, 34, "none", 2, ' transform="rotate(60 158 98)"') + ell(158, 98, 92, 34, "none", 2, ' transform="rotate(-60 158 98)"'),
      nuc + dL("nucleus", 158, 140, 13),
      circ(250, 98, 7, "#5F9BC7", 1.8) + circ(112, 20, 7, "#5F9BC7", 1.8) + circ(204, 176, 7, "#5F9BC7", 1.8),
      circ(232, 60, 6, "#E05A5A", 1.5) + dL("proton (+)", 270, 65, 13) + circ(232, 100, 6, "#9AA3AD", 1.5) + dL("neutron", 270, 105, 13) + circ(232, 140, 6, "#5F9BC7", 1.5) + dL("electron (–)", 272, 145, 13)
    ];
  });
  dgm("simplemachines", "Simple machines", "plain", ["simple machines", "six simple machines", "simple machine"], {
    lever: [[2, 6, 104, 92], "lever,levers,fulcrum"], pulley: [[108, 6, 104, 92], "pulley,pulleys"], wheel: [[214, 6, 104, 92], "wheel and axle,axle"],
    ramp: [[2, 102, 104, 94], "inclined plane,ramp,ramps,slope"], wedge: [[108, 102, 104, 94], "wedge,wedges"], screw: [[214, 102, 104, 94], "screw,screws"]
  }, function(){
    var screw = rct(256, 120, 18, 10, "#9AA3AD", 2, 2) + poly([[258, 130], [272, 130], [265, 178]], "#C9CED4", 2) + [138, 148, 158, 168].map(function(y){ return ln(258 + (y - 130) * 0.14, y, 272 - (y - 130) * 0.14, y - 6, INK, 1.8); }).join("");
    return [
      dI("lever", 54, 46, 66) + dL("lever", 54, 92, 14),
      dI("pulley", 160, 46, 66) + dL("pulley", 160, 92, 14),
      circ(266, 46, 26, "#E8D9B0", 2.5) + circ(266, 46, 6, "#8A5A3C", 2) + ln(240, 46, 292, 46, INK, 4) + dL("wheel & axle", 266, 92, 14),
      poly([[16, 172], [94, 172], [94, 128]], "#D9C7A3") + rct(52, 136, 18, 14, "#C8553D", 2, 2) + dL("inclined plane", 56, 192, 13),
      poly([[136, 128], [184, 128], [160, 176]], "#C9CED4") + dL("wedge", 160, 192, 14),
      screw + dL("screw", 266, 192, 14)
    ];
  });
  dgm("scimethod", "The scientific method", "class", ["scientific method", "steps of the scientific method", "scientific process"], {
    question: [[2, 14, 104, 78], "question,questions,ask"], research: [[108, 14, 104, 78], "research,observe,observation"],
    hypothesis: [[214, 14, 104, 78], "hypothesis,predict,prediction"], experiment: [[214, 106, 104, 80], "experiment,test,testing"],
    analyze: [[108, 106, 104, 80], "analyze,data,results,analysis"], conclusion: [[2, 106, 104, 80], "conclusion,conclude,share"]
  }, function(){
    var B = [["question", 54, 52, "question"], ["book", 160, 52, "research"], ["bulb", 266, 52, "hypothesis"], ["flask", 266, 144, "experiment"], ["chart", 160, 144, "analyze"], ["trophy", 54, 144, "conclusion"]];
    return B.map(function(b, i){
      var nx = B[i + 1], arrow = !nx ? "" : i === 2 ? dA(266, 84, 266, 112, INK, 0, 3) : nx[1] > b[1] ? dA(b[1] + 34, b[2], nx[1] - 34, nx[2], INK, 0, 3) : dA(b[1] - 34, b[2], nx[1] + 34, nx[2], INK, 0, 3);
      return rct(b[1] - 46, b[2] - 34, 92, 68, "#FFFFFF", 10, 2.5) + dI(b[0], b[1], b[2] - 8, 36) + dT(b[3], b[1], b[2] + 26, 14) + arrow;
    });
  });
  dgm("punnett", "A Punnett square", "lab", ["punnett square", "punnett squares", "dominant and recessive"], {
    dominant: [[96, 50, 150, 140], "dominant"], recessive: [[176, 124, 74, 70], "recessive"]
  }, function(){
    var cells = [["BB", 118, 88, "#8A5A3C"], ["Bb", 182, 88, "#B07A3C"], ["Bb", 118, 158, "#B07A3C"], ["bb", 182, 158, "#F2D27A"]];
    return [
      rct(86, 54, 128, 140, "#FFFFFF", 6, 2.5) + ln(150, 54, 150, 194, INK, 2.5) + ln(86, 124, 214, 124, INK, 2.5),
      dT("B", 118, 44, 20) + dT("b", 182, 44, 20) + dT("B", 70, 95, 20) + dT("b", 70, 165, 20) + dL("parent 1", 150, 18, 13) + dL("parent 2", 32, 130, 13),
      cells.map(function(c){ return circ(c[1] - 14, c[2] - 4, 8, c[3], 1.5) + dT(c[0], c[1] + 9, c[2] + 2, 17); }).join(""),
      dL("B = dominant", 224, 90, 13, "start") + dL("b = recessive", 224, 160, 13, "start")
    ];
  });
  dgm("wave", "Parts of a wave", "lab", ["wavelength", "amplitude", "sound wave", "sound waves", "light wave", "light waves", "crest and trough", "parts of a wave"], {
    crest: [[40, 20, 70, 44], "crest,peak"], trough: [[120, 132, 70, 44], "trough"], wavelength: [[30, 2, 160, 24], "wavelength"], amplitude: [[230, 40, 88, 100], "amplitude,height"]
  }, function(){
    var pts = [];
    for (var x = 10; x <= 310; x += 4) pts.push([x, 100 - 50 * Math.sin((x - 10) / 160 * Math.PI * 2)]);
    return [
      ln(10, 100, 310, 100, "#9AA3AD", 1.5, { dash: "5 5" }),
      pline(pts, "#3F7FAF", 4),
      dL("crest", 50, 44, 14) + dL("trough", 130, 168, 14),
      ln(50, 14, 210, 14, INK, 2) + ln(50, 8, 50, 20, INK, 2) + ln(210, 8, 210, 20, INK, 2) + dL("wavelength", 130, 30, 13),
      ln(250, 52, 250, 98, "#D9674B", 2.5) + arrowHead(250, 50, -Math.PI / 2, "#D9674B", 8) + dL("amplitude", 280, 80, 13)
    ];
  });
  dgm("tectonics", "Tectonic plates", "plain", ["tectonic plates", "plate tectonics", "plates collide", "continental drift", "plate boundaries"], {
    plates: [[2, 110, 316, 70], "plate,plates"], mountains: [[110, 20, 100, 90], "mountain,mountains"], magma: [[60, 160, 200, 40], "mantle,magma"]
  }, function(){
    return [
      rct(0, 160, 320, 40, "#E58A4E", 0, 0) + dL("mantle", 160, 192, 14),
      rct(4, 120, 150, 40, "#B07A3C", 4, 2.5) + rct(166, 120, 150, 40, "#8A6A4A", 4, 2.5) + dL("plate", 60, 146, 14) + dL("plate", 260, 146, 14),
      poly([[118, 120], [160, 40], [202, 120]], "#A0846A", 2.5) + poly([[160, 40], [150, 58], [170, 58]], "#FFFFFF", 1.5) + dL("mountains form", 160, 30, 13),
      dA(40, 104, 104, 104, INK, 0, 4) + dA(280, 104, 216, 104, INK, 0, 4)
    ];
  });

  // ----- math -----
  dgm("numberlinebig", "A number line", "math", ["number line", "number lines"], {}, function(){
    var t = "";
    for (var k = 0; k <= 10; k++){ var x = 24 + k * 27.2; t += ln(x, 92, x, 108, INK, 2.5) + txt(String(k), x, 132, 16, INK); }
    return [ln(12, 100, 308, 100, INK, 3) + arrowHead(314, 100, 0, INK, 10) + arrowHead(6, 100, Math.PI, INK, 10), t,
      dA(105.6, 86, 187.2, 86, "#D9674B", -26, 2.5) + dT("+3", 146, 50, 15)];
  });
  dgm("fractionbars", "Fraction bars", "math", ["fraction bars", "fraction bar", "fraction strips", "fraction wall", "equivalent fractions", "unit fractions", "comparing fractions"], {}, function(){
    var rows = [[1, "#F6C343"], [2, "#7FB8DE"], [3, "#9CCB7A"], [4, "#F29BB5"]], out = [];
    rows.forEach(function(r, i){
      var y = 22 + i * 42, w = 280 / r[0], s = "";
      for (var k = 0; k < r[0]; k++) s += rct(20 + k * w, y, w, 34, r[1], 3, 2.5) + txt(r[0] === 1 ? "1" : "1/" + r[0], 20 + k * w + w / 2, y + 23, 15, INK);
      out.push(s);
    });
    return out;
  });
  dgm("fractionparts", "Parts of a fraction", "math", ["numerator", "denominator", "parts of a fraction", "what is a fraction", "numerator and denominator"], {
    numerator: [[150, 24, 168, 62], "numerator,top number,shaded"], denominator: [[150, 104, 168, 66], "denominator,bottom number,equal parts"]
  }, function(){
    var pie = circ(76, 100, 52, "#FFFFFF", 2.5);
    for (var k = 0; k < 3; k++){ var a0 = -Math.PI / 2 + k * Math.PI / 2, a1 = a0 + Math.PI / 2, p0 = polar(76, 100, 52, a0), p1 = polar(76, 100, 52, a1);
      pie += '<path d="M76 100 L' + f(p0[0]) + ' ' + f(p0[1]) + ' A52 52 0 0 1 ' + f(p1[0]) + ' ' + f(p1[1]) + ' Z" fill="#F6C343" stroke="' + INK + '" stroke-width="2.5"/>'; }
    pie += ln(24, 100, 128, 100, INK, 2.5) + ln(76, 48, 76, 152, INK, 2.5);
    return [pie, txt("3", 182, 78, 40, INK) + ln(164, 92, 200, 92, INK, 4) + txt("4", 182, 136, 40, INK),
      dLead(204, 64, 226, 56) + dL("numerator", 268, 52, 15) + dL("parts we have", 268, 70, 12),
      dLead(204, 122, 226, 128) + dL("denominator", 270, 132, 15) + dL("equal parts in all", 270, 150, 12)];
  });
  dgm("placevalue", "Place value", "math", ["place value", "hundreds tens and ones", "tens and ones", "hundreds place", "tens place", "ones place"], {
    hundreds: [[6, 6, 100, 190], "hundred,hundreds"], tens: [[110, 6, 100, 190], "ten,tens"], ones: [[214, 6, 100, 190], "one,ones"]
  }, function(){
    var flat = "", rods = "", cubes = "";
    for (var r = 0; r < 10; r++){ flat += ln(31, 52 + r * 5.5, 81, 52 + r * 5.5, "#7FB8DE", 1); flat += ln(31 + r * 5.5, 52, 31 + r * 5.5, 107, "#7FB8DE", 1); }
    for (var k = 0; k < 3; k++){ rods += rct(132 + k * 20, 48, 12, 66, "#9CCB7A", 2, 2); for (var q = 1; q < 10; q++) rods += ln(132 + k * 20, 48 + q * 6.6, 144 + k * 20, 48 + q * 6.6, INK, 0.8); }
    [[244, 60], [262, 60], [280, 60], [253, 78], [271, 78]].forEach(function(p){ cubes += rct(p[0], p[1], 14, 14, "#F6C343", 2, 2); });
    return [
      ln(108, 10, 108, 190, "#C7D6EA", 2) + ln(212, 10, 212, 190, "#C7D6EA", 2) + dT("hundreds", 56, 30, 15) + dT("tens", 160, 30, 15) + dT("ones", 264, 30, 15),
      rct(31, 52, 55, 55, "#D6ECFA", 2, 2) + flat,
      rods, cubes,
      txt("1", 56, 160, 44, INK) + txt("3", 160, 160, 44, INK) + txt("5", 264, 160, 44, INK)
    ];
  });
  dgm("clockface", "Telling time", "class", ["tell time", "telling time", "tell the time", "hour hand", "minute hand", "clock face", "analog clock", "read a clock"], {
    hour: [[180, 50, 136, 40], "hour,hour hand,hours"], minute: [[180, 104, 136, 40], "minute,minute hand,minutes"]
  }, function(){
    var nums = "";
    for (var k = 1; k <= 12; k++){ var p = polar(100, 100, 66, k * Math.PI / 6 - Math.PI / 2); nums += txt(String(k), p[0], p[1] + 6, 15, INK); }
    return [circ(100, 100, 84, "#FFFFFF", 3.5), nums,
      ln(100, 100, 136, 100, "#D9674B", 6) + dLead(126, 104, 196, 128) + dL("hour hand", 248, 133, 15),
      ln(100, 100, 100, 50, INK, 4) + circ(100, 100, 5, INK, 0) + dLead(102, 62, 196, 62) + dL("minute hand", 254, 67, 15)];
  });
  dgm("shapes2d", "2D shapes", "math", ["2d shapes", "flat shapes", "plane shapes", "two dimensional shapes", "2 d shapes", "polygons"], {
    circle: [[2, 8, 104, 92], "circle,circles"], square: [[108, 8, 104, 92], "square,squares"], triangle: [[214, 8, 104, 92], "triangle,triangles"],
    rectangle: [[2, 104, 104, 92], "rectangle,rectangles"], pentagon: [[108, 104, 104, 92], "pentagon,pentagons"], hexagon: [[214, 104, 104, 92], "hexagon,hexagons"]
  }, function(){
    function ngon(cx, cy, r, n, fill){ var p = []; for (var k = 0; k < n; k++) p.push(polar(cx, cy, r, k * 2 * Math.PI / n - Math.PI / 2)); return poly(p, fill, 2.5); }
    return [
      circ(54, 46, 28, "#F29BB5", 2.5) + dL("circle", 54, 92, 14),
      rct(134, 20, 52, 52, "#7FB8DE", 2, 2.5) + dL("square", 160, 92, 14),
      ngon(266, 50, 32, 3, "#9CCB7A") + dL("triangle", 266, 92, 14),
      rct(18, 122, 72, 44, "#F6C343", 2, 2.5) + dL("rectangle", 54, 188, 14),
      ngon(160, 146, 30, 5, "#B79CD9") + dL("pentagon", 160, 188, 14),
      ngon(266, 146, 30, 6, "#E58A4E") + dL("hexagon", 266, 188, 14)
    ];
  });
  dgm("shapes3d", "3D shapes", "math", ["3d shapes", "solid shapes", "three dimensional shapes", "solid figures", "3 d shapes", "3d figures"], {
    cube: [[2, 8, 104, 92], "cube,cubes"], sphere: [[108, 8, 104, 92], "sphere,spheres,ball"], cylinder: [[214, 8, 104, 92], "cylinder,cylinders,can"],
    cone: [[2, 104, 104, 92], "cone,cones"], pyramid: [[108, 104, 104, 92], "pyramid,pyramids"], prism: [[214, 104, 104, 92], "prism,prisms,rectangular prism,box"]
  }, function(){
    return [
      dI("cube", 54, 46, 66) + dL("cube", 54, 92, 14), dI("sphere", 160, 46, 66) + dL("sphere", 160, 92, 14), dI("cylinder", 266, 46, 66) + dL("cylinder", 266, 92, 14),
      dI("cone", 54, 142, 66) + dL("cone", 54, 188, 14),
      poly([[160, 114], [132, 168], [176, 172]], "#F6C343", 2.5) + poly([[160, 114], [176, 172], [192, 160]], "#D9A92E", 2.5) + dL("pyramid", 160, 188, 14),
      cubeAt(240, 128, 40, "#9CCB7A", "#7BB662", "#5D9A4E") + dL("prism", 266, 188, 14)
    ];
  });
  dgm("coordplane", "The coordinate plane", "math", ["coordinate plane", "coordinate grid", "x axis", "y axis", "ordered pair", "ordered pairs", "plot the point", "plotting points", "x and y axis"], {
    xaxis: [[40, 150, 276, 46], "x axis,x,horizontal"], yaxis: [[4, 4, 70, 160], "y axis,y,vertical"], point: [[150, 40, 120, 60], "point,ordered pair,coordinates"]
  }, function(){
    var g = "";
    for (var k = 1; k <= 7; k++){ g += ln(56 + k * 34, 20, 56 + k * 34, 156, "#DFE8F3", 1.5); }
    for (var q = 1; q <= 4; q++){ g += ln(56, 156 - q * 34, 300, 156 - q * 34, "#DFE8F3", 1.5); }
    var nums = "";
    for (var n = 1; n <= 7; n++) nums += txt(String(n), 56 + n * 34, 174, 13, INK);
    for (var m = 1; m <= 4; m++) nums += txt(String(m), 44, 161 - m * 34, 13, INK);
    return [g, ln(56, 156, 304, 156, INK, 3) + arrowHead(310, 156, 0, INK, 9) + ln(56, 156, 56, 14, INK, 3) + arrowHead(56, 8, -Math.PI / 2, INK, 9) + nums + dL("x", 300, 190, 16) + dL("y", 30, 20, 16),
      ln(56 + 4 * 34, 156, 56 + 4 * 34, 156 - 3 * 34, "#D9674B", 2, { dash: "4 4" }) + ln(56, 156 - 3 * 34, 56 + 4 * 34, 156 - 3 * 34, "#D9674B", 2, { dash: "4 4" }) + circ(56 + 4 * 34, 156 - 3 * 34, 6, "#D9674B", 2) + dT("(4, 3)", 222, 48, 15)];
  });
  dgm("angletypes", "Types of angles", "math", ["types of angles", "kinds of angles", "acute angle", "right angle", "obtuse angle", "straight angle", "acute right and obtuse"], {
    acute: [[2, 30, 104, 140], "acute"], right: [[108, 30, 104, 140], "right,90 degrees,90"], obtuse: [[214, 30, 104, 140], "obtuse"]
  }, function(){
    function ang(x, y, deg, color){ var a = -deg * Math.PI / 180, p = [x + 70 * Math.cos(a), y + 70 * Math.sin(a)], q = polar(x, y, 24, a);
      var arc = deg === 90 ? pth("M" + (x + 16) + " " + y + " V" + (y - 16) + " H" + x, "none", { stroke: color, w: 2.5 }) : '<path d="M' + (x + 24) + ' ' + y + ' A24 24 0 0 0 ' + f(q[0]) + ' ' + f(q[1]) + '" fill="none" stroke="' + color + '" stroke-width="3"/>';
      return ln(x, y, x + 76, y, INK, 3.5) + ln(x, y, p[0], p[1], INK, 3.5) + arc; }
    return [ang(20, 140, 40, "#E06D3A") + dL("acute", 56, 168, 15) + dL("less than 90°", 56, 186, 11),
      ang(132, 140, 90, "#4F9D78") + dL("right", 168, 168, 15) + dL("exactly 90°", 168, 186, 11),
      ang(262, 140, 130, "#4A84B8") + dL("obtuse", 268, 168, 15) + dL("more than 90°", 268, 186, 11)];
  });
  dgm("arraygrid", "A multiplication array", "math", ["array", "arrays", "multiplication array", "rows and columns"], {
    rows: [[4, 30, 60, 140], "row,rows"], columns: [[60, 4, 200, 30], "column,columns"]
  }, function(){
    var d = [];
    for (var r = 0; r < 3; r++){ var s = ""; for (var c = 0; c < 4; c++) s += circ(100 + c * 40, 64 + r * 40, 13, "#F29BB5", 2.5); d.push(s); }
    return d.concat([dL("3 rows", 42, 108, 14) + dL("4 columns", 160, 24, 14), dT("3 × 4 = 12", 160, 190, 20)]);
  });
  dgm("bargraph", "A bar graph", "math", ["bar graph", "bar graphs", "bar chart", "bar charts"], {
    title: [[60, 2, 200, 24], "title"], axis: [[2, 20, 50, 160], "axis,scale"], bars: [[60, 30, 250, 140], "bar,bars,data"]
  }, function(){
    var bars = [[84, 70, "#F29BB5"], [138, 40, "#7FB8DE"], [192, 100, "#9CCB7A"], [246, 60, "#F6C343"]];
    var grid = "";
    for (var k = 1; k <= 4; k++) grid += ln(56, 160 - k * 30, 300, 160 - k * 30, "#DFE8F3", 1.5) + txt(String(k * 2), 44, 165 - k * 30, 12, INK);
    return [grid + ln(56, 160, 300, 160, INK, 3) + ln(56, 160, 56, 30, INK, 3) + dL("favorite fruit", 180, 22, 14),
      bars.map(function(b){ return rct(b[0] - 18, 160 - b[1], 36, b[1], b[2], 2, 2.5); }).join(""),
      dI("apple", 84, 180, 24) + dI("banana", 138, 180, 24) + dI("grapes", 192, 180, 24) + dI("orange", 246, 180, 24)];
  });
  dgm("areaperimeter", "Area and perimeter", "math", ["area and perimeter", "perimeter", "area of a rectangle", "find the area", "square units"], {
    area: [[40, 30, 180, 120], "area,square units,inside"], perimeter: [[30, 20, 200, 140], "perimeter,around,outside,edge"]
  }, function(){
    var g = "";
    for (var r = 0; r < 3; r++) for (var c = 0; c < 5; c++) g += rct(50 + c * 32, 40 + r * 32, 32, 32, "#D6ECFA", 0, 1.5);
    return [g, rct(50, 40, 160, 96, "none", 0, 0).replace('fill="none"', 'fill="none" stroke="#D9674B" stroke-width="5"'),
      dL("5 units", 130, 156, 14) + dL("3 units", 236, 92, 14, "start"),
      dT("area = 15 square units", 160, 180, 14) + dT("perimeter = 16 units", 160, 198, 14)];
  });
  dgm("pythagoras", "The Pythagorean theorem", "math", ["pythagorean theorem", "pythagorean", "hypotenuse", "a squared plus b squared"], {
    hyp: [[110, 30, 120, 80], "hypotenuse,c"], legs: [[30, 60, 110, 140], "leg,legs,a,b"]
  }, function(){
    return [poly([[60, 160], [220, 160], [60, 50]], "#D6ECFA", 3) + pth("M60 146 H74 V160", "none", { w: 2 }),
      dL("a", 44, 110, 18) + dL("b", 140, 182, 18), dL("c", 150, 96, 18) + dL("hypotenuse", 176, 76, 13, "start"),
      dT("a² + b² = c²", 236, 30, 18)];
  });
  dgm("slopeline", "Slope of a line", "math", ["slope of a line", "slope of the line", "rise over run", "linear equation", "linear equations", "linear function", "y intercept", "slope intercept"], {
    rise: [[170, 50, 80, 70], "rise"], run: [[110, 110, 110, 40], "run"], intercept: [[30, 120, 70, 50], "intercept,y intercept,b"]
  }, function(){
    var g = "";
    for (var k = 1; k <= 8; k++) g += ln(40 + k * 32, 14, 40 + k * 32, 180, "#DFE8F3", 1.5);
    for (var q = 1; q <= 5; q++) g += ln(40, 180 - q * 32, 300, 180 - q * 32, "#DFE8F3", 1.5);
    return [g + ln(40, 180, 304, 180, INK, 2.5) + ln(40, 180, 40, 10, INK, 2.5),
      ln(40, 148, 296, 20, "#4A84B8", 4) + circ(40, 148, 5, "#D9674B", 2) + dL("y-intercept", 92, 170, 12),
      ln(136, 100, 200, 100, "#E06D3A", 3, { dash: "5 4" }) + ln(200, 100, 200, 68, "#E06D3A", 3, { dash: "5 4" }) + dL("run", 168, 120, 13) + dL("rise", 226, 88, 13),
      dT("y = mx + b", 246, 158, 18)];
  });

  // ----- reading & writing -----
  dgm("storymountain", "Story mountain", "class", ["story mountain", "plot diagram", "plot structure", "rising action", "falling action", "parts of a plot", "plot mountain", "elements of plot"], {
    beginning: [[2, 132, 92, 66], "beginning,exposition,introduction,characters,setting"], rising: [[50, 54, 104, 64], "rising action,rising,problem,conflict"],
    climax: [[112, 2, 96, 58], "climax,turning point"], falling: [[180, 54, 100, 64], "falling action,falling"], resolution: [[226, 132, 92, 66], "resolution,ending,end,solution,conclusion"]
  }, function(){
    return [
      ln(10, 160, 60, 160, INK, 4) + dL("beginning", 48, 184, 14),
      ln(60, 160, 160, 48, INK, 4) + dL("rising action", 84, 92, 14, "end"),
      circ(160, 48, 7, "#D9674B", 2.5) + dL("climax", 160, 28, 15),
      ln(160, 48, 240, 140, INK, 4) + dL("falling action", 232, 92, 14, "start"),
      ln(240, 140, 310, 140, INK, 4) + dL("resolution", 276, 166, 14)
    ];
  });
  dgm("venn", "A Venn diagram", "class", ["venn diagram", "compare and contrast", "similarities and differences", "alike and different", "same and different"], {
    left: [[6, 30, 110, 140], "different,differences,contrast"], both: [[124, 30, 72, 140], "both,alike,same,similar,similarities,compare"], right: [[204, 30, 110, 140], "different,differences,contrast"]
  }, function(){
    return [
      '<circle cx="118" cy="100" r="78" fill="#7FB8DE" fill-opacity="0.55" stroke="' + INK + '" stroke-width="2.5"/>',
      '<circle cx="202" cy="100" r="78" fill="#F29BB5" fill-opacity="0.55" stroke="' + INK + '" stroke-width="2.5"/>',
      dT("only A", 82, 104, 15) + dT("both", 160, 104, 16) + dT("only B", 238, 104, 15)
    ];
  });
  dgm("mainidea", "Main idea and details", "class", ["main idea", "supporting details", "key details", "main idea and details"], {
    main: [[30, 16, 260, 60], "main idea,main,topic"], details: [[30, 80, 260, 116], "detail,details,supporting,evidence"]
  }, function(){
    return [
      rct(30, 24, 260, 46, "#F6C343", 8, 2.5) + dT("main idea", 160, 53, 18),
      rct(46, 70, 20, 64, "#D9C7A3", 0, 2.5) + rct(254, 70, 20, 64, "#D9C7A3", 0, 2.5),
      dBox(28, 138, 80, 46, "#FFFFFF", "detail") + dBox(120, 138, 80, 46, "#FFFFFF", "detail") + dBox(212, 138, 80, 46, "#FFFFFF", "detail")
    ];
  });
  dgm("paragraph", "Parts of a paragraph", "class", ["topic sentence", "concluding sentence", "closing sentence", "paragraph structure", "hamburger paragraph", "parts of a paragraph", "parts of an essay"], {
    topic: [[40, 2, 240, 52], "topic sentence,topic,introduction"], details: [[40, 56, 240, 88], "detail,details,supporting,body"], closing: [[40, 146, 240, 52], "concluding,closing,conclusion"]
  }, function(){
    return [
      pth("M60 46 C60 12 260 12 260 46 Z", "#E8B46A", { w: 2.5 }) + dT("topic sentence", 160, 38, 15),
      pth("M52 52 C80 46 100 60 128 52 C156 46 176 60 204 52 C232 46 252 60 268 52 V74 H52 Z", "#9CCB7A", { w: 2.5 }) + dT("detail", 160, 69, 14),
      rct(56, 78, 208, 24, "#F28B82", 6, 2.5) + dT("detail", 160, 95, 14),
      rct(52, 106, 216, 28, "#C98F5B", 10, 2.5) + dT("detail", 160, 125, 14),
      pth("M56 140 H264 C264 176 56 176 56 140 Z", "#E8B46A", { w: 2.5 }) + dT("closing sentence", 160, 160, 14)
    ];
  });
  dgm("sequencebox", "Sequence of events", "class", ["sequence of events", "first next then last", "first then next last", "order of events", "beginning middle and end"], {
    first: [[2, 50, 80, 100], "first,beginning"], next: [[82, 50, 78, 100], "next,middle"], then: [[160, 50, 78, 100], "then,after"], last: [[238, 50, 80, 100], "last,finally,end"]
  }, function(){
    return ["first", "next", "then", "last"].map(function(w, i){ var x = 8 + i * 79; return dBox(x, 70, 66, 60, ["#F6C343", "#7FB8DE", "#9CCB7A", "#F29BB5"][i], w, 15) + (i < 3 ? dA(x + 68, 100, x + 78, 100, INK, 0, 2.5) : ""); });
  });
  dgm("causeeffect", "Cause and effect", "class", ["cause and effect", "causes and effects", "cause effect"], {
    cause: [[10, 40, 130, 120], "cause,causes,because,why"], effect: [[180, 40, 130, 120], "effect,effects,result,happened"]
  }, function(){
    return [dBox(20, 60, 110, 80, "#F6C343", "cause", 18) + dT("why it happened", 75, 160, 12),
      dA(140, 100, 178, 100, INK, 0, 4),
      dBox(190, 60, 110, 80, "#7FB8DE", "effect", 18) + dT("what happened", 245, 160, 12)];
  });
  dgm("partsofspeech", "Parts of speech", "class", ["parts of speech", "noun", "nouns", "verb", "verbs", "adjective", "adjectives", "adverb", "adverbs"], {
    adjective: [[40, 66, 74, 92], "adjective,adjectives,describes,describing"], noun: [[116, 66, 64, 92], "noun,nouns,person place or thing"],
    verb: [[180, 66, 62, 92], "verb,verbs,action"], adverb: [[242, 66, 76, 92], "adverb,adverbs"]
  }, function(){
    return [
      dT("The", 30, 104, 20),
      dT("happy", 92, 104, 20) + ln(66, 112, 118, 112, "#E9A23B", 4) + dL("adjective", 92, 140, 14),
      dT("dog", 160, 104, 20) + ln(142, 112, 178, 112, "#4A84B8", 4) + dL("noun", 160, 140, 14),
      dT("runs", 220, 104, 20) + ln(200, 112, 240, 112, "#D9674B", 4) + dL("verb", 220, 140, 14),
      dT("fast.", 284, 104, 20) + ln(264, 112, 304, 112, "#4F9D78", 4) + dL("adverb", 284, 140, 14)
    ];
  });

  // ----- social studies -----
  dgm("timelinebig", "A timeline", "history", ["timeline", "time line", "timelines"], {
    past: [[6, 40, 150, 120], "past,long ago,ago,earliest"], present: [[164, 40, 150, 120], "present,today,now,recent"]
  }, function(){
    var M = [[40, "pyramid", "long ago"], [120, "castle", "past"], [200, "ship", ""], [280, "rocket", "today"]];
    return [ln(16, 120, 296, 120, INK, 4) + arrowHead(306, 120, 0, INK, 12)].concat(M.map(function(m){
      return ln(m[0], 112, m[0], 128, INK, 3) + dI(m[1], m[0], 80, 46) + (m[2] ? dL(m[2], m[0], 152, 14) : "");
    }));
  });
  dgm("compassrose", "Compass rose", "history", ["compass rose", "cardinal directions", "north south east and west", "north east south and west", "north east south west", "intermediate directions"], {
    north: [[130, 2, 60, 46], "north,n"], south: [[130, 152, 60, 46], "south,s"], east: [[234, 76, 70, 48], "east,e"], west: [[16, 76, 70, 48], "west,w"]
  }, function(){
    return [
      poly([[160, 30], [172, 88], [160, 100], [148, 88]], "#D9674B") + poly([[160, 170], [148, 112], [160, 100], [172, 112]], "#FFFFFF"),
      poly([[230, 100], [172, 112], [160, 100], [172, 88]], "#FFFFFF") + poly([[90, 100], [148, 88], [160, 100], [148, 112]], "#FFFFFF"),
      circ(160, 100, 8, "#F6C343", 2),
      txt("N", 160, 24, 22, INK) + txt("S", 160, 194, 22, INK) + txt("E", 250, 108, 22, INK) + txt("W", 70, 108, 22, INK),
      dL("north", 206, 24, 13) + dL("south", 206, 192, 13) + dL("east", 286, 108, 13) + dL("west", 34, 108, 13)
    ];
  });
  dgm("govbranches", "Three branches of government", "history", ["three branches", "branches of government", "checks and balances", "separation of powers", "three branches of government"], {
    legislative: [[4, 30, 104, 166], "legislative,congress,senate,house of representatives,make laws,makes laws"],
    executive: [[108, 30, 104, 166], "executive,president,enforce,enforces"],
    judicial: [[212, 30, 104, 166], "judicial,supreme court,court,courts,judges,interpret"]
  }, function(){
    var B = [[56, "legislative", "columns", "makes laws"], [160, "executive", "crown", "carries out laws"], [264, "judicial", "scale", "explains laws"]];
    return [dT("government", 160, 22, 16)].concat(B.map(function(b){
      return rct(b[0] - 48, 34, 96, 158, "#FFFDF6", 10, 2.5) + dI(b[2], b[0], 82, 56) + dT(b[1], b[0], 136, 15) + dL(b[3], b[0], 160, 12);
    }));
  });
  dgm("landforms", "Landforms", "sky", ["landforms", "landform", "types of landforms", "bodies of water"], {
    mountain: [[196, 20, 120, 90], "mountain,mountains"], valley: [[150, 80, 70, 60], "valley,valleys"], hill: [[90, 70, 70, 60], "hill,hills"],
    river: [[110, 130, 120, 50], "river,rivers"], lake: [[230, 130, 88, 60], "lake,lakes"], island: [[4, 140, 90, 56], "island,islands"], plain: [[4, 90, 90, 50], "plain,plains,flat"]
  }, function(){
    return [
      rct(0, 146, 100, 54, "#8CC4E8", 0, 0) + pth("M0 120 H120 Q150 100 176 120 L212 66 L246 40 L290 96 L320 108 V200 H100 V146 H0 Z", "#B9DBA0", { w: 2.5 }),
      poly([[246, 40], [236, 54], [246, 50], [256, 54]], "#FFFFFF", 2) + dL("mountain", 270, 30, 13),
      dL("hill", 148, 98, 13) + dL("valley", 192, 118, 13) + dL("plain", 48, 112, 13),
      pth("M200 120 C190 150 160 160 120 196", "none", { stroke: "#8CC4E8", w: 7 }) + dL("river", 150, 158, 13),
      ell(268, 160, 30, 12, "#8CC4E8", 2) + dL("lake", 268, 186, 13),
      ell(46, 172, 22, 8, "#E8D9A0", 2) + dL("island", 46, 194, 13)
    ];
  });
  dgm("continents", "The seven continents", "sea", ["seven continents", "7 continents", "all the continents", "continents and oceans", "world map", "map of the world"], {
    namerica: [[6, 20, 100, 70], "north america"], samerica: [[50, 94, 70, 90], "south america"], europe: [[132, 14, 56, 42], "europe"],
    africa: [[130, 58, 66, 90], "africa"], asia: [[188, 10, 128, 84], "asia"], australia: [[236, 106, 80, 52], "australia,oceania"], antarctica: [[40, 168, 240, 32], "antarctica"]
  }, function(){
    var land = "#9CCB7A";
    return [
      rct(0, 0, 320, 200, "#A7D3EC", 0, 0) + pth("M24 46 C30 26 70 18 98 30 C104 40 94 50 84 58 C74 66 70 80 60 86 C50 80 44 68 34 62 C26 58 22 52 24 46 Z", land, { w: 2 }) + dL("North America", 60, 46, 12),
      pth("M72 96 C86 92 104 102 104 118 C102 136 92 152 84 170 C78 156 70 140 66 122 C64 110 66 100 72 96 Z", land, { w: 2 }) + dL("South America", 108, 166, 11, "start"),
      pth("M138 30 C146 20 172 18 180 26 C182 36 172 44 160 46 C148 48 136 40 138 30 Z", land, { w: 2 }) + dL("Europe", 160, 16, 11),
      pth("M140 62 C156 54 184 58 190 76 C194 92 184 106 176 124 C170 138 160 142 156 128 C150 112 138 98 136 82 C134 72 136 66 140 62 Z", land, { w: 2 }) + dL("Africa", 164, 98, 12),
      pth("M188 26 C214 12 268 14 300 30 C310 44 298 60 282 64 C268 70 256 82 240 82 C224 80 212 70 200 62 C190 54 182 38 188 26 Z", land, { w: 2 }) + dL("Asia", 250, 48, 13),
      pth("M246 118 C262 108 292 112 300 126 C302 140 286 150 268 148 C254 146 242 132 246 118 Z", land, { w: 2 }) + dL("Australia", 274, 132, 11),
      pth("M50 184 C100 174 220 174 270 184 C260 196 70 196 50 184 Z", "#F3F7FA", { w: 2 }) + dL("Antarctica", 160, 186, 11)
    ];
  });
  dgm("feudal", "The feudal system", "history", ["feudal system", "feudalism", "feudal pyramid", "social pyramid"], {
    king: [[110, 6, 100, 50], "king,queen,monarch,ruler,pharaoh"], nobles: [[84, 56, 152, 44], "noble,nobles,lord,lords,nobility"],
    knights: [[58, 100, 204, 44], "knight,knights,soldiers,warriors"], peasants: [[30, 144, 260, 52], "peasant,peasants,serf,serfs,farmers,workers"]
  }, function(){
    return [
      poly([[160, 12], [196, 56], [124, 56]], "#F6C343", 2.5) + dT("king", 160, 48, 14),
      poly([[124, 56], [196, 56], [228, 100], [92, 100]], "#E8B46A", 2.5) + dT("nobles", 160, 84, 15),
      poly([[92, 100], [228, 100], [258, 144], [62, 144]], "#C9A27A", 2.5) + dT("knights", 160, 128, 15),
      poly([[62, 144], [258, 144], [288, 190], [32, 190]], "#A0846A", 2.5) + dT("peasants", 160, 174, 16)
    ];
  });
  dgm("billtolaw", "How a bill becomes a law", "history", ["bill becomes a law", "how a bill becomes a law", "how laws are made", "a bill becomes law"], {
    bill: [[2, 40, 76, 100], "bill,idea"], house: [[80, 40, 80, 100], "house,house of representatives,congress"],
    senate: [[160, 40, 80, 100], "senate,senators"], president: [[240, 40, 78, 100], "president,sign,signs,veto,law"]
  }, function(){
    var S = [["scroll", "a bill"], ["columns", "House"], ["columns", "Senate"], ["quill", "President"]];
    return S.map(function(s, i){ var x = 40 + i * 80; return dI(s[0], x, 86, 50) + dT(s[1], x, 134, 14) + (i < 3 ? dA(x + 26, 86, x + 54, 86, INK, 0, 3) : ""); }).concat([dT("signed → it becomes a law", 160, 176, 16)]);
  });
  dgm("supplydemand", "Supply and demand", "math", ["supply and demand", "law of supply", "law of demand", "equilibrium price", "supply curve", "demand curve"], {
    supply: [[150, 14, 160, 60], "supply"], demand: [[150, 120, 160, 60], "demand"], equilibrium: [[130, 70, 70, 50], "equilibrium,price"]
  }, function(){
    return [ln(50, 172, 300, 172, INK, 3) + ln(50, 172, 50, 14, INK, 3) + dL("quantity", 260, 192, 13) + dL("price", 26, 30, 13),
      ln(70, 160, 280, 30, "#4A84B8", 4) + dL("supply", 290, 48, 14),
      ln(70, 30, 280, 160, "#D9674B", 4) + dL("demand", 290, 150, 14),
      circ(175, 95, 7, "#F6C343", 2.5) + dL("equilibrium", 175, 124, 13)];
  });

  // ----- health -----
  dgm("myplate", "Food groups", "plain", ["food groups", "five food groups", "myplate", "my plate", "balanced diet", "healthy plate", "healthy eating", "food pyramid"], {
    fruits: [[40, 10, 96, 90], "fruit,fruits"], vegetables: [[40, 100, 96, 92], "vegetable,vegetables,veggies"],
    grains: [[136, 10, 104, 90], "grain,grains,bread,rice,pasta,cereal"], protein: [[136, 100, 104, 92], "protein,meat,beans,fish,eggs"], dairy: [[244, 20, 74, 90], "dairy,milk,cheese,yogurt"]
  }, function(){
    function q(a0, color){ var p0 = polar(136, 100, 84, a0), p1 = polar(136, 100, 84, a0 + Math.PI / 2); return '<path d="M136 100 L' + f(p0[0]) + ' ' + f(p0[1]) + ' A84 84 0 0 1 ' + f(p1[0]) + ' ' + f(p1[1]) + ' Z" fill="' + color + '" stroke="' + INK + '" stroke-width="2.5"/>'; }
    return [circ(136, 100, 92, "#FFFFFF", 2.5),
      q(Math.PI, "#E86A6A") + dT("fruits", 96, 70, 14), q(-Math.PI / 2, "#E8A04B") + dT("grains", 176, 70, 14),
      q(Math.PI / 2, "#7BB662") + dT("vegetables", 98, 138, 14), q(0, "#A68BD0") + dT("protein", 176, 138, 14),
      rct(258, 50, 44, 60, "#7FB8DE", 6, 2.5) + dT("dairy", 280, 132, 14)];
  });

  // ----- concepts that lectures name but no single picture can show (found by replaying recorded lessons) -----
  dgm("functionmachine", "A function machine", "math", ["function machine", "input and output", "inputs and outputs", "input output", "function table", "in and out table", "input output table"], {
    input: [[4, 60, 86, 100], "input,inputs"], rule: [[100, 34, 120, 146], "rule,machine"], output: [[230, 60, 86, 100], "output,outputs"]
  }, function(){
    return [
      rct(10, 76, 72, 48, "#FFFFFF", 10, 2.5) + txt("3", 46, 109, 26, INK) + dL("input", 46, 146, 14),
      dA(86, 100, 114, 100, INK, 0, 3.5),
      rct(132, 44, 60, 16, "#5F9BC7", 4, 2.5) + rct(116, 58, 92, 86, "#7FB8DE", 12, 3) + txt("× 2", 162, 110, 26, INK) + circ(132, 136, 5, "#F6C343", 2) + circ(192, 136, 5, "#F6C343", 2) + dL("rule", 162, 168, 14),
      dA(212, 100, 240, 100, INK, 0, 3.5),
      rct(244, 76, 72, 48, "#FFFFFF", 10, 2.5) + txt("6", 280, 109, 26, INK) + dL("output", 280, 146, 14)
    ];
  });
  dgm("derivative", "The derivative", "math", ["derivative", "derivatives", "rate of change", "tangent line", "instantaneous rate", "slope of the tangent", "calculus"], {
    tangent: [[150, 40, 166, 100], "tangent,tangent line,slope"], point: [[176, 92, 50, 46], "point,instant,moment"]
  }, function(){
    var pts = [];
    for (var x = 30; x <= 300; x += 5){ var u = (x - 30) / 270; pts.push([x, 175 - u * u * 150]); }
    var x0 = 200, t = (x0 - 30) / 270, y0 = 175 - t * t * 150, m = -2 * t * 150 / 270;
    return [
      ln(30, 180, 306, 180, INK, 2.5) + ln(30, 180, 30, 14, INK, 2.5),
      pline(pts, "#4A84B8", 4) + dL("curve", 92, 166, 13),
      ln(x0 - 84, y0 - m * 84, x0 + 84, y0 + m * 84, "#D9674B", 3.5) + dL("tangent line", 196, 66, 13, "end"),
      ln(x0, y0, x0 + 34, y0, "#D9674B", 2, { dash: "4 4" }) + ln(x0 + 34, y0, x0 + 34, y0 + m * 34, "#D9674B", 2, { dash: "4 4" }) + circ(x0, y0, 6, "#F6C343", 2.5),
      dT("its slope = the derivative", 160, 26, 15)
    ];
  });
  dgm("payoffmatrix", "A payoff matrix", "math", ["payoff matrix", "prisoner's dilemma", "prisoners dilemma", "prisoner dilemma", "game theory", "dominant strategy", "dominated strategy", "nash equilibrium"], {
    payoffs: [[92, 60, 224, 134], "payoff,payoffs,outcome,outcomes,points"], player1: [[2, 60, 88, 134], "player 1,player one,row"], player2: [[92, 2, 224, 56], "player 2,player two,column"]
  }, function(){
    var C = [[147, 94, "#D6ECFA", "3 , 3"], [258, 94, "#FDE2E2", "0 , 5"], [147, 159, "#FDE2E2", "5 , 0"], [258, 159, "#EFE7D6", "1 , 1"]];
    return [
      C.map(function(c){ return rct(c[0] - 55, c[1] - 32, 110, 65, c[2], 0, 0); }).join(""),
      rct(92, 62, 222, 130, "none", 4, 2.5) + ln(203, 62, 203, 192, INK, 2.5) + ln(92, 126, 314, 126, INK, 2.5) +
        dT("cooperate", 147, 52, 13) + dT("defect", 258, 52, 13) + dL("player 2", 203, 22, 14) + dT("cooperate", 46, 98, 12) + dT("defect", 46, 163, 12) + dL("player 1", 46, 66, 14),
      C.map(function(c){ return txt(c[3], c[0], c[1] + 8, 20, INK); }).join("")
    ];
  });
  dgm("cer", "Claim, evidence, reasoning", "class", ["claim evidence and reasoning", "claim evidence reasoning", "claim and evidence", "evidence and reasoning", "c e r"], {
    claim: [[4, 34, 98, 136], "claim,claims"], evidence: [[111, 34, 98, 136], "evidence,data,proof,observation,observations"], reasoning: [[218, 34, 98, 136], "reasoning,reason,explain,explanation"]
  }, function(){
    var B = [["claim", "speech", "what you think", "#F6C343"], ["evidence", "magnifier", "what you found", "#7FB8DE"], ["reasoning", "brain", "why it proves it", "#9CCB7A"]];
    return B.map(function(b, i){
      var x = 53 + i * 107;
      return rct(x - 44, 40, 88, 122, b[3], 12, 2.5) + dI(b[1], x, 80, 44) + dT(b[0], x, 126, 15) + dL(b[2], x, 148, 11) + (i < 2 ? dA(x + 46, 100, x + 61, 100, INK, 0, 3) : "");
    });
  });
  dgm("growthcurve", "Linear and exponential growth", "math", ["exponential growth", "population growth", "grows exponentially", "growing exponentially", "linear growth", "exponential function", "doubling time", "exponential decay"], {
    exponential: [[170, 10, 146, 110], "exponential,exponentially,doubling,doubles"], linear: [[180, 96, 136, 70], "linear,steady,constant"]
  }, function(){
    var e = [];
    for (var x = 0; x <= 250; x += 5) e.push([40 + x, 176 - 150 * (Math.pow(2, x / 50) - 1) / 31]);
    return [
      ln(40, 178, 304, 178, INK, 2.5) + ln(40, 178, 40, 14, INK, 2.5) + dL("time", 280, 196, 13) + dL("amount", 24, 24, 13, "start"),
      ln(40, 176, 290, 104, "#4F9D78", 4) + dL("linear (adds)", 300, 96, 13, "end"),
      pline(e, "#D9674B", 4) + dL("exponential (doubles)", 232, 30, 13, "end")
    ];
  });
  dgm("animalgroups", "Animal groups", "land", ["animal groups", "groups of animals", "classify animals", "classifying animals", "classification of animals", "vertebrates", "types of animals", "kinds of animals", "five groups of animals"], {
    mammals: [[2, 66, 64, 110], "mammal,mammals,fur,milk"], birds: [[66, 66, 62, 110], "bird,birds,feathers"], fish: [[128, 66, 64, 110], "fish,gills,fins"],
    reptiles: [[192, 66, 62, 110], "reptile,reptiles,scales"], amphibians: [[254, 66, 64, 110], "amphibian,amphibians"]
  }, function(){
    var K = [["bear", "mammals"], ["bird", "birds"], ["fish", "fish"], ["turtle", "reptiles"], ["frog", "amphibians"]];
    return [dT("animals", 160, 26, 16) + K.map(function(k, i){ return ln(160, 34, 34 + i * 63, 72, "#9AA3AD", 2); }).join("")].concat(K.map(function(k, i){
      var x = 34 + i * 63;
      return dI(k[0], x, 108, 52) + dL(k[1], x, 156, 11);
    }));
  });
  dgm("celldivision", "Cell division", "bio", ["cell division", "cells divide", "cell divides", "mitosis"], {
    parent: [[10, 44, 110, 130], "parent cell,original,one cell"], daughter: [[180, 14, 136, 172], "daughter cells,two cells,new cells,copies,identical"]
  }, function(){
    return [
      circ(64, 100, 40, "#FCE1E4", 2.5) + circ(64, 100, 14, "#B79CD9", 2) + dL("one cell", 64, 162, 14),
      dA(110, 92, 176, 64, INK, -6, 3) + dA(110, 108, 176, 136, INK, 6, 3) + dL("divides", 142, 104, 12),
      circ(220, 58, 30, "#FCE1E4", 2.5) + circ(220, 58, 10, "#B79CD9", 2) + circ(220, 142, 30, "#FCE1E4", 2.5) + circ(220, 142, 10, "#B79CD9", 2),
      dL("two new cells", 266, 104, 13)
    ];
  });
  dgm("neuron", "A neuron", "bio", ["neuron", "neurons", "nerve cell", "nerve cells", "parts of a neuron", "axon", "axons", "synapse", "synapses"], {
    dendrites: [[2, 22, 92, 156], "dendrite,dendrites"], body: [[48, 70, 62, 62], "cell body,nucleus,soma"],
    axon: [[106, 74, 150, 56], "axon,axons,signal,signals,impulse,message"], terminals: [[250, 42, 68, 120], "synapse,synapses,terminal,terminals,neurotransmitter,neurotransmitters"]
  }, function(){
    var myelin = "";
    for (var x = 116; x < 244; x += 32) myelin += rct(x, 92, 26, 16, "#F2E3B3", 7, 2);
    return [
      pth("M60 84 L30 52 M30 52 L16 44 M30 52 L24 34 M58 118 L28 146 M28 146 L12 150 M28 146 L32 166 M84 76 L90 42 M90 42 L80 28 M90 42 L104 32", "none", { stroke: "#C97BA8", w: 4 }) + dL("dendrites", 40, 24, 13),
      circ(78, 100, 26, "#F4B8D2", 2.5) + circ(78, 100, 9, "#7E5DB0", 0) + dL("cell body", 78, 150, 13),
      ln(104, 100, 252, 100, "#C97BA8", 6) + myelin + dL("axon", 180, 84, 14),
      pth("M252 100 L280 72 M252 100 L288 100 M252 100 L280 128", "none", { stroke: "#C97BA8", w: 4 }) + circ(282, 70, 6, "#F4B8D2", 2) + circ(291, 100, 6, "#F4B8D2", 2) + circ(282, 130, 6, "#F4B8D2", 2) + dL("synapse", 284, 160, 13),
      dA(124, 124, 236, 124, "#E9A23B", 0, 2.5) + dL("signal", 180, 142, 12)
    ];
  });

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
    sc.caption = raw.length <= 14 ? cap(raw.join(" ").replace(/^[^A-Za-z0-9]+/, "").replace(/[.!?;:,\u2014\-]+$/, "")) : d.title;
    return sc;
  }
  function drawDiagram(sc){
    var d = DIAGRAMS[sc.diagram], at = sc.diagramAt || 0, out = "";
    (sc.highlight || []).forEach(function(p){ if (d.parts[p]) out += el(at, glow(d.parts[p].box)); });
    d.draw().forEach(function(layer, j){ out += el(at + j, layer); });
    return out;
  }

  var renderCount = 0;
  function renderScene(sc){
    var id = "s" + (++renderCount) + "_";
    var bg = background(sc.setting, id);
    return '<svg class="scene" viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(sc.caption || "") + '">' +
      '<defs>' + bg.defs + '</defs>' + bg.body + (sc.diagram && DIAGRAMS[sc.diagram] ? drawDiagram(sc) : layoutScene(sc)) + '</svg>';
  }

  // ---------- helpers for the app ----------
  function firstAt(sc){
    if (sc.diagram) return sc.diagramAt || 0;
    var ats = allItems(sc).map(function(x){ return x.at; });
    if (sc.relation && sc.relation !== "and") ats.push(sc.verbAt);
    return ats.length ? Math.min.apply(null, ats) : 0;
  }
  function highlightAts(sc){
    var h = {};
    if (!sc.show) return h;
    if (sc.diagram){ (sc.hlAts || []).forEach(function(i){ h[i] = true; }); return h; }
    allItems(sc).forEach(function(x){ h[x.at] = true; });
    if (sc.relation && sc.relation !== "and") h[sc.verbAt] = true;
    if (sc.then) h[sc.then.verbAt] = true;
    return h;
  }
  function sceneKeys(sc){ return sc.diagram ? ["d:" + sc.diagram + ":" + (sc.highlight || []).join(",")] : allItems(sc).map(function(x){ return x.key; }); }

  var ICON_HINT = {
    drop: "water", wave: "ocean/sea", sprout: "plant/seed", bolt: "energy/electricity", flame: "fire/heat", snowflake: "ice/cold",
    globe: "Earth/world/country", crown: "king/queen/ruler", group: "people/citizens/crowd/soldiers", person: "one person/student/teacher",
    gear: "machine/wheel", columns: "government/law/democracy", ballot: "voting/election", vapor: "steam/gas/evaporation",
    bulb: "idea/invention/light", scroll: "document/history", swords: "war/battle", dove: "peace/freedom", coins: "money/trade",
    fist: "revolution/protest", chart: "data/graph", flask: "experiment/chemistry", gravity: "gravity/falling objects", apple: "food/fruit",
    cell: "living cell", dna: "DNA/genes", atom: "atom/molecule/matter", rain: "rain", storm: "storm/thunder",
    pizza: "fraction (pizza with a slice missing)", whole: "a whole (full pizza)", half: "one half", slice: "one slice/quarter", numbers: "numbers/math", co2: "carbon dioxide", quill: "writer/author/scribe", puzzle: "plot/puzzle",
    trophy: "goal/prize/climax", question: "question/problem", magnifier: "clue/evidence", handshake: "agreement/union", map: "map/setting/route",
    muscle: "muscle/force", cocoon: "chrysalis/cocoon", fox: "fox/predator", rabbit: "rabbit/prey", grass: "grass/producer", mushroom: "mushroom/decomposer",
    shield: "protection/immune system", pill: "medicine/vaccine", plug: "wire/circuit", note: "music", sound: "sound", house: "home/house", city: "city/town"
  };
  function buildPlanPrompt(sentences, extraWords){
    var icons = Object.keys(I).map(function(k){ return ICON_HINT[k] ? k + " (" + ICON_HINT[k] + ")" : k; }).join(", ");
    var extra = extraWords && extraWords.length ? "\nExtra words the teacher added (also usable as icon keys): " + extraWords.join(", ") : "";
    return [
      "You are helping a teacher turn a spoken lesson into a simple picture storyboard for students. For each numbered sentence, decide whether a small illustrated scene would help students picture the idea, and if so describe the scene using ONLY the icons and relations listed below.",
      "",
      "Icons (use the key exactly): " + icons + extra,
      "",
      "Relations:",
      "- heats / cools: subject warms, burns, cools, or hardens the object",
      "- rises / falls: movement up / down (evaporating, raining, sinking, flowing downhill)",
      "- becomes: subject turns into, forms, or builds the object",
      "- powers: subject gives energy to or drives the object",
      "- contains: subject (the container) holds the objects inside it",
      "- versus: subject fights or opposes the object",
      "- wants: subject says, writes, demands, or asks for the objects (drawn as a speech bubble)",
      "- needs: subject uses, depends on, or eats the objects",
      "- pulls: subject pulls, pushes, or attracts the object",
      "- leads: subject causes, leads to, helps, gives, sends, or moves to the object",
      "- splits: subject divides, breaks, or shares into the objects",
      "- cycle: the subjects repeat in a loop or orbit (list every participant in subjects, no objects)",
      "- and: no clear action; just show the subjects together",
      "Settings: sky, land, sea, space, bio, lab, history, town, math, class, plain",
      "",
      "Diagrams: when a sentence introduces one of these whole topics, reply {\"i\":n,\"show\":true,\"diagram\":\"key\",\"caption\":\"...\"} instead of icons: " +
        DIAGRAM_ORDER.map(function(k){ return k + " (" + DIAGRAMS[k].title + ")"; }).join(", "),
      "",
      "Rules:",
      "- Picture the MEANING of the phrase, not just its nouns. Pick icons for what the words refer to (\"citizens\" -> group, \"the ruler\" -> crown, \"steam\" -> vapor) and the relation that shows what happens.",
      "- subjects: 1-2 icon keys doing the action. objects: 0-2 icon keys it acts on. Never repeat a key within a sentence.",
      "- Optional \"then\" continues the story from the objects: {\"relation\", \"verb\", \"objects\"} (the sun heats the ocean, which then becomes vapor). Only for heats, cools, rises, falls, becomes, powers, pulls, leads, splits.",
      "- verb: the arrow label, 1-3 words in the teacher's own wording (\"heats\", \"turns into\").",
      "- labels: for each icon key used, the 1-2 word name to print under it, in the teacher's words (\"ocean\", not \"wave\").",
      "- caption: at most 7 plain words a 10-year-old could read.",
      "- Use \"show\": false for sentences with nothing concrete to picture (greetings, transitions), and when nothing in the icon list fits. A missing picture is better than a misleading one.",
      "",
      "Reply with only a JSON array, one object per sentence, in order. Example:",
      '[{"i":1,"show":true,"setting":"sea","subjects":["sun"],"relation":"heats","verb":"heats","objects":["wave"],"then":{"relation":"becomes","verb":"turns into","objects":["vapor"]},"labels":{"sun":"sun","wave":"ocean","vapor":"vapor"},"caption":"The sun turns ocean water into vapor"},{"i":2,"show":false}]',
      "",
      "Sentences:",
      sentences.map(function(s, i){ return (i + 1) + ". " + s; }).join("\n")
    ].join("\n");
  }
  function iconGallery(){
    return Object.keys(I).map(function(k){
      return { key: k, name: VOCAB[k] ? VOCAB[k][0] : k, words: VOCAB[k] || [k], svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + I[k] + '</svg>' };
    });
  }

  function iconSVG(key){ return I[key] ? '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + I[key] + '</svg>' : ""; }
  function sceneIcons(sc){ return allItems(sc).filter(function(x){ return x.icon; }).map(function(x){ return x.icon; }); }
  return {
    iconSVG: iconSVG, sceneIcons: sceneIcons, vocabFor: function(k){ return VOCAB[k] || []; },
    analyze: analyze, sceneFromAI: sceneFromAI, renderScene: renderScene, firstAt: firstAt,
    highlightAts: highlightAts, sceneKeys: sceneKeys, buildPlanPrompt: buildPlanPrompt, iconGallery: iconGallery, isUnsure: function(w, extra){ w = normalize(w); return !!w && !RELATION[w] && looseWord(w) && extraConcept(w, extra) === undefined; }, lookup: function(w, extra){ return conceptFor(normalize(w), extra); },
    setOpenMoji: function(o){ OM = o; }, hasOpenMoji: function(){ return !!OM; },
    splitSpoken: splitSpoken, diagramScene: function(text, key){ return diagramScene(text, key); }, diagramCount: DIAGRAM_ORDER.length,
    diagramGallery: function(){
      return DIAGRAM_ORDER.map(function(k){ var d = DIAGRAMS[k], sc = diagramScene(d.title, k); sc.caption = d.title; sc.highlight = []; return { key: k, title: d.title, say: d.sayText, svg: renderScene(sc) }; });
    },
    normalize: normalize, iconCount: Object.keys(I).length, wordCount: Object.keys(WORD_TO_ICON).length + Object.keys(EMOJI_LIB).length, ICONS: I
  };
})();
