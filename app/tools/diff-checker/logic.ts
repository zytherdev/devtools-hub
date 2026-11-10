import type { ToolOptions } from '@/app/tools/types'

export const DEFAULT_SEPARATOR = '---8<---'
export const MAX_INPUT_LENGTH = 200_000
export const MAX_LINES_PER_SIDE = 2_000
export const MAX_OUTPUT_LENGTH = 500_000

const CONTROL_CHARACTERS = /[\u0000-\u001F\u007F-\u009F]/u

function getSeparator(options: ToolOptions): string {
  if (options === null || typeof options !== 'object' || Array.isArray(options)) {
    throw new Error('As opções devem ser um objeto.')
  }

  const keys = Reflect.ownKeys(options)
  for (const key of keys) {
    if (key !== 'separator') {
      throw new Error(`Opção desconhecida: ${String(key)}.`)
    }
  }

  const separator = Object.hasOwn(options, 'separator')
    ? options.separator
    : DEFAULT_SEPARATOR

  if (typeof separator !== 'string') {
    throw new Error('A opção separator deve ser uma string.')
  }
  if (separator.length === 0) {
    throw new Error('A opção separator não pode ser vazia.')
  }
  if (separator.length > 80) {
    throw new Error('A opção separator deve ter no máximo 80 caracteres.')
  }
  if (CONTROL_CHARACTERS.test(separator)) {
    throw new Error('A opção separator não pode conter caracteres de controle.')
  }

  return separator
}

function linesFromRecords(records: string[]): string[] {
  if (records.length === 0) return []

  const text = records.join('\n')
  if (text.length === 0) return []

  const lines = text.split('\n')
  // A quebra final termina a última linha, não cria outra linha vazia.
  if (lines[lines.length - 1] === '') lines.pop()
  return lines
}

function buildDiff(original: string[], updated: string[]): string[] {
  const originalCount = original.length
  const updatedCount = updated.length
  const lcs = Array.from(
    { length: originalCount + 1 },
    () => new Uint16Array(updatedCount + 1),
  )

  for (let i = originalCount - 1; i >= 0; i--) {
    const row = lcs[i]
    const nextRow = lcs[i + 1]
    for (let j = updatedCount - 1; j >= 0; j--) {
      row[j] = original[i] === updated[j]
        ? nextRow[j + 1] + 1
        : Math.max(nextRow[j], row[j + 1])
    }
  }

  const diff: string[] = []
  let i = 0
  let j = 0

  while (i < originalCount && j < updatedCount) {
    if (original[i] === updated[j]) {
      diff.push(` ${original[i]}`)
      i++
      j++
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      // Em empates, emitir remoções antes das adições torna o resultado estável.
      diff.push(`-${original[i]}`)
      i++
    } else {
      diff.push(`+${updated[j]}`)
      j++
    }
  }

  while (i < originalCount) {
    diff.push(`-${original[i]}`)
    i++
  }
  while (j < updatedCount) {
    diff.push(`+${updated[j]}`)
    j++
  }

  return diff
}

export function run(input: string, options: ToolOptions = {}): string {
  if (typeof input !== 'string') {
    throw new Error('A entrada deve ser uma string.')
  }
  if (input.length > MAX_INPUT_LENGTH) {
    throw new Error('A entrada deve ter no máximo 200.000 caracteres.')
  }

  const separator = getSeparator(options)
  const records = input.replace(/\r\n?/g, '\n').split('\n')
  const separatorIndexes: number[] = []

  for (let index = 0; index < records.length; index++) {
    if (records[index] === separator) separatorIndexes.push(index)
  }

  if (separatorIndexes.length === 0) {
    throw new Error(`A entrada deve conter exatamente uma linha ${JSON.stringify(separator)} como separador.`)
  }
  if (separatorIndexes.length > 1) {
    throw new Error(`A entrada contém mais de uma linha ${JSON.stringify(separator)} como separador.`)
  }

  const separatorIndex = separatorIndexes[0]
  const original = linesFromRecords(records.slice(0, separatorIndex))
  const updated = linesFromRecords(records.slice(separatorIndex + 1))

  if (original.length > MAX_LINES_PER_SIDE) {
    throw new Error('O texto Original pode ter no máximo 2.000 linhas.')
  }
  if (updated.length > MAX_LINES_PER_SIDE) {
    throw new Error('O texto Atualizado pode ter no máximo 2.000 linhas.')
  }

  const output = ['--- Original', '+++ Atualizado', ...buildDiff(original, updated)].join('\n')
  if (output.length > MAX_OUTPUT_LENGTH) {
    throw new Error('A saída excede o limite de 500.000 caracteres.')
  }
  return output
}
