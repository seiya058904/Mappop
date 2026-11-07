import { fromMarkdown } from 'mdast-util-from-markdown'

// Keep supported headings/lists compatible with the native importer, but never
// silently discard additional roots or unsupported blocks from a user's file.
export function parseMarkdownImport(text, title = 'Imported map') {
  const tree = fromMarkdown(text)
  const warnings = []
  const warn = node =>
    warnings.push({
      type: node.type,
      line: node.position ? node.position.start.line : 1
    })
  const label = node => {
    if (node.type === 'text' || node.type === 'inlineCode') return node.value
    if (node.type === 'break') return '\n'
    if (
      ['heading', 'paragraph', 'strong', 'emphasis', 'link'].includes(node.type)
    ) {
      return (node.children || []).map(label).join('')
    }
    warn(node)
    return ''
  }
  const roots = []
  const headings = []
  const list = (block, target, depth = 0) => {
    if (depth > 128) throw new Error('invalidDocument')
    for (const item of block.children) {
      const first = item.children[0]
      if (!first || first.type !== 'paragraph') {
        warn(item)
        continue
      }
      const node = { data: { text: label(first) }, children: [] }
      target.push(node)
      for (const child of item.children.slice(1)) {
        if (child.type === 'list') list(child, node.children, depth + 1)
        else warn(child)
      }
    }
  }
  for (const block of tree.children) {
    if (block.type === 'heading') {
      while (
        headings.length &&
        headings[headings.length - 1].depth >= block.depth
      )
        headings.pop()
      const node = { data: { text: label(block) }, children: [] }
      const target = headings.length
        ? headings[headings.length - 1].node.children
        : roots
      target.push(node)
      headings.push({ depth: block.depth, node })
    } else if (block.type === 'list') {
      list(
        block,
        headings.length ? headings[headings.length - 1].node.children : roots
      )
    } else warn(block)
  }
  if (!roots.length) throw new Error('invalidDocument')
  const multipleRoots = roots.length > 1
  return {
    data: multipleRoots ? { data: { text: title }, children: roots } : roots[0],
    warnings,
    multipleRoots
  }
}
