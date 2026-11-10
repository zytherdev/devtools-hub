/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/slug-generator/definition.ts')
const implementation = require('../../app/tools/slug-generator/logic.ts')

test('slug-generator follows the per-tool contract and is connected to UniversalTool', () => {
  assert.equal(tool.id, 'slug-generator')
  assert.equal(tool.href, '/slug-generator')
  assert.equal(tool.status, 'implemented')
  assert.equal(typeof implementation.run, 'function')
  assert.match(require('node:fs').readFileSync('app/tools/slug-generator/Tool.tsx', 'utf8'), /UniversalTool/)
})

test('normalizes accented text and punctuation into a lowercase URL slug', () => {
  assert.equal(implementation.run('Olá, Mundo! Página número 2', {}), 'ola-mundo-pagina-numero-2')
})

test('supports Unicode letters, custom separator, and preserved casing', () => {
  assert.equal(implementation.run('東京 Café', { separator: '_', lowercase: 'false' }), '東京_Cafe')
})

test('enforces maximum length without leaving a trailing separator', () => {
  assert.equal(implementation.run('alpha beta gamma', { maxLength: '8' }), 'alpha-be')
  assert.equal(implementation.run('alpha beta', { maxLength: '6' }), 'alpha')
  assert.equal(implementation.run('𐐷𐐷', { maxLength: '1', lowercase: 'false' }), '𐐷')
})

test('returns empty output for text without letters/numbers and rejects invalid options', () => {
  assert.equal(implementation.run('🚀 — !!!', {}), '')
  assert.throws(() => implementation.run('hello', { separator: '.' }), /separator must be/)
  assert.throws(() => implementation.run('hello', { maxLength: '0' }), /maxLength/)
  assert.throws(() => implementation.run('hello', { lowercase: 'yes' }), /lowercase/)
  assert.throws(() => implementation.run('hello', { extra: 'x' }), /Unknown option/)
  assert.throws(() => implementation.run('x'.repeat(100_001), {}), /100,000/)
})
