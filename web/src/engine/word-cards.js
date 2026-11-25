// Word cards: the key point in words when a sentence has nothing to picture, with a label for what kind of thing was said.
import { emptyScene } from "./analyze.js"
import { DIAGRAMS } from "./diagrams/registry.js"
import { allItems, cap } from "./lookup.js"
import { INK, circ, esc, f, pth, rct } from "./primitives.js"
import { el } from "./render.js"
import { cueSet } from "./senses.js"

// ---------- word cards ----------
// A sentence with nothing to picture ("A hypothesis is an educated guess…", "Always check your answer") still gets a card in
// the storyboard: its key point in a few words, the key words in bold, and a small label for what kind of thing was said
// (a question, something to do, something to remember, a key word, the topic). So the lesson has no gaps.
function cw(t){ return String(t).toLowerCase().replace(/[‘’]/g, "'").replace(/[^a-z0-9'-]/g, "").replace(/^['-]+|['-]+$/g, ""); }
// words that carry no idea of their own: shown lighter, and a card needs at least one word that isn't one of these
var WC_STOP = cueSet("a an the and or but nor so if then than that this these those there here it its it's itself they them their theirs themselves " +
  "he him his she her hers we us our ours you your yours yourself yourselves i me my mine myself " +
  "is are was were be been being am do does did done doing have has had having will would can could should shall may might must " +
  "i'm you're we're they're he's she's that's there's here's what's who's where's how's let's let i'll you'll we'll they'll it'll that'll " +
  "i've you've we've they've i'd you'd we'd they'd isn't aren't wasn't weren't don't doesn't didn't can't cannot won't wouldn't couldn't " +
  "shouldn't haven't hasn't hadn't ain't gonna wanna gotta kinda sorta " +
  "to of in on at by for with about from into onto over under up down out off as like just only also very really too such much many more most " +
  "what which who whom whose when where why how whether all any some each every both either neither no not none one ones another other others " +
  "get gets got getting go goes going gone went come comes came coming make makes made making take takes took taking put puts say says said " +
  "tell tells told see sees saw seen look looks know knows knew think thinks thought want wants wanted need needs needed try tries " +
  "thing things stuff something anything everything nothing someone anyone everyone somebody anybody everybody " +
  "way lot lots kind sort bit part okay ok alright yeah yes yep well now today right pretty quite " +
  "always never usually often sometimes maybe probably actually basically again still even ever already yet though although because while");
// praise and classroom management: a sentence made only of these needs no card ("Great job, that's exactly right")
var WC_LIGHT = cueSet("good great nice awesome amazing excellent perfect wonderful fantastic cool super job work thanks thank please sorry " +
  "correct exactly sure fine guys class friends folks minute minutes second seconds sec moment hold wait quiet ready hi hello bye goodbye " +
  "morning afternoon welcome back done finished start started starting begin beginning give keep hear");
// said at the start of a sentence just to keep talking; dropped from the card
var WC_LEAD = cueSet("okay ok alright so now well um uh erm hmm oh and but yeah yes anyway anyways basically actually also plus hey");
// dropped at the start only when a comma follows ("Everyone, look up here"), since "Everyone makes mistakes" means it
var WC_LEAD_COMMA = cueSet("right everybody everyone guys class friends folks listen look boys girls kids");
var WC_STEP = { first: "First", firstly: "First", second: "Second", secondly: "Second", third: "Third", next: "Next", then: "Then",
  afterwards: "Next", finally: "Finally", lastly: "Finally" };
var WC_TAIL = cueSet("please okay ok alright guys");
var WC_TAIL_COMMA = cueSet("everyone everybody class friends folks");
var WC_TOPIC_VERB = cueSet("talk talking learn learning look looking study studying read reading start starting begin beginning review reviewing " +
  "focus focusing practice practicing cover covering explore exploring discuss discussing continue continuing work working");
var WC_IMP = cueSet("ask add answer bring check choose circle close color colour compare copy count cross describe draw explain figure fill find " +
  "finish fold give grab highlight keep label line list listen look make match measure move name notice open pass pay pick place point " +
  "practice predict put raise read remember repeat reread review say share show sit solve sort spell stand start stop study take talk tell " +
  "think trace try turn underline use wait walk wash watch work write be don't do never always only just " +
  "cite annotate summarize summarise analyze analyse identify define evaluate calculate graph plot simplify factor prove sketch estimate convert " +
  "classify support defend revise edit proofread avoid include record observe submit hand complete outline quote paraphrase research test " +
  "contrast interpret construct round multiply divide subtract isolate substitute plug draft brainstorm memorize prepare select organize create " +
  "design build type save print imagine consider skim scan log flip box address focus discuss");
// "Research shows…", "Practice makes…": a word that could be an instruction, followed by a verb, starts a statement instead
var WC_STATE_NEXT = cueSet("shows means makes helps says tells gives includes involves requires needs takes uses causes leads allows becomes " +
  "happens works seems looks sounds explains describes proves suggests");
var WC_NOT_IMP_NEXT = cueSet("is are was were has have had can could will would of 's");
var WC_WH = cueSet("who what why how which whose what's how's who's");
var WC_AUX = cueSet("is are was were do does did can could will would should has have isn't aren't don't doesn't didn't can't won't");
var WC_AUX_SUBJ = cueSet("you we they i he she it this that there anyone anybody everyone everybody someone somebody the a an your our these those people");
var WC_NOT_TERM = cueSet("it this that there here what which who he she they we you i one that's it's everyone everybody someone something nothing " +
  "everything anyone people some many most all each when if while because after before since although as once unless until where why how");
var WC_DET = cueSet("a an the this that these those our your their my his her its some");
var WC_HEDGE = cueSet("usually often always sometimes basically just really also simply generally actually kind sort like");
var WC_ADJ_ONLY = cueSet("full very so too more less different similar equal same hot cold warm big small large tiny true false right wrong good bad " +
  "easy hard ready able likely used made based known located found not usually due");
var WC_KINDS = {
  question: { label: "Question", color: "#2F6E9E" },
  todo: { label: "To do", color: "#2F7553" },
  remember: { label: "Remember", color: "#94650B" },
  important: { label: "Important", color: "#94650B" },
  means: { label: "Key word", color: "#B0472D" },
  example: { label: "Example", color: "#B0472D" },
  topic: { label: "Topic", color: "#5B4F9A" },
  idea: { label: "Key idea", color: "#6B6156" }
};

// Read one sentence for its key point. Returns null when there is nothing worth a card.
function keyPoint(text, opt){
  opt = opt || {};
  var raw = String(text).split(/\s+/).filter(Boolean);
  var w = raw.map(cw), n = raw.length, s = 0, e = n, tag = "", kind = "idea", term = null, s0 = -1;
  if (!n) return null;
  var endQ = /\?["')\]]*$/.test(raw[n - 1]);
  var comma = function(i){ return /[,;:]["')\]]*$/.test(raw[i] || ""); };
  var at = function(i, list){ for (var k = 0; k < list.length; k++) if (w[i + k] !== list[k]) return false; return true; };
  // 1. the openings people use to keep talking, and the step words that say where this sits in a sequence
  for (var guard = 0; guard < 12 && s < e; guard++){
    var x = w[s];
    if (!x){ s++; continue; }
    if (WC_LEAD[x] && !(x === "well" && /'/.test(raw[s]))){ s++; continue; }
    if (WC_LEAD_COMMA[x] && (comma(s) || WC_LEAD[w[s + 1]] || w[s + 1] === "today" || w[s + 1] === "we're" || w[s + 1] === "let's")){ s++; continue; }
    if (at(s, ["all", "right"]) || ((at(s, ["you", "know"]) || at(s, ["i", "mean"]) || at(s, ["you", "guys"])) && comma(s + 1))){ s += 2; continue; }
    if (s0 < 0 && (WC_STEP[x] || x === "today" || x === "after" || x === "to")) s0 = s;
    if (!tag && WC_STEP[x] && !(x === "second" && !comma(s)) && !(x === "next" && (w[s + 1] === "week" || w[s + 1] === "time" || w[s + 1] === "year"))){ tag = WC_STEP[x]; s++; continue; }
    if (!tag && (at(s, ["after", "that"]) || at(s, ["to", "start"]) || at(s, ["to", "begin"]))){ tag = w[s] === "after" ? "Next" : "First"; s += 2; continue; }
    if (x === "today" && !WC_AUX[w[s + 1]]){ tag = tag || "Today"; s++; continue; }
    break;
  }
  var lead = s0 >= 0 ? s0 : s;
  // 2. the endings that only keep the class with you
  while (e - 1 > s && (WC_TAIL[w[e - 1]] || ((WC_TAIL_COMMA[w[e - 1]] || w[e - 1] === "right") && comma(e - 2)) || (w[e - 1] === "now" && e - s > 4))) e--;
  if (e - 2 > s && ((at(e - 2, ["you", "know"]) && comma(e - 3)) || at(e - 2, ["for", "me"]) || at(e - 2, ["real", "quick"]))) e -= 2;
  if (e - s < 1) return null;
  // 3. what kind of thing was said
  var x0 = w[s], x1 = w[s + 1] || "";
  if (endQ || (WC_WH[x0] && !(x0 === "how" && x1 === "to")) || (WC_AUX[x0] && WC_AUX_SUBJ[x1])) kind = "question";
  if (kind === "idea"){
    var rem = at(s, ["remember", "that"]) ? 2 : at(s, ["don't", "forget", "that"]) ? 3 : at(s, ["keep", "in", "mind", "that"]) ? 4 :
      at(s, ["don't", "forget", "to"]) ? 3 : at(s, ["remember", "to"]) ? 2 : at(s, ["don't", "forget"]) ? 2 : at(s, ["keep", "in", "mind"]) ? 3 :
      x0 === "remember" && x1 ? 1 : 0;
    if (rem){ kind = "remember"; s += rem; }
  }
  if (kind === "idea"){
    // "Today we're going to talk about theme", "Let's look at this word problem", "Our topic is erosion"
    var t = s;
    if (w[t] === "let's" || w[t] === "lets") t++;
    else {
      if (/^(we're|we|i'm|i|we'll|i'll)$/.test(w[t] || "")) t++;
      if (w[t] === "are" || w[t] === "am" || w[t] === "will") t++;
      if (w[t] === "going" && w[t + 1] === "to") t += 2; else if (w[t] === "gonna") t++;
    }
    if (t > s && (w[t] === "go" || w[t] === "going") && w[t + 1] === "over"){ term = nounPhrase(t + 2, e); if (term) kind = "topic"; }
    else if (t > s && WC_TOPIC_VERB[w[t]]){
      var p = t + 1;
      if (w[p] === "you" || w[p] === "us") p++;
      if (/^(about|at|on|with)$/.test(w[p] || "")) p++;
      else if (w[t] !== "learn" && w[t] !== "learning" && w[t] !== "study" && w[t] !== "studying" && w[t] !== "review" && w[t] !== "reviewing" && w[t] !== "practice" && w[t] !== "practicing" && w[t] !== "cover" && w[t] !== "covering" && w[t] !== "explore" && w[t] !== "exploring" && w[t] !== "discuss" && w[t] !== "discussing" && w[t] !== "read" && w[t] !== "reading") p = -1;
      if (p > 0) term = nounPhrase(p, e);
      if (term) kind = "topic";
    }
    var o = s;
    if (!term && /^(our|today's|this)$/.test(w[o] || "") && /^(topic|lesson|unit|focus)$/.test(w[o + 1] || "")){
      o += 2;
      while (/^(for|this|the|today|week|unit|month)$/.test(w[o] || "")) o++;
      if (w[o] === "is" && (w[o + 1] === "about" || w[o + 1] === "on")) o++;
      if (w[o] === "is" || w[o] === "about" || w[o] === "on"){ term = nounPhrase(o + 1, e); if (term) kind = "topic"; }
    }
  }
  if (kind === "idea" || kind === "remember"){
    // "You need to …", "I want you to …", "Make sure you …", "You only change one variable", "Underline what the question asks"
    var strong = [["i", "want", "you", "to"], ["i", "need", "you", "to"], ["i'd", "like", "you", "to"], ["you", "need", "to"],
      ["you", "have", "to"], ["you've", "got", "to"], ["you", "should"], ["you", "must"], ["you're", "going", "to"], ["you", "are", "going", "to"],
      ["make", "sure", "that", "you"], ["make", "sure", "you"], ["make", "sure", "to"], ["be", "sure", "to"], ["go", "ahead", "and"], ["please"],
      ["we", "need", "to"], ["we", "have", "to"]];
    var weak = [["try", "to"], ["let's"], ["lets"], ["you", "can"], ["you", "will"], ["you'll"]];
    // match a frame, letting "also", "all", "really"… sit inside it; returns how many words it took
    var frame = function(list){
      var i = s, k = 0;
      while (k < list.length && i < e){
        if (w[i] === list[k]){ i++; k++; continue; }
        if (k > 0 && /^(also|all|really|just|now|then|first|still|definitely|each|both)$/.test(w[i])){ i++; continue; }
        return 0;
      }
      return k === list.length ? i - s : 0;
    };
    var hit = 0;
    for (var q = 0; q < strong.length && !hit; q++){ var fl = frame(strong[q]); if (fl && w[s + fl] && !WC_STOP[w[s + fl]] || fl && WC_IMP[w[s + fl]]) hit = fl; }
    for (var q2 = 0; q2 < weak.length && !hit; q2++){ var fw = frame(weak[q2]); if (fw && WC_IMP[w[s + fw]]) hit = fw; }
    if (!hit && w[s] === "you" && WC_IMP[w[s + 1]] && !WC_NOT_IMP_NEXT[w[s + 2]] && !WC_STATE_NEXT[w[s + 2]]) hit = 1;
    if (!hit && w[s] === "you" && /^(only|just|always|never|also|then|first|now)$/.test(w[s + 1] || "") && WC_IMP[w[s + 2]]) hit = 1;
    if (hit){ s += hit; if (kind === "idea") kind = "todo"; }
    else if (kind === "idea" && WC_IMP[w[s]] && !WC_NOT_IMP_NEXT[w[s + 1]] && !WC_STATE_NEXT[w[s + 1]] && w[s] !== "only" && w[s] !== "just" && w[s] !== "always" && w[s] !== "never") kind = "todo";
    else if (kind === "idea" && /^(always|never)$/.test(w[s]) && WC_IMP[w[s + 1]]) kind = "todo";
  }
  var mean = null;
  if (kind === "idea"){
    for (var cc = s; cc < e - 1 && !term; cc++){
      var ex = w[cc] === "of" && /^(example|examples)$/.test(w[cc - 1] || "");
      if (!(w[cc] === "called" || (w[cc] === "as" && w[cc - 1] === "known") || ex)) continue;
      var ta = cc + 1;
      while (ta < e && WC_DET[w[ta]]) ta++;
      if (e - ta < 1 || e - ta > 4 || !termOk(ta, e)) continue;
      var mb = cc - (w[cc] === "as" || ex ? 1 : 0);
      while (mb > s && /^(is|are|was|were|also|which|that|this|it|it's|that's|a|an|the|sometimes|often|usually|now|known|called|example|examples|one|just)$/.test(w[mb - 1])) mb--;
      term = { a: ta, b: e };
      if (mb - s >= 2 && hasContent(s, mb)) mean = { a: s, b: mb };
      kind = ex ? "example" : "means";
    }
  }
  if (kind === "idea"){
    // "A hypothesis is an educated guess…", "Democracy means people choose their leaders", "This idea is really important"
    for (var c = s + 1; c <= Math.min(s + 5, e - 2); c++){
      var cv = w[c];
      if (!(cv === "is" || cv === "are" || cv === "means" || cv === "mean" || (cv === "refers" && w[c + 1] === "to") || (cv === "stands" && w[c + 1] === "for"))) continue;
      var x2 = w[c + 1] === "called" ? "called" : "";
      var ts = s;
      while (ts < c && WC_DET[w[ts]]) ts++;
      if (at(ts, ["idea", "of"]) || at(ts, ["concept", "of"]) || at(ts, ["word"]) && c - ts > 1) ts += w[ts] === "word" ? 1 : 2;
      if (ts >= c || WC_NOT_TERM[w[ts]] || !termOk(ts, c)) break;
      var named = true;
      for (var tq = ts + 1; tq < c; tq++) if (WC_NOT_TERM[w[tq]] || WC_DET[w[tq]]) named = false;
      if (!named) break;
      var ys = c + 1 + (cv === "refers" || cv === "stands" ? 1 : 0) + (x2 ? 1 : 0);
      while (ys < e && (WC_HEDGE[w[ys]] || w[ys] === "of")) ys++;
      if (/^(really|very|so|super|extremely|pretty)$/.test(w[ys] || "") && /^(important|key|essential|crucial)$/.test(w[ys + 1] || "")) ys++;
      if (/^(important|key|essential|crucial)$/.test(w[ys] || "")){ kind = "important"; term = { a: ts, b: c }; break; }
      var defines = cv !== "is" && cv !== "are";
      if (defines && w[ys] === "that") ys++;
      // "X is …" defines X only when a thing follows, not "is full of tension", "is that…", "is going to…"
      if (!defines && (/^(that|because|why|not|going|able|also|still|now|here|there|in|on|at|from|by|with|for)$/.test(w[ys] || "") || /ing$/.test(w[ys] || "") || adjOnly(ys))) break;
      if (x2){ term = { a: ys, b: e }; mean = { a: ts, b: c }; }
      else { term = { a: ts, b: c }; mean = { a: ys, b: e }; }
      while (mean.a < mean.b && WC_DET[w[mean.a]] && mean.b - mean.a > 2) mean.a++;
      if (term.b - term.a > 4 || mean.b - mean.a < 2 || !hasContent(mean.a, mean.b) || !termOk(term.a, term.b)) { term = null; mean = null; break; }
      kind = "means";
      break;
    }
  }
  if (kind === "idea" && /\b(important|on the test|on the quiz|on the exam|pay attention|don't forget|due (on|by|tomorrow|next|this|monday|tuesday|wednesday|thursday|friday))\b/i.test(raw.slice(s, e).join(" "))) kind = "remember";

  function hasContent(a, b){ for (var k = a; k < b; k++) if (w[k] && !WC_STOP[w[k]]) return true; return false; }
  // "is full of tension", "is different from", "is hot": a description, not a definition ("are different versions of…" is one)
  function adjOnly(i){
    if (/^(very|so|too|not|usually|more|less)$/.test(w[i] || "")) return true;
    return !!WC_ADJ_ONLY[w[i]] && (i + 1 >= e || /^(of|to|from|than|and|or|for|in|on|at|with|by|as|because|when|if|but|enough|tomorrow|today)$/.test(w[i + 1]));
  }
  // a word big enough to stand alone on a card: not "b", not "this"
  function termOk(a, b){ for (var k = a; k < b; k++) if (w[k] && !WC_STOP[w[k]] && !WC_LIGHT[w[k]] && w[k].length >= 3) return true; return false; }
  function nounPhrase(a, b){
    while (a < b && (WC_DET[w[a]] || /^(few|several|all|both|more|another)$/.test(w[a]))) a++;
    // "a few literary devices before we read act two" → "literary devices"
    for (var cut2 = a + 1; cut2 < b; cut2++) if (/^(before|after|when|while|because|so|since|until|if|and|then)$/.test(w[cut2])){ b = cut2; break; }
    while (b > a && /^(today|together|now|tomorrow|first|again|next)$/.test(w[b - 1] || "")) b--;
    if (b > a + 1 && /^(this|next)$/.test(w[b - 2]) && /^(week|morning|afternoon|year|unit|time)$/.test(w[b - 1])) b -= 2;
    if (b <= a || b - a > 6 || !hasContent(a, b)) return null;
    return { a: a, b: b };
  }

  // 4. the words to show: long sentences keep their first clause or two
  var MAX = 22;
  var body = term ? mean : { a: s, b: e };
  var cut = false;
  if (body && body.b - body.a > MAX){
    var best = -1;
    for (var k2 = body.a + 4; k2 < body.a + MAX; k2++){
      if (comma(k2) || /^(because|which|but|so|while|although|when|if)$/.test(w[k2 + 1] || "")) best = k2 + 1;
    }
    body = { a: body.a, b: best > 0 ? best : body.a + MAX };
    cut = true;
  }
  function toks(r){
    var out = [];
    for (var k3 = r.a; k3 < r.b; k3++){
      var tx = raw[k3].replace(/^["'(\[“‘]+/, "");
      if (k3 === r.b - 1) tx = tx.replace(/[.!?;:,"')\]”’]+$/, "");
      if (!tx) continue;
      out.push({ t: tx, k: !!w[k3] && !WC_STOP[w[k3]] && !WC_LIGHT[w[k3]], at: k3 });
    }
    if (out.length) out[0].t = out[0].t.charAt(0).toUpperCase() + out[0].t.slice(1);
    return out;
  }
  var main = term ? toks(term) : null, words = body ? toks(body) : [];
  if (main) main.forEach(function(tk){ tk.k = true; });
  if (words.length && cut) words[words.length - 1].t += "…";
  if (words.length && kind === "question" && !cut) words[words.length - 1].t += "?";
  if (words.length && !main) words[0].t = words[0].t.charAt(0).toUpperCase() + words[0].t.slice(1);
  if (main && main.length && kind !== "topic") main[0].t = main[0].t.charAt(0).toUpperCase() + main[0].t.slice(1);
  // under a big word, the meaning reads on from it in lower case, unless it starts with a name ("Juliet", "DNA")
  if (main && words.length && !(words[0].at > 0 && /^[A-Z]/.test(raw[words[0].at])) && !/^[A-Z0-9]{2,}/.test(words[0].t) && !/^I\b/.test(words[0].t)) words[0].t = words[0].t.charAt(0).toLowerCase() + words[0].t.slice(1);

  // 5. is there anything here? Praise and "okay, let's go" need no card; live talk asks for a little more.
  var all = (main || []).concat(words), keyN = all.filter(function(tk){ return tk.k; }).length;
  var light = all.every(function(tk){ var z = cw(tk.t); return WC_STOP[z] || WC_LIGHT[z] || !z; });
  // …but a thinking prompt made of small words still counts in a lesson: "How do you know?", "Think about what you already know"
  var prompt = !opt.live && all.length >= 4 && (kind === "todo" || (kind === "question" && WC_WH[w[s]])) && !all.some(function(tk){ return WC_LIGHT[cw(tk.t)]; });
  if (light && !prompt) return null;
  if (opt.live && !main && keyN < (kind === "idea" || (kind === "question" && !WC_WH[w[s]]) ? 2 : 1)) return null;
  if (!keyN) all.forEach(function(tk){ tk.k = true; });
  return { kind: kind, tag: tag, main: main, words: words, first: all.length ? Math.min.apply(null, all.map(function(tk){ return tk.at; })) : 0, raw: raw, lead: lead, e: e };
}
// The same sentence as plain text, with the openings and endings that only keep people listening taken off.
function plainKeyPoint(kp){ return (kp.main || []).concat(kp.words).map(function(tk){ return tk.t; }).join(" "); }
function tidySentence(raw){
  var kp = keyPoint(raw.join(" "));
  if (!kp) return raw.length ? cap(raw.join(" ").replace(/^[^A-Za-z0-9]+/, "").replace(/[.!?;:,\u2014\-]+$/, "")) : "";
  var t = raw.slice(kp.lead, kp.e).join(" ").replace(/^[^A-Za-z0-9]+/, "").replace(/[.!?;:,\u2014\-]+$/, "");
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : "";
}

function wordScene(text, opt){
  var kp = keyPoint(text, opt);
  if (!kp) return emptyScene();
  var sc = emptyScene(), say = plainKeyPoint(kp);
  sc.show = true;
  sc.words = kp;
  sc.verbAt = kp.first;
  sc.setting = "words";
  var K = WC_KINDS[kp.kind];
  sc.words.label = kp.kind === "topic" && kp.tag === "Today" ? "Today" : kp.tag && (kp.kind === "idea" || kp.kind === "todo") ? kp.tag : K.label;
  sc.words.say = (sc.words.label ? sc.words.label + ": " : "") + say;
  sc.words.sig = "w:" + say.toLowerCase().replace(/[^a-z0-9 ]/g, "");
  // a big word or two on the card leaves room under it for the whole sentence
  var full = tidySentence(kp.raw);
  sc.caption = kp.main && !kp.words.length && full.split(" ").length <= 16 && full.toLowerCase() !== say.toLowerCase() ? full : "";
  return sc;
}

// The words a scene puts in front of the class: its picture labels, a diagram's title and parts, a word card's key words.
// Lower case and singular, so "electron" and "electrons" count as the same word.
function wcStem(x){ return x.length > 4 && /(ss|us|is)$/.test(x) ? x : x.length > 4 && /(ches|shes|xes|ses|zes)$/.test(x) ? x.slice(0, -2) : x.length > 3 && /ies$/.test(x) ? x.slice(0, -3) + "y" : x.length > 3 && /s$/.test(x) ? x.slice(0, -1) : x; }
function sceneWords(sc){
  var out = [];
  function add(t){ String(t).split(/[\s&,]+/).forEach(function(x){ x = cw(x); if (x && !WC_STOP[x] && x.length > 1) out.push(wcStem(x)); }); }
  if (!sc || !sc.show) return out;
  if (sc.words) (sc.words.main || []).concat(sc.words.words).forEach(function(tk){ if (tk.k) add(tk.t); });
  else if (sc.diagram && DIAGRAMS[sc.diagram]){
    var d = DIAGRAMS[sc.diagram];
    add(d.title);
    Object.keys(d.parts).forEach(function(k){ d.parts[k].say.forEach(function(ph){ add(ph.join(" ")); }); });
  } else allItems(sc).forEach(function(x){ add(x.label); });
  return out;
}

function wcLine(tokens, size){
  var out = "", cur = null, buf = [];
  function flush(){ if (buf.length) out += (out ? " " : "") + '<tspan font-weight="' + (cur ? 700 : 500) + '" fill="' + (cur ? INK : "#776C5F") + '">' + esc(buf.join(" ")) + '</tspan>'; buf = []; }
  tokens.forEach(function(tk){ if (tk.k !== cur) flush(); cur = tk.k; buf.push(tk.t); });
  flush();
  return out;
}
function wcWidth(tokens, size){ return tokens.reduce(function(sum, tk){ return sum + tk.t.length * size * (tk.k ? 0.62 : 0.56) + size * 0.28; }, -size * 0.28); }
function wcWrap(tokens, size, maxW){
  var lines = [], cur = [];
  tokens.forEach(function(tk){
    if (cur.length && wcWidth(cur.concat(tk), size) > maxW){ lines.push(cur); cur = []; }
    cur.push(tk);
  });
  if (cur.length) lines.push(cur);
  return lines;
}
function wcText(lines, size, y0, lh){
  return lines.map(function(ln, i){
    return el(ln[0].at, '<text x="160" y="' + f(y0 + i * lh) + '" text-anchor="middle" font-size="' + size + '" font-family="Figtree, Arial, sans-serif">' + wcLine(ln, size) + '</text>');
  }).join("");
}
function wcGlyph(kind, color){
  var g = circ(32, 30, 11, color, 0), wht = "#FFFDF6";
  switch (kind){
    case "question": return g + '<text x="32" y="35.5" text-anchor="middle" font-size="15" font-weight="800" font-family="Figtree, Arial, sans-serif" fill="' + wht + '">?</text>';
    case "todo": return g + pth("M26.5 30.5 L30.5 34.5 L37.5 26.5", "none", { stroke: wht, w: 2.6 });
    case "remember": case "important":
      var st = [];
      for (var i = 0; i < 10; i++){ var r = i % 2 ? 2.9 : 6.6, a = -Math.PI / 2 + i * Math.PI / 5; st.push(f(32 + r * Math.cos(a)) + " " + f(30.5 + r * Math.sin(a))); }
      return g + '<path d="M' + st.join(" L") + ' Z" fill="' + wht + '"/>';
    case "means": return g + '<text x="32" y="34.5" text-anchor="middle" font-size="11.5" font-weight="800" font-family="Figtree, Arial, sans-serif" fill="' + wht + '">Aa</text>';
    case "topic": return g + pth("M27 24.5 H37 V36 L32 32.5 L27 36 Z", wht, { w: 0 });
    default: return g + '<path d="M32 23.2 A5.3 5.3 0 0 1 35 32.9 V34.2 H29 V32.9 A5.3 5.3 0 0 1 32 23.2 Z" fill="' + wht + '"/>' + rct(29.6, 35.3, 4.8, 1.8, wht, 0.9, 0);
  }
}
function drawWords(sc){
  var kp = sc.words, K = WC_KINDS[kp.kind], out = "", maxW = 272;
  out += el(kp.first, wcGlyph(kp.kind, K.color) +
    '<text x="50" y="34.5" font-size="12.5" font-weight="700" letter-spacing="1" font-family="Figtree, Arial, sans-serif" fill="' + K.color + '">' + esc(kp.label.toUpperCase()) + '</text>');
  var top = 52, bottom = 188;
  if (kp.main && kp.main.length){
    // one big word or phrase, with what it means under it
    var ms = 44;
    var fits = function(sz){ var ls = wcWrap(kp.main, sz, maxW); return ls.length <= (sz > 30 ? 1 : 2) && ls.every(function(l){ return wcWidth(l, sz) <= maxW; }); };
    while (ms > 18 && !fits(ms)) ms -= 2;
    var mLines = wcWrap(kp.main, ms, maxW), mh = mLines.length * ms * 1.1;
    var ss = 18, sLines = kp.words.length ? wcWrap(kp.words, ss, maxW) : [];
    while (sLines.length > 3 && ss > 14){ ss -= 1; sLines = wcWrap(kp.words, ss, maxW); }
    var sh = sLines.length ? 14 + sLines.length * ss * 1.3 : 0;
    var y = top + (bottom - top - mh - sh) / 2 + ms * 0.8;
    out += wcText(mLines, ms, y, ms * 1.1);
    if (sLines.length) out += wcText(sLines, ss, y + (mLines.length - 1) * ms * 1.1 + 14 + ss * 1.25, ss * 1.3);
    return out;
  }
  var n = kp.words.length, size = n <= 3 ? 36 : n <= 6 ? 30 : n <= 10 ? 25 : n <= 13 ? 22 : 20, lines = wcWrap(kp.words, size, maxW);
  while (size > 15 && lines.length * size * 1.28 > bottom - top){ size -= 1; lines = wcWrap(kp.words, size, maxW); }
  var lh = size * 1.28, y0 = top + (bottom - top - lines.length * lh) / 2 + size * 0.95;
  return out + wcText(lines, size, y0, lh);
}
export { drawWords, keyPoint, sceneWords, tidySentence, wordScene };
