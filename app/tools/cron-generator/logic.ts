import type { ToolOptions } from '@/app/tools/types'

type Field = { key: string; label: string; minimum: number; maximum: number; unit: string }
const FIELDS: Field[] = [
  { key: 'minute', label: 'Minute', minimum: 0, maximum: 59, unit: 'minute' },
  { key: 'hour', label: 'Hour', minimum: 0, maximum: 23, unit: 'hour' },
  { key: 'dayOfMonth', label: 'Day of month', minimum: 1, maximum: 31, unit: 'day of the month' },
  { key: 'month', label: 'Month', minimum: 1, maximum: 12, unit: 'month' },
  { key: 'dayOfWeek', label: 'Day of week', minimum: 0, maximum: 7, unit: 'day of the week' },
]

function validField(value: string, field: Field): boolean {
  if (value.length === 0 || value.length > 128) return false
  const tokens = value.split(',')
  if (tokens.some(token => token.length === 0)) return false
  return tokens.every(token => {
    const match = /^(\*|\d+(?:-\d+)?)(?:\/(\d+))?$/.exec(token)
    if (!match) return false
    const [, range, stepText] = match
    if (stepText && (Number(stepText) < 1 || Number(stepText) > field.maximum - field.minimum + 1)) return false
    if (stepText && range !== '*' && !range.includes('-')) return false
    if (range === '*') return true
    const bounds = range.split('-').map(Number)
    if (bounds.some(bound => !Number.isInteger(bound) || bound < field.minimum || bound > field.maximum)) return false
    return bounds.length === 1 || bounds[0] <= bounds[1]
  })
}

function describe(value: string, field: Field): string {
  if (value === '*') return `every ${field.unit}`
  const step = /^\*\/(\d+)$/.exec(value)
  if (step) return `every ${step[1]} ${field.unit}(s)`
  return `selected ${field.unit}(s): ${value}`
}

export function run(input: string, options: ToolOptions = {}): string {
  if (typeof input !== 'string' || input.length !== 0) throw new Error('This tool does not accept input text.')
  if (!options || typeof options !== 'object' || Array.isArray(options)) throw new Error('Options must be an object.')
  const allowed = new Set(FIELDS.map(field => field.key))
  const unknown = Object.keys(options).find(key => !allowed.has(key))
  if (unknown) throw new Error(`Unknown option: ${unknown}.`)

  const values = FIELDS.map(field => {
    const value = options[field.key] ?? (field.key === 'minute' ? '0' : field.key === 'hour' ? '9' : field.key === 'dayOfWeek' ? '1-5' : '*')
    if (typeof value !== 'string' || !validField(value, field)) {
      throw new Error(`${field.key} must use valid cron syntax with values from ${field.minimum} to ${field.maximum}.`)
    }
    return value
  })
  const expression = values.join(' ')
  const details = FIELDS.map((field, index) => `- ${field.label}: ${describe(values[index], field)}.`)
  details.push('- Traditional cron treats restricted day-of-month and day-of-week fields with OR semantics.')
  return `Cron expression: ${expression}\nSchedule details:\n${details.join('\n')}\n`
}
