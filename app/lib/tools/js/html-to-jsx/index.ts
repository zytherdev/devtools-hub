/* eslint-disable @typescript-eslint/no-empty-object-type */
import {
  tokenizeHTML,
} from './lexer'

import {
  parseHTML,
} from './parser'

import {
  generateJSX,
  type JSXGeneratorOptions,
} from './generator'

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
} from './lexer'

export {
  parseHTML,
} from './parser'

export {
  generateJSX,
} from './generator'

export {
  isValidHTML,
} from './validator'

export {
  cssToObject,
} from './css'

export type {
  HTMLDocument,
  HTMLNode,
  HTMLToken,
  HTMLAttribute,
  ElementNode,
  TextNode,
  CommentNode,
  AttributeValue,
} from './ast'

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