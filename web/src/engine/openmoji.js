// The OpenMoji artwork, once loaded (it arrives after the first screen is drawn); until then emoji use the device's own.

// OpenMoji artwork (CC BY-SA 4.0), loaded after first paint; until then, or if it cannot load, the system emoji is used.
var OM = null;
function omKey(e){ return String(e).replace(/\uFE0F/g, ""); }
export function setOpenMoji(o){ OM = o; }

export { OM, omKey };
