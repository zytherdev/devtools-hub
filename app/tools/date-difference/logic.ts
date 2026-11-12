import type { ToolOptions } from '@/app/tools/types'

const MAX_INPUT_LENGTH = 256
const MAX_RANGE_MS = 36_600 * 24 * 60 * 60 * 1000
const DAY_MS = 24 * 60 * 60 * 1000
const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/
const DATE_TIME = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?(Z|[+-]\d{2}:\d{2})$/

interface ParsedDate {
  timestamp: number
  utc: string
}

interface Difference {
  years: number
  months: number
  days: number
  hours: number
  minutes: number
  seconds: number
  milliseconds: number
}

function daysInMonth(year: number, month: number): number {
  if (month === 2) {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28
  }
  return [4, 6, 9, 11].includes(month) ? 30 : 31
}

function makeUtcTimestamp(year: number, month: number, day: number, hour = 0, minute = 0, second = 0, millisecond = 0): number {
  const date = new Date(0)
  date.setUTCFullYear(year, month - 1, day)
  date.setUTCHours(hour, minute, second, millisecond)
  return date.getTime()
}

function parseDate(value: unknown, label: string): ParsedDate {
  if (typeof value !== 'string') throw new Error(`${label} must be an ISO date or date-time string.`)
  const dateMatch = DATE_ONLY.exec(value)
  const timeMatch = DATE_TIME.exec(value)
  if (!dateMatch && !timeMatch) {
    throw new Error(`${label} must use YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss[.sss]Z/±HH:MM.`)
  }

  const parts = dateMatch ?? timeMatch!
  const year = Number(parts[1])
  const month = Number(parts[2])
  const day = Number(parts[3])
  if (year < 1 || year > 9999 || month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) {
    throw new Error(`${label} contains an invalid calendar date.`)
  }

  let timestamp: number
  if (dateMatch) {
    timestamp = makeUtcTimestamp(year, month, day)
  } else {
    const hour = Number(parts[4])
    const minute = Number(parts[5])
    const second = Number(parts[6])
    const millisecond = Number((parts[7] ?? '').padEnd(3, '0'))
    const zone = parts[8]
    if (hour > 23 || minute > 59 || second > 59) throw new Error(`${label} contains an invalid time.`)

    let offsetMinutes = 0
    if (zone !== 'Z') {
      const offsetHour = Number(zone.slice(1, 3))
      const offsetMinute = Number(zone.slice(4, 6))
      if (offsetHour > 14 || offsetMinute > 59 || (offsetHour === 14 && offsetMinute !== 0)) {
        throw new Error(`${label} contains an invalid UTC offset; offsets must be between -14:00 and +14:00.`)
      }
      offsetMinutes = (offsetHour * 60 + offsetMinute) * (zone[0] === '+' ? 1 : -1)
    }
    timestamp = makeUtcTimestamp(year, month, day, hour, minute, second, millisecond) - offsetMinutes * 60 * 1000
  }

  const parsed = new Date(timestamp)
  if (!Number.isFinite(timestamp) || parsed.getUTCFullYear() < 1 || parsed.getUTCFullYear() > 9999) {
    throw new Error(`${label} resolves outside the supported UTC year range 0001–9999.`)
  }
  return { timestamp, utc: parsed.toISOString() }
}

function addCalendarMonths(timestamp: number, months: number): number {
  const date = new Date(timestamp)
  const absoluteMonth = date.getUTCFullYear() * 12 + date.getUTCMonth() + months
  const year = Math.floor(absoluteMonth / 12)
  const month = absoluteMonth % 12
  const day = Math.min(date.getUTCDate(), daysInMonth(year, month + 1))
  return makeUtcTimestamp(
    year,
    month + 1,
    day,
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
    date.getUTCMilliseconds()
  )
}

function decomposeDifference(start: number, end: number): Difference {
  let cursor = start
  let years = 0
  while (years < 100 && addCalendarMonths(cursor, 12) <= end) {
    cursor = addCalendarMonths(cursor, 12)
    years += 1
  }
  let months = 0
  while (months < 11 && addCalendarMonths(cursor, 1) <= end) {
    cursor = addCalendarMonths(cursor, 1)
    months += 1
  }
  const days = Math.floor((end - cursor) / DAY_MS)
  cursor += days * DAY_MS
  let remainder = end - cursor
  const hours = Math.floor(remainder / (60 * 60 * 1000))
  remainder -= hours * 60 * 60 * 1000
  const minutes = Math.floor(remainder / (60 * 1000))
  remainder -= minutes * 60 * 1000
  const seconds = Math.floor(remainder / 1000)
  const milliseconds = remainder - seconds * 1000
  return { years, months, days, hours, minutes, seconds, milliseconds }
}

export function run(input: string, options: ToolOptions = {}): string {
  if (typeof input !== 'string' || input.length > MAX_INPUT_LENGTH) {
    throw new Error(`Input must be a JSON object no longer than ${MAX_INPUT_LENGTH} characters.`)
  }
  if (!input.trim()) throw new Error('Input must be a JSON object with "start" and "end" date strings.')
  if (!options || typeof options !== 'object' || Array.isArray(options) || Object.keys(options).length > 0) {
    throw new Error('Date difference does not accept options.')
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(input)
  } catch {
    throw new Error('Input must be valid JSON containing "start" and "end" date strings.')
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Input must be a JSON object containing exactly "start" and "end".')
  }
  const record = parsed as Record<string, unknown>
  const keys = Object.keys(record)
  if (keys.length !== 2 || !keys.includes('start') || !keys.includes('end')) {
    throw new Error('Input must contain exactly the "start" and "end" properties.')
  }
  const start = parseDate(record.start, 'Start')
  const end = parseDate(record.end, 'End')
  const direction = end.timestamp > start.timestamp ? 'forward' : end.timestamp < start.timestamp ? 'backward' : 'same'
  const earlier = Math.min(start.timestamp, end.timestamp)
  const later = Math.max(start.timestamp, end.timestamp)
  const elapsedMilliseconds = later - earlier
  if (elapsedMilliseconds > MAX_RANGE_MS) {
    throw new Error('The difference must not exceed 100 years (36,600 days).')
  }

  return JSON.stringify({
    start: start.utc,
    end: end.utc,
    direction,
    calendarDifference: decomposeDifference(earlier, later),
    elapsedMilliseconds,
    elapsedDays: Number((elapsedMilliseconds / DAY_MS).toFixed(6)),
  }, null, 2)
}
