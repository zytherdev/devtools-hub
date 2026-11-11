import type { ToolOptions } from '@/app/tools/types'
import { parseAllDocuments, stringify } from 'yaml'

const MAX_INPUT_CHARS = 500_000
const MAX_KEYS = 10_000
const MAX_SECRET_KEY_LENGTH = 253
const SECRET_KEY_PATTERN = /^[A-Za-z0-9._-]+$/
const BASE64_PATTERN = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/

type StringMap = Record<string, unknown>

function isRecord(value: unknown): value is StringMap {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

function validateSecretKey(key: string): void {
  if (key.length > MAX_SECRET_KEY_LENGTH || !SECRET_KEY_PATTERN.test(key)) {
    throw new Error(`Secret key ${JSON.stringify(key)} is invalid; use up to ${MAX_SECRET_KEY_LENGTH} ASCII letters, digits, dots, hyphens, or underscores.`)
  }
}

function decodeBase64Utf8(value: string, key: string): string {
  if (!BASE64_PATTERN.test(value)) {
    throw new Error(`Invalid base64 value for key ${JSON.stringify(key)}.`)
  }

  let binary: string
  try {
    binary = atob(value)
  } catch {
    throw new Error(`Invalid base64 value for key ${JSON.stringify(key)}.`)
  }
  if (btoa(binary) !== value) {
    throw new Error(`Base64 value for key ${JSON.stringify(key)} is not in canonical form.`)
  }

  const bytes = Uint8Array.from(binary, character => character.charCodeAt(0))
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    throw new Error(`Value for key ${JSON.stringify(key)} does not contain valid UTF-8 text.`)
  }
}

function readStringMap(value: unknown, fieldName: string): Record<string, string> {
  if (!isRecord(value)) throw new Error(`${fieldName} must be a YAML map of strings.`)

  const entries = Object.entries(value)
  const result: Record<string, string> = Object.create(null) as Record<string, string>
  for (const [key, item] of entries) {
    validateSecretKey(key)
    if (typeof item !== 'string') throw new Error(`Value for key ${JSON.stringify(key)} in ${fieldName} must be a string.`)
    result[key] = item
  }
  return result
}

export function run(input: string, _options: ToolOptions = {}): string {
  void _options
  if (typeof input !== 'string' || !input.trim()) throw new Error('Provide a Kubernetes Secret YAML document.')
  if (input.length > MAX_INPUT_CHARS) throw new Error(`Input exceeds the ${MAX_INPUT_CHARS.toLocaleString('en-US')}-character limit.`)

  let documents
  try {
    documents = parseAllDocuments(input, { uniqueKeys: true })
  } catch (cause) {
    throw new Error(`Invalid YAML: ${cause instanceof Error ? cause.message : 'parsing error.'}`)
  }
  if (documents.length !== 1) throw new Error('Provide exactly one Kubernetes Secret YAML document.')
  const document = documents[0]
  if (document.errors.length) throw new Error(`Invalid YAML: ${document.errors.map(error => error.message).join('\n')}`)

  let parsed: unknown
  try {
    parsed = document.toJS()
  } catch (cause) {
    throw new Error(`The Secret YAML structure is invalid: ${cause instanceof Error ? cause.message : 'conversion error.'}`)
  }
  if (!isRecord(parsed)) throw new Error('Kubernetes Secret document must be a YAML map.')
  if (parsed.kind !== 'Secret') throw new Error('Only Kubernetes documents with kind: Secret are supported.')
  if (!isRecord(parsed.metadata)) throw new Error('The required metadata field must be a YAML map.')

  const hasData = Object.hasOwn(parsed, 'data')
  const hasStringData = Object.hasOwn(parsed, 'stringData')
  const data = hasData ? readStringMap(parsed.data, 'data') : Object.create(null) as Record<string, string>
  const stringData = hasStringData ? readStringMap(parsed.stringData, 'stringData') : Object.create(null) as Record<string, string>
  if (Object.keys(data).length + Object.keys(stringData).length > MAX_KEYS) {
    throw new Error(`Secret exceeds the limit of ${MAX_KEYS.toLocaleString('en-US')} keys across data and stringData.`)
  }

  const decodedData: Record<string, string> = Object.create(null) as Record<string, string>
  for (const [key, value] of Object.entries(data)) decodedData[key] = decodeBase64Utf8(value, key)

  const output: StringMap = { ...parsed }
  delete output.data
  if (hasData || hasStringData) {
    // Kubernetes stringData values override matching data keys.
    output.stringData = { ...decodedData, ...stringData }
  }

  return stringify(output, { lineWidth: 0 })
}
