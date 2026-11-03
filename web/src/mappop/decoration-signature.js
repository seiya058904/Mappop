// v1.4 "Signature" collection. Each theme explores a different axis — silhouette,
// material, extrusion, line language — rather than a recolor of an existing box.
// Same contract as decoration-presets.js: deterministic geometry inside the node's
// own coordinate space, no hit targets, no data writes. `side` mirrors marks that
// point toward the parent so left-hand branches of a mindMap read correctly.

// Four-point sparkle used by several themes.
const sparkle = (x, y, r) => `M${x} ${y - r}Q${x + r * 0.18} ${y - r * 0.18} ${x + r} ${y}Q${x + r * 0.18} ${y + r * 0.18} ${x} ${y + r}Q${x - r * 0.18} ${y + r * 0.18} ${x - r} ${y}Q${x - r * 0.18} ${y - r * 0.18} ${x} ${y - r}Z`

export const signatureDecorators = {
  // 青花瓷韵: cloud-tablet root, concave-cornered 开光 cartouches, scroll tendrils.
  'porcelain-blue': ({ w, h, root, major, outline, path, side, theme }) => {
    if (root) {
      const r = h / 6
      // Scalloped 如意 ends: three lobes per side, flat glaze top and bottom.
      outline(`M10 0H${w - 10}a${r} ${r} 0 0 1 0 ${r * 2}a${r} ${r} 0 0 1 0 ${r * 2}a${r} ${r} 0 0 1 0 ${r * 2}H10a${r} ${r} 0 0 1 0 ${-r * 2}a${r} ${r} 0 0 1 0 ${-r * 2}a${r} ${r} 0 0 1 0 ${-r * 2}Z`)
      path(`M18 6H${w - 18}M18 ${h - 6}H${w - 18}`, { stroke: '#dbe6fb', 'stroke-width': 1, opacity: 0.85 })
      path(`M22 10H${w - 22}M22 ${h - 10}H${w - 22}`, { stroke: '#dbe6fb', 'stroke-width': 0.6, opacity: 0.5 })
      // 回纹 key-fret ticks at the four inner corners.
      path(`M22 16v-6h6v3h-3 M${w - 22} 16v-6h-6v3h3 M22 ${h - 16}v6h6v-3h-3 M${w - 22} ${h - 16}v6h-6v-3h3`, { stroke: '#dbe6fb', 'stroke-width': 1.1, 'stroke-linecap': 'square' })
    } else if (major) {
      const c = 9
      outline(`M${c} 0H${w - c}A${c} ${c} 0 0 0 ${w} ${c}V${h - c}A${c} ${c} 0 0 0 ${w - c} ${h}H${c}A${c} ${c} 0 0 0 0 ${h - c}V${c}A${c} ${c} 0 0 0 ${c} 0Z`)
      path(`M${c + 4} 4H${w - c - 4}A${c} ${c} 0 0 0 ${w - 4} ${c + 4}V${h - c - 4}A${c} ${c} 0 0 0 ${w - c - 4} ${h - 4}H${c + 4}A${c} ${c} 0 0 0 4 ${h - c - 4}V${c + 4}A${c} ${c} 0 0 0 ${c + 4} 4Z`, { stroke: theme.border, 'stroke-width': 0.7, opacity: 0.55 })
    } else {
      // A small 缠枝 curl where the stem arrives.
      side().appendChild(svgPath(`M2 ${h / 2 + 4}c1-5 4-7 7-6.4 2.6.5 3 3.6.8 4.4-1.6.6-3-.6-2.4-2`, { stroke: theme.accent, 'stroke-width': 1.3, fill: 'none' }))
      path(`M14 ${h - 2}H${w - 4}`, { stroke: theme.border, 'stroke-width': 0.6, opacity: 0.35 })
    }
  },
  // 敦煌壁画: flame-finial niche root, 藻井 coffered panels, lotus buds on leaves.
  'dunhuang-mural': ({ w, h, root, major, outline, path, circle, side, theme }) => {
    const gold = '#e6bd62'
    if (root) {
      const cx = w / 2
      outline(`M0 ${h}V14Q0 5 9 5H${cx - 26}Q${cx - 8} 5 ${cx} -11Q${cx + 8} 5 ${cx + 26} 5H${w - 9}Q${w} 5 ${w} 14V${h}Z`)
      path(`M7 ${h - 6}V17Q7 11 13 11H${cx - 22}Q${cx - 7} 11 ${cx} -1Q${cx + 7} 11 ${cx + 22} 11H${w - 13}Q${w - 7} 11 ${w - 7} 17V${h - 6}Z`, { stroke: gold, 'stroke-width': 1.2, opacity: 0.9 })
      // Flame finial and 联珠 pearl border.
      path(`M${cx} -24Q${cx + 7} -15 ${cx + 2} -9Q${cx + 6} -14 ${cx + 4} -19Q${cx + 10} -11 ${cx} -3Q${cx - 10} -11 ${cx - 4} -19Q${cx - 6} -14 ${cx - 2} -9Q${cx - 7} -15 ${cx} -24Z`, { fill: gold, stroke: 'none' })
      const beads = Math.max(4, Math.floor((w - 40) / 14))
      for (let i = 0; i < beads; i++) circle({ cx: 20 + i * (w - 40) / (beads - 1), cy: h - 3, r: 1.8, fill: gold, stroke: 'none', opacity: 0.85 })
    } else if (major) {
      path(`M4 4H${w - 4}V${h - 4}H4Z`, { stroke: gold, 'stroke-width': 1.1, opacity: 0.85 })
      path(`M4 4l7 7M${w - 4} 4l-7 7M4 ${h - 4}l7-7M${w - 4} ${h - 4}l-7-7`, { stroke: gold, 'stroke-width': 1, opacity: 0.85 })
      path(`M${w / 2 - 4} 4l4 3.5 4-3.5`, { fill: gold, stroke: 'none' })
    } else {
      side().appendChild(svgPath(`M7 ${h / 2 + 4}Q2 ${h / 2} 4 ${h / 2 - 5}Q6 ${h / 2 - 1} 7 ${h / 2 + 4}Q8 ${h / 2 - 1} 10 ${h / 2 - 5}Q12 ${h / 2} 7 ${h / 2 + 4}Z`, { fill: theme.accent, stroke: 'none', opacity: 0.9 }))
    }
  },
  // 植物标本: sage specimen sheet with a pressed sprig, kraft tags with an
  // eyelet facing the stem, leaf-shaped markers at every twig.
  'botanical-herbarium': ({ w, h, root, major, left, outline, path, rect, circle, side, theme }) => {
    if (root) {
      path(`M7 7H${w - 7}V${h - 7}H7Z`, { stroke: '#f5f0df', 'stroke-width': 0.8, opacity: 0.6 })
      // A pressed sprig rising out of the label's corner, held by paper tape.
      path(`M${w - 18} ${h - 4}C${w - 26} ${h * 0.45} ${w - 4} ${h * 0.2} ${w + 2} -24`, { stroke: '#2b4128', 'stroke-width': 1.8 })
      ;[[0.18, -1], [0.36, 1], [0.54, -1], [0.72, 1], [0.9, -1]].forEach(([t, s]) => {
        const y = h - 4 - (h + 20) * t
        const x = w - 18 + 18 * t
        path(`M${x} ${y}q${s * 12} -1 ${s * 17} -11q${-s * 12} -1 ${-s * 17} 11Z M${x} ${y}l${s * 11} -7`, { fill: '#93b47c', stroke: '#2b4128', 'stroke-width': 0.9 })
      })
      rect({ x: w - 30, y: h - 14, width: 30, height: 10, fill: '#e9dcb8', opacity: 0.92, stroke: 'none', transform: `rotate(-24 ${w - 15} ${h - 9})` })
      path(`M16 ${h - 11}H${Math.min(110, w * 0.45)}`, { stroke: '#f5f0df', 'stroke-width': 0.8, 'stroke-dasharray': '1 3', opacity: 0.7 })
    } else if (major) {
      // The tag's clipped end always faces the stem it hangs from.
      outline(left ? `M0 0H${w - 12}L${w} 11V${h - 11}L${w - 12} ${h}H0Z` : `M12 0H${w}V${h}H12L0 ${h - 11}V11Z`)
      const g = side()
      g.appendChild(svgCircle({ cx: 10, cy: h / 2, r: 3.2, fill: theme.background, stroke: '#8a6a3f', 'stroke-width': 1.2 }))
      g.appendChild(svgPath(`M10 ${h / 2 - 3}C2 ${h / 2 - 10} -8 ${h / 2 - 4} -14 ${h / 2}`, { stroke: '#a07d4c', 'stroke-width': 1.1, fill: 'none' }))
      path(`M18 ${h - 5}H${w - 8}`, { stroke: '#8a6a3f', 'stroke-width': 0.6, opacity: 0.45 })
    } else {
      side().appendChild(svgPath(`M2 ${h / 2 + 2}Q7 ${h / 2 - 7} 13 ${h / 2 - 3}Q8 ${h / 2 + 6} 2 ${h / 2 + 2}Z M2 ${h / 2 + 2}L11 ${h / 2 - 2.6}`, { fill: '#a9c48f', stroke: '#3f5a3a', 'stroke-width': 0.9 }))
    }
  },
  // 塔罗秘仪: parchment arch-top card, jewel arch cards, constellation leaves.
  'tarot-arcana': ({ w, h, root, major, outline, path, circle, theme, color }) => {
    const gold = '#d9b56a'
    if (root) {
      const r = Math.min(26, h / 2)
      outline(`M0 ${h}V${r}Q0 0 ${r} 0H${w - r}Q${w} 0 ${w} ${r}V${h}Z`)
      path(`M6 ${h - 6}V${r + 2}Q6 6 ${r + 2} 6H${w - r - 2}Q${w - 6} 6 ${w - 6} ${r + 2}V${h - 6}Z`, { stroke: '#a7843f', 'stroke-width': 1 })
      // Sun crown above the arch, crescent moons on the shoulders.
      const cx = w / 2
      for (let i = 0; i < 9; i++) {
        const a = Math.PI * (0.12 + i * 0.095)
        path(`M${cx - Math.cos(a) * 15} ${-Math.sin(a) * 15 + 2}L${cx - Math.cos(a) * 24} ${-Math.sin(a) * 24 + 2}`, { stroke: gold, 'stroke-width': 1.4 })
      }
      circle({ cx, cy: 2, r: 9, fill: gold, stroke: '#1d1230', 'stroke-width': 1.4 })
      path(`M18 ${h / 2 - 5}a6 6 0 1 0 0 10a4.6 4.6 0 1 1 0-10Z M${w - 18} ${h / 2 - 5}a6 6 0 1 1 0 10a4.6 4.6 0 1 0 0-10Z`, { fill: '#a7843f', stroke: 'none' })
    } else if (major) {
      const r = Math.min(14, h / 2)
      outline(`M0 ${h}V${r}Q0 0 ${r} 0H${w - r}Q${w} 0 ${w} ${r}V${h}Z`)
      path(`M4 ${h - 4}V${r + 1}Q4 4 ${r + 1} 4H${w - r - 1}Q${w - 4} 4 ${w - 4} ${r + 1}V${h - 4}Z`, { stroke: gold, 'stroke-width': 0.7, opacity: 0.7 })
      path(sparkle(w / 2, 0, 5), { fill: gold, stroke: '#1d1230', 'stroke-width': 1 })
    } else {
      path(sparkle(6, h / 2, 4), { fill: color, stroke: 'none' })
    }
  },
  // 等距积木: toy bricks — studs on top, tinted side faces, chips for leaves.
  'isometric-blocks': ({ w, h, root, major, leaf, shape, backing, decoration, theme, shade }) => {
    const fill = shape.getAttribute('fill')
    const base = /^#[0-9a-f]{6}$/i.test(fill || '') ? fill : '#ffffff'
    const d = root ? 11 : major ? 8 : 4
    if (major) {
      // Studs sit behind the face so the shape hides their lower half.
      const count = Math.max(2, Math.min(root ? 6 : 4, Math.floor(w / 46)))
      for (let i = 0; i < count; i++) {
        const x = (w / count) * (i + 0.5)
        const r = Math.min(root ? 14 : 10, h * 0.2)
        backing(`M${x - r} 2V${-5}A${r} ${r * 0.42} 0 0 1 ${x + r} -5V2Z`, shade(base, -0.16))
        backing(`M${x - r} -5A${r} ${r * 0.42} 0 1 1 ${x + r} -5A${r} ${r * 0.42} 0 1 1 ${x - r} -5Z`, shade(base, 0.25))
      }
    }
    backing(`M${w} 0L${w + d} ${d}V${h + d}L${w} ${h}Z`, shade(base, -0.22))
    backing(`M0 ${h}L${d} ${h + d}H${w + d}L${w} ${h}Z`, shade(base, -0.36))
    decoration.appendChild(svgPath(`M3 3H${w - 3}`, { stroke: '#ffffff', 'stroke-width': major ? 2.4 : 1.4, opacity: 0.55 }))
    if (leaf) decoration.appendChild(svgPath(`M${w - 3} 3V${h - 3}`, { stroke: '#000000', 'stroke-width': 1, opacity: 0.06 }))
  },
  // 午夜工作室: product-grade dark cards with status dots and a hairline glow.
  'midnight-studio': ({ w, h, root, major, shape, path, circle, side, theme, color, id }) => {
    if (root) {
      shape.setAttribute('fill', `url(#${id}-studio-root)`)
      path(`M14 1H${w - 14}`, { stroke: '#ffffff', 'stroke-width': 1, opacity: 0.45 })
      path(`M12 0.5H${w - 12}Q${w - 0.5} 0.5 ${w - 0.5} 12V${h - 12}Q${w - 0.5} ${h - 0.5} ${w - 12} ${h - 0.5}H12Q0.5 ${h - 0.5} 0.5 ${h - 12}V12Q0.5 0.5 12 0.5Z`, { stroke: '#ffffff', 'stroke-width': 1, opacity: 0.16 })
    } else if (major) {
      path(`M12 0.6H${w - 12}`, { stroke: color, 'stroke-width': 1.2, opacity: 0.9 })
      side().appendChild(svgCircle({ cx: 11, cy: h / 2, r: 3.4, fill: color, stroke: 'none' }))
      side().appendChild(svgCircle({ cx: 11, cy: h / 2, r: 6.5, fill: color, stroke: 'none', opacity: 0.18 }))
    } else {
      side().appendChild(svgPath(`M3 ${h / 2}h5`, { stroke: color, 'stroke-width': 2, 'stroke-linecap': 'round', fill: 'none', opacity: 0.85 }))
    }
  },
  // 千禧铬光: liquid-chrome capsules with an iridescent rim and a gloss bead.
  'y2k-chrome': ({ w, h, root, major, shape, outline, path, circle, theme, color, id }) => {
    if (major) {
      const c = h / 2
      outline(`M${c} 0H${w - c}A${c} ${c} 0 0 1 ${w - c} ${h}H${c}A${c} ${c} 0 0 1 ${c} 0Z`)
      if (root) {
        shape.setAttribute('fill', `url(#${id}-chrome)`)
        shape.setAttribute('stroke', `url(#${id}-iris)`)
      } else shape.setAttribute('stroke', color)
      const r = h / 2
      path(`M${r} ${4}H${w - r}`, { stroke: '#ffffff', 'stroke-width': root ? 4 : 3, opacity: 0.85 })
      path(`M${r + 6} ${h - 4}H${w - r - 6}`, { stroke: '#ffffff', 'stroke-width': 1.2, opacity: 0.6 })
      if (root) {
        path(sparkle(w - 6, 4, 10), { fill: '#ffffff', stroke: '#7a4fd6', 'stroke-width': 1.2 })
        path(sparkle(10, h - 3, 6), { fill: '#ffffff', stroke: '#1f8fb8', 'stroke-width': 1 })
      } else circle({ cx: w - r * 0.7, cy: r * 0.6, r: 2.2, fill: '#ffffff', stroke: 'none', opacity: 0.95 })
    } else path(sparkle(6, h / 2, 4.2), { fill: color, stroke: 'none' })
  },
  // 莫兰迪画廊: a framed canvas on a mat board; leaves are underlined wall labels.
  'morandi-gallery': ({ w, h, root, major, leaf, backing, path, rect, theme }) => {
    if (root) {
      backing(`M-16 -16H${w + 16}V${h + 16}H-16Z`, '#f7f3ec')
      path(`M-16.5 -16.5H${w + 16.5}V${h + 16.5}H-16.5Z`, { stroke: '#3d3a36', 'stroke-width': 3 })
      path(`M-0.5 -0.5H${w + 0.5}V${h + 0.5}H-0.5Z`, { stroke: '#cfc6b8', 'stroke-width': 1 })
      // The small museum caption plate under the frame.
      rect({ x: w / 2 - 22, y: h + 24, width: 44, height: 6, fill: '#b9afa2', stroke: 'none' })
    } else if (major) {
      path(`M6 6H${w - 6}V${h - 6}H6Z`, { stroke: '#ffffff', 'stroke-width': 0.8, opacity: 0.55 })
    } else if (!leaf) rect({ x: 2, y: h / 2 - 2, width: 4, height: 4, fill: theme.accent, stroke: 'none' })
  }
}

// Free-standing helpers for marks placed inside a mirrored `side()` group.
const NS = 'http://www.w3.org/2000/svg'
const make = (tag, attrs) => {
  const el = document.createElementNS(NS, tag)
  Object.keys(attrs).forEach(key => el.setAttribute(key, attrs[key]))
  return el
}
export const svgPath = (d, attrs = {}) => make('path', { d, ...attrs })
export const svgCircle = attrs => make('circle', attrs)
