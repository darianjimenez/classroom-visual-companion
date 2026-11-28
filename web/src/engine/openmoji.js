// OpenMoji artwork (CC BY-SA 4.0), loaded after the first screen is drawn; until then, or if it cannot load, emoji use the device's own.
var OM = null;
function omKey(e){ return String(e).replace(/️/g, ""); }
export function setOpenMoji(o){ OM = o; }

export { OM, omKey };
