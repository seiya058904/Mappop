import { textures } from './textures'
import './themes.css'

const asset = file => `${process.env.BASE_URL || '/'}mappop/${file}`
const fallback = '"Noto Sans SC", "Microsoft YaHei", "PingFang SC", sans-serif'
const fonts = {
  pixel: { family: 'Silkscreen', file: 'Silkscreen-Regular.ttf' },
  rounded: { family: 'Zen Maru Gothic', file: 'ZenMaruGothic-Regular.ttf' },
  comic: { family: 'Bangers', file: 'Bangers-Regular.ttf' },
  serif: { family: 'Zen Old Mincho', file: 'ZenOldMincho-Regular.ttf' },
  pencil: { family: 'Caveat', file: 'Caveat[wght].ttf' },
  marker: { family: 'Permanent Marker', file: 'PermanentMarker-Regular.ttf' },
  cyber: { family: 'Rajdhani', file: 'Rajdhani-SemiBold.ttf' },
  chinese: { family: 'Noto Sans SC', file: 'NotoSansSC-Regular.woff2', format: 'woff2' }
}

// All presets go through the upstream defineTheme API. Node data and layout
// never change when selecting a visual style.
const definitions = [
  {
    slug: 'pixel-arcade', name: 'Pixel Arcade', zh: '像素街机',
    description: 'Stepped panels · 8-bit lettering', descriptionZh: '像素切角 · 街机字形',
    font: 'pixel', dark: true, background: '#151e35', ink: '#c4f2ff',
    rootFill: '#ffdf6c', rootInk: '#222740', secondFill: '#263655', nodeFill: '#1e2b47',
    border: '#74c6d5', accent: '#ffb9c6', line: '#73d8c7',
    radius: 0, borderWidth: 2, lineWidth: 3, lineStyle: 'straight',
    rootSize: 25, secondSize: 19, nodeSize: 16, shadow: ['#080e20', 5, 5, 0]
  },
  {
    slug: 'anime-pop', name: 'Anime Pop', zh: '动漫气泡',
    description: 'Sakura badges · manga halftone', descriptionZh: '樱色徽章 · 漫画网点',
    font: 'rounded', dark: false, background: '#fff8ee', ink: '#493149',
    rootFill: '#efabc4', rootInk: '#38243b', secondFill: '#fff0b9', nodeFill: '#fffdf8',
    border: '#76516d', accent: '#9bcdb8', line: '#ab7893',
    radius: 18, borderWidth: 2, lineWidth: 3, lineStyle: 'curve',
    rootSize: 28, secondSize: 21, nodeSize: 17, shadow: ['#a66582', 3, 4, 0]
  },
  {
    slug: 'toon-motion', name: 'Toon Motion', zh: '卡通动感',
    description: 'Speech balloons · bold comic ink', descriptionZh: '对话气泡 · 粗线漫画',
    font: 'comic', dark: false, background: '#f4c744', ink: '#242736',
    rootFill: '#ff775b', rootInk: '#202331', secondFill: '#fff8df', nodeFill: '#fffdf2',
    border: '#292d3b', accent: '#5987c7', line: '#292d3b',
    radius: 14, borderWidth: 3, lineWidth: 4, lineStyle: 'direct',
    rootSize: 33, secondSize: 26, nodeSize: 22, shadow: ['#292d3b', 5, 5, 0]
  },
  {
    slug: 'zen-japan', name: 'Zen Japan', zh: '日式留白',
    description: 'Washi paper · vermilion seals', descriptionZh: '和纸留白 · 朱砂印记',
    font: 'serif', dark: false, background: '#f1eee4', ink: '#343d36',
    rootFill: '#445e50', rootInk: '#fffdf3', secondFill: '#e3e6d9', nodeFill: '#f9f7ef',
    border: '#9ca895', accent: '#b94c3e', line: '#8e9b87',
    radius: 2, borderWidth: 1, lineWidth: 1.5, lineStyle: 'straight',
    rootSize: 29, secondSize: 22, nodeSize: 18, shadow: ['#6e7966', 1, 3, 2]
  },
  {
    slug: 'ink-wash', name: 'Ink Wash', zh: '水墨山岚',
    description: 'Ink contours · quiet rice paper', descriptionZh: '墨迹轮廓 · 宣纸肌理',
    font: 'serif', dark: false, background: '#eaece7', ink: '#2d3433',
    rootFill: '#3c4847', rootInk: '#fafbf5', secondFill: '#d9dfd9', nodeFill: '#f4f5ee',
    border: '#687773', accent: '#a74435', line: '#586a65',
    radius: 3, borderWidth: 1, lineWidth: 2.5, lineStyle: 'curve',
    rootSize: 30, secondSize: 22, nodeSize: 18, shadow: ['#778680', 2, 3, 3]
  },
  {
    slug: 'sketchbook', name: 'Sketchbook', zh: '手绘速写',
    description: 'Pencil contours · notebook rules', descriptionZh: '铅笔复线 · 横格笔记',
    font: 'pencil', dark: false, background: '#faf6e9', ink: '#414a59',
    rootFill: '#f8dfa4', rootInk: '#343f4e', secondFill: '#eceddf', nodeFill: '#fffcf2',
    border: '#626e7b', accent: '#b95747', line: '#647589',
    radius: 4, borderWidth: 1.5, lineWidth: 1.5, lineStyle: 'curve',
    rootSize: 35, secondSize: 28, nodeSize: 25, shadow: ['#9c9481', 2, 3, 1]
  },
  {
    slug: 'marker-notes', name: 'Marker Notes', zh: '马克便签',
    description: 'Taped notes · broad marker strokes', descriptionZh: '胶带便签 · 宽头马克笔',
    font: 'marker', dark: false, background: '#eee9dd', ink: '#384537',
    rootFill: '#e7f17a', rootInk: '#34412d', secondFill: '#f9c5b6', nodeFill: '#fff2ad',
    border: '#a39b78', accent: '#618c72', line: '#6b816c',
    radius: 0, borderWidth: 0, lineWidth: 4, lineStyle: 'direct',
    rootSize: 27, secondSize: 22, nodeSize: 19, shadow: ['#80775e', 3, 5, 2]
  },
  {
    slug: 'cyber-neon', name: 'Cyber Neon', zh: '赛博霓虹',
    description: 'Circuit corners · luminous connections', descriptionZh: '电路切角 · 霓虹连线',
    font: 'cyber', dark: true, background: '#0c1821', ink: '#bcebe9',
    rootFill: '#153b43', rootInk: '#e6ffef', secondFill: '#142d39', nodeFill: '#102731',
    border: '#49d0c5', accent: '#f1bb70', line: '#4dc6bc',
    radius: 0, borderWidth: 1.5, lineWidth: 2, lineStyle: 'straight',
    rootSize: 32, secondSize: 25, nodeSize: 21, shadow: ['#40bdba', 0, 1, 4]
  }
]

export const artThemes = definitions.map(theme => {
  const font = fonts[theme.font]
  const fontFamily = `"${font.family}", ${fallback}`
  const node = (fillColor, color, fontSize) => ({
    shape: theme.slug === 'cyber-neon' ? 'octagonalRectangle' : 'rectangle',
    fillColor, color, fontSize, fontFamily, fontWeight: 'normal',
    borderColor: theme.border, borderWidth: theme.borderWidth,
    borderRadius: theme.radius, paddingX: 22, paddingY: 12,
    hoverRectColor: theme.accent, hoverRectRadius: theme.radius,
    marginX: 68, marginY: 24
  })
  return {
    ...theme, value: `mappop-${theme.slug}`,
    img: asset(`theme-${theme.slug}-preview.svg`),
    config: {
      backgroundColor: theme.background,
      backgroundImage: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(textures[theme.slug])}`,
      backgroundRepeat: 'repeat', backgroundPosition: '0 0', backgroundSize: 'auto',
      fontFamily, lineColor: theme.line, lineWidth: theme.lineWidth,
      lineStyle: theme.lineStyle, lineRadius: theme.slug === 'pixel-arcade' ? 0 : 7,
      rootLineKeepSameInCurve: true, rootLineStartPositionKeepSameInCurve: true,
      generalizationLineColor: theme.line, associativeLineColor: theme.line,
      associativeLineTextColor: theme.ink, associativeLineTextFontFamily: fontFamily,
      root: { ...node(theme.rootFill, theme.rootInk, theme.rootSize), paddingX: 30, paddingY: 20 },
      second: node(theme.secondFill, theme.ink, theme.secondSize),
      node: { ...node(theme.nodeFill, theme.ink, theme.nodeSize), paddingX: 18, paddingY: 10 },
      generalization: node(theme.nodeFill, theme.ink, theme.nodeSize)
    }
  }
})

export const findArtTheme = value => artThemes.find(theme => theme.value === value)

let registered = false
export function registerArtThemes(MindMap) {
  if (registered) return
  artThemes.forEach(theme => MindMap.defineTheme(theme.value, theme.config))
  registered = true
}

const fontCache = new Map()
// Cache locally hosted font bytes for display and portable SVG/PNG/PDF export.
// A failed download retains the final platform fallback instead of blocking UI.
function prepareFont(key) {
  const font = fonts[key]
  if (!fontCache.has(key)) {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null
    const timeout = controller ? setTimeout(() => controller.abort(), 12000) : null
    const promise = fetch(asset(`fonts/${encodeURIComponent(font.file)}`), controller ? { signal: controller.signal } : {})
      .then(response => {
        if (!response.ok) throw new Error('Local theme font unavailable')
        return response.blob()
      })
      .then(blob => new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      }))
      .then(async data => {
        if (typeof FontFace !== 'undefined' && document.fonts) {
          const face = new FontFace(font.family, `url(${data})`)
          await face.load()
          document.fonts.add(face)
        }
        clearTimeout(timeout)
        return `@font-face{font-family:"${font.family}";src:url("${data}") format("${font.format || 'truetype'}");font-weight:normal;font-style:normal;}`
      })
      .catch(() => {
        clearTimeout(timeout)
        fontCache.delete(key)
        return ''
      })
    fontCache.set(key, promise)
  }
  return fontCache.get(key)
}

export function prepareArtTheme(value) {
  const theme = findArtTheme(value)
  if (!theme) return Promise.resolve('')
  // Japanese display fonts omit many Simplified Chinese characters. Load and
  // embed a complete local fallback for every preset, independent of the OS.
  return Promise.all([prepareFont(theme.font), prepareFont('chinese')])
    .then(styles => styles.join('\n'))
}

const NS = 'http://www.w3.org/2000/svg'
const svgElement = (tag, attrs = {}) => {
  const element = document.createElementNS(NS, tag)
  Object.keys(attrs).forEach(key => element.setAttribute(key, attrs[key]))
  return element
}

function addDecoration(node, theme, filterId) {
  const shape = node.shapeNode && node.shapeNode.node
  const group = node.group && node.group.node
  if (!shape || !group) return
  // Only our owned additions are replaced. User text, styles and geometry stay.
  group.querySelectorAll('[data-mappop-decoration]').forEach(el => el.remove())
  shape.setAttribute('filter', `url(#${filterId})`)
  shape.setAttribute('data-mappop-filter', 'true')
  const width = Math.max(12, node.width - node.getBorderWidth())
  const height = Math.max(12, node.height - node.getBorderWidth())
  const decoration = svgElement('g', {
    'data-mappop-decoration': theme.slug, 'pointer-events': 'none',
    'aria-hidden': 'true', fill: 'none', stroke: theme.accent,
    'stroke-linecap': 'round', 'stroke-linejoin': 'round'
  })
  const path = (d, attrs = {}) => decoration.appendChild(svgElement('path', { d, ...attrs }))
  const rect = attrs => decoration.appendChild(svgElement('rect', attrs))
  switch (theme.slug) {
    case 'pixel-arcade':
      path(`M6 12V6H18 M${width - 18} ${height - 6}h12v-6`, { 'stroke-width': 3 })
      if (!node.getData('shape') && node.getShape() === 'rectangle' && shape.tagName.toLowerCase() === 'path') {
        const step = 6
        shape.setAttribute('d', `M${step} 0H${width - step}V${step}H${width}V${height - step}H${width - step}V${height}H${step}V${height - step}H0V${step}H${step}Z`)
      }
      break
    case 'anime-pop':
      if (node.isRoot) {
        path(`M${width - 5} -11l3 7 7 3-7 3-3 7-3-7-7-3 7-3Z`, { fill: '#fff0b9', stroke: theme.border, 'stroke-width': 1.5 })
        decoration.appendChild(svgElement('circle', { cx: 9, cy: height - 5, r: 4, fill: theme.accent, stroke: theme.border }))
      } else {
        path(`M10 9h12`, { stroke: theme.border, 'stroke-width': 2, opacity: 0.35 })
      }
      break
    case 'toon-motion':
      path(`M${width - 30} ${height - 2}l2 13 14-13`, { fill: node.style.merge('fillColor'), stroke: node.style.merge('borderColor'), 'stroke-width': 2.5 })
      if (node.isRoot) {
        path('M-17 5l-10-5 M-19 16h-14 M-17 27l-10 5', { stroke: theme.border, 'stroke-width': 3 })
      }
      break
    case 'zen-japan':
      rect({ x: width - 11, y: height - 11, width: 5, height: 5, fill: theme.accent, stroke: 'none' })
      break
    case 'ink-wash':
      path(`M5 ${height - 3}Q${width * 0.35} ${height + 2} ${width - 6} ${height - 2}`, { stroke: theme.border, 'stroke-width': 2.5, opacity: 0.5 })
      path(`M2 8Q-1 ${height * 0.5} 3 ${height - 5}`, { stroke: theme.border, 'stroke-width': 1.3, opacity: 0.6 })
      if (node.isRoot) rect({ x: width - 14, y: height - 14, width: 8, height: 8, fill: theme.accent, stroke: 'none' })
      break
    case 'sketchbook':
      path(`M6 4Q${width * 0.45} 1 ${width - 4} 5L${width - 2} ${height - 4}Q${width * 0.5} ${height - 1} 4 ${height - 3}L3 7`, { stroke: theme.border, 'stroke-width': 0.9, opacity: 0.55 })
      if (node.isRoot) path(`M14 ${height - 7}l24 1m-20 3h18`, { stroke: theme.accent, 'stroke-width': 1.5 })
      break
    case 'marker-notes':
      rect({ x: width / 2 - 19, y: -5, width: 38, height: 10, fill: '#c8bf9c', opacity: 0.65, stroke: 'none', transform: `rotate(-3 ${width / 2} 0)` })
      path(`M${width - 12} ${height}v-12h12Z`, { fill: '#b8aa77', opacity: 0.32, stroke: 'none' })
      break
    case 'cyber-neon':
      path(`M4 15V8l4-4h15 M${width - 23} ${height - 4}h15l4-4v-7`, { 'stroke-width': 2 })
      rect({ x: width - 18, y: 7, width: 7, height: 2, fill: theme.accent, stroke: 'none' })
      break
  }
  // Decorations are behind text and controls, above the native node shape.
  group.insertBefore(decoration, shape.nextSibling)
}

let runtimeId = 0
export function attachArtThemeRuntime(mindMap, { initialFontReady = false } = {}) {
  const id = `mappop-art-${++runtimeId}`
  let disposed = false
  let loadedTheme = null
  let embeddedFont = ''
  let firstLoad = true
  let pendingRemeasure = null
  let remeasureQueued = false
  const queueRemeasure = () => {
    if (disposed || !pendingRemeasure || remeasureQueued || mindMap.renderer.isRendering) return
    remeasureQueued = true
    // Let every current render-end subscriber finish before clearing the SVG.
    Promise.resolve().then(() => {
      remeasureQueued = false
      if (disposed) return
      if (pendingRemeasure !== mindMap.getTheme()) {
        pendingRemeasure = null
        return
      }
      if (mindMap.renderer.isRendering) return
      pendingRemeasure = null
      mindMap.reRender()
    })
  }
  const render = () => {
    if (disposed || !mindMap.svg) return
    const svg = mindMap.svg.node
    const theme = findArtTheme(mindMap.getTheme())
    svg.querySelectorAll(`[data-mappop-defs="${id}"]`).forEach(el => el.remove())
    const previousFont = svg.querySelector(`[data-mappop-font="${id}"]`)
    if (previousFont && (!theme || previousFont.getAttribute('data-theme') !== theme.value)) previousFont.remove()
    if (!theme) {
      mindMap.el.removeAttribute('data-mappop-art')
      svg.querySelectorAll('[data-mappop-decoration]').forEach(el => el.remove())
      svg.querySelectorAll('[data-mappop-filter]').forEach(el => {
        el.removeAttribute('filter')
        el.removeAttribute('data-mappop-filter')
      })
      return
    }
    mindMap.el.setAttribute('data-mappop-art', theme.slug)
    const defs = svgElement('defs', { 'data-mappop-defs': id })
    const filter = svgElement('filter', { id, x: '-30%', y: '-35%', width: '170%', height: '190%', 'color-interpolation-filters': 'sRGB' })
    const [color, dx, dy, blur] = theme.shadow
    filter.appendChild(svgElement('feDropShadow', { dx, dy, stdDeviation: blur, 'flood-color': color, 'flood-opacity': theme.slug === 'cyber-neon' ? 0.55 : 0.48 }))
    defs.appendChild(filter)
    svg.insertBefore(defs, svg.firstChild)
    if (embeddedFont && loadedTheme === theme.value && !svg.querySelector(`[data-mappop-font="${id}"]`)) {
      const style = svgElement('style', { 'data-mappop-font': id, 'data-theme': theme.value })
      style.textContent = embeddedFont
      svg.insertBefore(style, svg.firstChild)
    }
    const visit = node => {
      if (!node) return
      addDecoration(node, theme, id)
      ;(node.children || []).forEach(visit)
    }
    visit(mindMap.renderer.root)
    queueRemeasure()
  }
  const change = async () => {
    const preserveInitialRender = firstLoad && initialFontReady
    firstLoad = false
    const value = mindMap.getTheme()
    render()
    if (!findArtTheme(value)) {
      pendingRemeasure = null
      return
    }
    if (loadedTheme === value) return
    const css = await prepareArtTheme(value)
    if (disposed || mindMap.getTheme() !== value) return
    loadedTheme = value
    embeddedFont = css
    // A caller that preloaded the font before constructing MindMap already
    // has correct metrics. Do not start a competing initial tree render.
    // Subsequent theme changes still remeasure for their different typefaces.
    if (preserveInitialRender) render()
    else {
      pendingRemeasure = value
      queueRemeasure()
    }
  }
  mindMap.on('node_tree_render_end', render)
  mindMap.on('view_theme_change', change)
  change()
  return () => {
    disposed = true
    pendingRemeasure = null
    mindMap.off('node_tree_render_end', render)
    mindMap.off('view_theme_change', change)
  }
}
