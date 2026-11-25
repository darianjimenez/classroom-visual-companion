// The choices made by hand when the pictures were added: what to leave out, and which words go with which picture. The build
// (build.mjs) applies them; change a list here, run `npm run pictures:build`, and read the test snapshot's diff.
const words = (s) => s.trim().split(/\s+/)

// ---------- Mulberry Symbols ----------
// categories left out: flags (OpenMoji has them), football kits, letters and numbers, communication-aid devices, religion,
// alcohol and cigarettes, weapons, question words, position/quantity/time words that would picture every "above" or "before"
// Mulberry categories not used
export const SKIP_CATS = [
  "Alphabet", "Animal Activity Misc", "Building Public", "Celebration Event",
  "Clothes Sport", "Communication Aid", "Communication Conversation", "Communication Signs",
  "Country Flags", "Descriptive Direction", "Descriptive Position", "Descriptive Quantity",
  "Descriptive Time", "Drink Actions", "Drink Containers and measures", "Drink Type",
  "Electrical TV", "Food Festival", "Leisure General", "Military",
  "Number", "People Descriptive", "Question", "Religion Festival",
  "Religion General", "Religion Person",
]

// single symbols not used: brands, UK-only items, personal care, things a class would not need pictured
export const SKIP_NAMES = words(`
  iPhone iPod playstation channel_bbc_1 big_mac_switch marmite simnel_cake football_kit_blank Houses_of_Parliament bra bikini
  boxer_shorts aftershave aftershave_1 blusher eye_shadow emery_board baby_oil baby_powder deodorant deodorant_spray cotton_bud
  bubble_bath change_nappy_,_to flush_toilet_,_to Guy_Fawkes Bonfire_Night lager beer champagne cigarette handcuffs arrest_,_to
  smoke_,_to seizure lump acne_spots disabled_toilet ladies_toilet mens_toilet need_toilet chewy_tube cup_non_spill doidy_cup
  coated_spoon dish_partitioned hoist pool_hoist headmouse headpointer_2 bad dead fat crunchy fromage_frais creme_fraiche
  castor_sugar beansprouts bap breafkfast_continental_1 breafkfast_continental_2 cheese_stilton cheese_brie corned_beef
  sausage_cumberland stock stock_cubes pint pint_half lemon_squash
`)

// words with several meanings: a picture of one would mislead, so the engine decides these from context or not at all
export const AMBIGUOUS = words(`
  bank bat bark bill block bowl box case cell change charge check club coach cold court crane current date degree draft fair fan
  file fine fire foot game glass ground interest iron jam key kind last lead letter light line match mean mine model mole note
  order organ page palm park party pitch plain plant plate point pool port pound power present press pupil race range rate record
  ring rock roll root row ruler saw scale seal season second set shell ship sign sink slide space spring square stage stamp star
  state step stick story strike table tie tire trip trunk type watch wave well yard bolt nail drill hose lift bow pot cross bulb
  back bottom calf chest temple lid stroke dust fly cricket hamster duck boot trunk tank cart engine cracker crackers chip chips
  sweet sweets biscuit biscuits squash pants jumper trainers lead swing bench field float clay switch connection monitor programme
  copy download inbox homepage install_software dinner_hot cut burn operation healthy test answer sum
`)

// reviewed and left out: other meanings in school (cycle, stable, mercury, rose), colours, violence, brands, too personal
export const DROP_WORDS = words(`
  die kill drown choke shoot steal cheat fight wrestle hit pray zoom rewind insert smear join pick remove return tear sort break
  correct good great absent open even front head gum sole arms tin knickers petticoat blank georgia jersey jordan palestine
  somaliland swede dates orange black blue brown green mauve pink purple red terracotta white yellow tampon toupee perm mascara
  nappy tap bush holly ivy lily rose bendy guy secretary desiring sneering vice lego undress bowler cycle run rudolph tippex
  staple caravan stable vomit save outbox scanning plaster backstop walkman wii travel add assembly counters hoover mercury pe
  hard spread serve strain dice chad meet
`)

// phrases left out: phrasal verbs that fire in ordinary talk ("take out", "pick up"), device and UI items, odd names
export const DROP_PHRASES = [
  "kick person", "hit something", "change mind", "change weather", "give up cake",
  "give up foods", "show me", "verbs collective", "take care of", "go in",
  "go out", "go outside", "get up", "pick up", "put away",
  "put in", "take out", "turn off", "turn on", "call out",
  "fall over", "fall off", "roll over", "prop up", "reach for",
  "push down", "walk up to", "wait table", "transport car", "kick swimming",
  "dysphagia cup", "sanitary towel", "potty chair", "shave underarm", "underarm hair",
  "no smoking sign", "mistake no wrong", "weak link", "wire break", "time out",
  "no class", "it room", "it class", "nosey cup", "plate guard",
  "plate lipped", "spoon adapted", "knife adapted", "fork adapted", "good to drink",
  "good to eat", "pureed food", "switch access", "sit in beanbag", "feed someone",
  "grow hair", "forward wind", "fried breakfast", "breafkfast fried", "computer folder",
  "computer folder open", "my computer icon", "install software", "email send", "receive email",
  "print preview", "new document", "arrow keys", "at key", "space bar",
  "web address", "recycle bin", "wii fit", "multi media", "phone picture video",
  "text phone", "mobile phone no", "mobile phone number", "mobile phone silent", "mobile phone cover",
  "mobile phone case", "telephone mobile", "text mobile message", "northern cyprus", "western sahara",
  "wakes island", "the sudan", "russian federation", "viet nam", "congo brazzaville",
  "congo kinshasa", "raisin currants", "cereal box bran", "cereal box museli", "cereal museli",
  "cereal bran", "bin bags", "book ends", "hold sledge hammer", "pet carrying basket",
  "sausage roll small", "hair curlers electric", "can opener electric", "toss pancake", "pour cake mixture",
  "give up", "climbing rock", "baseball base", "first base", "bowling spare",
  "bowling strike", "boccia chute", "bowling gutter", "glass , drinking", "graph column",
  "triangle right-angled", "line parallel",
]

// two-word names whose natural order is the other way round ("soup tomato" is said "tomato soup"): both are matched
export const REORDER_HEADS = words("ball bee bread cake cheese chicken drink egg eggs fish food graph line milkshake pie prism pyramid sandwich sauce soup sting triangle")
// actions and states: shown only when a sentence has little else to picture
// categories whose symbols are actions or states
export const MINOR_CATS = [
  "Animal Activity Feeding", "Animal Activity Grooming", "Building Household tasks",
  "Descriptive State", "Food Feeding and eating", "Food Kitchen actions",
  "Healthcare Grooming activities", "People Actions", "Tools Actions",
  "Verb",
]

// a phrase name with any of these parts is a variant ("hat - ladies", "bread roll granary"), not something a teacher says
export const VARIANT_PARTS = /\d|\b(female|male|generic|blank|lady|man|men|people|packet|portable|personal|dark|light|extra|top|side|bushy|half|filled|granary|partitioned|non spill|on toast|kit)\b/
// other spellings and words for a symbol
export const EXTRA_WORDS = { antarctica: "antartica", djibouti: "djbouti", classroom: "class room", bumblebee: "bee bumble", honeybee: "bee honey",
  rattlesnake: "rattle snake", anteater: "ant eater", seesaw: "see saw" }
export const EXTRA_PHRASES = { "right triangle": "triangle-right-angled", "right angled triangle": "triangle-right-angled", "square pyramid": "pyramid-square-base",
  "triangular pyramid": "pyramid-triangular-base", "parallel lines": "line-parallel", "bee sting": "sting-bee", "drinking glass": "glass-drinking",
  "column graph": "graph-column", "tropical fish": "fish-tropical" }
// past tenses that don't end in -ed, for the action symbols
export const IRREGULAR = {
  eat: ["ate", "eaten"],
  drink: ["drank", "drunk"],
  swim: ["swam", "swum"],
  run: ["ran"],
  sing: ["sang", "sung"],
  throw: ["threw", "thrown"],
  catch: ["caught"],
  write: ["wrote", "written"],
  draw: ["drew", "drawn"],
  ride: ["rode", "ridden"],
  sit: ["sat"],
  stand: ["stood"],
  sleep: ["slept"],
  bite: ["bit", "bitten"],
  blow: ["blew", "blown"],
  bring: ["brought"],
  build: ["built"],
  buy: ["bought"],
  dig: ["dug"],
  drive: ["drove", "driven"],
  fall: ["fell", "fallen"],
  feed: ["fed"],
  fight: ["fought"],
  freeze: ["froze", "frozen"],
  grow: ["grew", "grown"],
  hang: ["hung"],
  hide: ["hid", "hidden"],
  hit: ["hit"],
  hold: ["held"],
  kneel: ["knelt"],
  lie: ["lay"],
  read: ["read"],
  shake: ["shook"],
  shut: ["shut"],
  sweep: ["swept"],
  teach: ["taught"],
  tear: ["tore", "torn"],
  think: ["thought"],
  wake: ["woke"],
  wear: ["wore", "worn"],
  win: ["won"],
  fly: ["flew", "flown"],
  speak: ["spoke", "spoken"],
  steal: ["stole"],
  sting: ["stung"],
  swing: ["swung"],
  begin: ["began", "begun"],
  break: ["broke", "broken"],
  choose: ["chose", "chosen"],
  forget: ["forgot"],
  give: ["gave"],
  hear: ["heard"],
  kick: [],
  lose: ["lost"],
  meet: ["met"],
  pay: ["paid"],
  say: ["said"],
  sell: ["sold"],
  send: ["sent"],
  shoot: ["shot"],
  sink: ["sank"],
  spend: ["spent"],
  spin: ["spun"],
  split: ["split"],
  spread: ["spread"],
  take: ["took"],
  tell: ["told"],
  understand: ["understood"],
  cut: ["cut"],
  put: ["put"],
  let: ["let"],
}

// ---------- OpenMoji ----------
// OpenMoji pictures the app had no words for, by OpenMoji name: the words and phrases that bring each up
export const OPENMOJI_PICK = {
  'solar energy': 'solar energy|solar power|renewable energy', 'wind energy': 'wind energy|wind power|wind turbine|wind turbines|wind farm',
  'nuclear power plant': 'nuclear power plant|nuclear plant|nuclear power|nuclear energy|nuclear reactor', 'oil spill': 'oil spill|oil spills',
  'exhaust gases factory': 'pollution|air pollution|smog|polluted', 'exhaust gases car': 'car exhaust|exhaust fumes', 'sea level rise': 'sea level rise|rising sea levels|sea levels',
  'ice shelf melting': 'melting ice|melting glaciers|ice melting', 'ice shelf': 'ice shelf|ice sheet', 'floating ice': 'sea ice',
  'radioactive waste': 'radioactive waste|nuclear waste', 'geiger counter': 'geiger counter', 'atom bomb': 'atomic bomb|atom bomb|nuclear bomb|atomic bombs|nuclear weapons',
  'reusable bag': 'reusable bag', 'volcano eruption': 'eruption|eruptions', 'avalanche': 'avalanche|avalanches', 'evacuate': 'evacuate|evacuation|evacuated',
  'first aid': 'first aid', 'quarantine': 'quarantine', 'social distancing': 'social distancing', 'sanitizer spray': 'hand sanitizer|sanitizer',
  'person with medical mask': 'face mask|face masks', 'person sneezing into elbow': 'sneeze|sneezes|sneezing|sneezed',
  'large intestine': 'large intestine|colon cancer', 'blood transfusion': 'blood transfusion|blood donation|donate blood', 'stretcher': 'stretcher',
  'ct scan': 'ct scan|cat scan|mri scan', 'saline drip': 'iv drip', 'fracture leg': 'fracture|fractures|fractured', 'earache': 'earache|ear infection',
  'backache': 'backache', 'joint pain': 'joint pain|arthritis', 'ecg waves': 'heart rate|ecg|electrocardiogram',
  'black hole': 'black hole|black holes', 'space shuttle': 'space shuttle', 'eiffel tower': 'eiffel tower',
  'great pyramid of giza': 'great pyramid|pyramid of giza|great pyramid of giza|pyramids of giza', 'colossus of rhodes': 'colossus of rhodes',
  'hanging gardens of babylon': 'hanging gardens|hanging gardens of babylon', 'lighthouse of alexandria': 'lighthouse of alexandria',
  'mausoleum at halicarnassus': 'mausoleum|mausoleum at halicarnassus', 'statue of zeus at olympia': 'statue of zeus', 'temple of artemis at ephesus': 'temple of artemis',
  'cafeteria': 'cafeteria', 'drone': 'drone|drones', 'autonomous car': 'self-driving car|self driving car|autonomous car|driverless car',
  'solar cell': 'solar cell|solar cells|photovoltaic', 'smartwatch': 'smartwatch|smart watch', 'virtual reality': 'virtual reality|vr headset',
  'augmented reality': 'augmented reality', 'barcode': 'barcode|barcodes|bar code', 'qr code': 'qr code', 'code editor': 'code editor', 'surveillance': 'surveillance',
  'woman judge': 'judge|judges', 'man pilot': 'pilot|pilots', 'woman firefighter': 'firefighter|firefighters|firefighting', 'man police officer': 'police officer|police officers|policeman|policewoman',
  'man detective': 'detective|detectives|investigator', 'guard': 'guard|guards|security guard', 'woman construction worker': 'construction worker|construction workers|builder|builders',
  'woman mechanic': 'mechanic|mechanics|car mechanic', 'man factory worker': 'factory worker|factory workers', 'woman office worker': 'office worker|office workers|employee|employees',
  'man farmer': 'farmer|farmers', 'woman cook': 'chef|chefs', 'man artist': 'artist|artists|painter|painters', 'woman astronaut': 'astronaut|astronauts', 'man scientist': 'scientist|scientists',
  'woman raising hand': 'raise your hand|raise hands|raised hand|raised her hand|raised his hand', 'person shrugging': 'shrug|shrugs|shrugged', 'deaf person': 'deaf|deaf people',
  'man surfing': 'surf|surfing|surfer|surfers', 'woman golfing': 'golf|golfer|golfing', 'man rowing boat': 'rowing|row a boat', 'woman lifting weights': 'weightlifting|lifting weights|lift weights|weights',
  'man cartwheeling': 'cartwheel|cartwheels|gymnast|gymnastics', 'woman juggling': 'juggle|juggling|juggler', 'person playing water polo': 'water polo', 'woman playing handball': 'handball',
  'person mountain biking': 'mountain bike|mountain biking', 'horse racing': 'horse race|horse racing|jockey', 'woman kneeling': 'kneel|kneels|kneeling|knelt',
  'person in manual wheelchair': 'wheelchair|wheelchairs|wheelchair user', 'man climbing': 'climb|climbs|climbing|climbed|climber|rock climbing',
  'anxious face with sweat': 'anxious|anxiety|nervous', 'astonished face': 'astonished|amazed|shocked|surprised', 'disappointed face': 'disappointed|disappointment',
  'persevering face': 'frustrated|frustration|struggling', 'flushed face': 'embarrassed|embarrassing|embarrassment', 'expressionless face': 'bored|boring|boredom',
  'grimacing face': 'awkward|cringe', 'face with monocle': 'curious|curiosity|inspect', 'shushing face': 'quiet|quietly|shh|whisper quietly', 'saluting face': 'salute|saluted|saluting',
  'pleading face': 'please help|pleading|beg', 'yawning face': 'yawn|yawns|yawning', 'weary face': 'exhausted|exhaustion', 'relieved face': 'relieved|relief', 'pensive face': 'thoughtful|regret',
  'waxing gibbous moon': 'waxing gibbous', 'waning gibbous moon': 'waning gibbous', 'first quarter moon': 'first quarter|first quarter moon', 'last quarter moon': 'last quarter|third quarter|last quarter moon',
  'waxing crescent moon': 'waxing crescent', 'waning crescent moon': 'waning crescent', 'new moon': 'new moon', 'full moon': 'full moon',
  'broken heart': 'heartbroken|broken heart', 'beating heart': 'heartbeat|heartbeats|heart beat',
  'one o’clock': "one o'clock|1 o'clock", 'two o’clock': "two o'clock|2 o'clock", 'three o’clock': "three o'clock|3 o'clock", 'four o’clock': "four o'clock|4 o'clock",
  'five o’clock': "five o'clock|5 o'clock", 'six o’clock': "six o'clock|6 o'clock", 'seven o’clock': "seven o'clock|7 o'clock", 'eight o’clock': "eight o'clock|8 o'clock",
  'nine o’clock': "nine o'clock|9 o'clock", 'ten o’clock': "ten o'clock|10 o'clock", 'eleven o’clock': "eleven o'clock|11 o'clock", 'twelve o’clock': "twelve o'clock|12 o'clock|noon|midday",
  'lab coat': 'lab coat|lab coats', 'goggles': 'goggles|safety glasses', 'safety vest': 'safety vest|high visibility vest', 'hiking boot': 'hiking boot|hiking boots|hiking',
  'ballet shoes': 'ballet|ballet shoes|ballerina', 'file folder': 'folder|folders', 'treasure chest': 'treasure|treasures|treasure chest', 'euro banknote': 'euro|euros',
  'ticket': 'ticket|tickets', 'bullet train': 'bullet train|high-speed train|high speed rail', 'guide dog': 'guide dog|guide dogs|service dog', 'four leaf clover': 'four leaf clover|four-leaf clover|good luck',
  'leafless tree': 'bare tree|bare trees|leafless', 'pomegranate': 'pomegranate|pomegranates', 'poppy': 'poppy|poppies', 'narwhal': 'narwhal|narwhals', 'menorah': 'menorah', 'yin yang': 'yin and yang|yin yang',
  'warning': 'warning|warnings|caution', 'prohibited': 'forbidden|prohibited|not allowed|banned', 'check mark': 'check mark|checkmark', 'speech balloon': 'speech bubble|speech bubbles',
  'thought balloon': 'thought bubble|thought bubbles', 'dizzy': 'dizzy|dizziness', 'fingerprint': 'fingerprint|fingerprints', 'speaking head': 'speak|speaks|speaking|speech therapy',
  'clapping hands': 'clap|claps|clapping|applause|applaud', 'thumbs down': 'thumbs down', 'crystal ball': 'crystal ball|fortune teller', 'magic wand': 'magic wand|wand|wands',
  'rugby football': 'rugby', 'flying disc': 'frisbee|flying disc', 'curling stone': 'curling', 'pot of food': 'stew|stews', 'currency exchange': 'currency|currencies|exchange rate',
  'landslide': 'landslide|landslides|mudslide|mudslides', 'mouse trap': 'mousetrap|mouse trap|trap|traps', 'construction worker': 'construction|construction site',
}
// country flags not added: disputed places, territories with no use in class, and names that are also first names
export const NO_FLAG = /^chad$|palestin|western sahara|ceuta|diego garcia|clipperton|bouvet|heard|south georgia|cocos|norfolk|british indian|st\. pierre|wallis|united nations|kosovo|taiwan|tibet|hong kong|macao/
