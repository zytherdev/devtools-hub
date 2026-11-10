import type { ToolOptions } from '@/app/tools/types'

const ISO_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?(Z|([+-])(\d{2}):(\d{2}))$/

function parseIsoWithZone(input: string): number {
  const match = ISO_PATTERN.exec(input)
  if (!match) throw new Error('Use ISO-8601 format with an explicit timezone, such as 2026-01-01T12:30:00Z.')
  const [, yearText, monthText, dayText, hourText, minuteText, secondText, fraction = '', zone, sign, offsetHourText, offsetMinuteText] = match
  const year = Number(yearText)
  const month = Number(monthText)
  const day = Number(dayText)
  const hour = Number(hourText)
  const minute = Number(minuteText)
  const second = Number(secondText)
  const millisecond = Number(fraction.padEnd(3, '0') || '0')
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth[month - 1] || hour > 23 || minute > 59 || second > 59) throw new Error('ISO date/time components are outside their valid ranges.')

  let offsetMinutes = 0
  if (zone !== 'Z') {
    const offsetHours = Number(offsetHourText)
    const extraMinutes = Number(offsetMinuteText)
    if (offsetHours > 14 || extraMinutes > 59 || (offsetHours === 14 && extraMinutes !== 0)) throw new Error('Timezone offset must be within ±14:00.')
    offsetMinutes = (sign === '+' ? 1 : -1) * (offsetHours * 60 + extraMinutes)
  }

  const date = new Date(0)
  date.setUTCFullYear(year, month - 1, day)
  date.setUTCHours(hour, minute, second, millisecond)
  const timestamp = date.getTime() - offsetMinutes * 60_000
  if (!Number.isFinite(timestamp) || Math.abs(timestamp) > 8.64e15) throw new Error('Date is outside the supported JavaScript Date range.')
  return timestamp
}

export function run(input: string, options: ToolOptions = {}): string {
  if (typeof input !== 'string' || input.length === 0 || input.length > 100) throw new Error('Input must contain 1 to 100 characters.')
  if (!options || typeof options !== 'object' || Array.isArray(options)) throw new Error('Options must be an object.')
  const unknown = Object.keys(options).find(key => !['mode', 'unit'].includes(key))
  if (unknown) throw new Error(`Unknown option: ${unknown}.`)
  for (const [key, value] of Object.entries(options)) if (typeof value !== 'string') throw new Error(`${key} must be a string.`)

  const mode = options.mode ?? 'iso-to-epoch'
  if (mode === 'iso-to-epoch') {
    const milliseconds = parseIsoWithZone(input)
    return JSON.stringify({ iso: new Date(milliseconds).toISOString(), unixSeconds: milliseconds / 1000, unixMilliseconds: milliseconds })
  }
  if (mode !== 'epoch-to-iso') throw new Error('mode must be iso-to-epoch or epoch-to-iso.')
  const unit = options.unit ?? 'seconds'
  if (unit !== 'seconds' && unit !== 'milliseconds') throw new Error('unit must be seconds or milliseconds.')
  if (!/^-?(?:0|[1-9]\d*)$/.test(input)) throw new Error('Unix timestamp must be a whole number.')
  const value = Number(input)
  if (!Number.isSafeInteger(value)) throw new Error('Unix timestamp must be a safe whole number.')
  const milliseconds = unit === 'seconds' ? value * 1000 : value
  if (!Number.isSafeInteger(milliseconds) || Math.abs(milliseconds) > 8.64e15) throw new Error('Timestamp is outside the supported JavaScript Date range.')
  const date = new Date(milliseconds)
  if (!Number.isFinite(date.getTime())) throw new Error('Timestamp is outside the supported JavaScript Date range.')
  return JSON.stringify({ iso: date.toISOString(), unixSeconds: milliseconds / 1000, unixMilliseconds: milliseconds })
}
