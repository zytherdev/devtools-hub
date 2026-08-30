import type { HTMLAttribute } from './ast'

import {
  BOOLEAN_ATTRIBUTES,
} from './constants'

import {
  escapeAttribute,
} from './entities'

import {
  cssToObject,
} from './css'

export interface AttributeOptions {
  convertStyle: boolean
  inlineStyle: boolean
  className: 'class' | 'className'
  htmlFor: 'for' | 'htmlFor'
}

export function generateAttributes(
  attributes: HTMLAttribute[],
  options: AttributeOptions,
): string {
  const result: string[] = []

  for (const attribute of attributes) {
    const {
      name,
      value,
    } = attribute

    if (
      name === 'style' &&
      typeof value === 'string' &&
      options.convertStyle
    ) {
      if (options.inlineStyle) {
        result.push(
          `style=${cssToObject(value)}`,
        )
      } else {
        result.push(
          `style="${escapeAttribute(value)}"`,
        )
      }

      continue
    }

    if (
      name === 'className' &&
      options.className === 'class'
    ) {
      result.push(
        `class="${escapeAttribute(
          String(value),
        )}"`,
      )

      continue
    }

    if (
      name === 'htmlFor' &&
      options.htmlFor === 'for'
    ) {
      result.push(
        `for="${escapeAttribute(
          String(value),
        )}"`,
      )

      continue
    }

    if (value === true) {
      result.push(name)
      continue
    }

    if (
      BOOLEAN_ATTRIBUTES.has(name) &&
      value === 'true'
    ) {
      result.push(name)
      continue
    }

    result.push(
      `${name}="${escapeAttribute(
        String(value),
      )}"`,
    )
  }

  return result.length
    ? ` ${result.join(' ')}`
    : ''
}