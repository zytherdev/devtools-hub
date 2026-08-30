import type {
  ElementNode,
  HTMLDocument,
  HTMLNode,
  HTMLToken,
} from './ast'

import { VOID_ELEMENTS } from './constants'

export function parseHTML(
  tokens: HTMLToken[],
): HTMLDocument {
  const root: HTMLDocument = {
    type: 'root',
    children: [],
  }

  const stack: ElementNode[] = []

  for (const token of tokens) {
    switch (token.type) {
      case 'text':
        appendNode(
          {
            type: 'text',
            value: token.value,
          },
          root,
          stack,
        )
        break

      case 'comment':
        appendNode(
          {
            type: 'comment',
            value: token.value,
          },
          root,
          stack,
        )
        break

      case 'open-tag': {
        const node: ElementNode = {
          type: 'element',
          name: token.name,
          attributes: token.attributes,
          children: [],
          selfClosing:
            token.selfClosing ||
            VOID_ELEMENTS.has(token.name),
        }

        appendNode(
          node,
          root,
          stack,
        )

        if (!node.selfClosing) {
          stack.push(node)
        }

        break
      }

      case 'close-tag':
        closeElement(
          token.name,
          stack,
        )
        break
    }
  }

  return root
}

function appendNode(
  node: HTMLNode,
  root: HTMLDocument,
  stack: ElementNode[],
): void {
  const parent = stack[stack.length - 1]

  if (parent) {
    parent.children.push(node)
  } else {
    root.children.push(node)
  }
}

function closeElement(
  name: string,
  stack: ElementNode[],
): void {
  const normalized = name.toLowerCase()

  for (
    let i = stack.length - 1;
    i >= 0;
    i--
  ) {
    if (stack[i].name === normalized) {
      stack.length = i
      return
    }
  }
}