// Which word shows which picture: the drawings' word lists, the emoji library, the symbol table, and words kept picture-less.
import { PICTURE_SYMBOLS } from "./data/symbols.js"
import { OPENMOJI_WORDS } from "./data/openmoji-words.js"
import { I } from "./drawings.js"

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
// More words for OpenMoji pictures that had none, picked by going through the whole set: "black hole", "judge", "avalanche"…
var EMOJI_MORE = OPENMOJI_WORDS;
Object.keys(EMOJI_MORE).forEach(function(w){ if (!WORD_TO_ICON[w] && !EMOJI_LIB[w] && !NEVER[w]) EMOJI_LIB[w] = EMOJI_MORE[w]; });
// Mulberry Symbols (CC BY-SA 4.0), made for children and adults who communicate with pictures, and maps of the US states. They are
// separate files, loaded the first time they are shown, and only used for words nothing above covers. See public/credits.html.
var SYM = PICTURE_SYMBOLS;
var SYM_WORDS = {}, SYM_MINOR = {};
(SYM.minor || []).forEach(function(k){ SYM_MINOR[k] = 1; });
Object.keys(SYM.words).forEach(function(w){ if (!WORD_TO_ICON[w] && !EMOJI_LIB[w] && !NEVER[w]) SYM_WORDS[w] = SYM.words[w]; });
// a country named on its own shows its map (which carries its flag) rather than the flag alone; "American", "French" keep the flag
(SYM.override || []).forEach(function(w){ if (SYM.words[w] && !WORD_TO_ICON[w]){ delete EMOJI_LIB[w]; SYM_WORDS[w] = SYM.words[w]; } });
var ASSET_BASE = "";
function symArt(name){ return '<image href="' + ASSET_BASE + 'symbols/' + String(name).replace(/[^a-z0-9-]/g, "") + '.svg" x="3" y="3" width="94" height="94"/>'; }

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
export function setAssetBase(b){ ASSET_BASE = b || ""; }

// NEVER and EMOJI_LIB_SRC are also read by the picture build (web/tools/pictures)
export { ASSET_BASE, EMOJI_LIB, EMOJI_LIB_SRC, ICON_SETTING, NEVER, SETTINGS, SETTING_ORDER, SYM, SYM_MINOR, SYM_WORDS, VOCAB, WEAK, WORD_TO_ICON, symArt };
