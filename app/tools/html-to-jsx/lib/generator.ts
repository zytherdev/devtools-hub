import type {
  HTMLDocument,
  HTMLNode,
  ElementNode,
} from './ast'
import { decodeHTMLEntities } from './entities'
import {
  generateAttributes,
  type AttributeOptions,
} from './attributes'

export interface JSXGeneratorOptions extends AttributeOptions {
  preserveComments: boolean
  preserveWhitespace: boolean
  selfClosingTags: boolean
}

const INLINE_ELEMENTS = new Set([
  'a', 'abbr', 'acronym', 'audio', 'b', 'bdi', 'bdo', 'big', 'button', 'canvas', 'cite',
  'code', 'data', 'datalist', 'del', 'dfn', 'em', 'embed', 'i', 'iframe', 'img', 'input',
  'ins', 'kbd', 'label', 'map', 'mark', 'meter', 'noscript', 'object', 'output', 'picture',
  'progress', 'q', 'ruby', 's', 'samp', 'select', 'slot', 'small', 'span', 'strong', 'sub',
  'sup', 'textarea', 'time', 'tt', 'u', 'var', 'video', 'wbr',
])

export function generateJSX(document: HTMLDocument, options: JSXGeneratorOptions): string {
  return generateNodes(document.children, options, 0).trim()
}

function generateNodes(nodes: HTMLNode[], options: JSXGeneratorOptions, level: number): string {
  const output: string[] = []
  for (let index = 0; index < nodes.length; index++) {
    const node = nodes[index]
    if (node.type === 'text' && !options.preserveWhitespace) {
      const rendered = generateNormalizedText(node.value, options, level, nodes[index - 1], nodes[index + 1])
      if (rendered) output.push(rendered)
      continue
    }
    const generated = generateNode(node, options, level)
    if (generated) output.push(generated)
  }
  return output.join('\n')
}

function generateNode(node: HTMLNode, options: JSXGeneratorOptions, level: number): string {
  const indent = '  '.repeat(level)
  switch (node.type) {
    case 'text':
      return generateText(node.value, indent)
    case 'comment':
      return options.preserveComments ? `${indent}{/* ${node.value.trim().replace(/\*\//g, '* /')} */}` : ''
    case 'element':
      return generateElement(node, options, level)
  }
}

function generateText(value: string, indent: string): string {
  const text = decodeHTMLEntities(value)
  return text ? `${indent}{${JSON.stringify(text)}}` : ''
}

function generateNormalizedText(
  value: string,
  options: JSXGeneratorOptions,
  level: number,
  previous?: HTMLNode,
  next?: HTMLNode,
): string {
  const decoded = decodeHTMLEntities(value)
  if (!decoded.trim()) {
    return decoded && isInlineNode(previous) && isInlineNode(next) ? `${'  '.repeat(level)}{" "}` : ''
  }

  const previousIsInline = isInlineNode(previous)
  const nextIsInline = isInlineNode(next)
  let text = decoded.replace(/\s+/g, ' ')
  if (!previousIsInline) text = text.trimStart()
  else if (/^\s/.test(decoded)) text = ` ${text.trimStart()}`
  if (!nextIsInline) text = text.trimEnd()
  else if (/\s$/.test(decoded)) text = `${text.trimEnd()} `
  if (!text) return ''
  return `${'  '.repeat(level)}{${JSON.stringify(text)}}`
}

function isInlineNode(node?: HTMLNode): boolean {
  if (!node) return false
  if (node.type === 'text') return true
  return node.type === 'element' && INLINE_ELEMENTS.has(node.name)
}

function generateElement(node: ElementNode, options: JSXGeneratorOptions, level: number): string {
  const indent = '  '.repeat(level)
  const attributes = generateAttributes(node.attributes, options)
  const children = node.children
  const shouldSelfClose = node.selfClosing || (options.selfClosingTags && children.length === 0)
  if (shouldSelfClose) return `${indent}<${node.name}${attributes} />`
  if (children.length === 0) return `${indent}<${node.name}${attributes}></${node.name}>`

  const content = generateNodes(children, options, level + 1)
  return [`${indent}<${node.name}${attributes}>`, content, `${indent}</${node.name}>`].join('\n')
}
