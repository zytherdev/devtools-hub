/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const { tool } = require('../../app/tools/subnet-calculator/definition.ts')
const implementation = require('../../app/tools/subnet-calculator/logic.ts')

function calculate(input, options) {
  return JSON.parse(implementation.run(input, options))
}

test('subnet-calculator follows the implemented tool contract', () => {
  assert.equal(tool.id, 'subnet-calculator')
  assert.equal(tool.href, '/subnet-calculator')
  assert.equal(tool.status, 'implemented')
  assert.equal(tool.badge, '')
  assert.equal(tool.exampleInput, '192.168.1.10/24')
  assert.deepEqual(tool.defaultOptions, {})
  assert.equal(tool.outputExtension, 'json')
  assert.equal(typeof implementation.run, 'function')
})

test('calculates IPv4 subnet, range, masks, counts, and input classifications', () => {
  assert.deepEqual(calculate('192.168.1.10/24'), {
    version: 4,
    input: '192.168.1.10/24',
    prefixLength: 24,
    networkAddress: '192.168.1.0',
    broadcastAddress: '192.168.1.255',
    subnetMask: '255.255.255.0',
    wildcardMask: '0.0.0.255',
    firstUsableAddress: '192.168.1.1',
    lastUsableAddress: '192.168.1.254',
    totalAddresses: '256',
    usableHostCount: '254',
    isNetworkAddress: false,
    isBroadcastAddress: false,
  })
  assert.equal(calculate('10.2.3.4/16').networkAddress, '10.2.0.0')
  assert.equal(calculate('10.2.0.0/16').isNetworkAddress, true)
  assert.equal(calculate('10.2.255.255/16').isBroadcastAddress, true)
})

test('handles IPv4 /0, /31, and /32 boundaries without 32-bit number overflow', () => {
  assert.deepEqual(calculate('255.255.255.255/0'), {
    version: 4,
    input: '255.255.255.255/0',
    prefixLength: 0,
    networkAddress: '0.0.0.0',
    broadcastAddress: '255.255.255.255',
    subnetMask: '0.0.0.0',
    wildcardMask: '255.255.255.255',
    firstUsableAddress: '0.0.0.1',
    lastUsableAddress: '255.255.255.254',
    totalAddresses: '4294967296',
    usableHostCount: '4294967294',
    isNetworkAddress: false,
    isBroadcastAddress: true,
  })
  const pointToPoint = calculate('192.0.2.0/31')
  assert.equal(pointToPoint.totalAddresses, '2')
  assert.equal(pointToPoint.usableHostCount, '2')
  assert.equal(pointToPoint.firstUsableAddress, '192.0.2.0')
  assert.equal(pointToPoint.lastUsableAddress, '192.0.2.1')
  const single = calculate('203.0.113.9/32')
  assert.equal(single.totalAddresses, '1')
  assert.equal(single.usableHostCount, '1')
  assert.equal(single.firstUsableAddress, '203.0.113.9')
  assert.equal(single.lastUsableAddress, '203.0.113.9')
})

test('calculates compressed and full IPv6 prefixes, including 128-bit boundaries', () => {
  assert.deepEqual(calculate('2001:0db8:0000:0000:0000:0000:0000:0001/64'), {
    version: 6,
    input: '2001:0db8:0000:0000:0000:0000:0000:0001/64',
    prefixLength: 64,
    networkAddress: '2001:db8::',
    lastAddress: '2001:db8::ffff:ffff:ffff:ffff',
    totalAddresses: '18446744073709551616',
    isNetworkAddress: false,
  })
  assert.equal(calculate('2001:db8::/64').isNetworkAddress, true)
  assert.deepEqual(calculate('ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff/0'), {
    version: 6,
    input: 'ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff/0',
    prefixLength: 0,
    networkAddress: '::',
    lastAddress: 'ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff',
    totalAddresses: '340282366920938463463374607431768211456',
    isNetworkAddress: false,
  })
  assert.equal(calculate('2001:db8::1/128').totalAddresses, '1')
  assert.equal(calculate('::ffff:192.0.2.1/128').networkAddress, '::ffff:c000:201')
})

test('rejects malformed addresses, ambiguous octets, invalid prefixes, and unsupported options', () => {
  const invalid = [
    '', '192.168.1.1', '/24', '192.168.1.1/', '192.168.1.1/24/1',
    ' 192.168.1.1/24', '192.168.1.1/24 ', '192.168.001.1/24',
    '256.0.0.1/24', '1.2.3/24', '1..2.3/24', '1.2.3.+4/24',
    '192.0.2.1/-1', '192.0.2.1/+24', '192.0.2.1/024', '192.0.2.1/33',
    '2001:db8::1/129', '2001:db8::1/064', '2001::db8::1/64',
    '1:2:3:4:5:6:7/64', '1:2:3:4:5:6:7:8:9/64', ':::1/64',
    '2001:db8::gg/64', 'fe80::1%eth0/64', '1.2.3.4::/64',
  ]
  for (const input of invalid) {
    assert.throws(() => implementation.run(input), Error, `expected ${JSON.stringify(input)} to be rejected`)
  }
  assert.throws(() => implementation.run(null), /input|address/i)
  assert.throws(() => implementation.run('192.0.2.1/24', { format: 'text' }), /does not accept options/i)
  assert.throws(() => implementation.run('192.0.2.1/24', null), /options/i)
  assert.throws(() => implementation.run('x'.repeat(65)), /64 characters/i)
})

test('UI is connected to the dynamic slug, exposes CIDR calculation controls, and stays local', () => {
  const toolSource = fs.readFileSync(path.join(__dirname, '../../app/tools/subnet-calculator/Tool.tsx'), 'utf8')
  const logicSource = fs.readFileSync(path.join(__dirname, '../../app/tools/subnet-calculator/logic.ts'), 'utf8')
  assert.match(toolSource, /ToolPanel/)
  assert.match(toolSource, /subnet-cidr-input/)
  assert.match(toolSource, /Calculate subnet/)
  assert.match(toolSource, /Load example/)
  assert.match(toolSource, /Clear/)
  assert.match(logicSource, /export function calculate/)
  assert.doesNotMatch(toolSource + logicSource, /fetch\s*\(|XMLHttpRequest|node:child_process|execSync|spawnSync/)
})
