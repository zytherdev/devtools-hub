/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const test = require('node:test')
const { tool } = require('../../app/tools/email-validator/definition.ts')
const { run } = require('../../app/tools/email-validator/logic.ts')

const parse = output => JSON.parse(output)

test('email-validator follows the per-tool and shared UI contract', () => {
  assert.equal(tool.id, 'email-validator')
  assert.equal(tool.href, '/email-validator')
  assert.equal(tool.status, 'implemented')
  assert.equal(tool.badge, '')
  assert.deepEqual(tool.defaultOptions, {})
  assert.match(fs.readFileSync('app/tools/email-validator/Tool.tsx', 'utf8'), /UniversalTool/)
})

test('accepts practical dot-atom addresses and normalizes only the domain', () => {
  const result = parse(run('Alex.Lee+updates@Sub.Example.CO.UK'))
  assert.equal(result.valid, true)
  assert.equal(result.localPart, 'Alex.Lee+updates')
  assert.equal(result.domain, 'Sub.Example.CO.UK')
  assert.equal(result.normalized, 'Alex.Lee+updates@sub.example.co.uk')
  assert.equal(result.reason, null)
  assert.match(result.message, /DNS, mailbox existence, and deliverability were not checked/)

  assert.equal(parse(run('a_b%tag@example.xn--p1ai')).valid, true)
})

test('returns clear invalid results for malformed local parts and domains', () => {
  const invalidAddresses = [
    ['plain-address', /one @ separator/],
    ['a@@example.com', /one @ separator/],
    ['@example.com', /local part.*empty/],
    ['user@', /domain.*empty/],
    ['.user@example.com', /dot-atom/],
    ['user.@example.com', /dot-atom/],
    ['first..last@example.com', /dot-atom/],
    ['user name@example.com', /Whitespace/],
    ['user@example', /at least two labels/],
    ['user@-example.com', /Domain labels/],
    ['user@example-.com', /Domain labels/],
    ['user@exa_mple.com', /Domain labels/],
    ['user@example..com', /labels must not be empty/],
    ['user@example.c', /final domain label/],
    ['user@例え.テスト', /ASCII characters/],
  ]
  for (const [address, reason] of invalidAddresses) {
    const result = parse(run(address))
    assert.equal(result.valid, false, address)
    assert.equal(result.normalized, null, address)
    assert.match(result.reason, reason, address)
  }
})

test('enforces local-part, domain-label, and complete address length boundaries', () => {
  assert.equal(parse(run(`${'a'.repeat(64)}@example.com`)).valid, true)
  assert.match(parse(run(`${'a'.repeat(65)}@example.com`)).reason, /local part must be 64/)

  assert.equal(parse(run(`a@${'b'.repeat(63)}.co`)).valid, true)
  assert.match(parse(run(`a@${'b'.repeat(64)}.co`)).reason, /Each domain label/)

  const maxDomainFor254CharAddress = `${'a'.repeat(63)}.${'b'.repeat(63)}.${'c'.repeat(61)}`
  const maxLengthAddress = `${'l'.repeat(64)}@${maxDomainFor254CharAddress}`
  assert.equal(maxLengthAddress.length, 254)
  assert.equal(parse(run(maxLengthAddress)).valid, true)
  assert.match(parse(run(`${'l'.repeat(64)}@${'b'.repeat(63)}.${'c'.repeat(63)}.${'d'.repeat(62)}`)).reason, /254 characters or fewer/)

  assert.throws(() => run('a'.repeat(321)), /320 characters or fewer/)
  assert.throws(() => run(''), /Enter one email address/)
})

test('rejects unsupported options and non-text input', () => {
  assert.equal(parse(run('user@example.com', {})).valid, true)
  assert.throws(() => run('user@example.com', { mode: 'strict' }), /Unknown option/)
  assert.throws(() => run('user@example.com', null), /Options must be a JSON object/)
  assert.throws(() => run(42), /Input must be text/)
})

test('keeps validation local and output bounded', () => {
  const source = fs.readFileSync('app/tools/email-validator/logic.ts', 'utf8')
  assert.doesNotMatch(source, /\b(fetch|XMLHttpRequest|WebSocket)\b/)
  const output = run('user@example.com')
  assert.ok(output.length <= 8192)
})
