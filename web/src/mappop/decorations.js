// Small, deterministic SVG geometry. No canvas-only effects, DOM text replacement,
// random paths, hit targets or data mutations. Exports clone the same SVG.
import { decorators, branchColor, branchIndex, secondFillFor } from './decoration-presets'
const NS = 'http://www.w3.org/2000/svg'
export const svgElement = (tag, attrs = {}) => {
  const el = document.createElementNS(NS, tag)
  Object.keys(attrs).forEach(key => el.setAttribute(key, attrs[key]))
  return el
}

// Mix a #rrggbb color toward white (amount > 0) or black (amount < 0).
export const shade = (hex, amount) => {
  const target = amount > 0 ? 255 : 0
  const t = Math.abs(amount)
  return '#' + hex.slice(1).match(/../g).map(x => {
    const v = parseInt(x, 16)
    return Math.round(v + (target - v) * t).toString(16).padStart(2, '0')
  }).join('')
}

const linear = (defs, id, stops, attrs = { x1: '0%', y1: '0%', x2: '0%', y2: '100%' }) => {
  const gradient = svgElement('linearGradient', { id, ...attrs })
  stops.forEach(([offset, color, opacity]) => gradient.appendChild(svgElement('stop', { offset, 'stop-color': color, ...(opacity !== undefined ? { 'stop-opacity': opacity } : {}) })))
  defs.appendChild(gradient)
}

export function addArtDefs(defs, theme, id) {
  if (theme.slug === 'clay-studio') {
    linear(defs, `${id}-clay-root`, [['0%', shade(theme.rootFill, 0.22)], ['100%', shade(theme.rootFill, -0.12)]])
    theme.secondPalette.forEach((color, index) => linear(defs, `${id}-clay-${index}`, [['0%', shade(color, 0.3)], ['100%', shade(color, -0.1)]]))
  }
  if (theme.slug === 'glass-aurora') {
    const diagonal = { x1: '0%', y1: '0%', x2: '100%', y2: '100%' }
    linear(defs, `${id}-glass-root`, [['0%', '#5b4fc4'], ['55%', '#3d4fae'], ['100%', '#23808f']], diagonal)
    theme.branchPalette.forEach((color, index) => linear(defs, `${id}-glass-${index}`, [['0%', color, 0.42], ['100%', color, 0.12]], diagonal))
    linear(defs, `${id}-glass-leaf`, [['0%', '#ffffff', 0.12], ['100%', '#ffffff', 0.03]], diagonal)
  }
}

const customKeys = ['shape', 'fillColor', 'borderColor', 'borderWidth', 'borderRadius', 'gradientStyle', 'paddingX', 'paddingY']
// Title-tier shadows stay off for themes whose identity is flat print.
const flatThemes = ['zen-japan', 'ink-wash', 'blueprint-lab', 'bauhaus-geometry', 'vintage-editorial']
export function addDecoration(node, theme, id) {
  const shape = node.shapeNode && node.shapeNode.node
  const group = node.group && node.group.node
  if (!shape || !group) return
  group.querySelectorAll('[data-mappop-decoration]').forEach(el => el.remove())
  if (shape.hasAttribute('data-mappop-filter')) {
    shape.removeAttribute('filter')
    shape.removeAttribute('data-mappop-filter')
  }
  const level = node.isRoot ? 'root' : node.layerIndex === 1 ? 'second' : 'node'
  const config = node.mindMap.getCustomThemeConfig()
  // Explicit user geometry wins, including a retained global custom theme.
  if (customKeys.some(key => node.getData(key) !== undefined || config[key] !== undefined || (config[level] && config[level][key] !== undefined))) return
  const w = Math.max(12, node.width - node.getBorderWidth())
  const h = Math.max(12, node.height - node.getBorderWidth())
  const root = node.isRoot
  const major = node.layerIndex < 2
  const color = branchColor(node, theme)
  const index = branchIndex(node)
  const decoration = svgElement('g', {
    'data-mappop-decoration': theme.slug, 'pointer-events': 'none', 'aria-hidden': 'true',
    fill: 'none', stroke: theme.accent, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'
  })
  const path = (d, attrs = {}) => decoration.appendChild(svgElement('path', { d, ...attrs }))
  const rect = attrs => decoration.appendChild(svgElement('rect', attrs))
  const circle = attrs => decoration.appendChild(svgElement('circle', attrs))
  const outline = d => { if (shape.tagName.toLowerCase() === 'path') shape.setAttribute('d', d) }
  const backing = (d, fill) => group.insertBefore(svgElement('path', { d, fill, stroke: 'none', 'pointer-events': 'none', 'data-mappop-decoration': theme.slug }), shape)
  // Render-time per-branch color; never written to node data.
  if (level === 'second') {
    const fill = secondFillFor(node, theme)
    if (fill) shape.setAttribute('fill', fill)
  }
  if (theme.branchStroke && major && !root) shape.setAttribute('stroke', color)
  // A shared filter only on title tiers, never hundreds of leaf filters.
  if (major && theme.shadow.slice(1).some(value => value !== 0) && !flatThemes.includes(theme.slug)) {
    shape.setAttribute('filter', `url(#${id})`)
    shape.setAttribute('data-mappop-filter', 'true')
  }
  const tools = { w, h, root, major, level, node, shape, path, rect, circle, outline, backing, theme, id, color, index, decoration }
  if (decorators[theme.slug]) decorators[theme.slug](tools)
  switch (theme.slug) {
    case 'pixel-arcade': {
      const s = root ? 9 : major ? 6 : 4
      outline(`M${s * 2} 0H${w - s * 2}V${s}H${w - s}V${s * 2}H${w}V${h - s * 2}H${w - s}V${h - s}H${w - s * 2}V${h}H${s * 2}V${h - s}H${s}V${h - s * 2}H0V${s * 2}H${s}V${s}H${s * 2}Z`)
      if (major) {
        path(`M${s * 2} ${s + 2}h${root ? 34 : 18}`, { stroke: '#ffffff', 'stroke-width': 3, 'stroke-linecap': 'square', opacity: 0.75 })
        path(`M${w - 34} ${h - s - 2}h14m5 0h5`, { stroke: theme.rootInk, 'stroke-width': 3, 'stroke-linecap': 'square', opacity: 0.6 })
      } else rect({ x: 6, y: h / 2 - 3, width: 6, height: 6, fill: color, stroke: 'none' })
      break
    }
    case 'anime-pop': {
      const star = (x, y, r, fill) => path(`M${x} ${y - r}l${r * 0.3} ${r * 0.7} ${r * 0.7} ${r * 0.3}-${r * 0.7} ${r * 0.3}-${r * 0.3} ${r * 0.7}-${r * 0.3}-${r * 0.7}-${r * 0.7}-${r * 0.3} ${r * 0.7}-${r * 0.3}Z`, { fill, stroke: theme.border, 'stroke-width': 1.2 })
      if (major) {
        star(w - 8, 1, root ? 12 : 9, '#fff3b0')
        if (root) star(10, h - 2, 7, '#ffffff')
        for (let i = 0; i < 5; i++) circle({ cx: (root ? 30 : 9) + i * 5, cy: h - 6, r: 1.1, fill: root ? '#ffffff' : theme.border, stroke: 'none', opacity: root ? 0.8 : 0.45 })
      } else circle({ cx: 7, cy: h / 2, r: 2.6, fill: color, stroke: 'none' })
      break
    }
    case 'toon-motion':
      outline(`M18 1Q1 1 1 18V${h - 18}Q1 ${h - 1} 18 ${h - 1}H${w - 37}l-4 10 17-10H${w - 18}Q${w - 1} ${h - 1} ${w - 1} ${h - 18}V18Q${w - 1} 1 ${w - 18} 1Z`)
      if (major) path(`M16 7Q${w * 0.25} 5 ${w * 0.42} 7`, { stroke: '#ffffff', 'stroke-width': root ? 4 : 3, opacity: 0.75 })
      if (root) path(`M-8 6l-10-7 M-10 18h-15 M-8 30l-10 6 M${w + 8} ${h - 14}l11 6 M${w + 9} ${h - 28}l13-2`, { stroke: theme.border, 'stroke-width': 3.2 })
      break
    case 'zen-japan':
      if (root) {
        path(`M8 6H${w - 8} M8 ${h - 6}H${w - 8}`, { stroke: '#cfc6b0', 'stroke-width': 0.8, opacity: 0.8 })
        rect({ x: w - 19, y: h - 19, width: 12, height: 12, fill: theme.accent, stroke: 'none' })
        path(`M${w - 16} ${h - 13}h6 M${w - 13} ${h - 16}v6`, { stroke: '#f8f2e4', 'stroke-width': 1 })
      } else if (major) {
        rect({ x: 0, y: 4, width: 4, height: h - 8, fill: theme.accent, stroke: 'none' })
        path(`M10 ${h - 1}H${w - 4}`, { stroke: theme.border, 'stroke-width': 1 })
      } else circle({ cx: 4, cy: h / 2, r: 1.6, fill: theme.accent, stroke: 'none' })
      break
    case 'ink-wash':
      if (major) {
        outline(`M4 5Q${w * 0.3} -1 ${w - 7} 3L${w} ${h - 9}Q${w * 0.7} ${h + 2} 3 ${h - 3}L0 14Z`)
        path(`M8 ${h - 2}Q${w * 0.45} ${h + 4} ${w - 8} ${h - 3}`, { stroke: root ? '#000000' : theme.border, 'stroke-width': root ? 4 : 2.4, opacity: 0.5 })
        path(`M12 1L${w - 12} 0`, { stroke: root ? '#000000' : theme.border, 'stroke-width': 1.4, opacity: 0.5 })
        if (root) {
          rect({ x: w - 21, y: h - 19, width: 13, height: 13, fill: theme.accent, stroke: 'none' })
          path(`M${w - 18} ${h - 12.5}h7`, { stroke: '#fbf8ee', 'stroke-width': 1.2 })
        }
      } else path(`M7 ${h - 2}Q${w * 0.4} ${h} ${w - 4} ${h - 4}`, { stroke: theme.border, 'stroke-width': 1.4, opacity: 0.6 })
      break
    case 'sketchbook':
      if (major) {
        outline(`M3 4L${w - 4} 1L${w} ${h - 3}L4 ${h}Z`)
        path(`M8 1L${w - 1} 5L${w - 4} ${h - 6}L2 ${h - 3}L5 8`, { stroke: theme.border, 'stroke-width': 0.8, opacity: 0.7 })
      } else path(`M3 ${h - 8}l1 5Q${w * 0.5} ${h} ${w - 3} ${h - 4}`, { stroke: color, 'stroke-width': 1.2 })
      if (root) {
        rect({ x: w / 2 - 24, y: -6, width: 48, height: 13, fill: '#e6dcbc', opacity: 0.85, stroke: 'none', transform: `rotate(-3 ${w / 2} 0)` })
        path(`M16 ${h - 9}l${Math.min(70, w * 0.4)}-3m-${Math.min(64, w * 0.36)} 7l${Math.min(60, w * 0.34)}-3`, { 'stroke-width': 1.8 })
      }
      break
    case 'marker-notes':
      if (major) {
        outline(`M0 2L${w - 2} 0L${w} ${h - 12}L${w - 12} ${h}H2Z`)
        rect({ x: w / 2 - 25, y: -5, width: 50, height: 12, fill: '#e7dcae', opacity: 0.9, stroke: 'none', transform: `rotate(-4 ${w / 2} 0)` })
        path(`M${w - 12} ${h}v-12h12Z`, { fill: '#ffffff', opacity: 0.55, stroke: 'none' })
      } else {
        outline(`M3 7L${w - 1} 4L${w - 4} ${h - 5}L0 ${h - 2}Z`)
        path(`M6 ${h - 4}L${w - 10} ${h - 7}`, { stroke: color, 'stroke-width': 2.4, opacity: 0.5 })
      }
      break
    case 'cyber-neon':
      outline(`M12 0H${w}V${h - 12}L${w - 12} ${h}H0V12Z`)
      if (major) {
        const ink = root ? theme.accent : color
        path(`M5 15V10l5-5h18 M${w - 28} ${h - 5}h12l7-7`, { stroke: ink, 'stroke-width': 2 })
        path(`M${w - 24} 6h3m3 0h3m3 0h3`, { stroke: root ? theme.border : ink, 'stroke-width': 2.2 })
      } else path(`M6 10v-4h10`, { stroke: color, 'stroke-width': 1.2 })
      break
    case 'watercolor-garden':
      outline(`M14 3Q${w * 0.4} -2 ${w - 16} 4Q${w + 2} 6 ${w - 1} ${h / 2}Q${w + 1} ${h - 2} ${w - 18} ${h - 1}Q${w * 0.5} ${h + 3} 13 ${h - 3}Q-2 ${h - 5} 1 ${h / 2}Q-1 5 14 3Z`)
      path(`M14 5Q${w * 0.45} 1 ${w - 14} 6 M12 ${h - 5}Q${w * 0.6} ${h + 1} ${w - 12} ${h - 5}`, { stroke: root ? '#b9506a' : color, opacity: 0.35, 'stroke-width': major ? 2.8 : 1.6 })
      if (major) {
        path(`M${w - 8} 12Q${w - 16} 0 ${w - 9} -9Q${w} 2 ${w - 8} 12M${w - 8} 12Q${w - 21} 2 ${w - 25} 8Q${w - 22} 16 ${w - 8} 12`, { fill: '#5f9468', stroke: 'none', opacity: 0.8 })
        if (root) circle({ cx: 12, cy: h - 10, r: 4, fill: '#fbe39c', stroke: '#b9506a', 'stroke-width': 1 })
      }
      break
    case 'paper-cut':
      outline(`M0 0H${w - 13}L${w} 13V${h}H12L0 ${h - 12}Z`)
      if (major) {
        backing(`M-5 6H${w - 7}L${w + 4} 17V${h + 6}H6L-5 ${h - 5}Z`, root ? '#f3c95a' : '#fffaf0')
        path(`M${w - 13} 0v13h13`, { fill: root ? '#4f8f99' : '#ffffff', stroke: 'none', opacity: root ? 1 : 0.6 })
      } else path(`M6 ${h - 5}H${w - 5}`, { stroke: '#d4b38a', 'stroke-width': 1.2 })
      break
    case 'ukiyo-e-print':
      if (major) {
        path(`M5 5H${w - 5}V${h - 5}H5Z`, { stroke: '#efe4c3', 'stroke-width': 0.9 })
        path(`M9 8h10M9 8v8M${w - 9} ${h - 8}h-10m10 0v-8`, { stroke: '#efe4c3', 'stroke-width': 1.6 })
        if (root) path(`M14 ${h - 12}q8-8 16 0t16 0`, { stroke: '#e9d29a', 'stroke-width': 1.4 })
      } else {
        outline(`M7 0H${w}V${h - 7}L${w - 7} ${h}H0V7Z`)
        path(`M4 8V4h8`, { stroke: theme.accent, 'stroke-width': 1.4 })
      }
      break
    case 'blueprint-lab':
      if (major) {
        path(`M0 -6H${w}M0 -10v8M${w} -10v8M-6 0V${h}M-10 0h8M-10 ${h}h8`, { stroke: theme.border, 'stroke-width': 0.9, opacity: 0.9 })
        circle({ cx: 0, cy: 0, r: 3.5, stroke: theme.accent, 'stroke-width': 1.2 })
        circle({ cx: w, cy: h, r: 3.5, stroke: theme.accent, 'stroke-width': 1.2 })
        if (root) path(`M6 ${h - 6}h18 M6 ${h - 6}v-6`, { stroke: theme.accent, 'stroke-width': 1.4 })
      } else path(`M-3 ${h / 2}h6m-3-3v6`, { stroke: theme.accent, 'stroke-width': 1.2 })
      break
    case 'bauhaus-geometry':
      if (root) {
        circle({ cx: 10, cy: 10, r: 14, fill: theme.accent, stroke: 'none' })
        rect({ x: w - 32, y: h - 9, width: 26, height: 9, fill: '#f2c230', stroke: 'none' })
        path(`M${w - 14} 0L${w} 14V0Z`, { fill: '#3d7cc9', stroke: 'none' })
      } else if (major) {
        outline(`M${h / 2} 0H${w}V${h}H${h / 2}A${h / 2} ${h / 2} 0 0 1 ${h / 2} 0Z`)
        rect({ x: w - 7, y: 0, width: 7, height: h, fill: theme.border, stroke: 'none' })
      } else {
        rect({ x: 2, y: h / 2 - 3, width: 6, height: 6, fill: theme.accent, stroke: 'none' })
        path(`M14 ${h - 1}H${w}`, { stroke: theme.border, 'stroke-width': 1.4 })
      }
      break
    case 'glass-aurora':
      shape.setAttribute('fill', `url(#${id}-glass-${root ? 'root' : major ? index % theme.branchPalette.length : 'leaf'})`)
      path(`M14 3.5H${w - 14}Q${w - 3.5} 3.5 ${w - 3.5} 14`, { stroke: '#ffffff', 'stroke-width': root ? 1.8 : 1.3, opacity: major ? 0.8 : 0.45 })
      if (major) path(`M16 ${h - 3.5}H${w - 16}`, { stroke: root ? '#6ff0cf' : color, 'stroke-width': 1.6, opacity: 0.85 })
      break
    case 'vintage-editorial':
      if (root) {
        path(`M8 5H${w - 8}M8 9H${w - 8}M8 ${h - 9}H${w - 8}M8 ${h - 5}H${w - 8}`, { stroke: '#d9b878', 'stroke-width': 0.9 })
        path(`M${w / 2 - 5} 7l5-4 5 4-5 4Z M${w / 2 - 5} ${h - 7}l5-4 5 4-5 4Z`, { fill: '#d9b878', stroke: 'none' })
      } else if (major) {
        path(`M0 1.5H${w}M0 ${h - 1.5}H${w}`, { stroke: theme.border, 'stroke-width': 1.1 })
        rect({ x: 0, y: 5, width: 3, height: h - 10, fill: theme.accent, stroke: 'none' })
      } else path(`M2 ${h / 2 - 3}v6`, { stroke: theme.accent, 'stroke-width': 1.6 })
      break
    case 'celestial-atlas':
      if (root) {
        decoration.appendChild(svgElement('ellipse', { cx: w / 2, cy: h / 2, rx: w / 2 - 6, ry: h / 2 - 5, stroke: theme.rootInk, 'stroke-width': 0.8, opacity: 0.45 }))
        decoration.appendChild(svgElement('ellipse', { cx: w / 2, cy: h / 2, rx: w / 2 + 9, ry: h / 2 + 7, stroke: theme.accent, 'stroke-width': 1, opacity: 0.7, 'stroke-dasharray': '2 5' }))
        circle({ cx: w / 2, cy: -7, r: 3.5, fill: theme.accent, stroke: 'none' })
        circle({ cx: w + 7, cy: h / 2, r: 2.5, fill: '#ffffff', stroke: 'none' })
      } else if (major) {
        circle({ cx: 7, cy: h / 2, r: 2.6, fill: theme.accent, stroke: 'none' })
        circle({ cx: w - 7, cy: h / 2, r: 2.6, stroke: theme.accent, 'stroke-width': 1 })
      } else path(`M4 ${h / 2 - 4}v8m-4-4h8 M12 ${h - 2}Q${w / 2} ${h} ${w - 1} ${h - 2}`, { stroke: theme.accent, 'stroke-width': 0.9, opacity: 0.8 })
      break
  }
  // Behind text, icons and controls; nothing intercepts pointer events.
  group.insertBefore(decoration, shape.nextSibling)
}
