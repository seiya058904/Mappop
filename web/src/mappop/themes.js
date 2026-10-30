import { textures } from './textures'
import './themes.css'
import { definitions } from './theme-tokens'
import { addDecoration, addArtDefs } from './decorations'

const asset = file => `${process.env.BASE_URL || '/'}mappop/${file}`
const fallback = '"Noto Sans SC", "Microsoft YaHei", "PingFang SC", sans-serif'
const fonts = {
  pixel: { family: 'Mappop Pixel', file: 'MappopPixel.woff2' },
  hand: { family: 'Mappop Hand', file: 'MappopHand.woff2' },
  comic: { family: 'Mappop Comic', file: 'MappopComic.woff2' },
  serif: { family: 'Mappop Serif', file: 'MappopSerif.woff2' },
  brush: { family: 'Mappop Brush', file: 'MappopBrush.woff2' },
  sans: { family: 'Noto Sans SC', file: 'MappopSans.woff2' },
  tech: { family: 'Mappop Tech', file: 'MappopTech.woff2' },
  chinese: { family: 'Noto Sans SC', file: 'MappopSans.woff2' }
}

export const artThemes = definitions.map(theme => {
  const fontFamily = `"${fonts[theme.font].family}", ${fallback}`
  const node = (fillColor, color, fontSize, level) => ({
    shape: 'rectangle', fillColor, color, fontSize, fontFamily, fontWeight: 'normal',
    borderColor: theme.border, borderWidth: theme.borderWidth, borderRadius: theme.radius,
    paddingX: theme.padding[0], paddingY: theme.padding[1],
    hoverRectColor: theme.accent, hoverRectRadius: theme.radius,
    marginX: theme.spacing[0], marginY: theme.spacing[1],
    ...(level === 'root' ? { paddingX: 30, paddingY: 20 } : {}),
    ...theme.levels[level]
  })
  return {
    ...theme, value: `mappop-${theme.slug}`,
    img: asset(`previews/${theme.slug}.webp`),
    config: {
      backgroundColor: theme.background,
      backgroundImage: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(textures[theme.slug])}`,
      backgroundRepeat: 'repeat', backgroundPosition: '0 0', backgroundSize: 'auto',
      fontFamily, lineColor: theme.line, lineWidth: theme.lineWidth,
      lineStyle: theme.lineStyle, lineRadius: theme.slug === 'pixel-arcade' || theme.slug === 'blueprint-lab' ? 0 : 5,
      rootLineKeepSameInCurve: true, rootLineStartPositionKeepSameInCurve: true,
      generalizationLineColor: theme.line, associativeLineColor: theme.accent,
      associativeLineTextColor: theme.ink, associativeLineTextFontFamily: fontFamily,
      root: node(theme.rootFill, theme.rootInk, theme.rootSize, 'root'),
      second: node(theme.secondFill, theme.ink, theme.secondSize, 'second'),
      node: node(theme.nodeFill, theme.ink, theme.nodeSize, 'node'),
      generalization: node(theme.nodeFill, theme.ink, theme.nodeSize, 'node')
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
        return `@font-face{font-family:"${font.family}";src:url("${data}") format("${font.format || 'woff2'}");font-weight:normal;font-style:normal;}`
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
  return Promise.all([...new Set([theme.font === 'sans' ? 'chinese' : theme.font, 'chinese'])].map(prepareFont))
    .then(styles => styles.join('\n'))
}

const NS = 'http://www.w3.org/2000/svg'
const svgElement = (tag, attrs = {}) => {
  const element = document.createElementNS(NS, tag)
  Object.keys(attrs).forEach(key => element.setAttribute(key, attrs[key]))
  return element
}

let runtimeId = 0
export function attachArtThemeRuntime(mindMap, { initialFontReady = false } = {}) {
  const id = `mappop-art-${++runtimeId}`
  const previousExportHandler = mindMap.opt.handleBeingExportSvg
  const handleExport = original => {
    const svg = previousExportHandler ? previousExportHandler(original) : original
    if (findArtTheme(mindMap.getTheme())) {
      // Chromium can round standalone SVG font advances differently from the
      // live HTML/SVG tree (e.g. a serif ellipsis). Reserve two pixels inside the
      // existing node padding so a final glyph cannot wrap into a clipped line.
      // This is the export clone only; document data and live layout stay intact.
      svg.node.querySelectorAll('foreignObject').forEach(el => {
        const wrap = el.querySelector('.smm-richtext-node-wrap')
        if (!wrap) return
        el.setAttribute('width', Number(el.getAttribute('width')) + 2)
        if (wrap.style.maxWidth.endsWith('px')) wrap.style.maxWidth = `${parseFloat(wrap.style.maxWidth) + 2}px`
      })
    }
    return svg
  }
  mindMap.opt.handleBeingExportSvg = handleExport
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
    addArtDefs(defs, theme, id)
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
    if (mindMap.opt.handleBeingExportSvg === handleExport) mindMap.opt.handleBeingExportSvg = previousExportHandler
  }
}
