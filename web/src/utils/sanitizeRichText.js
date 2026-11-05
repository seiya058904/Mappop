// Strip active content from rich-text node HTML before the editor parses it
// into the live document. Keeps the markup the editor itself produces
// (paragraphs, spans with inline styles, lists, links, KaTeX/MathML output)
// and removes executable elements, event handlers and script-capable URLs.
const BLOCKED_TAGS = new Set([
  'script',
  'iframe',
  'frame',
  'frameset',
  'object',
  'embed',
  'applet',
  'base',
  'meta',
  'link',
  'style',
  'form',
  'input',
  'button',
  'textarea',
  'select',
  'template',
  'noscript',
  'animate',
  'animatemotion',
  'animatetransform',
  'set',
  'handler',
  'listener'
])
const URL_ATTRS = new Set([
  'href',
  'src',
  'xlink:href',
  'action',
  'formaction',
  'srcset',
  'poster',
  'background',
  'data'
])
const SAFE_URL = /^(?:https?:|mailto:|tel:|#|\/|\.|[^:]*$)/i
const SAFE_DATA_IMAGE = /^data:image\/(?:png|gif|jpe?g|webp|bmp);/i

const isSafeUrl = (name, value) => {
  // Browsers ignore control characters and whitespace inside URL schemes.
  // eslint-disable-next-line no-control-regex
  const v = String(value).replace(/[\u0000- \u007f]+/g, '')
  if (SAFE_URL.test(v)) return true
  return name === 'src' && SAFE_DATA_IMAGE.test(v)
}

const cleanTree = root => {
  let changed = false
  const elements = Array.from(root.querySelectorAll('*'))
  elements.forEach(el => {
    if (BLOCKED_TAGS.has(el.localName.toLowerCase())) {
      el.remove()
      changed = true
      return
    }
    Array.from(el.attributes).forEach(attr => {
      const name = attr.name.toLowerCase()
      if (
        name.startsWith('on') ||
        (URL_ATTRS.has(name) && !isSafeUrl(name, attr.value)) ||
        (name === 'style' && /expression\s*\(|url\s*\(\s*['"]?\s*javascript:/i.test(attr.value))
      ) {
        el.removeAttribute(attr.name)
        changed = true
      }
    })
  })
  return changed
}

export const sanitizeRichTextHtml = html => {
  if (typeof html !== 'string' || !/<[a-z!/?]/i.test(html)) return html
  // <template> content is inert: nothing loads or runs while we clean it.
  const template = document.createElement('template')
  template.innerHTML = html
  // Leave clean text byte-for-byte; only rewrite when something was removed.
  return cleanTree(template.content) ? template.innerHTML : html
}

// Sanitize every rich-text `text` field in map data, in place.
// Covers node trees, generalizations and nested arrays/objects.
export const sanitizeMapData = data => {
  const seen = new WeakSet()
  const walk = value => {
    if (!value || typeof value !== 'object' || seen.has(value)) return
    seen.add(value)
    if (Array.isArray(value)) {
      value.forEach(walk)
      return
    }
    // Plain-text labels are escaped by the editor; only fields flagged as rich
    // text are parsed as HTML, so only those are cleaned.
    if (value.richText && typeof value.text === 'string') {
      value.text = sanitizeRichTextHtml(value.text)
    }
    Object.keys(value).forEach(key => walk(value[key]))
  }
  walk(data)
  return data
}
