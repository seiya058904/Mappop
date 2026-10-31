// The second collection shares drawing primitives, not one interchangeable box.
// All measurements are inside the text padding and independent of document data.
export const branchIndex = node => {
  if (!node || node.isRoot) return 0
  let branch = node
  while (branch.parent && !branch.parent.isRoot) branch = branch.parent
  return branch.parent ? Math.max(0, branch.parent.children.indexOf(branch)) : 0
}
export const branchColor = (node, theme) => {
  if (!theme.branchPalette || node.isRoot) return theme.border
  return theme.branchPalette[branchIndex(node) % theme.branchPalette.length]
}
export const secondFillFor = (node, theme) => theme.secondPalette ? theme.secondPalette[branchIndex(node) % theme.secondPalette.length] : null

export const decorators = {
  'swiss-type': ({ w, h, root, major, path, rect, theme }) => {
    if (root) {
      path(`M0 ${h + 7}H${w * 0.62}`, { stroke: theme.ink, 'stroke-width': 6, 'stroke-linecap': 'butt' })
      rect({ x: w - 14, y: 8, width: 6, height: 6, fill: '#ffffff', stroke: 'none' })
    } else if (major) rect({ x: 0, y: 0, width: 7, height: h, fill: theme.accent, stroke: 'none' })
  },
  'metro-transit': ({ w, h, root, major, rect, circle, shape, color, theme }) => {
    if (major) {
      shape.setAttribute('stroke', root ? theme.border : color)
      if (root) rect({ x: 8, y: 8, width: w - 16, height: h - 16, rx: Math.min(22, h / 2 - 8), stroke: theme.border, 'stroke-width': 1.4 })
    }
    circle({ cx: major ? 0 : 6, cy: h / 2, r: root ? 8 : major ? 6 : 4.5, fill: '#ffffff', stroke: root ? theme.border : color, 'stroke-width': root ? 3.5 : 3 })
    if (root) circle({ cx: w, cy: h / 2, r: 8, fill: '#ffffff', stroke: theme.border, 'stroke-width': 3.5 })
  },
  'chalk-classroom': ({ w, h, root, major, path, color, theme }) => {
    if (root) {
      path(`M4 15L3 4L${w - 5} 2L${w - 2} ${h - 4}L6 ${h - 2}L3 24`, { stroke: theme.border, 'stroke-width': 2.6 })
      path(`M15 ${h + 4}L${w - 16} ${h + 2}`, { stroke: theme.rootInk, opacity: 0.8, 'stroke-width': 2, 'stroke-dasharray': '22 4 9 3' })
    } else if (major) {
      path(`M14 4L5 5V${h - 5}H16 M${w - 14} ${h - 3}h9v-10`, { stroke: color, 'stroke-width': 2.6 })
      path(`M18 ${h + 1}Q${w / 2} ${h + 3} ${w - 18} ${h}`, { stroke: color, 'stroke-width': 1.4, opacity: 0.55 })
    } else path(`M5 ${h - 3}Q${w / 2} ${h} ${w - 5} ${h - 4}`, { stroke: color, opacity: 0.75, 'stroke-width': 1.2 })
  },
  'terminal-tree': ({ w, h, root, major, path, rect, theme }) => {
    if (root) {
      path(`M11 ${h / 2 - 6}l6 6-6 6`, { stroke: theme.rootInk, 'stroke-width': 2.4, 'stroke-linecap': 'square' })
      rect({ x: w - 18, y: h / 2 - 8, width: 8, height: 16, fill: theme.rootInk, stroke: 'none', opacity: 0.8 })
    } else if (major) {
      path(`M12 4H4V${h - 4}H12 M${w - 12} 4h8V${h - 4}h-8`, { stroke: theme.accent, 'stroke-width': 1.6, 'stroke-linecap': 'square' })
    } else path(`M3 ${h / 2 - 5}v9h7`, { stroke: theme.border, 'stroke-width': 1.3 })
  },
  'circuit-board': ({ w, h, root, major, path, circle, theme }) => {
    if (major) {
      const pins = root ? 6 : 3
      for (let i = 1; i <= pins; i++) {
        const x = w * i / (pins + 1)
        path(`M${x} 0v-7M${x} ${h}v7`, { stroke: theme.border, 'stroke-width': root ? 3.4 : 2.8, 'stroke-linecap': 'butt' })
      }
      if (root) {
        path(`M8 15V8h14 M${w - 8} ${h - 15}v7h-14`, { stroke: theme.border, 'stroke-width': 1.2 })
        circle({ cx: 14, cy: h - 13, r: 3, fill: theme.border, stroke: 'none' })
      } else circle({ cx: 11, cy: h / 2, r: 3, stroke: '#1b130a', 'stroke-width': 1.6 })
    } else {
      circle({ cx: 6, cy: h / 2, r: 4, fill: theme.border, stroke: 'none' })
      circle({ cx: 6, cy: h / 2, r: 1.5, fill: theme.background, stroke: 'none' })
    }
  },
  'art-deco': ({ w, h, root, major, outline, path, theme }) => {
    if (root) {
      outline(`M0 15H10V7H20V0H${w - 20}V7H${w - 10}V15H${w}V${h - 15}H${w - 10}V${h - 7}H${w - 20}V${h}H20V${h - 7}H10V${h - 15}H0Z`)
      path(`M7 20h10V13h10V7H${w - 27}v6h10v7h6V${h - 20}h-6v7h-10v6H27v-6H17v-7H7Z`, { stroke: theme.rootInk, 'stroke-width': 0.9, opacity: 0.55 })
      path(`M${w / 2 - 14} 4l14-0 M${w / 2} 4l14 0 M${w / 2 - 8} ${h - 4}h16`, { stroke: theme.rootInk, 'stroke-width': 1.4, opacity: 0.6 })
    } else if (major) path(`M4 ${h - 4}V4h16 M8 ${h - 8}V8h12 M12 ${h - 12}V12h8 M${w - 8} 5v${h - 10}`, { stroke: theme.accent, 'stroke-width': 1 })
    else path(`M2 ${h / 2}l4-4 4 4-4 4Z`, { fill: theme.accent, stroke: 'none' })
  },
  risograph: ({ w, h, root, major, path, rect, circle, theme }) => {
    if (major) {
      path(`M-4 6H${w - 5}V${h + 4}H-4Z`, { stroke: root ? theme.border : theme.accent, 'stroke-width': root ? 3 : 2, opacity: 0.9 })
      rect({ x: w - 11, y: 4, width: 7, height: h - 8, fill: root ? theme.border : theme.accent, stroke: 'none', opacity: 0.4 })
      for (let i = 0; i < 7; i++) circle({ cx: 8 + i * 5, cy: h - 6, r: 0.9, fill: theme.rootInk, stroke: 'none', opacity: 0.5 })
    } else path(`M4 ${h - 2}H${w - 4}`, { stroke: theme.accent, 'stroke-width': 2 })
  },
  'memphis-play': ({ w, h, root, major, outline, path, circle, color, theme }) => {
    if (root) {
      outline(`M0 10L${w - 12} 0L${w} ${h - 8}L9 ${h}Z`)
      path(`M15 7l6 5 6-5 6 5 6-5`, { stroke: theme.border, 'stroke-width': 2.4 })
      path(`M${w - 19} ${h - 2}a14 14 0 0 1 18-18`, { stroke: theme.accent, 'stroke-width': 6 })
      circle({ cx: 12, cy: h - 10, r: 4, fill: '#ffd23f', stroke: theme.border, 'stroke-width': 1.6 })
    } else if (major) {
      outline(`M8 0H${w - 8}Q${w} 0 ${w} 8V${h}H0V8Z`)
      for (let i = 0; i < 3; i++) circle({ cx: w - 8 - i * 6, cy: 6, r: 1.6, fill: theme.border, stroke: 'none' })
    } else path(`M4 ${h - 3}l4-3 4 3 4-3 4 3`, { stroke: color, 'stroke-width': 1.6 })
  },
  'neo-brutalist': ({ w, h, root, major, path, rect, theme }) => {
    if (root) {
      rect({ x: w - 22, y: h - 11, width: 14, height: 4, fill: theme.rootInk, stroke: 'none' })
      rect({ x: 8, y: 8, width: 8, height: 8, fill: theme.accent, stroke: theme.rootInk, 'stroke-width': 2 })
    } else if (major) path(`M8 6h16`, { stroke: theme.border, 'stroke-width': 3, 'stroke-linecap': 'butt' })
  },
  'retro-desktop': ({ w, h, root, major, path, rect, theme }) => {
    if (major) {
      path(`M2 ${h - 2}V2H${w - 2}`, { stroke: '#ffffff', 'stroke-width': 2, 'stroke-linecap': 'square' })
      path(`M${w - 2} 2V${h - 2}H2`, { stroke: '#808080', 'stroke-width': 2, 'stroke-linecap': 'square' })
      if (root) {
        rect({ x: 4, y: 4, width: w - 8, height: 12, fill: theme.accent, stroke: 'none' })
        for (let i = 0; i < 3; i++) rect({ x: w - 18 - i * 11, y: 6, width: 9, height: 8, fill: '#d4d0c8', stroke: '#404040', 'stroke-width': 0.6 })
      } else rect({ x: 5, y: 5, width: 4, height: h - 10, fill: theme.accent, stroke: 'none' })
    } else path(`M4 ${h / 2 - 6}h6l3 3v9H4Z M10 ${h / 2 - 6}v3h3`, { stroke: theme.accent, 'stroke-width': 1 })
  },
  'stitched-linen': ({ w, h, root, major, rect, path, theme }) => {
    if (major) {
      rect({ x: 5, y: 5, width: w - 10, height: h - 10, rx: root ? 10 : 8, stroke: root ? '#f3e7cc' : theme.border, 'stroke-width': root ? 1.6 : 1.3, 'stroke-dasharray': '5 4' })
    } else path(`M4 ${h - 2}H${w - 4}`, { stroke: theme.accent, 'stroke-width': 1.3, 'stroke-dasharray': '4 4' })
  },
  'clay-studio': ({ w, h, root, major, shape, path, id, index, theme }) => {
    if (major) {
      shape.setAttribute('fill', `url(#${id}-clay-${root ? 'root' : index % theme.secondPalette.length})`)
      path(`M20 7Q${w / 2} 2 ${w - 20} 7`, { stroke: '#ffffff', opacity: 0.6, 'stroke-width': 2.6 })
      path(`M18 ${h - 5}Q${w / 2} ${h} ${w - 18} ${h - 5}`, { stroke: '#000000', opacity: 0.12, 'stroke-width': 2 })
    }
  },
  'stained-glass': ({ w, h, root, major, outline, path, theme }) => {
    if (major) {
      const s = root ? 18 : 12
      outline(`M${s} 0H${w - s}L${w} ${s}V${h - s}L${w - s} ${h}H${s}L0 ${h - s}V${s}Z`)
      const [a, b] = root ? ['#1f5f8b', '#e0a43c'] : ['#e0a43c', '#f3ead2']
      path(`M${s} 0L${s + 10} 10L0 ${s + 12}V${s}Z M${w - s} ${h}l-10-10L${w} ${h - s - 12}v12Z`, { fill: a, stroke: theme.border, 'stroke-width': 1.6 })
      path(`M${w - s} 0l-10 10L${w} ${s + 12}V${s}Z M${s} ${h}l10-10L0 ${h - s - 12}v12Z`, { fill: b, stroke: theme.border, 'stroke-width': 1.6 })
      path(`M${s + 12} 5H${w - s - 12}`, { stroke: '#ffffff', 'stroke-width': root ? 2 : 1.4, opacity: 0.35 })
      if (root) path(`M${s + 11} ${h - 5}H${w - s - 11}`, { stroke: theme.accent, 'stroke-width': 2 })
    } else path(`M5 ${h / 2}l3-4 3 4-3 4Z`, { fill: theme.accent, stroke: theme.border, 'stroke-width': 0.8 })
  },
  topographic: ({ w, h, root, major, outline, path, circle, color }) => {
    if (root) {
      outline(`M0 0H${w - 14}V8H${w}V${h}H14V${h - 8}H0Z`)
      path(`M7 14V7H${w - 21} M21 ${h - 7}H${w - 7}v-7`, { stroke: '#d4dfba', 'stroke-width': 1.1 })
      path(`M${w - 30} ${h - 16}l6-9 6 9Z`, { fill: '#eab079', stroke: 'none' })
    } else if (major) {
      outline(`M10 0H${w - 10}L${w} ${h / 2}L${w - 10} ${h}H10L0 ${h / 2}Z`)
      circle({ cx: 10, cy: h / 2, r: 3, fill: color, stroke: 'none' })
    } else path(`M2 ${h / 2 + 4}l5-8 5 8Z`, { fill: color, stroke: 'none' })
  },
  'film-storyboard': ({ w, h, root, major, rect, path, theme }) => {
    if (major) {
      const ink = root ? '#fdf9ee' : theme.border
      const count = root ? 4 : 3
      for (let i = 0; i < count; i++) {
        const y = 7 + i * (h - 20) / (count - 1)
        rect({ x: 5, y, width: 6, height: 6, rx: 1, fill: ink, stroke: 'none', opacity: root ? 0.9 : 0.8 })
        rect({ x: w - 11, y, width: 6, height: 6, rx: 1, fill: ink, stroke: 'none', opacity: root ? 0.9 : 0.8 })
      }
      path(`M16 4H${w - 16}V${h - 4}H16Z`, { stroke: root ? theme.accent : ink, 'stroke-width': root ? 1.4 : 0.9 })
    } else path(`M5 6H1v8 M${w - 5} ${h - 6}h4v-8`, { stroke: theme.accent, 'stroke-width': 1.4 })
  },
  'travel-tickets': ({ w, h, root, major, outline, path, circle, theme }) => {
    if (major) {
      const r = root ? 9 : 6
      outline(`M0 0H${w}V${h / 2 - r}a${r} ${r} 0 0 0 0 ${r * 2}V${h}H0V${h / 2 + r}a${r} ${r} 0 0 0 0 ${-r * 2}Z`)
      path(`M${r + 9} 6V${h - 6}M${w - r - 9} 6V${h - 6}`, { stroke: root ? '#fff8ec' : theme.ink, 'stroke-width': 1.3, 'stroke-dasharray': '2 4', opacity: root ? 0.8 : 0.5 })
      if (root) path(`M${r + 16} 7H${w - r - 16}`, { stroke: '#fff8ec', 'stroke-width': 1, opacity: 0.6 })
    } else {
      outline(`M10 0H${w}V${h}H10L0 ${h / 2}Z`)
      circle({ cx: 10, cy: h / 2, r: 2.6, fill: theme.background, stroke: theme.border, 'stroke-width': 1 })
    }
  }
}
