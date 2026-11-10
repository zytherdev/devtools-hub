/* eslint-disable @typescript-eslint/no-empty-object-type */
import {
  tokenizeHTML,
} from './lib/lexer'

import {
  parseHTML,
} from './lib/parser'

import {
  generateJSX,
  type JSXGeneratorOptions,
} from './lib/generator'

export interface HTMLToJSXOptions
  extends JSXGeneratorOptions {}

export const defaultHTMLToJSXOptions: HTMLToJSXOptions = {
  preserveComments: false,
  preserveWhitespace: false,
  selfClosingTags: true,
  convertStyle: true,
  className: 'className',
  htmlFor: 'htmlFor',
  inlineStyle: true,
}

export function htmlToJSX(
  html: string,
  options: Partial<HTMLToJSXOptions> = {},
): string {
  if (
    typeof html !== 'string' ||
    !html
  ) {
    return ''
  }

  const config: HTMLToJSXOptions = {
    ...defaultHTMLToJSXOptions,
    ...options,
  }

  const tokens =
    tokenizeHTML(html)

  const ast =
    parseHTML(tokens)

  return generateJSX(
    ast,
    config,
  )
}

export {
  tokenizeHTML,
} from './lib/lexer'

export {
  parseHTML,
} from './lib/parser'

export {
  generateJSX,
} from './lib/generator'

export {
  isValidHTML,
} from './lib/validator'

export {
  cssToObject,
} from './lib/css'

export type {
  HTMLDocument,
  HTMLNode,
  HTMLToken,
  HTMLAttribute,
  ElementNode,
  TextNode,
  CommentNode,
  AttributeValue,
} from './lib/ast'

export const sampleHTML = `
<div class="container">
  <h1>Hello, World!</h1>
  <p style="color: blue; font-size: 16px;">This is a sample HTML to JSX conversion.</p>
  <ul>
    <li>Item 1</li>
    <li>Item 2</li>
    <li>Item 3</li>
  </ul>
  <input type="text" placeholder="Enter text" disabled />
  <button onClick="handleClick()" class="btn btn-primary">Click Me</button>
</div>`