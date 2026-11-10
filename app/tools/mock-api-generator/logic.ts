import type { ToolOptions } from '@/app/tools/types'

type JsonPrimitive = string | number | boolean | null
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue }
type JsonObject = { [key: string]: JsonValue }

export const MAX_INPUT_CHARS = 100_000
export const MAX_OUTPUT_BYTES = 1_000_000
export const MAX_JSON_DEPTH = 20
export const MAX_CONTAINER_ITEMS = 10_000
export const MAX_JSON_NODES = 20_000
const ALLOWED_OPTIONS = new Set(['count', 'wrapper', 'idField'])
const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f-\u009f]/u

/** Gera fixtures JSON determinísticas a partir de um objeto-template, sem rede ou execução dinâmica. */
export function run(input: string, options: ToolOptions = {}): string {
  if (typeof input !== 'string') throw new Error('A entrada deve ser um texto JSON.')
  if (input.length > MAX_INPUT_CHARS) {
    throw new Error(`A entrada excede o limite de ${MAX_INPUT_CHARS.toLocaleString('pt-BR')} caracteres.`)
  }
  if (!input.trim()) throw new Error('Informe um objeto-template JSON.')

  const settings = validateOptions(options)
  let parsed: unknown
  try {
    parsed = JSON.parse(input) as unknown
  } catch (cause) {
    const detail = cause instanceof Error ? cause.message : 'erro de sintaxe desconhecido'
    throw new Error(`JSON inválido: ${detail}`)
  }
  if (!isPlainObject(parsed)) {
    throw new Error('O objeto-template deve ser um objeto JSON simples, não um array ou valor primitivo.')
  }
  validateTemplate(parsed)

  const records: JsonObject[] = []
  for (let index = 1; index <= settings.count; index++) {
    const record = JSON.parse(JSON.stringify(parsed)) as JsonObject
    if (settings.idField) {
      Object.defineProperty(record, settings.idField, {
        value: index,
        enumerable: true,
        configurable: true,
        writable: true,
      })
    }
    records.push(record)
  }

  const result: JsonValue = settings.wrapper
    ? { [settings.wrapper]: records, meta: { count: settings.count } }
    : records
  const output = JSON.stringify(result, null, 2)
  const outputBytes = new TextEncoder().encode(output).byteLength
  if (outputBytes > MAX_OUTPUT_BYTES) {
    throw new Error(`A saída excede o limite de ${MAX_OUTPUT_BYTES.toLocaleString('pt-BR')} bytes.`)
  }
  return output
}

function validateOptions(options: ToolOptions): { count: number; wrapper: string; idField: string } {
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    throw new Error('As opções devem ser um objeto JSON.')
  }
  for (const key of Object.keys(options)) {
    if (!ALLOWED_OPTIONS.has(key)) throw new Error(`Opção não reconhecida: ${key}.`)
  }

  const countText = options.count ?? '3'
  if (typeof countText !== 'string' || !/^\d+$/u.test(countText)) {
    throw new Error('count deve ser um número inteiro entre 1 e 100.')
  }
  const count = Number(countText)
  if (!Number.isInteger(count) || count < 1 || count > 100) {
    throw new Error('count deve ser um número inteiro entre 1 e 100.')
  }
  const wrapper = validateOptionText(options.wrapper ?? 'data', 'wrapper')
  const idField = validateOptionText(options.idField ?? 'id', 'idField')
  if (wrapper === 'meta') {
    throw new Error('wrapper não pode ser "meta", pois esse nome é reservado para os metadados da saída.')
  }
  return { count, wrapper, idField }
}

function validateOptionText(value: string, name: string): string {
  if (typeof value !== 'string') throw new Error(`${name} deve ser um texto.`)
  if (value.length > 64) throw new Error(`${name} deve ter no máximo 64 caracteres.`)
  if (CONTROL_CHARACTERS.test(value)) throw new Error(`${name} não pode conter caracteres de controle.`)
  return value
}

function isPlainObject(value: unknown): value is JsonObject {
  return value !== null && typeof value === 'object' && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype
}

function validateTemplate(template: JsonObject): void {
  const pending: Array<{ value: JsonValue; depth: number }> = [{ value: template, depth: 0 }]
  let nodeCount = 0
  while (pending.length > 0) {
    const { value, depth } = pending.pop()!
    nodeCount++
    if (nodeCount > MAX_JSON_NODES) {
      throw new Error(`O template excede o limite de ${MAX_JSON_NODES.toLocaleString('pt-BR')} valores.`)
    }
    if (depth > MAX_JSON_DEPTH) {
      throw new Error(`O template excede a profundidade máxima de ${MAX_JSON_DEPTH}.`)
    }
    if (typeof value === 'number' && !Number.isFinite(value)) {
      throw new Error('O template contém um número fora dos limites do JSON.')
    }
    if (Array.isArray(value)) {
      if (value.length > MAX_CONTAINER_ITEMS) {
        throw new Error(`Arrays podem conter no máximo ${MAX_CONTAINER_ITEMS.toLocaleString('pt-BR')} itens.`)
      }
      for (const child of value) pending.push({ value: child, depth: depth + 1 })
    } else if (value !== null && typeof value === 'object') {
      if (!isPlainObject(value)) throw new Error('O template só pode conter objetos JSON simples.')
      const keys = Object.keys(value)
      if (keys.length > MAX_CONTAINER_ITEMS) {
        throw new Error(`Objetos podem conter no máximo ${MAX_CONTAINER_ITEMS.toLocaleString('pt-BR')} propriedades.`)
      }
      for (const key of keys) pending.push({ value: value[key], depth: depth + 1 })
    }
  }
}
