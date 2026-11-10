import type {
  ElementNode,
  HTMLDocument,
  HTMLNode,
  HTMLToken,
} from './ast'
import { MAX_HTML_DEPTH, VOID_ELEMENTS } from './constants'
import { decodeHTMLEntities } from './entities'

const BLOCK_START_TAGS = new Set([
  'address', 'article', 'aside', 'blockquote', 'details', 'dialog', 'dir', 'div', 'dl',
  'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5',
  'h6', 'header', 'hgroup', 'hr', 'main', 'menu', 'nav', 'ol', 'p', 'pre', 'search',
  'section', 'table', 'ul',
])

export function getHTMLTokenValidationError(tokens: HTMLToken[]): string | null {
  const stack: string[] = []
  for (const token of tokens) {
    if (token.type === 'open-tag') {
      applyImpliedClosures(token.name, stack)
      if (token.selfClosing || VOID_ELEMENTS.has(token.name)) continue
      if (stack.length >= MAX_HTML_DEPTH) {
        return `HTML exceeds the maximum nesting depth of ${MAX_HTML_DEPTH}.`
      }
      stack.push(token.name)
      continue
    }
    if (token.type === 'close-tag') {
      const index = stack.lastIndexOf(token.name)
      if (index === -1) return `Unexpected closing tag </${token.name || '?'}>.`
      stack.length = index
    }
  }

  while (stack.length && (stack[stack.length - 1] === 'li' || stack[stack.length - 1] === 'p')) {
    stack.pop()
  }
  if (stack.length) return `Unclosed HTML tag <${stack[stack.length - 1]}>.`
  return null
}

export function parseHTML(tokens: HTMLToken[]): HTMLDocument {
  const root: HTMLDocument = { type: 'root', children: [] }
  const stack: ElementNode[] = []

  for (const token of tokens) {
    switch (token.type) {
      case 'text':
        appendNode({ type: 'text', value: token.value }, root, stack)
        break
      case 'comment':
        appendNode({ type: 'comment', value: token.value }, root, stack)
        break
      case 'open-tag': {
        applyImpliedClosures(token.name, stack)
        if (!token.selfClosing && !VOID_ELEMENTS.has(token.name)) {
          if (stack.length >= MAX_HTML_DEPTH) {
            throw new Error(`HTML exceeds the maximum nesting depth of ${MAX_HTML_DEPTH}.`)
          }
        }
        const node: ElementNode = {
          type: 'element',
          name: token.name,
          attributes: token.attributes.map(attribute => ({
            ...attribute,
            value: typeof attribute.value === 'string' ? decodeHTMLEntities(attribute.value) : attribute.value,
          })),
          children: [],
          selfClosing: token.selfClosing || VOID_ELEMENTS.has(token.name),
        }
        appendNode(node, root, stack)
        if (!node.selfClosing) stack.push(node)
        break
      }
      case 'close-tag':
        closeElement(token.name, stack)
        break
    }
  }
  return root
}

function applyImpliedClosures(name: string, stack: Array<string | ElementNode>): void {
  if (name === 'li') {
    for (let i = stack.length - 1; i >= 0; i--) {
      const currentName = getStackName(stack[i])
      if (currentName === 'li') {
        stack.length = i
        break
      }
      if (currentName === 'ul' || currentName === 'ol') break
    }
  }

  if (name === 'p' || BLOCK_START_TAGS.has(name)) {
    for (let i = stack.length - 1; i >= 0; i--) {
      if (getStackName(stack[i]) === 'p') {
        stack.length = i
        break
      }
    }
  }
}

function getStackName(node: string | ElementNode): string {
  return typeof node === 'string' ? node : node.name
}

function appendNode(node: HTMLNode, root: HTMLDocument, stack: ElementNode[]): void {
  const parent = stack[stack.length - 1]
  if (parent) parent.children.push(node)
  else root.children.push(node)
}

function closeElement(name: string, stack: ElementNode[]): void {
  const normalized = name.toLowerCase()
  for (let i = stack.length - 1; i >= 0; i--) {
    if (stack[i].name === normalized) {
      stack.length = i
      return
    }
  }
}
