import * as TOML from '@iarna/toml'
import YAML from 'yaml'
import type { ToolOptions } from './toolEngine'
import { csvToJson } from './csvToJson'
import { convertPhpJson } from './phpJsonConverter'
import { convertTomlJson } from './tomlJsonConverter'
import { generateJsonSchema } from './jsonSchemaGenerator'

function parseCsv(source: string, delimiter: string) {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  for (let i = 0; i < source.length; i++) {
    const char = source[i]
    if (quoted) {
      if (char === '"' && source[i + 1] === '"') { field += '"'; i++ }
      else if (char === '"') quoted = false
      else field += char
    } else if (char === '"' && field.length === 0) quoted = true
    else if (char === delimiter) { row.push(field); field = '' }
    else if (char === '\n' || char === '\r') {
      if (char === '\r' && source[i + 1] === '\n') i++
      row.push(field); field = ''
      if (row.some(cell => cell !== '') || rows.length) rows.push(row)
      row = []
    } else field += char
  }
  if (quoted) throw new Error('CSV contains an unterminated quoted field.')
  row.push(field)
  if (row.some(cell => cell !== '') || rows.length) rows.push(row)
  return rows
}

function quoteCsvField(value: string, delimiter: string) {
  const clean = value.replace(/\r\n?/g, '\n')
  return clean.includes(delimiter) || clean.includes('"') || clean.includes('\n') || /^\s|\s$/.test(clean)
    ? `"${clean.replace(/"/g, '""')}"` : clean
}

function getDelimiter(option: string | undefined) {
  if (option === 'tab' || option === '\\t') return '\t'
  if (option === 'semicolon') return ';'
  return option?.length === 1 ? option : ','
}

function xmlNodeToValue(element: Element): unknown {
  const result: Record<string, unknown> = {}
  for (const attribute of Array.from(element.attributes)) result[`@${attribute.name}`] = attribute.value
  const children = Array.from(element.children)
  const rawText = Array.from(element.childNodes)
    .filter(node => node.nodeType === Node.TEXT_NODE || node.nodeType === Node.CDATA_SECTION_NODE)
    .map(node => node.textContent ?? '')
    .join('')
  const text = children.length && !rawText.trim() ? '' : rawText
  for (const child of children) {
    const value = xmlNodeToValue(child)
    if (Object.prototype.hasOwnProperty.call(result, child.tagName)) {
      const previous = result[child.tagName]
      result[child.tagName] = Array.isArray(previous) ? [...previous, value] : [previous, value]
    } else result[child.tagName] = value
  }
  if (!children.length && Object.keys(result).length === 0) return text
  if (text) result['#text'] = text
  return result
}

function xmlToJson(source: string) {
  const document = new DOMParser().parseFromString(source, 'application/xml')
  const issue = document.querySelector('parsererror')
  if (issue) throw new Error(issue.textContent?.replace(/\s+/g, ' ').trim() || 'Invalid XML document')
  const root = document.documentElement
  return JSON.stringify({ [root.tagName]: xmlNodeToValue(root) }, null, 2)
}

function escapeXml(value: string) {
  return value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char]!)
}

function jsonValueToXml(value: unknown, name: string): string {
  const safeName = /^[A-Za-z_][\w.:-]*$/.test(name) ? name : 'item'
  if (Array.isArray(value)) return value.map(item => jsonValueToXml(item, safeName)).join('')
  if (value !== null && typeof value === 'object') {
    const children = Object.entries(value as Record<string, unknown>).map(([key, child]) => jsonValueToXml(child, key)).join('')
    return `<${safeName}>${children}</${safeName}>`
  }
  return `<${safeName}>${escapeXml(value === null ? '' : String(value))}</${safeName}>`
}

export const DATA_TOOL_SLUGS = ['csv-formatter', 'toml-formatter', 'xml-to-json', 'yaml-to-json', 'json-to-xml', 'csv-to-json', 'toml-json-converter', 'php-json-converter', 'json-schema-generator'] as const

export async function runDataTool(slug: string, input: string, options: ToolOptions = {}): Promise<string | null> {
  if (!(DATA_TOOL_SLUGS as readonly string[]).includes(slug)) return null
  if (!input.trim()) throw new Error('Paste data to process.')
  if (slug === 'csv-to-json') return csvToJson(input, options)
  if (slug === 'toml-json-converter') return convertTomlJson(input, options)
  if (slug === 'php-json-converter') return convertPhpJson(input, options)
  if (slug === 'json-schema-generator') return generateJsonSchema(input, options)
  if (slug === 'csv-formatter') {
    const delimiter = getDelimiter(options.delimiter)
    const rows = parseCsv(input, delimiter)
    return rows.map(row => row.map(value => quoteCsvField(value, delimiter)).join(delimiter)).join('\n')
  }
  if (slug === 'toml-formatter') return TOML.stringify(TOML.parse(input) as TOML.JsonMap)
  if (slug === 'xml-to-json') return xmlToJson(input)
  if (slug === 'yaml-to-json') {
    const indent = Math.max(1, Math.min(8, Number(options.indent) || 2))
    return JSON.stringify(YAML.parse(input), null, indent)
  }
  const value: unknown = JSON.parse(input)
  const root = options.rootName || 'root'
  if (!/^[A-Za-z_][\w.:-]*$/.test(root)) throw new Error('Root element must be a valid XML name.')
  const wrapped = value !== null && typeof value === 'object' && !Array.isArray(value) ? Object.entries(value as Record<string, unknown>).map(([key, item]) => jsonValueToXml(item, key)).join('') : jsonValueToXml(value, 'item')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<${root}>${wrapped}</${root}>`
}
