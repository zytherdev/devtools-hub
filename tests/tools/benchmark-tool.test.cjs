/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const { tool } = require('../../app/tools/benchmark-tool/definition.ts')
const implementation = require('../../app/tools/benchmark-tool/logic.ts')
const uiSource = fs.readFileSync(path.join(__dirname, '../../app/tools/benchmark-tool/Tool.tsx'), 'utf8')
const logicSource = fs.readFileSync(path.join(__dirname, '../../app/tools/benchmark-tool/logic.ts'), 'utf8')

test('benchmark-tool is implemented and connected to the shared tool UI', () => {
  assert.equal(tool.id, 'benchmark-tool')
  assert.equal(tool.href, '/benchmark-tool')
  assert.equal(tool.status, 'implemented')
  assert.equal(tool.badge, '')
  assert.equal(tool.exampleInput, 'array-map')
  assert.equal(typeof implementation.run, 'function')
  assert.match(uiSource, /UniversalTool/)
})

test('each fixed workload returns bounded timing and summary metrics', () => {
  for (const suite of implementation.BENCHMARK_SUITES) {
    const result = JSON.parse(implementation.run(suite.id, { iterations: '20', samples: '3' }))
    assert.equal(result.suite.id, suite.id)
    assert.equal(result.iterationsPerSample, 20)
    assert.equal(result.sampleCount, 3)
    assert.equal(result.sampleTimesMs.length, 3)
    assert.ok(result.sampleTimesMs.every(value => Number.isFinite(value) && value >= 0))
    assert.ok(Number.isFinite(result.minimumMs))
    assert.ok(Number.isFinite(result.medianMs))
    assert.ok(Number.isFinite(result.meanMs))
    assert.ok(Number.isFinite(result.maximumMs))
    assert.ok(Number.isSafeInteger(result.operationsPerSecond) && result.operationsPerSecond > 0)
    assert.ok(Number.isSafeInteger(result.checksum))
    assert.match(result.note, /results vary/i)
  }
})

test('runner uses defaults and honors inclusive iteration and sample boundaries', () => {
  const defaults = implementation.runBenchmark('map-lookup')
  assert.equal(defaults.iterationsPerSample, implementation.DEFAULT_ITERATIONS)
  assert.equal(defaults.sampleCount, implementation.DEFAULT_SAMPLES)
  assert.equal(defaults.sampleTimesMs.length, implementation.DEFAULT_SAMPLES)
  assert.equal(implementation.runBenchmark('string-assembly', { iterations: '1', samples: '1' }).iterationsPerSample, 1)
  const maximum = implementation.runBenchmark('array-map', { iterations: String(implementation.MAX_ITERATIONS), samples: String(implementation.MAX_SAMPLES) })
  assert.equal(maximum.iterationsPerSample, implementation.MAX_ITERATIONS)
  assert.equal(maximum.sampleCount, implementation.MAX_SAMPLES)
})

test('runner rejects unknown suites, unsupported options, invalid strings, and out-of-range values', () => {
  assert.throws(() => implementation.runBenchmark('unknown'), /Unknown suite/)
  assert.throws(() => implementation.runBenchmark('x'.repeat(implementation.MAX_SUITE_ID_LENGTH + 1)), /Suite ID must be/)
  assert.throws(() => implementation.runBenchmark(null), /Choose a benchmark suite/)
  assert.throws(() => implementation.runBenchmark('array-map', null), /plain object/)
  assert.throws(() => implementation.runBenchmark('array-map', { arbitrary: 'value' }), /Unsupported option/)
  assert.throws(() => implementation.runBenchmark('array-map', { iterations: '0' }), /Iterations must be/)
  assert.throws(() => implementation.runBenchmark('array-map', { iterations: '10001' }), /Iterations must be/)
  assert.throws(() => implementation.runBenchmark('array-map', { iterations: '1.5' }), /Iterations must be/)
  assert.throws(() => implementation.runBenchmark('array-map', { samples: '10' }), /Samples must be/)
  assert.throws(() => implementation.runBenchmark('array-map', { samples: 2 }), /Samples must be/)
})

test('benchmark workloads never evaluate user code or perform network requests', () => {
  assert.doesNotMatch(logicSource, /\beval\s*\(|new\s+Function\s*\(|\bfetch\s*\(/)
  assert.match(logicSource, /does not benchmark API endpoints or user-supplied code/)
  assert.match(uiSource, /UniversalTool/)
})
