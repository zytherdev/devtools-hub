import type { HTMLAttribute } from './ast'
import { BOOLEAN_ATTRIBUTES } from './constants'
import { escapeAttribute } from './entities'
import { cssToObject } from './css'

export interface AttributeOptions {
  convertStyle: boolean
  inlineStyle: boolean
  className: 'class' | 'className'
  htmlFor: 'for' | 'htmlFor'
}

const URL_ATTRIBUTES = new Set(['href', 'src', 'action', 'formaction', 'xlink:href', 'xlinkhref'])
const ACTIVE_SCHEMES = /^\s*(?:javascript|vbscript):/i
const DATA_HTML_SCHEME = /^\s*data\s*:\s*text\/html/i

export function generateAttributes(attributes: HTMLAttribute[], options: AttributeOptions): string {
  const result: string[] = []

  for (const attribute of attributes) {
    const { name, value } = attribute
    const normalizedName = name.toLowerCase()

    // This targeted output filter is not a general-purpose HTML sanitizer.
    if (/^on[a-z]/i.test(name) || normalizedName === 'srcdoc') continue
    if (URL_ATTRIBUTES.has(normalizedName) && typeof value === 'string' && isBlockedURL(value)) continue

    if (normalizedName === 'style' && typeof value === 'string' && options.convertStyle) {
      if (options.inlineStyle) result.push(`style=${cssToObject(value)}`)
      else result.push(`style="${escapeAttribute(value)}"`)
      continue
    }

    if (normalizedName === 'classname' && options.className === 'class') {
      result.push(`class="${escapeAttribute(String(value))}"`)
      continue
    }
    if (normalizedName === 'htmlfor' && options.htmlFor === 'for') {
      result.push(`for="${escapeAttribute(String(value))}"`)
      continue
    }
    if (value === true || (BOOLEAN_ATTRIBUTES.has(normalizedName) && value === 'true')) {
      result.push(name)
      continue
    }
    result.push(`${name}="${escapeAttribute(String(value))}"`)
  }

  return result.length ? ` ${result.join(' ')}` : ''
}

function isBlockedURL(value: string): boolean {
  // Ignore ASCII controls/whitespace before scheme checks; this is defense-in-depth,
  // not a substitute for validating URLs in the application that consumes the JSX.
  const normalized = value.replace(/[\u0000-\u0020\u007f]+/g, '')
  return ACTIVE_SCHEMES.test(normalized) || DATA_HTML_SCHEME.test(normalized)
}
