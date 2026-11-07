export const IMPORT_BYTES = 10 * 1024 * 1024

const object = value =>
  value && typeof value === 'object' && !Array.isArray(value)
export const cloneDocument = value => JSON.parse(JSON.stringify(value))

// Validate before any renderer, file binding or recovery point is changed.
// Keep unknown SMM fields; older documents may omit theme, layout or children.
export function normalizeDocument(value, defaults = {}) {
  if (!object(value)) throw new Error('invalidDocument')
  const full = Object.prototype.hasOwnProperty.call(value, 'root')
  const root = full ? value.root : value
  const stack = [{ node: root, depth: 0 }]
  const seen = new Set()
  while (stack.length) {
    const { node, depth } = stack.pop()
    if (
      !object(node) ||
      !object(node.data) ||
      typeof node.data.text !== 'string' ||
      (node.children !== undefined && !Array.isArray(node.children)) ||
      seen.has(node) ||
      depth > 128
    ) {
      throw new Error('invalidDocument')
    }
    seen.add(node)
    ;(node.children || []).forEach(child =>
      stack.push({ node: child, depth: depth + 1 })
    )
  }
  if (
    full &&
    ((value.theme !== undefined && !object(value.theme)) ||
      (value.view != null && !object(value.view)))
  )
    throw new Error('invalidDocument')
  return cloneDocument({ ...defaults, ...(full ? value : { root }) })
}

export function documentSummary(doc) {
  const root = doc.root || doc
  const stack = [root]
  let nodes = 0
  while (stack.length) {
    const node = stack.pop()
    nodes++
    stack.push(...(node.children || []))
  }
  return { title: root.data.text, nodes }
}
