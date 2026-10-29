import { fromMarkdown } from 'mdast-util-from-markdown'

export const LIMITS = Object.freeze({
  requestBytes: 128 * 1024,
  markdownBytes: 64 * 1024,
  nodes: 500,
  depth: 12,
  titleCharacters: 200,
  nodeCharacters: 2000,
  dailyMaps: 100,
  totalMaps: 10000
})

export class ApiError extends Error {
  constructor(status, code, message, headers = {}) {
    super(message)
    this.status = status
    this.code = code
    this.headers = headers
  }
}

function invalid(message) {
  throw new ApiError(422, 'invalid_markdown', message)
}

// Match the app's mdast importer: inline formatting and links become label text.
// Reject everything it would silently discard (HTML, images, code blocks, etc.).
function labelText(node) {
  let text = ''
  const stack = [...node.children].reverse().map(node => ({ node, depth: 0 }))
  while (stack.length) {
    const { node: current, depth } = stack.pop()
    if (depth > LIMITS.depth) invalid('Inline formatting is nested too deeply.')
    if (current.type === 'text' || current.type === 'inlineCode') {
      text += current.value
    } else if (['emphasis', 'strong', 'link'].includes(current.type)) {
      stack.push(...current.children.slice().reverse().map(node => ({ node, depth: depth + 1 })))
    } else {
      invalid(`Unsupported inline Markdown: ${current.type}. Use text labels.`)
    }
  }
  text = text.trim()
  if (!text) invalid('Every heading and list item needs a non-empty text label.')
  if ([...text].length > LIMITS.nodeCharacters) invalid(`Node labels must not exceed ${LIMITS.nodeCharacters} characters.`)
  return text
}

export function validateMarkdown(markdown) {
  if (typeof markdown !== 'string' || !markdown.trim()) invalid('markdown must be a non-empty string.')
  if (new TextEncoder().encode(markdown).byteLength > LIMITS.markdownBytes) {
    throw new ApiError(413, 'markdown_too_large', `Markdown must not exceed ${LIMITS.markdownBytes} UTF-8 bytes.`)
  }
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(markdown)) invalid('Control characters are not supported.')
  const tree = fromMarkdown(markdown)
  if (tree.children[0]?.type !== 'heading' || tree.children[0].depth !== 1) {
    invalid('Start with one level-one title (# Title).')
  }
  let title
  let nodes = 0
  let headingDepth = 0
  function countNode(depth) {
    if (++nodes > LIMITS.nodes) invalid(`A map must not exceed ${LIMITS.nodes} nodes, including its title.`)
    if (depth > LIMITS.depth) invalid(`A map must not exceed ${LIMITS.depth} levels, including its title.`)
  }
  function visitList(list, depth) {
    for (const item of list.children) {
      countNode(depth)
      if (item.children[0]?.type !== 'paragraph') invalid('Each list item must start with a text label.')
      labelText(item.children[0])
      for (const child of item.children.slice(1)) {
        if (child.type !== 'list') invalid('List items support one label followed by nested lists only.')
        visitList(child, depth + 1)
      }
    }
  }
  for (const block of tree.children) {
    if (block.type === 'heading') {
      if (block.depth === 1 && nodes) invalid('Use exactly one level-one title.')
      if (block.depth > headingDepth + 1) invalid('Heading levels must not skip a level.')
      const label = labelText(block)
      if (!nodes) {
        title = label
        if ([...title].length > LIMITS.titleCharacters) invalid(`The title must not exceed ${LIMITS.titleCharacters} characters.`)
      }
      headingDepth = block.depth
      countNode(headingDepth)
    } else if (block.type === 'list') {
      visitList(block, headingDepth + 1)
    } else {
      invalid(`Unsupported Markdown block: ${block.type}. Use headings and lists only.`)
    }
  }
  if (nodes < 2) invalid('Include at least one child heading or list item below the title.')
  return { title, nodeCount: nodes }
}
