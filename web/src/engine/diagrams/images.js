// Diagrams kept as files (from Wikimedia Commons, credited in public/credits.html), shown as pictures.
import { IMAGE_DIAGRAM_LIST } from "../data/image-diagrams.js"
import { IMAGE_DIAGRAM, dgm } from "./registry.js"
import { ASSET_BASE } from "../vocabulary.js"

// Labelled diagrams from Wikimedia Commons (public domain or Creative Commons, each credited in public/credits.html), kept as
// files and shown as pictures. A sentence naming the topic brings one up, the same way as the drawn diagrams above.
var IMAGE_DIAGRAMS = IMAGE_DIAGRAM_LIST;
IMAGE_DIAGRAMS.forEach(function(d){
  IMAGE_DIAGRAM[d[0]] = 1;
  dgm(d[0], d[1], "plain", d[2], {}, function(){
    return ['<rect x="6" y="6" width="308" height="188" rx="6" fill="#FFFFFF"/><image href="' + ASSET_BASE + 'diagrams/' + d[0] + '.' + (d[3] || "svg") +
      '" x="10" y="10" width="300" height="180" preserveAspectRatio="xMidYMid meet"/>'];
  });
});
export { IMAGE_DIAGRAMS };
