// The second collection shares drawing primitives, not one interchangeable box.
// All measurements are inside the text padding and independent of document data.
export const branchColor = (node, theme) => {
  if (!theme.branchPalette || node.isRoot) return theme.border
  let branch = node
  while (branch.parent && !branch.parent.isRoot) branch = branch.parent
  const index = branch.parent ? branch.parent.children.indexOf(branch) : 0
  return theme.branchPalette[Math.max(0, index) % theme.branchPalette.length]
}

export const decorators = {
  'swiss-type': ({ w, h, root, major, path, rect, theme }) => {
    if (root) path(`M0 ${h - 3}H${w}`, { stroke: theme.accent, 'stroke-width': 5, 'stroke-linecap': 'butt' })
    else if (major) rect({ x: 0, y: 0, width: 5, height: h, fill: theme.accent, stroke: 'none' })
  },
  'metro-transit': ({ w, h, root, major, rect, circle, shape, node, theme }) => {
    const color = branchColor(node, theme)
    if (major) {
      shape.setAttribute('stroke', color)
      if (root) rect({ x: 6, y: 6, width: w - 12, height: h - 12, rx: Math.min(24, h / 2 - 6), stroke: color, 'stroke-width': 1 })
    }
    circle({ cx: major ? 0 : 5, cy: h / 2, r: root ? 6 : major ? 4.5 : 3.5, fill: theme.background, stroke: color, 'stroke-width': 2 })
    if (root) circle({ cx: w, cy: h / 2, r: 6, fill: theme.background, stroke: color, 'stroke-width': 2 })
  },
  'chalk-classroom': ({ w, h, root, major, path, theme }) => {
    if (root) {
      path(`M4 15L3 4L${w - 5} 2L${w - 2} ${h - 4}L6 ${h - 2}L3 24`, { stroke: theme.border, 'stroke-width': 1.8 })
      path(`M15 ${h + 1}L${w - 16} ${h - 1}`, { stroke: theme.border, opacity: 0.5, 'stroke-width': 0.7, 'stroke-dasharray': '19 3 8 2' })
    } else if (major) path(`M12 4L5 5V${h - 5}H14 M${w - 12} ${h - 3}h7v-8`, { stroke: theme.accent, 'stroke-width': 1.5 })
    else path(`M5 ${h - 3}Q${w / 2} ${h} ${w - 5} ${h - 4}`, { stroke: theme.border, opacity: 0.65, 'stroke-width': 0.8 })
  },
  'terminal-tree': ({ w, h, root, major, path, rect, theme }) => {
    if (root) {
      path(`M10 ${h / 2 - 6}l6 6-6 6`, { stroke: theme.rootInk, 'stroke-width': 2, 'stroke-linecap': 'square' })
      rect({ x: 21, y: h / 2 + 5, width: 7, height: 2, fill: theme.accent, stroke: 'none' })
      path(`M5 ${h - 2}H${w - 5}`, { stroke: theme.border, 'stroke-width': 1 })
    } else if (major) path(`M12 5H5V${h - 5}H12 M${w - 12} 5h7V${h - 5}h-7`, { stroke: theme.border, 'stroke-width': 1 })
    else path(`M3 ${h / 2 - 4}v8h6`, { stroke: theme.accent, 'stroke-width': 1 })
  },
  'circuit-board': ({ w, h, root, major, path, circle, theme }) => {
    if (major) {
      const pins = root ? 5 : 3
      for (let i = 1; i <= pins; i++) {
        const x = w * i / (pins + 1)
        path(`M${x} 0v-6M${x} ${h}v6`, { stroke: theme.border, 'stroke-width': 2.4, 'stroke-linecap': 'butt' })
      }
      if (root) path(`M7 14V7h14 M${w - 7} ${h - 14}v7h-14`, { stroke: theme.border, 'stroke-width': 0.8 })
      circle({ cx: 11, cy: h / 2, r: 2.5, stroke: theme.accent, 'stroke-width': 1.2 })
    } else circle({ cx: 5, cy: h / 2, r: 3, stroke: theme.border, 'stroke-width': 1.5 })
  },
  'art-deco': ({ w, h, root, major, outline, path, theme }) => {
    if (root) {
      outline(`M0 15H10V7H20V0H${w - 20}V7H${w - 10}V15H${w}V${h - 15}H${w - 10}V${h - 7}H${w - 20}V${h}H20V${h - 7}H10V${h - 15}H0Z`)
      path(`M7 20h10V13h10V7H${w - 27}v6h10v7h6V${h - 20}h-6v7h-10v6H27v-6H17v-7H7Z`, { stroke: theme.border, 'stroke-width': 0.6 })
    } else if (major) path(`M4 ${h - 4}V4h14 M8 ${h - 8}V8h10 M12 ${h - 12}V12h6 M${w - 8} 5v${h - 10}`, { stroke: theme.accent, 'stroke-width': 0.7 })
    else path(`M2 ${h / 2}l4-4 4 4-4 4Z`, { stroke: theme.border, 'stroke-width': 0.7 })
  },
  risograph: ({ w, h, root, major, path, rect, circle, theme }) => {
    if (major) {
      path(`M-3 5H${w - 4}V${h + 3}H-3Z`, { stroke: theme.border, 'stroke-width': root ? 2.5 : 1.5 })
      rect({ x: w - 10, y: 4, width: 6, height: h - 8, fill: theme.border, stroke: 'none', opacity: 0.32 })
      for (let i = 0; i < 6; i++) circle({ cx: 8 + i * 5, cy: h - 6, r: 0.7, fill: theme.rootInk, stroke: 'none', opacity: 0.45 })
    } else path(`M4 ${h - 2}H${w - 4}`, { stroke: theme.accent, 'stroke-width': 1.4 })
  },
  'memphis-play': ({ w, h, root, major, outline, path, circle, theme }) => {
    if (root) {
      outline(`M0 10L${w - 12} 0L${w} ${h - 8}L9 ${h}Z`)
      path(`M15 6l6 5 6-5 6 5`, { stroke: theme.border, 'stroke-width': 2 })
      path(`M${w - 17} ${h - 2}a12 12 0 0 1 16-16`, { stroke: theme.accent, 'stroke-width': 5 })
    } else if (major) {
      outline(`M8 0H${w - 8}Q${w} 0 ${w} 8V${h}H0V8Z`)
      for (let i = 0; i < 3; i++) circle({ cx: w - 7 - i * 5, cy: 5, r: 1, fill: theme.border, stroke: 'none' })
    }
  },
  'neo-brutalist': ({ w, h, root, major, path, rect, theme }) => {
    if (root) rect({ x: w - 18, y: h - 9, width: 11, height: 3, fill: theme.rootInk, stroke: 'none' })
    else if (major) path(`M7 5h15`, { stroke: theme.border, 'stroke-width': 2, 'stroke-linecap': 'butt' })
  },
  'retro-desktop': ({ w, h, root, major, path, rect, theme }) => {
    if (major) {
      path(`M2 ${h - 2}V2H${w - 2}`, { stroke: '#ffffff', 'stroke-width': 2, 'stroke-linecap': 'square' })
      path(`M${w - 2} 2V${h - 2}H2`, { stroke: '#7b8a8e', 'stroke-width': 2, 'stroke-linecap': 'square' })
      rect({ x: 5, y: 5, width: w - 10, height: root ? 8 : 4, fill: theme.accent, stroke: 'none' })
    } else path(`M3 ${h / 2 - 6}h6l3 3v9H3Z M9 ${h / 2 - 6}v3h3`, { stroke: theme.border, 'stroke-width': 0.8 })
  },
  'stitched-linen': ({ w, h, root, major, rect, path, theme }) => {
    if (major) rect({ x: 5, y: 5, width: w - 10, height: h - 10, rx: root ? 9 : 7, stroke: theme.border, 'stroke-width': 1, 'stroke-dasharray': '4 4' })
    else path(`M4 ${h - 2}H${w - 4}`, { stroke: theme.border, 'stroke-width': 0.9, 'stroke-dasharray': '3 5' })
  },
  'clay-studio': ({ w, h, root, major, shape, path, theme, id }) => {
    if (major) {
      shape.setAttribute('fill', `url(#${id}-clay-${root ? 'root' : 'second'})`)
      path(`M19 7Q${w / 2} 2 ${w - 19} 7`, { stroke: '#fff9e7', opacity: 0.45, 'stroke-width': 2 })
      path(`M18 ${h - 6}Q${w / 2} ${h - 1} ${w - 18} ${h - 6}`, { stroke: theme.border, opacity: 0.4, 'stroke-width': 1.3 })
    }
  },
  'stained-glass': ({ w, h, root, major, outline, path, theme }) => {
    if (major) {
      const s = root ? 18 : 12
      outline(`M${s} 0H${w - s}L${w} ${s}V${h - s}L${w - s} ${h}H${s}L0 ${h - s}V${s}Z`)
      path(`M${s} 0L${s + 10} 10L0 ${s + 12}V${s}Z M${w - s} ${h}l-10-10L${w} ${h - s - 12}v12Z`, { fill: '#48788b', stroke: theme.border, 'stroke-width': 1 })
      path(`M${w - s} 0l-10 10L${w} ${s + 12}V${s}Z M${s} ${h}l10-10L0 ${h - s - 12}v12Z`, { fill: '#bd8952', stroke: theme.border, 'stroke-width': 1 })
      if (root) path(`M${s + 11} 5H${w - s - 11} M${s + 11} ${h - 5}H${w - s - 11}`, { stroke: '#728367', 'stroke-width': 2 })
    }
  },
  topographic: ({ w, h, root, major, outline, path, circle, theme }) => {
    if (root) {
      outline(`M0 0H${w - 14}V8H${w}V${h}H14V${h - 8}H0Z`)
      path(`M7 14V7H${w - 21} M21 ${h - 7}H${w - 7}v-7`, { stroke: '#d4dfba', 'stroke-width': 0.8 })
    } else if (major) {
      outline(`M9 0H${w - 9}L${w} ${h / 2}L${w - 9} ${h}H9L0 ${h / 2}Z`)
      circle({ cx: 9, cy: h / 2, r: 2.3, fill: theme.accent, stroke: 'none' })
    } else path(`M2 ${h / 2 + 3}l4-7 4 7Z`, { stroke: theme.border, 'stroke-width': 0.8 })
  },
  'film-storyboard': ({ w, h, root, major, rect, path, theme }) => {
    if (major) {
      const ink = root ? '#e6e3d6' : theme.border
      for (let i = 0; i < 3; i++) {
        const y = 8 + i * (h - 21) / 2
        rect({ x: 5, y, width: 5, height: 5, rx: 0.8, fill: ink, stroke: 'none' })
        rect({ x: w - 10, y, width: 5, height: 5, rx: 0.8, fill: ink, stroke: 'none' })
      }
      path(`M15 4H${w - 15}V${h - 4}H15Z`, { stroke: ink, 'stroke-width': 0.7 })
    } else path(`M4 5H1v7 M${w - 4} ${h - 5}h3v-7`, { stroke: theme.border, 'stroke-width': 0.8 })
  },
  'travel-tickets': ({ w, h, root, major, outline, path, circle, theme }) => {
    if (major) {
      const r = root ? 8 : 6
      outline(`M0 0H${w}V${h / 2 - r}a${r} ${r} 0 0 0 0 ${r * 2}V${h}H0V${h / 2 + r}a${r} ${r} 0 0 0 0 ${-r * 2}Z`)
      path(`M${r + 8} 6V${h - 6}M${w - r - 8} 6V${h - 6}`, { stroke: theme.border, 'stroke-width': 0.9, 'stroke-dasharray': '2 4' })
    } else {
      outline(`M10 0H${w}V${h}H10L0 ${h / 2}Z`)
      circle({ cx: 10, cy: h / 2, r: 2.2, stroke: theme.border, 'stroke-width': 0.7 })
    }
  }
}
