// People's names, so "Rosa Parks" doesn't draw a park and "Martin Luther King" doesn't draw a crown.
import { RELATION } from "./relations.js"

// "Rosa Parks" must not draw a park and "Martin Luther King" must not draw a crown: runs of capitalised words are names.
var NAME_SKIP = { the: 1, a: 1, an: 1, in: 1, on: 1, at: 1, of: 1, and: 1, ancient: 1, modern: 1, early: 1, great: 1, many: 1, some: 1, when: 1, then: 1, today: 1, now: 1, this: 1, that: 1, these: 1, those: 1, every: 1, each: 1, after: 1, before: 1, during: 1, as: 1, if: 1, but: 1, so: 1, with: 1, for: 1, from: 1 };
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
export { isName, spokenNames };
