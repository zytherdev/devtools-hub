import type { ToolOptions } from '@/app/tools/types'

export const MAX_CRON_INPUT_LENGTH = 256
export const MAX_ITEMS_PER_FIELD = 64

export const CRON_FIELDS = [
  { name: 'Minute', min: 0, max: 59 },
  { name: 'Hour', min: 0, max: 23 },
  { name: 'Day of month', min: 1, max: 31 },
  { name: 'Month', min: 1, max: 12 },
  { name: 'Day of week', min: 0, max: 7 }
] as const

export type CronValidationResult = {
  valid: boolean
  message: string
}

function isPlainOptionsObject(options: unknown): options is ToolOptions {
  if (typeof options !== 'object' || options === null || Array.isArray(options)) return false
  const prototype = Object.getPrototypeOf(options)
  return prototype === Object.prototype || prototype === null
}

function validateField(field: string, fieldIndex: number): string | null {
  const definition = CRON_FIELDS[fieldIndex]
  const items = field.split(',')
  if (items.length > MAX_ITEMS_PER_FIELD) {
    return `${definition.name} has too many comma-separated items (maximum ${MAX_ITEMS_PER_FIELD}).`
  }
  if (items.some(item => item.length === 0)) {
    return `${definition.name} contains an empty list item.`
  }

  for (const item of items) {
    const stepParts = item.split('/')
    if (stepParts.length > 2 || stepParts.some(part => part.length === 0)) {
      return `${definition.name} item "${item}" has an invalid step expression.`
    }

    const hasStep = stepParts.length === 2
    let step = 1
    if (hasStep) {
      if (!/^\d+$/.test(stepParts[1])) {
        return `${definition.name} step must be a positive integer.`
      }
      step = Number(stepParts[1])
      if (!Number.isSafeInteger(step) || step < 1 || step > definition.max - definition.min + 1) {
        return `${definition.name} step must be from 1 to ${definition.max - definition.min + 1}.`
      }
    }

    const base = stepParts[0]
    let start: number
    let end: number
    if (base === '*') {
      start = definition.min
      end = definition.max
    } else if (/^\d+-\d+$/.test(base)) {
      const range = base.split('-').map(Number)
      start = range[0]
      end = range[1]
      if (start > end) {
        return `${definition.name} range "${base}" must ascend from its lower bound to its upper bound.`
      }
    } else if (/^\d+$/.test(base)) {
      start = Number(base)
      // A stepped single value means that value and every step after it through the field maximum.
      end = hasStep ? definition.max : start
    } else {
      return `${definition.name} item "${item}" is not supported. Use numbers, *, ranges, lists, and optional steps.`
    }

    if (start < definition.min || start > definition.max || end < definition.min || end > definition.max) {
      return `${definition.name} values must be from ${definition.min} to ${definition.max}.`
    }
  }
  return null
}

export function validateCronExpression(input: unknown): CronValidationResult {
  if (typeof input !== 'string') {
    return { valid: false, message: 'Enter the cron expression as text.' }
  }
  if (input.length > MAX_CRON_INPUT_LENGTH) {
    return { valid: false, message: `Cron expression must be ${MAX_CRON_INPUT_LENGTH} characters or fewer.` }
  }
  const trimmed = input.trim()
  if (!trimmed) {
    return { valid: false, message: 'Enter a five-field cron expression.' }
  }

  const fields = trimmed.split(/\s+/)
  if (fields.length !== CRON_FIELDS.length) {
    return { valid: false, message: 'A cron expression must contain exactly five fields: minute, hour, day of month, month, and day of week.' }
  }

  for (let index = 0; index < fields.length; index += 1) {
    const error = validateField(fields[index], index)
    if (error) return { valid: false, message: error }
  }

  return {
    valid: true,
    message: 'Valid five-field cron expression. Syntax and field bounds are valid; no timezone-specific next run is calculated.'
  }
}

export function run(input: string, options: ToolOptions = {}): string {
  if (!isPlainOptionsObject(options)) {
    throw new Error('Options must be a plain object.')
  }
  if (Object.keys(options).length > 0) {
    throw new Error(`Unsupported option: ${Object.keys(options)[0]}. This tool does not accept options.`)
  }

  const result = validateCronExpression(input)
  if (!result.valid) throw new Error(result.message)
  return result.message
}
