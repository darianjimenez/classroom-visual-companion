// Phrases that mean one thing ("american football", "power plant", "cell phone") and what each shows.
import { OPENMOJI_PHRASES } from "./data/openmoji-words.js"
import { I } from "./drawings.js"
import { forms, normalize } from "./lookup.js"
import { SYM } from "./vocabulary.js"

// ---------- phrases, senses and verbs: what live talk needs beyond single words ----------
// Phrases that mean one thing ("american football", "power plant", "hot dog"). Read word by word they draw the wrong
// pictures, so the whole phrase is matched first: i:drawing, m:emoji, or "-" for no picture at all. The last word may be plural.
var PHRASE_SRC =
  // sport and games
  "american football|m:🏈;field goal|m:🏈;soccer ball|m:⚽;baseball bat|m:⚾;home run|m:⚾;cricket bat|m:🏏;table tennis|m:🏓;ping pong|m:🏓;" +
  "ice hockey|m:🏒;hockey stick|m:🏒;ice skating|m:⛸️;ice skate|m:⛸️;golf ball|m:⛳;tennis ball|m:🎾;tennis racket|m:🎾;basketball hoop|m:🏀;" +
  "quarterback|m:🏈;touchdown|m:🏈;goalkeeper|m:🥅;goalie|m:🥅;swimming pool|m:🏊;finish line|m:🏁;gold medal|m:🥇;silver medal|m:🥈;bronze medal|m:🥉;olympic games|m:🏅;board game|m:🎲;video game|m:🎮;" +
  // food
  "hot dog|m:🌭;corn dog|m:🌭;french fry|m:🍟;french fries|m:🍟;ice cream|m:🍦;ice cube|m:🧊;peanut butter|m:🥜;french toast|m:🍞;sweet potato|m:🍠;" +
  "apple pie|m:🥧;candy cane|m:🍬;cotton candy|m:🍭;fast food|m:🍔;junk food|m:🍟;orange juice|m:🧃;apple juice|m:🧃;chocolate milk|i:milk;" +
  // animals
  "guinea pig|m:🐹;sea lion|m:🦭;sea horse|i:fish;sea turtle|i:turtle;jelly fish|i:jellyfish;killer whale|i:whale;blue whale|i:whale;" +
  "polar bear|m:🐻‍❄️;teddy bear|m:🧸;fruit fly|m:🪰;house fly|m:🪰;dragon fly|i:dragonfly;honey bee|i:bee;bald eagle|m:🦅;prairie dog|m:🐿️;" +
  "hermit crab|i:crab;tree frog|i:frog;german shepherd|i:dog;golden retriever|i:dog;hot dog stand|m:🌭;" +
  // science and technology
  "power plant|i:factory;power station|i:factory;nuclear plant|i:factory;cell phone|i:phone;mobile phone|i:phone;smart phone|i:phone;" +
  "light bulb|i:bulb;black hole|m:🕳️;solar panel|i:solar;wind turbine|i:turbine;computer virus|i:computer;computer mouse|m:🖱️;" +
  "space station|i:satellite;space shuttle|i:rocket;milky way|m:🌌;big bang|m:💥;rain forest|i:jungle;fire truck|m:🚒;fire engine|m:🚒;" +
  "fire drill|m:🚨;fire fighter|m:🧑‍🚒;police officer|m:👮;police car|m:🚓;traffic light|m:🚦;stop sign|m:🛑;bus stop|i:bus;school bus|i:bus;" +
  "hot air balloon|i:balloon;ice age|m:🧊;global warming|i:thermometer;climate change|i:thermometer;greenhouse gas|i:co2;carbon dioxide|i:co2;" +
  "red blood cell|i:cell;white blood cell|i:cell;blood vessel|i:heart;spinal cord|i:brain;magnifying glass|i:magnifier;first aid|i:bandage;" +
  "heart rate|i:heartbeat;light switch|i:switch;north pole|i:globe;south pole|i:globe;rock band|i:guitar;rock music|i:guitar;rock and roll|i:guitar;" +
  // places, history, civics
  "united states|m:🇺🇸;united states of america|m:🇺🇸;american flag|m:🇺🇸;white house|m:🏛️;new york|m:🗽;statue of liberty|i:liberty;" +
  "north america|m:🌎;south america|m:🌎;central america|m:🌎;latin america|m:🌎;supreme court|m:⚖️;city hall|i:columns;" +
  "civil rights|i:fist;high school|i:school;middle school|i:school;elementary school|i:school;sign language|m:🤟;american sign language|m:🤟;" +
  // people are described, not drawn as a flag
  "native american|-;african american|-;asian american|-;mexican american|-;first nations|-;" +
  // school talk
  "number line|i:numberline;times table|i:times;pie chart|i:piechart;bar graph|i:chart;line graph|i:chart;right angle|i:angle;table of contents|i:book;" +
  "point of view|m:👁️;key word|-;key idea|-;key point|-;key detail|-;key term|-;key vocabulary|-;" +
  // everyday phrases that contain a picture word but mean something else
  "kind of|-;sort of|-;a lot|-;right now|-;as well|-;of course|-;in fact|-;at least|-;for example|-;by the way|-;all right|-;make sure|-;" +
  "pay attention|-;come on|-;hang on|-;hold on|-;line up|-;turn in|-;fill in|-;figure out|-;" +
  "what's the matter|-;whats the matter|-;no matter|-;doesn't matter|-;doesnt matter|-;dont matter|-;" +
  "fire away|-;break a leg|-;piece of cake|-;raining cats and dogs|m:🌧️;building block|-;" +
  // history and music
  "tea party|m:🍵;boston tea party|m:🍵;declaration of independence|i:scroll;bill of rights|i:scroll;end zone|m:🏈;" +
  "string section|i:violin;brass section|i:trumpet;woodwind section|m:🎷;percussion section|i:drum;double bass|i:violin;bass guitar|i:guitar;" +
  "bass drum|i:drum;french horn|m:🎺;electric guitar|i:guitar;sheet music|i:note;" +
  // middle and high school: names that use an everyday word for something else
  "stock market|m:📈;interest rate|m:📈;cold war|-;iron curtain|-;fight or flight|m:😨;calvin cycle|-;krebs cycle|-;citric acid cycle|-;" +
  "soviet union|-;square root|-;cube root|-;periodic table|-;new deal|-;great depression|-;dust bowl|m:🌪️;space race|i:rocket";
var PHRASES = {};
PHRASE_SRC.split(";").forEach(function(row){
  var p = row.split("|"), ws = p[0].split(" ").map(normalize);
  (PHRASES[ws[0]] = PHRASES[ws[0]] || []).push({ words: ws, pic: p[1] });
});
var PHRASE_START = {};
Object.keys(PHRASES).forEach(function(k){ PHRASE_START[k] = 1; });
var PHRASE_MORE = OPENMOJI_PHRASES;
function addPhrase(text, pic){
  var ws = String(text).split(" ").map(normalize).filter(Boolean);
  if (ws.length < 2) return;
  var list = PHRASES[ws[0]] = PHRASES[ws[0]] || [], key = ws.join(" ");
  if (!list.some(function(x){ return x.words.join(" ") === key; })) list.push({ words: ws, pic: pic });
}
Object.keys(PHRASE_MORE).forEach(function(t){ addPhrase(t, "m:" + PHRASE_MORE[t]); });
Object.keys(SYM.phrases).forEach(function(t){ addPhrase(t, "s:" + SYM.phrases[t]); });
Object.keys(PHRASES).forEach(function(k){ PHRASES[k].sort(function(a, b){ return b.words.length - a.words.length; }); });
function picOf(spec){
  if (!spec || spec === "-") return null;
  if (spec.slice(0, 2) === "i:" && I[spec.slice(2)]) return { icon: spec.slice(2), key: "i:" + spec.slice(2) };
  if (spec.slice(0, 2) === "m:") return { emoji: spec.slice(2), key: "m:" + spec.slice(2) };
  if (spec.slice(0, 2) === "s:") return { sym: spec.slice(2), key: "s:" + spec.slice(2) };
  return null;
}
// the longest phrase starting at word i, or null
function phraseAt(norm, i){
  var list = PHRASES[norm[i]];
  if (!list) return null;
  for (var k = 0; k < list.length; k++){
    var ws = list[k].words, ok = i + ws.length <= norm.length;
    for (var j = 1; ok && j < ws.length; j++){
      var t = norm[i + j];
      ok = t === ws[j] || (j === ws.length - 1 && forms(t).indexOf(ws[j]) >= 0);
    }
    if (ok) return { len: ws.length, c: picOf(list[k].pic) };
  }
  return null;
}
// PHRASE_SRC is also read by the picture build (web/tools/pictures)
export { PHRASES, PHRASE_SRC, PHRASE_START, phraseAt };
