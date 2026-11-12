import type { ToolOptions } from '@/app/tools/types'

const MAX_INPUT_LENGTH = 2_048
const MAX_ZONE_LENGTH = 128
const ISO_INSTANT = /^(\d{4})-(\d{2})-(\d{2})[Tt](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?(Z|[+-]\d{2}:\d{2})$/

type DateParts = {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

type ZoneResult = {
  timeZone: string
  localDateTime: string
  utcOffset: string
  timeZoneName: string
  daylightSavingTime: boolean | null
  daylightSavingLabel: string
}

function daysInMonth(year: number, month: number): number {
  if (month === 2) return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28
  return [4, 6, 9, 11].includes(month) ? 30 : 31
}

function makeUtcTimestamp(parts: DateParts, millisecond: number): number {
  const date = new Date(0)
  date.setUTCFullYear(parts.year, parts.month - 1, parts.day)
  date.setUTCHours(parts.hour, parts.minute, parts.second, millisecond)
  return date.getTime()
}

function parseInstant(value: unknown): { timestamp: number; iso: string } {
  if (typeof value !== 'string') throw new Error('Instant must be an ISO-8601 date-time string with an explicit UTC offset.')
  const match = ISO_INSTANT.exec(value)
  if (!match) {
    throw new Error('Instant must use YYYY-MM-DDTHH:mm[:ss[.sss]]Z or an explicit ±HH:MM offset.')
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const hour = Number(match[4])
  const minute = Number(match[5])
  const second = match[6] === undefined ? 0 : Number(match[6])
  const millisecond = Number((match[7] ?? '').padEnd(3, '0'))
  if (year < 1 || year > 9999 || month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) {
    throw new Error('Instant contains an invalid calendar date; supported years are 0001–9999.')
  }
  if (hour > 23 || minute > 59 || second > 59) throw new Error('Instant contains an invalid clock time.')

  const offset = match[8]
  let offsetSeconds = 0
  if (offset !== 'Z' && offset !== 'z') {
    const offsetHours = Number(offset.slice(1, 3))
    const offsetMinutes = Number(offset.slice(4, 6))
    if (offsetHours > 14 || offsetMinutes > 59 || (offsetHours === 14 && offsetMinutes !== 0)) {
      throw new Error('UTC offset must be between -14:00 and +14:00.')
    }
    const direction = offset[0] === '+' ? 1 : -1
    offsetSeconds = direction * (offsetHours * 60 + offsetMinutes) * 60
  }

  const timestamp = makeUtcTimestamp({ year, month, day, hour, minute, second }, millisecond) - offsetSeconds * 1_000
  const utcDate = new Date(timestamp)
  const utcYear = utcDate.getUTCFullYear()
  if (!Number.isFinite(timestamp) || utcYear < 1 || utcYear > 9999) {
    throw new Error('Instant resolves outside the supported UTC year range 0001–9999.')
  }
  const iso = utcDate.toISOString().replace(/\.000Z$/, 'Z')
  return { timestamp, iso }
}

function validateTimeZone(value: unknown, label: string): { name: string; formatter: Intl.DateTimeFormat } {
  if (typeof value !== 'string' || value.length === 0 || value.length > MAX_ZONE_LENGTH || value.trim() !== value || /\s/.test(value)) {
    throw new Error(`${label} must be a non-empty IANA time-zone name of at most ${MAX_ZONE_LENGTH} characters, with no whitespace.`)
  }
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: value,
      year: 'numeric',
      era: 'short',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
      timeZoneName: 'long',
    })
    return { name: value, formatter }
  } catch {
    throw new Error(`${label} is not a supported IANA time-zone name.`)
  }
}

function partsAt(timestamp: number, formatter: Intl.DateTimeFormat): DateParts {
  const values: Record<string, number> = {}
  let era = ''
  for (const part of formatter.formatToParts(new Date(timestamp))) {
    if (part.type === 'era') era = part.value
    else if (part.type !== 'literal' && part.type !== 'timeZoneName') values[part.type] = Number(part.value)
  }
  if ((era && era !== 'AD' && era !== 'CE') || !values.year || values.year < 1 || values.year > 9999) {
    throw new Error('Converted local date falls outside the supported display years 0001–9999.')
  }
  return {
    year: values.year,
    month: values.month,
    day: values.day,
    hour: values.hour,
    minute: values.minute,
    second: values.second,
  }
}

function offsetAt(timestamp: number, formatter: Intl.DateTimeFormat): number {
  const date = new Date(timestamp)
  const local = partsAt(timestamp, formatter)
  const localAsUtc = makeUtcTimestamp(local, date.getUTCMilliseconds())
  return Math.round((localAsUtc - timestamp) / 1_000)
}

function formatOffset(offsetSeconds: number): string {
  const sign = offsetSeconds < 0 ? '-' : '+'
  const absolute = Math.abs(offsetSeconds)
  const hours = Math.floor(absolute / 3_600)
  const minutes = Math.floor((absolute % 3_600) / 60)
  const seconds = absolute % 60
  return `UTC${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}${seconds ? `:${String(seconds).padStart(2, '0')}` : ''}`
}

function formatLocalDateTime(parts: DateParts, millisecond: number, offset: string): string {
  const date = `${String(parts.year).padStart(4, '0')}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`
  const time = `${String(parts.hour).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')}:${String(parts.second).padStart(2, '0')}`
  const fraction = millisecond ? `.${String(millisecond).padStart(3, '0')}` : ''
  return `${date}T${time}${fraction}${offset.replace(/^UTC/, '')}`
}

function convertZone(timestamp: number, timeZone: { name: string; formatter: Intl.DateTimeFormat }): ZoneResult {
  const date = new Date(timestamp)
  const parts = partsAt(timestamp, timeZone.formatter)
  const currentOffset = offsetAt(timestamp, timeZone.formatter)
  const seasonalOffsets = new Set<number>()
  for (let month = 0; month < 12; month += 1) {
    const sample = makeUtcTimestamp({ year: date.getUTCFullYear(), month: month + 1, day: 15, hour: 12, minute: 0, second: 0 }, 0)
    seasonalOffsets.add(offsetAt(sample, timeZone.formatter))
  }
  const offsets = [...seasonalOffsets]
  const minimumOffset = Math.min(...offsets)
  const maximumOffset = Math.max(...offsets)
  let daylightSavingTime: boolean | null = null
  let daylightSavingLabel: string
  if (offsets.length === 1) {
    daylightSavingTime = false
    daylightSavingLabel = 'No seasonal offset change was observed in this calendar year.'
  } else if (currentOffset === maximumOffset && maximumOffset !== minimumOffset) {
    daylightSavingTime = true
    daylightSavingLabel = 'Daylight saving time is in effect; this is the larger offset observed this calendar year.'
  } else if (currentOffset === minimumOffset) {
    daylightSavingTime = false
    daylightSavingLabel = 'Daylight saving time is not in effect; this is the smaller offset observed this calendar year.'
  } else {
    daylightSavingLabel = 'The annual offset pattern is irregular, so daylight-saving status could not be inferred.'
  }

  const zoneName = timeZone.formatter.formatToParts(new Date(timestamp)).find(part => part.type === 'timeZoneName')?.value ?? timeZone.name
  const offset = formatOffset(currentOffset)
  return {
    timeZone: timeZone.name,
    localDateTime: formatLocalDateTime(parts, date.getUTCMilliseconds(), offset),
    utcOffset: offset,
    timeZoneName: zoneName,
    daylightSavingTime,
    daylightSavingLabel,
  }
}

export function run(input: string, options: ToolOptions = {}): string {
  if (typeof input !== 'string' || input.length > MAX_INPUT_LENGTH) {
    throw new Error(`Input must be a JSON object no longer than ${MAX_INPUT_LENGTH.toLocaleString('en-US')} characters.`)
  }
  if (!options || typeof options !== 'object' || Array.isArray(options) || Object.keys(options).length > 0) {
    throw new Error('Timezone Converter does not accept options; put the instant and time zones in the input object.')
  }
  if (!input.trim()) throw new Error('Input must be a JSON object with an instant and two time zones.')

  let parsed: unknown
  try {
    parsed = JSON.parse(input)
  } catch {
    throw new Error('Input must be valid JSON containing an instant and two time zones.')
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Input must be a JSON object containing exactly "instant", "fromTimeZone", and "toTimeZone".')
  }
  const record = parsed as Record<string, unknown>
  const keys = Object.keys(record)
  if (keys.length !== 3 || !keys.includes('instant') || !keys.includes('fromTimeZone') || !keys.includes('toTimeZone')) {
    throw new Error('Input must contain exactly the "instant", "fromTimeZone", and "toTimeZone" properties.')
  }

  const instant = parseInstant(record.instant)
  const fromTimeZone = validateTimeZone(record.fromTimeZone, 'Source time zone')
  const toTimeZone = validateTimeZone(record.toTimeZone, 'Target time zone')
  return JSON.stringify({
    instant: instant.iso,
    source: convertZone(instant.timestamp, fromTimeZone),
    target: convertZone(instant.timestamp, toTimeZone),
  }, null, 2)
}
