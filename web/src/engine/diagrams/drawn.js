// The diagrams drawn in code, one per topic (the water cycle, parts of a plant, the solar system…).
import { dA, dBox, dI, dL, dLead, dT, dgm, loop4, moonPhase, rockBlob } from "./registry.js"
import { cubeAt, txt } from "../drawings.js"
import { INK, blob, circ, ell, f, ln, pline, polar, poly, pth, rct } from "../primitives.js"
import { arrowHead } from "../render.js"

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
dgm("bodyorgans", "Organs of the body", "bio", ["human body", "body systems", "organs of the body", "organ systems", "circulatory system", "nervous system", "major organs"], {
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