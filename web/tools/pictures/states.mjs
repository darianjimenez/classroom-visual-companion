// US state pictures from the Census Bureau's boundaries (public domain, via us-atlas): each state in cream with a black
// outline and its neighbours in light grey around it, in a 100×100 box like the other symbols.
export function drawStates(topo) {
  const T = topo.transform
  const arcs = topo.arcs.map((arc) => {
    let x = 0, y = 0
    return arc.map(([dx, dy]) => { x += dx; y += dy; return T ? [x * T.scale[0] + T.translate[0], y * T.scale[1] + T.translate[1]] : [dx, dy] })
  })
  function ring(ids) {
    const pts = []
    ids.forEach((i) => {
      const a = i >= 0 ? arcs[i] : arcs[~i].slice().reverse()
      a.forEach((p, k) => { if (k || !pts.length) pts.push(p) })
    })
    return pts
  }
  const states = topo.objects.states.geometries.map((g) => {
    const polys = g.type === 'Polygon' ? [g.arcs] : g.arcs
    const rings = polys.flatMap((poly) => poly.map(ring))
    const xs = rings.flat().map((p) => p[0]), ys = rings.flat().map((p) => p[1])
    return { name: g.properties.name, rings, box: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)] }
  })
  const f = (n) => Math.round(n * 10) / 10
  function pathOf(rings, tx) {
    return rings.map((r) => {
      let d = '', last = null
      r.forEach((p, k) => {
        const q = tx(p)
        if (last && k < r.length - 1 && Math.hypot(q[0] - last[0], q[1] - last[1]) < 0.5) return
        d += (d ? 'L' : 'M') + f(q[0]) + ' ' + f(q[1]); last = q
      })
      return d + 'Z'
    }).join('')
  }
  const made = []
  for (const s of states) {
    const [x0, y0, x1, y1] = s.box, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2
    // a square view around the state, with room for its neighbours; small states get a wider view so they read as places
    const side = Math.max(x1 - x0, y1 - y0) * 1.5 + 30
    const vx = cx - side / 2, vy = cy - side / 2, k = 100 / side
    const tx = (p) => [(p[0] - vx) * k, (p[1] - vy) * k]
    const near = states.filter((o) => o !== s && o.box[2] > vx && o.box[0] < vx + side && o.box[3] > vy && o.box[1] < vy + side)
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><clipPath id="c"><rect width="100" height="100" rx="8"/></clipPath></defs>' +
      '<g clip-path="url(#c)"><rect width="100" height="100" fill="#EAF3F8"/>' +
      '<path d="' + near.map((o) => pathOf(o.rings, tx)).join('') + '" fill="#E7E3DA" stroke="#FFFFFF" stroke-width="0.8" stroke-linejoin="round"/>' +
      '<path d="' + pathOf(s.rings, tx) + '" fill="#FFE7A3" stroke="#231F20" stroke-width="2" stroke-linejoin="round"/></g></svg>'
    const slug = 'state-' + s.name.toLowerCase().replace(/[^a-z]+/g, '-')
    made.push({ name: s.name, slug, svg })
  }
  return made
}
