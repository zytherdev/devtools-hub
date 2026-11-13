import type { ToolOptions } from '@/app/tools/types'

export const MAX_SUITE_ID_LENGTH = 32
export const MIN_ITERATIONS = 1
export const MAX_ITERATIONS = 10_000
export const MIN_SAMPLES = 1
export const MAX_SAMPLES = 9
export const DEFAULT_ITERATIONS = 2_000
export const DEFAULT_SAMPLES = 5

export const BENCHMARK_SUITES = [
  { id: 'array-map', name: 'Array map and reduce', description: 'Map a fixed numeric array, then reduce its values.' },
  { id: 'json-roundtrip', name: 'JSON parse and stringify', description: 'Parse and serialize a fixed small JSON record.' },
  { id: 'string-assembly', name: 'String assembly', description: 'Build a fixed short string from parts using join.' },
  { id: 'map-lookup', name: 'Map lookup', description: 'Look up fixed keys in an in-memory Map.' },
] as const

export type BenchmarkSuiteId = (typeof BENCHMARK_SUITES)[number]['id']

const NUMBERS = Array.from({ length: 128 }, (_, index) => index + 1)
const JSON_FIXTURE = '{"name":"benchmark","version":1,"enabled":true,"values":[1,2,3,5,8,13,21,34]}'
const STRING_PARTS = ['local', '-', 'benchmark', '-', 'sample']
const LOOKUP_MAP = new Map<string, number>(Array.from({ length: 128 }, (_, index): [string, number] => [`key-${index}`, index]))
const LOOKUP_KEYS = Array.from({ length: 128 }, (_, index) => `key-${index}`)

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

function parseBoundedInteger(value: unknown, label: string, fallback: number, min: number, max: number): number {
  if (value === undefined) return fallback
  if (typeof value !== 'string' || !/^(0|[1-9]\d{0,4})$/.test(value)) {
    throw new Error(`${label} must be a whole-number string from ${min} to ${max}.`)
  }
  const parsed = Number(value)
  if (!Number.isSafeInteger(parsed) || parsed < min || parsed > max) {
    throw new Error(`${label} must be a whole-number string from ${min} to ${max}.`)
  }
  return parsed
}

function validateSuite(input: unknown): BenchmarkSuiteId {
  if (typeof input !== 'string') throw new Error('Choose a benchmark suite by its ID.')
  if (input.length > MAX_SUITE_ID_LENGTH) throw new Error(`Suite ID must be ${MAX_SUITE_ID_LENGTH} characters or fewer.`)
  const id = input.trim()
  const suite = BENCHMARK_SUITES.find(candidate => candidate.id === id)
  if (!suite) throw new Error(`Unknown suite. Choose one of: ${BENCHMARK_SUITES.map(candidate => candidate.id).join(', ')}.`)
  return suite.id
}

function runOperations(suite: BenchmarkSuiteId, iterations: number): number {
  let checksum = 0
  switch (suite) {
    case 'array-map':
      for (let i = 0; i < iterations; i += 1) {
        const mapped = NUMBERS.map(value => value * 2)
        checksum += mapped[i % mapped.length]
      }
      break
    case 'json-roundtrip':
      for (let i = 0; i < iterations; i += 1) {
        const value: unknown = JSON.parse(JSON_FIXTURE)
        checksum += JSON.stringify(value).length
      }
      break
    case 'string-assembly':
      for (let i = 0; i < iterations; i += 1) {
        checksum += STRING_PARTS.join('').length + (i & 1)
      }
      break
    case 'map-lookup':
      for (let i = 0; i < iterations; i += 1) {
        checksum += LOOKUP_MAP.get(LOOKUP_KEYS[i % LOOKUP_KEYS.length]) ?? 0
      }
      break
  }
  return checksum
}

function now(): number {
  if (typeof globalThis.performance?.now === 'function') return globalThis.performance.now()
  return Date.now()
}

function roundMilliseconds(value: number): number {
  return Math.round(value * 1000) / 1000
}

function median(values: number[]): number {
  const sorted = [...values].sort((left, right) => left - right)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle]
}

export type BenchmarkResult = {
  suite: { id: BenchmarkSuiteId; name: string; description: string }
  iterationsPerSample: number
  sampleCount: number
  warmupIterations: number
  sampleTimesMs: number[]
  minimumMs: number
  medianMs: number
  meanMs: number
  maximumMs: number
  operationsPerSecond: number
  checksum: number
  note: string
}

export function runBenchmark(input: unknown, options: unknown = {}): BenchmarkResult {
  const suiteId = validateSuite(input)
  if (!isPlainObject(options)) throw new Error('Options must be a plain object.')
  const allowedOptions = new Set(['iterations', 'samples'])
  const unsupported = Object.keys(options).find(key => !allowedOptions.has(key))
  if (unsupported) throw new Error(`Unsupported option: ${unsupported}.`)

  const iterations = parseBoundedInteger(options.iterations, 'Iterations', DEFAULT_ITERATIONS, MIN_ITERATIONS, MAX_ITERATIONS)
  const samples = parseBoundedInteger(options.samples, 'Samples', DEFAULT_SAMPLES, MIN_SAMPLES, MAX_SAMPLES)
  const warmupIterations = Math.min(100, Math.max(1, Math.floor(iterations * 0.05)))
  const suite = BENCHMARK_SUITES.find(candidate => candidate.id === suiteId)!

  let checksum = runOperations(suiteId, warmupIterations)
  const rawTimes: number[] = []
  for (let sample = 0; sample < samples; sample += 1) {
    const start = now()
    checksum += runOperations(suiteId, iterations)
    const elapsed = now() - start
    if (!Number.isFinite(elapsed) || elapsed < 0) throw new Error('The browser timer returned an invalid measurement.')
    rawTimes.push(elapsed)
  }

  const medianMs = median(rawTimes)
  const meanMs = rawTimes.reduce((sum, value) => sum + value, 0) / rawTimes.length
  const safeMedian = Math.max(medianMs, 0.000001)
  return {
    suite: { ...suite },
    iterationsPerSample: iterations,
    sampleCount: samples,
    warmupIterations,
    sampleTimesMs: rawTimes.map(roundMilliseconds),
    minimumMs: roundMilliseconds(Math.min(...rawTimes)),
    medianMs: roundMilliseconds(medianMs),
    meanMs: roundMilliseconds(meanMs),
    maximumMs: roundMilliseconds(Math.max(...rawTimes)),
    operationsPerSecond: Math.round((iterations * 1000) / safeMedian),
    checksum,
    note: 'Browser-local microbenchmark of a fixed workload; results vary with device, browser, load, and JIT state. Compare runs only under similar conditions. This does not benchmark API endpoints or user-supplied code.',
  }
}

export function run(input: string, options: ToolOptions = {}): string {
  return JSON.stringify(runBenchmark(input, options), null, 2)
}
