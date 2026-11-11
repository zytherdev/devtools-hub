/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const { tool } = require('../../app/tools/chmod-calculator/definition.ts')
const implementation = require('../../app/tools/chmod-calculator/logic.ts')

function calculate(mode, options) {
  return JSON.parse(implementation.run(mode, options))
}

test('chmod-calculator follows the implemented tool contract', () => {
  assert.equal(tool.id, 'chmod-calculator')
  assert.equal(tool.href, '/chmod-calculator')
  assert.equal(tool.status, 'implemented')
  assert.equal(tool.badge, '')
  assert.equal(tool.exampleInput, '755')
  assert.deepEqual(tool.defaultOptions, {})
  assert.equal(tool.outputExtension, 'json')
  assert.equal(typeof implementation.run, 'function')
})

test('converts basic three-digit modes to canonical four-digit octal and permission values', () => {
  assert.deepEqual(calculate('755'), {
    octal: '0755',
    symbolic: 'rwxr-xr-x',
    owner: 7,
    group: 5,
    others: 5,
  })
  assert.deepEqual(calculate('644'), {
    octal: '0644',
    symbolic: 'rw-r--r--',
    owner: 6,
    group: 4,
    others: 4,
  })
  assert.deepEqual(calculate('000'), {
    octal: '0000',
    symbolic: '---------',
    owner: 0,
    group: 0,
    others: 0,
  })
})

test('renders setuid, setgid, and sticky bits with lowercase or uppercase markers', () => {
  assert.deepEqual(calculate('4755'), {
    octal: '4755',
    symbolic: 'rwsr-xr-x',
    owner: 7,
    group: 5,
    others: 5,
  })
  assert.deepEqual(calculate('4644'), {
    octal: '4644',
    symbolic: 'rwSr--r--',
    owner: 6,
    group: 4,
    others: 4,
  })
  assert.equal(calculate('2755').symbolic, 'rwxr-sr-x')
  assert.equal(calculate('2644').symbolic, 'rw-r-Sr--')
  assert.equal(calculate('1777').symbolic, 'rwxrwxrwt')
  assert.equal(calculate('1744').symbolic, 'rwxr--r-T')
  assert.equal(calculate('7777').symbolic, 'rwsrwsrwt')
})

test('rejects malformed modes, non-octal digits, oversized input, and non-empty options', () => {
  for (const mode of ['', '7', '77', '77777', '888', '789', ' 755', '755 ', '+755', '0o755', '７５５']) {
    assert.throws(() => implementation.run(mode), /mode|octal|characters/i, `expected ${JSON.stringify(mode)} to be rejected`)
  }
  assert.throws(() => implementation.run(null), /mode|octal/i)
  assert.throws(() => implementation.run('755', { format: 'text' }), /does not accept options/i)
  assert.throws(() => implementation.run('755', null), /options/i)
})

test('the UI uses UniversalTool with this tool slug; conversion has no file or command execution', () => {
  const toolSource = fs.readFileSync(path.join(__dirname, '../../app/tools/chmod-calculator/Tool.tsx'), 'utf8')
  const logicSource = fs.readFileSync(path.join(__dirname, '../../app/tools/chmod-calculator/logic.ts'), 'utf8')
  assert.match(toolSource, /UniversalTool/)
  assert.match(toolSource, /slug=\{tool\.id\}/)
  assert.doesNotMatch(logicSource, /node:fs|node:child_process|execSync|spawnSync|\bchmod\b/i)
})
