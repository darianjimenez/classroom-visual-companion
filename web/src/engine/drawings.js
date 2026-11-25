// The hand-drawn picture library (each drawn in a 100×100 box), and the ones redrawn with OpenMoji artwork.
import { OM, omKey } from "./openmoji.js"
import { EMOJI_FONT, INK, blob, circ, ell, f, ln, person, pline, polar, poly, pth, rct, sub } from "./primitives.js"

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
I.coins = [70, 62, 54].map(function(y){ return ell(40, y + 5, 24, 8, "#E9A23B") + ell(40, y, 24, 8, "#F6C343"); }).join("") +
  circ(70, 56, 16, "#F6C343") + '<text x="70" y="62" text-anchor="middle" font-size="18" font-weight="700" font-family="Figtree, sans-serif" fill="#A8701A">$</text>';
I.flag = ln(28, 90, 28, 12, INK, 4) + pth("M28 16 C42 10 56 26 76 18 V48 C56 56 42 40 28 46 Z", "#D9674B") + circ(28, 11, 3.5, "#F6C343", 2);
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
I.bone = (function(){
  var ends = [[24, 36], [32, 26], [68, 74], [76, 64]];
  return ln(30, 34, 70, 66, INK, 19) + ends.map(function(p){ return circ(p[0], p[1], 11.5, INK, 0); }).join("") +
    ln(30, 34, 70, 66, "#F5EEDC", 13) + ends.map(function(p){ return circ(p[0], p[1], 9, "#F5EEDC", 0); }).join("");
})();
I.tooth = pth("M30 20 C40 14 46 20 50 20 C54 20 60 14 70 20 C82 28 78 46 72 56 C68 64 68 84 62 86 C56 88 56 68 50 68 C44 68 44 88 38 86 C32 84 32 64 28 56 C22 46 18 28 30 20 Z", "#FFFFFF") +
  pth("M34 28 Q38 24 44 26", "none", { stroke: "#BFE3F5", w: 3 });
I.eye = pth("M8 50 C26 24 74 24 92 50 C74 76 26 76 8 50 Z", "#FFFFFF") + circ(50, 50, 16, "#5F9BC7") + circ(50, 50, 7, INK, 0) + circ(55, 45, 3, "#FFFFFF", 0) +
  pth("M30 30 L26 22 M50 25 V15 M70 30 L74 22", "none", { w: 3 });
I.lungs = fatLine("M50 8 V40 M50 40 L42 50 M50 40 L58 50", "#E8D5C4", 4) +
  pth("M44 30 C30 30 18 50 18 70 C18 82 30 86 42 78 C46 74 46 60 46 50 Z", "#F28FA6") + pth("M56 30 C70 30 82 50 82 70 C82 82 70 86 58 78 C54 74 54 60 54 50 Z", "#F28FA6") +
  pth("M30 56 Q36 60 38 68 M70 56 Q64 60 62 68", "none", { w: 2, op: 0.5 });
I.stomach = pth("M40 12 C40 30 30 36 30 52 C30 74 52 84 70 76 C86 68 84 48 70 46 C58 44 58 56 50 50 C46 46 52 30 52 12 Z", "#F2A7B8") +
  pth("M38 60 Q48 70 62 66", "none", { w: 2, op: 0.5 });
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
I.cow = poly([[26, 30], [20, 12], [36, 22]], "#F4F1E8") + poly([[74, 30], [80, 12], [64, 22]], "#F4F1E8") + ell(16, 40, 10, 6, "#FFFFFF", 2.5, ' transform="rotate(20 16 40)"') + ell(84, 40, 10, 6, "#FFFFFF", 2.5, ' transform="rotate(-20 84 40)"') +
  ell(50, 46, 24, 28, "#FFFFFF") + circ(36, 30, 7, "#2B2620", 0) + ell(50, 70, 17, 13, "#F7C6C6") + circ(43, 71, 2.6, INK, 0) + circ(57, 71, 2.6, INK, 0) + circ(40, 44, 3.2, INK, 0) + circ(60, 44, 3.2, INK, 0);
I.pig = poly([[24, 36], [20, 14], [42, 26]], "#F5A9B8") + poly([[76, 36], [80, 14], [58, 26]], "#F5A9B8") + circ(50, 52, 31, "#F5A9B8") + ell(50, 62, 15, 11, "#EE8CA0", 2.5) +
  circ(45, 62, 2.6, INK, 0) + circ(55, 62, 2.6, INK, 0) + circ(38, 45, 3.2, INK, 0) + circ(62, 45, 3.2, INK, 0);
I.sheep = blob([[28, 46, 14], [42, 34, 15], [60, 34, 15], [74, 46, 14], [36, 62, 13], [64, 62, 13], [50, 50, 18]], "#FFFFFF") + ell(50, 58, 15, 18, "#3A322C") + circ(44, 52, 2.6, "#FFFFFF", 0) + circ(56, 52, 2.6, "#FFFFFF", 0) +
  ell(31, 56, 7, 4, "#3A322C", 2.5, ' transform="rotate(30 31 56)"') + ell(69, 56, 7, 4, "#3A322C", 2.5, ' transform="rotate(-30 69 56)"');
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
I.spider = pth("M44 46 L20 26 L10 36 M44 50 L14 50 L8 62 M44 54 L20 72 L16 88 M56 46 L80 26 L90 36 M56 50 L86 50 L92 62 M56 54 L80 72 L84 88", "none", { w: 3.5 }) +
  circ(50, 64, 17, "#4A3A55") + circ(50, 42, 11, "#4A3A55") + circ(46, 40, 2.6, "#FFFFFF", 0) + circ(54, 40, 2.6, "#FFFFFF", 0) + pth("M50 56 L50 72", "none", { stroke: "#D9674B", w: 4 });
I.octopus = pth("M22 60 C16 78 10 82 14 90 M34 66 C32 80 30 86 36 92 M50 66 V92 M66 66 C68 80 70 86 64 92 M78 60 C84 78 90 82 86 90", "none", { w: 12 }) +
  pth("M22 60 C16 78 10 82 14 90 M34 66 C32 80 30 86 36 92 M50 66 V92 M66 66 C68 80 70 86 64 92 M78 60 C84 78 90 82 86 90", "none", { stroke: "#B58AD6", w: 7 }) + pth("M20 54 C16 22 84 22 80 54 C78 68 22 68 20 54 Z", "#B58AD6") +
  circ(40, 46, 5, "#FFFFFF", 2) + circ(60, 46, 5, "#FFFFFF", 2) + circ(41, 47, 2, INK, 0) + circ(61, 47, 2, INK, 0);
I.crab = pth("M28 66 L12 80 M36 72 L24 90 M72 66 L88 80 M64 72 L76 90", "none", { w: 4 }) + pth("M30 52 C14 50 10 28 24 24 C30 30 30 40 36 46 M70 52 C86 50 90 28 76 24 C70 30 70 40 64 46", "#E05A5A", { w: 3 }) +
  ell(50, 62, 26, 18, "#E05A5A") + pth("M42 46 V38 M58 46 V38", "none", { w: 3 }) + circ(42, 36, 4.5, "#FFFFFF", 2) + circ(58, 36, 4.5, "#FFFFFF", 2) + circ(42, 36, 1.8, INK, 0) + circ(58, 36, 1.8, INK, 0) + pth("M42 64 Q50 70 58 64", "none", { w: 2.5 });
I.penguin = ell(50, 56, 28, 34, "#2F3A4A") + ell(50, 62, 18, 26, "#FFFFFF", 0) + circ(42, 38, 5, "#FFFFFF", 0) + circ(58, 38, 5, "#FFFFFF", 0) + circ(43, 39, 2.2, INK, 0) + circ(57, 39, 2.2, INK, 0) + poly([[44, 46], [56, 46], [50, 54]], "#F08A4B", 2) +
  ell(20, 60, 7, 18, "#2F3A4A", 2.5, ' transform="rotate(14 20 60)"') + ell(80, 60, 7, 18, "#2F3A4A", 2.5, ' transform="rotate(-14 80 60)"') + ell(38, 92, 9, 4, "#F08A4B", 2.5) + ell(62, 92, 9, 4, "#F08A4B", 2.5);
I.owl = poly([[26, 30], [24, 10], [42, 22]], "#8A5A3C") + poly([[74, 30], [76, 10], [58, 22]], "#8A5A3C") + ell(50, 54, 30, 36, "#A9744F") + ell(50, 66, 18, 22, "#F3E4BD", 0) + circ(38, 44, 12, "#FFFFFF", 2.5) + circ(62, 44, 12, "#FFFFFF", 2.5) +
  circ(38, 44, 5.5, INK, 0) + circ(62, 44, 5.5, INK, 0) + poly([[45, 52], [55, 52], [50, 62]], "#F6C343", 2) + pth("M40 72 Q44 76 48 72 M52 72 Q56 76 60 72 M42 82 Q46 86 50 82 M50 82 Q54 86 58 82", "none", { w: 2, stroke: "#A9744F" });
I.mouse = circ(24, 30, 15, "#B8BEC4") + circ(76, 30, 15, "#B8BEC4") + circ(24, 30, 8, "#F7C6C6", 0) + circ(76, 30, 8, "#F7C6C6", 0) + pth("M50 22 C74 22 82 48 70 70 C64 80 56 84 50 84 C44 84 36 80 30 70 C18 48 26 22 50 22 Z", "#C9CED3") +
  circ(40, 50, 3, INK, 0) + circ(60, 50, 3, INK, 0) + circ(50, 68, 4.5, "#E8788A", 0) + ln(10, 62, 32, 64, INK, 2) + ln(10, 72, 32, 68, INK, 2) + ln(90, 62, 68, 64, INK, 2) + ln(90, 72, 68, 68, INK, 2);
I.snail = pth("M10 78 C10 70 20 68 30 70 H80 C88 70 90 78 84 80 C70 84 24 86 10 78 Z", "#C9D88F") + pth("M80 72 L86 52 M88 74 L94 56", "none", { w: 3 }) + circ(86, 51, 3, "#C9D88F", 2) + circ(94, 55, 3, "#C9D88F", 2) +
  circ(50, 50, 24, "#D9A06F") + pth("M50 50 m0 -2 a4 4 0 1 1 -4 4 a9 9 0 1 1 9 9 a15 15 0 1 1 -15 -15", "none", { w: 2.8, stroke: "#8A5A3C" });
I.jellyfish = pth("M34 54 C32 68 36 76 32 90 M46 56 C44 70 48 80 44 94 M58 56 C60 70 56 80 60 94 M70 54 C68 68 72 76 68 90", "none", { stroke: "#E39BD6", w: 4 }) + pth("M16 56 C14 18 86 18 84 56 C70 50 64 60 50 56 C36 60 30 50 16 56 Z", "#F2B8E8") + circ(38, 38, 4, "#FFFFFF", 0, "") + circ(60, 34, 3, "#FFFFFF", 0);
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
I.tractor = circ(70, 68, 20, "#3A322C") + circ(70, 68, 8, "#F6C343", 0) + circ(26, 76, 12, "#3A322C") + circ(26, 76, 5, "#F6C343", 0) + pth("M12 62 V40 H34 L42 22 H62 V44 H88 V56 H12 Z", "#6BBF8A") + rct(44, 26, 14, 16, "#BFE3F5", 2, 2.5) + rct(66, 24, 6, 20, INK, 1, 0);
I.sailboat = poly([[50, 8], [50, 62], [18, 62]], "#FFFFFF") + poly([[54, 22], [54, 62], [84, 62]], "#F6C343") + ln(50, 8, 50, 70, INK, 3.5) + pth("M10 68 H90 L78 86 H22 Z", "#D9674B") + pth("M4 90 Q14 84 24 90 T44 90 T64 90 T84 90 T98 90", "none", { stroke: "#6FB3E0", w: 3.5 });
I.anchor = circ(50, 18, 8, "none", 5) + ln(50, 26, 50, 84, INK, 6) + ln(32, 42, 68, 42, INK, 6) + pth("M14 62 C16 82 36 90 50 88 C64 90 84 82 86 62 M14 62 L8 72 M86 62 L92 72", "none", { w: 6 });
I.lighthouse = poly([[34, 90], [40, 30], [60, 30], [66, 90]], "#FFFFFF") + poly([[37, 60], [63, 60], [65, 74], [35, 74]], "#D9674B", 0) + poly([[39, 40], [61, 40], [62, 50], [38, 50]], "#D9674B", 0) + rct(38, 20, 24, 12, "#F6C343", 2) + poly([[36, 20], [50, 6], [64, 20]], "#D9674B") + ln(24, 26, 8, 20, "#F6C343", 3.5) + ln(76, 26, 92, 20, "#F6C343", 3.5) + rct(26, 88, 48, 6, "#8A5A3C", 1);
I.tent = poly([[50, 14], [92, 86], [8, 86]], "#F08A4B") + poly([[50, 14], [50, 86], [34, 86]], "#D9674B", 0) + poly([[50, 42], [64, 86], [38, 86]], "#3A322C") + ln(50, 14, 50, 6, INK, 3);
I.campfire = pth("M16 84 L66 70 M84 84 L34 70", "none", { stroke: "#A9744F", w: 11 }) + pth("M16 84 L66 70 M84 84 L34 70", "none", { stroke: "#8A5A3C", w: 5 }) + pth("M50 12 C72 34 76 50 66 64 C60 72 40 72 34 64 C24 50 34 34 50 12 Z", "#F08A4B") + pth("M50 36 C60 48 62 56 54 64 C48 68 42 64 42 58 C42 52 46 48 50 36 Z", "#F6C343", { w: 0 });
I.bell = pth("M50 10 C30 10 26 30 26 46 C26 60 14 66 14 72 H86 C86 66 74 60 74 46 C74 30 70 10 50 10 Z", "#F6C343") + circ(50, 82, 7, "#E9A23B") + circ(50, 9, 4, "#E9A23B");
I.camera = rct(8, 28, 84, 56, "#5A6572", 8) + pth("M30 28 L36 16 H64 L70 28", "#5A6572", { w: 3 }) + circ(50, 56, 20, "#B8BEC4") + circ(50, 56, 13, "#5F9BC7") + circ(45, 51, 4, "#FFFFFF", 0) + circ(80, 40, 4, "#F6C343", 0);
I.headphones = pth("M16 60 V50 C16 14 84 14 84 50 V60", "none", { w: 7 }) + rct(10, 54, 20, 32, "#D9674B", 8) + rct(70, 54, 20, 32, "#D9674B", 8);
I.piano = rct(8, 24, 84, 56, "#FFFFFF", 4, 3.5) + [22, 36, 50, 64, 78].map(function(x){ return ln(x, 52, x, 80, INK, 2.5); }).join("") + [18, 32, 56, 70].map(function(x){ return rct(x, 24, 9, 32, INK, 1, 0); }).join("");
I.drum = pth("M10 38 V70 C10 82 90 82 90 70 V38", "#D9674B") + ell(50, 38, 40, 12, "#F3E4BD", 3) + ln(10, 40, 50, 74, "#F6C343", 3) + ln(90, 40, 50, 74, "#F6C343", 3) + ln(26, 20, 56, 38, "#C98A4F", 5) + ln(74, 20, 44, 38, "#C98A4F", 5);
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
I.kidneys = pth("M24 18 C6 28 6 62 24 82 C34 94 46 80 34 66 C30 58 34 48 42 44 C52 36 40 10 24 18 Z", "#C0504A") + pth("M76 18 C94 28 94 62 76 82 C66 94 54 80 66 66 C70 58 66 48 58 44 C48 36 60 10 76 18 Z", "#C0504A");
I.waterfall = poly([[6, 6], [40, 6], [40, 40], [6, 56]], "#8A7A66") + poly([[60, 6], [94, 6], [94, 60], [60, 40]], "#8A7A66") + rct(40, 6, 20, 56, "#BFE3F5", 0, 2.5) + ln(46, 10, 46, 58, "#FFFFFF", 3) + ln(54, 14, 54, 58, "#FFFFFF", 3) + ell(50, 76, 36, 12, "#6FB3E0", 3) + pth("M30 74 Q40 70 50 74 T70 74", "none", { stroke: "#FFFFFF", w: 2.5 });
I.lake = ell(50, 58, 42, 24, "#6FB3E0", 3) + pth("M22 58 Q32 52 42 58 T62 58", "none", { stroke: "#FFFFFF", w: 2.5 }) + pth("M30 70 Q40 64 50 70 T70 70", "none", { stroke: "#D6ECF8", w: 2.5 }) + pth("M4 40 l8 -14 l8 14 Z", "#4F9D78") + pth("M80 38 l8 -14 l8 14 Z", "#4F9D78");
I.iceberg = pth("M4 56 H96", "none", { stroke: "#6FB3E0", w: 3 }) + poly([[26, 56], [36, 30], [46, 20], [56, 38], [66, 28], [76, 56]], "#FFFFFF") + poly([[24, 58], [76, 58], [64, 84], [44, 92], [32, 78]], "#B8DCEF") + rct(0, 56, 100, 44, "#8EC5E4", 0, 0) + poly([[26, 56], [36, 30], [46, 20], [56, 38], [66, 28], [76, 56]], "#FFFFFF") + poly([[28, 60], [72, 60], [62, 82], [44, 90], [34, 78]], "#B8DCEF", 2.5);
I.igloo = pth("M8 80 C8 28 92 28 92 80 Z", "#FFFFFF") + pth("M8 80 H92", "none", { w: 3 }) + pth("M18 62 H82 M26 46 H74 M50 30 V46 M36 46 V62 M64 46 V62 M26 62 V80 M50 62 V80 M74 62 V80", "none", { stroke: "#B8DCEF", w: 2.5 }) + pth("M38 80 C38 64 62 64 62 80 Z", "#5A6572");
I.cave = pth("M4 90 C4 30 24 10 50 10 C76 10 96 30 96 90 Z", "#8A7A66") + pth("M26 90 C26 56 36 44 50 44 C64 44 74 56 74 90 Z", "#3A322C") + poly([[34, 12], [38, 28], [42, 12]], "#A89A84", 2) + poly([[58, 12], [62, 24], [66, 12]], "#A89A84", 2) + poly([[40, 90], [46, 76], [52, 90]], "#6B5E4E", 2);
I.canyon = poly([[2, 20], [40, 20], [30, 60], [42, 96], [2, 96]], "#D98A4F") + poly([[98, 20], [60, 20], [70, 60], [58, 96], [98, 96]], "#C97A3F") + pth("M10 44 H32 M10 66 H36 M90 44 H68 M90 70 H62", "none", { stroke: "#F3C48E", w: 2.5 }) + pth("M40 96 C46 72 38 60 44 20 H56 C60 60 54 72 58 96 Z", "#6FB3E0");
I.sandy = pth("M2 78 C24 40 44 52 60 64 C74 74 88 60 98 52 V96 H2 Z", "#F3D796") + pth("M2 90 C26 76 50 92 98 84", "none", { stroke: "#E4BC6A", w: 3 }) + circ(78, 22, 12, "#F6C343");
I.forest = [[22, 62], [50, 66], [78, 62]].map(function(p){ return ln(p[0], p[1], p[0], 90, "#8A5A3C", 7) + poly([[p[0], p[1] - 52], [p[0] + 20, p[1] - 8], [p[0] - 20, p[1] - 8]], "#4F9D78") + poly([[p[0], p[1] - 34], [p[0] + 24, p[1] + 6], [p[0] - 24, p[1] + 6]], "#6BBF8A"); }).join("");
I.torch = ln(50, 46, 50, 92, "#8A5A3C", 10) + pth("M50 8 C72 26 68 40 58 46 H42 C32 40 28 26 50 8 Z", "#F08A4B") + pth("M50 22 C60 32 58 40 54 44 H46 C42 40 40 32 50 22 Z", "#F6C343", { w: 0 }) + rct(36, 44, 28, 8, "#5A6572", 2);
I.amphora = pth("M36 10 H64 C62 22 74 32 76 56 C78 80 64 92 50 92 C36 92 22 80 24 56 C26 32 38 22 36 10 Z", "#D98A4F") + pth("M36 14 C14 18 14 46 30 44 M64 14 C86 18 86 46 70 44", "none", { w: 4 }) + pth("M28 40 H72 M26 66 H74", "none", { stroke: "#3A322C", w: 3 }) + pth("M34 52 L42 56 L50 52 L58 56 L66 52", "none", { stroke: "#3A322C", w: 2 });
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
I.heartbeat = pth("M50 88 C14 60 6 36 22 22 C34 12 46 20 50 30 C54 20 66 12 78 22 C94 36 86 60 50 88 Z", "#F5A9A9") + pth("M10 52 H34 L42 34 L54 70 L62 48 H90", "none", { stroke: "#B03030", w: 4 });
I.sunrise = pth("M2 70 H98", "none", { w: 3 }) + circ(50, 70, 24, "#F6C343") + rct(0, 70, 100, 30, "#8EC5E4", 0, 0) + ln(2, 70, 98, 70, INK, 3) + [[50, 24], [20, 36], [80, 36], [10, 58], [90, 58]].map(function(p){ return ln(p[0], p[1], p[0] + (p[0] - 50) * 0.15, p[1] - 6 - (p[0] === 50 ? 4 : 0), "#E9A23B", 4); }).join("");
I.stars = poly([[30, 16], [36, 32], [54, 34], [40, 44], [46, 62], [30, 52], [14, 62], [20, 44], [6, 34], [24, 32]], "#F6C343") + poly([[72, 44], [77, 58], [92, 60], [80, 68], [84, 84], [72, 76], [60, 84], [64, 68], [52, 60], [67, 58]], "#F6C343");
I.newmoon = circ(50, 50, 38, "#3A322C") + pth("M50 12 A38 38 0 0 0 50 88", "none", { stroke: "#E8D9A0", w: 3.5, op: 0.8 });
I.fullmoon = circ(50, 50, 38, "#F3E9B8") + circ(36, 38, 6, "#E4D794", 0) + circ(62, 60, 8, "#E4D794", 0) + circ(58, 32, 4, "#E4D794", 0);
I.crescent = pth("M64 10 C34 12 18 40 28 66 C38 90 70 94 86 78 C56 78 46 44 64 10 Z", "#F3E9B8");
I.nest = ell(50, 66, 38, 14, "#A9744F", 3) + pth("M14 62 C14 78 86 78 86 62 C86 70 14 70 14 62 Z", "#8A5A3C", { w: 2.5 }) + ell(36, 56, 9, 12, "#BFE3F5", 2.5) + ell(54, 54, 9, 12, "#BFE3F5", 2.5) + ell(70, 58, 8, 11, "#BFE3F5", 2.5) + pth("M16 66 L84 66", "none", { stroke: "#C98A4F", w: 3 });
I.web = pth("M50 50 L50 6 M50 50 L88 28 M50 50 L88 72 M50 50 L50 94 M50 50 L12 72 M50 50 L12 28", "none", { stroke: "#8E9AA6", w: 2.5 }) + pth("M50 22 L70 38 L70 62 L50 78 L30 62 L30 38 Z M50 36 L60 44 L60 56 L50 64 L40 56 L40 44 Z M50 10 L82 30 L82 70 L50 90 L18 70 L18 30 Z", "none", { stroke: "#8E9AA6", w: 2.5 });
I.crystal = poly([[50, 6], [76, 30], [66, 92], [34, 92], [24, 30]], "#9AD3E8") + pth("M24 30 H76 M50 6 L40 30 L34 92 M50 6 L60 30 L66 92", "none", { stroke: "#FFFFFF", w: 2.5, op: 0.8 });

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
// Hand drawings that didn't come out well are drawn with OpenMoji artwork instead: the same outlined, flat style, by
// professional designers. The keys stay, so lessons, diagrams and pictures teachers saved for a word keep working.
// Until the artwork has loaded (a moment after the page opens), the system emoji stands in.
var REDRAW = { bird: "🐦", dove: "🕊️", fist: "✊", tornado: "🌪️", dinosaur: "🦕", ear: "👂", hand: "✋", muscle: "💪", rabbit: "🐇", fox: "🦊", handshake: "🤝", horse: "🐴", chicken: "🐔", snake: "🐍", turtle: "🐢", ant: "🐜", shark: "🦈", giraffe: "🦒", deer: "🦌", squirrel: "🐿️", dolphin: "🐬", guitar: "🎸", trumpet: "🎺", violin: "🎻", flashlight: "🔦", helicopter: "🚁", footprint: "👣", jungle: "🌴", statue: "🗽", liberty: "🗽", helmet: "🪖", bandage: "🩹", meat: "🥩", thumbsup: "👍", nose: "👃", mouth: "👄", coral: "🪸" };
Object.keys(REDRAW).forEach(function(k){
  I[k] = '<text x="50" y="54" text-anchor="middle" dominant-baseline="middle" font-size="68" font-family="' + EMOJI_FONT + '">' + REDRAW[k] + '</text>';
});
function art(k){
  var e = REDRAW[k], om = e && OM && OM[omKey(e)];
  return om ? '<g transform="scale(1.3889)">' + om + '</g>' : I[k];
}
export { I, art, cubeAt, txt };
