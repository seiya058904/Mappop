// Small, deterministic SVG geometry. No canvas-only effects, DOM text replacement,
// random paths, hit targets or data mutations. Exports clone the same SVG.
const NS = 'http://www.w3.org/2000/svg'
export const svgElement = (tag, attrs = {}) => {
  const el = document.createElementNS(NS, tag)
  Object.keys(attrs).forEach(key => el.setAttribute(key, attrs[key]))
  return el
}

export function addArtDefs(defs, theme, id) {
  if (theme.slug === 'glass-aurora') {
    const gradient = svgElement('linearGradient', { id: `${id}-glass`, x1: '0%', y1: '0%', x2: '100%', y2: '100%' })
    ;[['0%', '#f8fbff'], ['55%', '#dcebf5'], ['100%', '#eee0ed']].forEach(([offset, color]) => gradient.appendChild(svgElement('stop', { offset, 'stop-color': color })))
    defs.appendChild(gradient)
  }
}

const customKeys = ['shape', 'fillColor', 'borderColor', 'borderWidth', 'borderRadius', 'gradientStyle', 'paddingX', 'paddingY']
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
  const decoration = svgElement('g', {
    'data-mappop-decoration': theme.slug, 'pointer-events': 'none', 'aria-hidden': 'true',
    fill: 'none', stroke: theme.accent, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'
  })
  const path = (d, attrs = {}) => decoration.appendChild(svgElement('path', { d, ...attrs }))
  const rect = attrs => decoration.appendChild(svgElement('rect', attrs))
  const circle = attrs => decoration.appendChild(svgElement('circle', attrs))
  const outline = d => { if (shape.tagName.toLowerCase() === 'path') shape.setAttribute('d', d) }
  // A shared filter only on title tiers, never hundreds of leaf filters.
  if (major && !['zen-japan', 'ink-wash', 'sketchbook', 'blueprint-lab', 'bauhaus-geometry', 'vintage-editorial', 'celestial-atlas'].includes(theme.slug)) {
    shape.setAttribute('filter', `url(#${id})`)
    shape.setAttribute('data-mappop-filter', 'true')
  }
  switch (theme.slug) {
    case 'pixel-arcade': {
      const s = root ? 9 : 5
      outline(`M${s * 2} 0H${w - s * 2}V${s}H${w - s}V${s * 2}H${w}V${h - s * 2}H${w - s}V${h - s}H${w - s * 2}V${h}H${s * 2}V${h - s}H${s}V${h - s * 2}H0V${s * 2}H${s}V${s}H${s * 2}Z`)
      if (major) path(`M${s * 2} 7h${root ? 30 : 16} M${w - 30} ${h - 7}h12m4 0h4`, { stroke: root ? theme.rootInk : theme.accent, 'stroke-width': 2, 'stroke-linecap': 'square' })
      break
    }
    case 'anime-pop':
      if (major) {
        path(`M${w - 10} 0l3-7 3 7 7 3-7 3-3 7-3-7-7-3Z`, { fill: '#fff5c9', stroke: theme.accent, 'stroke-width': 1 })
        for (let i = 0; i < 5; i++) circle({ cx: 7 + i * 5, cy: h - 6, r: 0.9, fill: theme.border, stroke: 'none' })
      }
      if (!root && major) path(`M5 5h${w - 10}`, { stroke: theme.border, 'stroke-width': 0.7 })
      break
    case 'toon-motion':
      outline(`M18 1Q1 1 1 18V${h - 18}Q1 ${h - 1} 18 ${h - 1}H${w - 37}l-4 9 16-9H${w - 18}Q${w - 1} ${h - 1} ${w - 1} ${h - 18}V18Q${w - 1} 1 ${w - 18} 1Z`)
      if (root) path(`M-8 6l-9-6 M-10 17h-13 M${w + 8} ${h - 12}l10 5`, { stroke: theme.border, 'stroke-width': 3 })
      break
    case 'zen-japan':
      if (root) {
        path(`M5 10V5H${w - 5}V10 M5 ${h - 10}v5H${w - 5}v-5`, { stroke: theme.border, 'stroke-width': 0.7 })
        rect({ x: w - 13, y: h - 13, width: 7, height: 7, fill: theme.accent, stroke: 'none' })
      } else if (major) {
        path(`M4 ${h - 2}H${w - 4}`, { stroke: theme.border, 'stroke-width': 0.8 })
        rect({ x: 1, y: h / 2 - 2, width: 3, height: 4, fill: theme.accent, stroke: 'none' })
      }
      break
    case 'ink-wash':
      if (major) {
        outline(`M4 5Q${w * 0.3} -1 ${w - 7} 3L${w} ${h - 9}Q${w * 0.7} ${h + 2} 3 ${h - 3}L0 14Z`)
        path(`M8 ${h - 2}Q${w * 0.45} ${h + 3} ${w - 8} ${h - 3}`, { stroke: theme.border, 'stroke-width': root ? 3 : 2, opacity: 0.4 })
        path(`M12 1L${w - 12} 0`, { stroke: theme.border, 'stroke-width': 1, opacity: 0.45 })
        if (root) rect({ x: w - 17, y: h - 14, width: 9, height: 9, fill: theme.accent, stroke: 'none' })
      } else path(`M7 ${h - 2}Q${w * 0.4} ${h} ${w - 4} ${h - 4}`, { stroke: theme.border, 'stroke-width': 1.1, opacity: 0.55 })
      break
    case 'sketchbook':
      if (major) {
        outline(`M3 4L${w - 4} 1L${w} ${h - 3}L4 ${h}Z`)
        path(`M8 1L${w - 1} 5L${w - 4} ${h - 6}L2 ${h - 3}L5 8`, { stroke: theme.border, 'stroke-width': 0.6, opacity: 0.7 })
      } else path(`M3 ${h - 8}l1 5Q${w * 0.5} ${h} ${w - 3} ${h - 4}`, { stroke: theme.border, 'stroke-width': 0.8 })
      if (root) path(`M16 ${h - 9}l35-2m-29 5l31-2`, { 'stroke-width': 1.3 })
      break
    case 'marker-notes':
      if (major) {
        outline(`M0 2L${w - 2} 0L${w} ${h - 12}L${w - 12} ${h}H2Z`)
        rect({ x: w / 2 - 23, y: -4, width: 46, height: 11, fill: '#c8bd96', opacity: 0.75, stroke: 'none', transform: `rotate(-4 ${w / 2} 0)` })
        path(`M${w - 12} ${h}v-12h12Z`, { fill: '#d6aa82', opacity: 0.65, stroke: 'none' })
      } else {
        outline(`M3 7L${w - 1} 4L${w - 4} ${h - 5}L0 ${h - 2}Z`)
        path(`M6 ${h - 4}L${w - 10} ${h - 7}`, { stroke: '#d7b849', 'stroke-width': 2, opacity: 0.4 })
      }
      break
    case 'cyber-neon':
      outline(`M12 0H${w}V${h - 12}L${w - 12} ${h}H0V12Z`)
      if (major) {
        path(`M5 15V10l5-5h18 M${w - 28} ${h - 5}h12l7-7`, { stroke: theme.accent, 'stroke-width': 1.7 })
        path(`M${w - 24} 6h3m3 0h3m3 0h3`, { stroke: theme.border, 'stroke-width': 2 })
      } else path(`M6 10v-4h10`, { stroke: theme.border, 'stroke-width': 0.8 })
      break
    case 'watercolor-garden':
      outline(`M14 3Q${w * 0.4} -2 ${w - 16} 4Q${w + 2} 6 ${w - 1} ${h / 2}Q${w + 1} ${h - 2} ${w - 18} ${h - 1}Q${w * 0.5} ${h + 3} 13 ${h - 3}Q-2 ${h - 5} 1 ${h / 2}Q-1 5 14 3Z`)
      path(`M14 5Q${w * 0.45} 1 ${w - 14} 6 M12 ${h - 5}Q${w * 0.6} ${h + 1} ${w - 12} ${h - 5}`, { stroke: theme.border, opacity: 0.4, 'stroke-width': major ? 2.3 : 1.4 })
      if (major) {
        path(`M8 ${h - 9}Q1 ${h - 19} 7 ${h - 26}Q15 ${h - 18} 8 ${h - 9}M8 ${h - 9}Q17 ${h - 20} 21 ${h - 14}Q20 ${h - 7} 8 ${h - 9}`, { fill: '#769c7a', stroke: 'none', opacity: 0.65 })
      }
      break
    case 'paper-cut':
      outline(`M0 0H${w - 13}L${w} 13V${h}H12L0 ${h - 12}Z`)
      if (major) {
        const backing = svgElement('path', { d: `M-4 6H${w - 7}L${w + 3} 16V${h + 5}H6L-4 ${h - 5}Z`, fill: '#cba586', stroke: 'none', 'pointer-events': 'none', 'data-mappop-decoration': theme.slug })
        group.insertBefore(backing, shape)
        path(`M${w - 13} 0v13h13`, { fill: root ? '#6f9190' : '#f7c9ac', stroke: 'none' })
      } else path(`M6 ${h - 5}H${w - 5}`, { stroke: '#d4b38a', 'stroke-width': 1 })
      break
    case 'ukiyo-e-print':
      if (major) {
        path(`M5 5H${w - 5}V${h - 5}H5Z`, { stroke: '#efe4c3', 'stroke-width': 0.7 })
        path(`M9 8h9M9 8v7M${w - 9} ${h - 8}h-9m9 0v-7`, { stroke: '#efe4c3', 'stroke-width': 1.2 })
      } else {
        outline(`M7 0H${w}V${h - 7}L${w - 7} ${h}H0V7Z`)
        path(`M4 8V4h8`, { stroke: theme.accent, 'stroke-width': 1 })
      }
      break
    case 'blueprint-lab':
      if (major) {
        path(`M0 -5H${w}M0 -9v8M${w} -9v8M-5 0V${h}M-9 0h8M-9 ${h}h8`, { stroke: theme.border, 'stroke-width': 0.6, opacity: 0.8 })
        circle({ cx: 0, cy: 0, r: 3, stroke: theme.accent, 'stroke-width': 0.8 })
        circle({ cx: w, cy: h, r: 3, stroke: theme.accent, 'stroke-width': 0.8 })
      } else path(`M-3 ${h / 2}h6m-3-3v6`, { stroke: theme.accent, 'stroke-width': 0.8 })
      break
    case 'bauhaus-geometry':
      if (root) {
        circle({ cx: 8, cy: 8, r: 10, fill: '#c64231', stroke: 'none' })
        rect({ x: w - 26, y: h - 7, width: 20, height: 7, fill: '#edc84c', stroke: 'none' })
      } else if (major) {
        outline(`M${h / 2} 0H${w}V${h}H${h / 2}A${h / 2} ${h / 2} 0 0 1 ${h / 2} 0Z`)
        rect({ x: w - 6, y: 0, width: 6, height: h, fill: '#436481', stroke: 'none' })
      } else {
        rect({ x: 2, y: h / 2 - 2.5, width: 5, height: 5, fill: theme.accent, stroke: 'none' })
        path(`M14 ${h - 1}H${w}`, { stroke: theme.border, 'stroke-width': 1.1 })
      }
      break
    case 'glass-aurora':
      shape.setAttribute('fill', `url(#${id}-glass)`)
      path(`M13 4H${w - 13}Q${w - 4} 4 ${w - 4} 13`, { stroke: '#ffffff', 'stroke-width': 1.4, opacity: 0.85 })
      if (major) path(`M13 ${h - 4}H${w - 13}`, { stroke: '#bba8cf', 'stroke-width': 1, opacity: 0.7 })
      break
    case 'vintage-editorial':
      if (root) path(`M6 4H${w - 6}M6 8H${w - 6}M6 ${h - 7}H${w - 6}M6 ${h - 3}H${w - 6}`, { stroke: '#cdb58d', 'stroke-width': 0.9 })
      else if (major) path(`M0 1H${w}M0 ${h - 1}H${w}`, { stroke: theme.border, 'stroke-width': 0.8 })
      else path(`M2 ${h / 2 - 3}v6`, { stroke: theme.accent, 'stroke-width': 1.2 })
      break
    case 'celestial-atlas':
      if (root) {
        decoration.appendChild(svgElement('ellipse', { cx: w / 2, cy: h / 2, rx: w / 2 - 6, ry: h / 2 - 5, stroke: theme.border, 'stroke-width': 0.5 }))
        circle({ cx: w / 2, cy: 0, r: 3, fill: theme.accent, stroke: 'none' })
        circle({ cx: w / 2, cy: h, r: 2, fill: theme.accent, stroke: 'none' })
      } else if (major) {
        circle({ cx: 6, cy: h / 2, r: 2, fill: theme.accent, stroke: 'none' })
        circle({ cx: w - 6, cy: h / 2, r: 2, stroke: theme.border, 'stroke-width': 0.7 })
      } else path(`M4 ${h / 2 - 3}v6m-3-3h6 M11 ${h - 2}Q${w / 2} ${h} ${w - 1} ${h - 2}`, { stroke: theme.border, 'stroke-width': 0.6 })
      break
  }
  // Behind text, icons and controls; nothing intercepts pointer events.
  group.insertBefore(decoration, shape.nextSibling)
}
