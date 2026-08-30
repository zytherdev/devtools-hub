import type {
  HTMLDocument,
  HTMLNode,
  ElementNode,
} from './ast'

import {
  escapeJSXText,
} from './entities'

import {
  generateAttributes,
  type AttributeOptions,
} from './attributes'

export interface JSXGeneratorOptions
  extends AttributeOptions {
  preserveComments: boolean
  preserveWhitespace: boolean
  selfClosingTags: boolean
}

export function generateJSX(
  document: HTMLDocument,
  options: JSXGeneratorOptions,
): string {
  return generateNodes(
    document.children,
    options,
    0,
  ).trim()
}

function generateNodes(
  nodes: HTMLNode[],
  options: JSXGeneratorOptions,
  level: number,
): string {
  const output: string[] = []

  for (const node of nodes) {
    const generated =
      generateNode(
        node,
        options,
        level,
      )

    if (generated) {
      output.push(generated)
    }
  }

  return output.join('\n')
}

function generateNode(
  node: HTMLNode,
  options: JSXGeneratorOptions,
  level: number,
): string {
  const indent = '  '.repeat(level)

  switch (node.type) {
    case 'text':
      return generateText(
        node.value,
        options,
        indent,
      )

    case 'comment':
      return options.preserveComments
        ? `${indent}{/* ${node.value.trim()} */}`
        : ''

    case 'element':
      return generateElement(
        node,
        options,
        level,
      )
  }
}

function generateText(
  value: string,
  options: JSXGeneratorOptions,
  indent: string,
): string {
  if (
    !options.preserveWhitespace &&
    !value.trim()
  ) {
    return ''
  }

  const text =
    options.preserveWhitespace
      ? value
      : value.trim()

  if (!text) {
    return ''
  }

  return `${indent}{${JSON.stringify(
    escapeJSXText(text),
  )}}`
}

function generateElement(
  node: ElementNode,
  options: JSXGeneratorOptions,
  level: number,
): string {
  const indent = '  '.repeat(level)

  const attributes =
    generateAttributes(
      node.attributes,
      options,
    )

  const children = node.children

  const shouldSelfClose =
    node.selfClosing ||
    (
      options.selfClosingTags &&
      children.length === 0
    )

  if (shouldSelfClose) {
    return (
      `${indent}<${node.name}` +
      `${attributes} />`
    )
  }

  if (children.length === 0) {
    return (
      `${indent}<${node.name}` +
      `${attributes}></${node.name}>`
    )
  }

  const content = generateNodes(
    children,
    options,
    level + 1,
  )

  return [
    `${indent}<${node.name}${attributes}>`,
    content,
    `${indent}</${node.name}>`,
  ].join('\n')
}