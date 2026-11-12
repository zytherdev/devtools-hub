import type { ToolOptions } from '@/app/tools/types'

const MAX_INPUT_LENGTH = 2_000
const MAX_ELAPSED_MINUTES = 365 * 24 * 60
const MAX_THROUGHPUT_PERCENT_PER_HOUR = 10_000
const MAX_ESTIMATE_SECONDS = 100 * 365 * 24 * 60 * 60
const ISO_UTC_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?Z$/
const MIN_ISO_TIMESTAMP = -62_167_219_200_000
const MAX_ISO_TIMESTAMP = 253_402_300_799_999

type EtaInput = {
  progress: number
  asOf: string
  elapsedMinutes?: number
  throughputPercentPerHour?: number
}

function validateOptions(options: unknown): void {
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    throw new Error('Options must be an empty object; this tool does not accept options.')
  }
  if (Object.keys(options).length > 0) {
    throw new Error('This tool does not accept options.')
  }
}

function hasAtMostTwoDecimals(value: number): boolean {
  const scaled = value * 100
  return Math.abs(scaled - Math.round(scaled)) <= 1e-9
}

function parseAsOf(value: unknown): number {
  if (typeof value !== 'string') {
    throw new Error('asOf must be a UTC ISO-8601 date and time, such as 2026-01-01T12:00:00Z.')
  }
  const match = ISO_UTC_PATTERN.exec(value)
  if (!match) {
    throw new Error('asOf must use UTC ISO-8601 format YYYY-MM-DDTHH:mm:ss[.sss]Z.')
  }
  const [, yearText, monthText, dayText, hourText, minuteText, secondText, fraction = ''] = match
  const year = Number(yearText)
  const month = Number(monthText)
  const day = Number(dayText)
  const hour = Number(hourText)
  const minute = Number(minuteText)
  const second = Number(secondText)
  const millisecond = Number(fraction.padEnd(3, '0') || '0')
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth[month - 1] || hour > 23 || minute > 59 || second > 59) {
    throw new Error('asOf contains a date or time outside its valid range.')
  }
  const date = new Date(0)
  date.setUTCFullYear(year, month - 1, day)
  date.setUTCHours(hour, minute, second, millisecond)
  const timestamp = date.getTime()
  if (!Number.isFinite(timestamp) || timestamp < MIN_ISO_TIMESTAMP || timestamp > MAX_ISO_TIMESTAMP) {
    throw new Error('asOf must be in the supported UTC date range 0000-01-01 through 9999-12-31.')
  }
  return timestamp
}

function parseInput(input: string): EtaInput {
  if (typeof input !== 'string' || input.length === 0 || input.length > MAX_INPUT_LENGTH) {
    throw new Error(`Input must contain 1 to ${MAX_INPUT_LENGTH} characters.`)
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(input)
  } catch {
    throw new Error('Input must be a valid JSON object.')
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Input must be a JSON object.')
  }
  const record = parsed as Record<string, unknown>
  const allowedKeys = ['progress', 'asOf', 'elapsedMinutes', 'throughputPercentPerHour']
  const unknownKey = Object.keys(record).find(key => !allowedKeys.includes(key))
  if (unknownKey) throw new Error(`Unknown input field: ${unknownKey}.`)
  if (!Object.hasOwn(record, 'progress')) throw new Error('progress is required and must be a number from 0 to 100.')
  if (typeof record.progress !== 'number' || !Number.isFinite(record.progress) || record.progress < 0 || record.progress > 100) {
    throw new Error('progress must be a finite number from 0 to 100.')
  }
  if (!hasAtMostTwoDecimals(record.progress)) {
    throw new Error('progress may have no more than 2 decimal places.')
  }
  if (!Object.hasOwn(record, 'asOf')) throw new Error('asOf is required to calculate a deterministic completion date.')
  parseAsOf(record.asOf)

  const hasElapsed = Object.hasOwn(record, 'elapsedMinutes')
  const hasThroughput = Object.hasOwn(record, 'throughputPercentPerHour')
  if (hasElapsed === hasThroughput) {
    throw new Error('Provide exactly one of elapsedMinutes or throughputPercentPerHour.')
  }
  if (hasElapsed) {
    const elapsed = record.elapsedMinutes
    if (typeof elapsed !== 'number' || !Number.isFinite(elapsed) || elapsed <= 0 || elapsed > MAX_ELAPSED_MINUTES) {
      throw new Error(`elapsedMinutes must be greater than 0 and no more than ${MAX_ELAPSED_MINUTES}.`)
    }
    if (!hasAtMostTwoDecimals(elapsed)) {
      throw new Error('elapsedMinutes may have no more than 2 decimal places.')
    }
    if (record.progress === 0) {
      throw new Error('Progress must be greater than 0 when using elapsedMinutes; zero progress has no measurable completion rate.')
    }
  } else {
    const throughput = record.throughputPercentPerHour
    if (typeof throughput !== 'number' || !Number.isFinite(throughput) || throughput <= 0 || throughput > MAX_THROUGHPUT_PERCENT_PER_HOUR) {
      throw new Error(`throughputPercentPerHour must be greater than 0 and no more than ${MAX_THROUGHPUT_PERCENT_PER_HOUR}.`)
    }
    if (!hasAtMostTwoDecimals(throughput)) {
      throw new Error('throughputPercentPerHour may have no more than 2 decimal places.')
    }
  }
  return record as EtaInput
}

export function run(input: string, options: ToolOptions = {}): string {
  validateOptions(options)
  const data = parseInput(input)
  const asOfMilliseconds = parseAsOf(data.asOf)
  let unroundedSeconds: number
  let method: 'elapsed-time' | 'throughput'
  if (data.elapsedMinutes !== undefined) {
    method = 'elapsed-time'
    unroundedSeconds = ((100 - data.progress) * data.elapsedMinutes * 60) / data.progress
  } else {
    method = 'throughput'
    unroundedSeconds = ((100 - data.progress) / (data.throughputPercentPerHour as number)) * 3_600
  }
  const remainingSeconds = Math.round(unroundedSeconds)
  if (!Number.isSafeInteger(remainingSeconds) || remainingSeconds < 0 || remainingSeconds > MAX_ESTIMATE_SECONDS) {
    throw new Error('Estimated remaining time must be no more than 100 years.')
  }
  const completionMilliseconds = asOfMilliseconds + remainingSeconds * 1_000
  if (completionMilliseconds > MAX_ISO_TIMESTAMP) {
    throw new Error('Estimated completion is outside the supported UTC date range 0000-01-01 through 9999-12-31.')
  }
  return JSON.stringify({
    progressPercent: data.progress,
    method,
    remainingSeconds,
    remainingMinutes: Number((remainingSeconds / 60).toFixed(2)),
    remainingHours: Number((remainingSeconds / 3_600).toFixed(4)),
    asOf: new Date(asOfMilliseconds).toISOString(),
    estimatedCompletion: new Date(completionMilliseconds).toISOString(),
  }, null, 2)
}
