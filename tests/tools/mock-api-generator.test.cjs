/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const test = require('node:test')
const { tool } = require('../../app/tools/mock-api-generator/definition.ts')
const { run } = require('../../app/tools/mock-api-generator/logic.ts')
const template = { name: 'Ada', role: 'engineer', profile: { active: true, tags: ['api'] } }
const input = value => JSON.stringify(value)

test('mock-api-generator está implementado e conectado ao UniversalTool com saída JSON', () => {
  assert.equal(tool.id, 'mock-api-generator')
  assert.equal(tool.href, '/mock-api-generator')
  assert.equal(tool.status, 'implemented')
  assert.equal(tool.outputExtension, 'json')
  assert.deepEqual(tool.defaultOptions, { count: '3', wrapper: 'data', idField: 'id' })
  const component = fs.readFileSync(require.resolve('../../app/tools/mock-api-generator/Tool.tsx'), 'utf8')
  assert.match(component, /<UniversalTool\s+tool=\{tool\}\s+slug="mock-api-generator"\s*\/>/)
})

test('gera o exemplo solicitado com wrapper, contagem e IDs incrementais', () => {
  const actual = JSON.parse(run('{"name":"Ada","role":"engineer"}', { count: '3', wrapper: 'data', idField: 'id' }))
  assert.deepEqual(actual, {
    data: [
      { name: 'Ada', role: 'engineer', id: 1 },
      { name: 'Ada', role: 'engineer', id: 2 },
      { name: 'Ada', role: 'engineer', id: 3 },
    ],
    meta: { count: 3 },
  })
})

test('cria cópias independentes dos objetos e valores aninhados', () => {
  const result = JSON.parse(run(input(template), { count: '2', wrapper: 'items', idField: '' }))
  assert.notStrictEqual(result.items[0], result.items[1])
  assert.notStrictEqual(result.items[0].profile, result.items[1].profile)
  assert.notStrictEqual(result.items[0].profile.tags, result.items[1].profile.tags)
  result.items[0].profile.tags.push('changed')
  assert.deepEqual(result.items[1].profile.tags, ['api'])
})

test('adiciona ID somente à raiz e substitui eventual propriedade raiz homônima', () => {
  const source = { id: 'template', nested: { id: 'nested' } }
  const result = JSON.parse(run(input(source), { count: '2', wrapper: 'data', idField: 'id' }))
  assert.deepEqual(result.data.map(row => row.id), [1, 2])
  assert.deepEqual(result.data.map(row => row.nested.id), ['nested', 'nested'])
  assert.equal(source.id, 'template')
})

test('wrapper vazio retorna um array cru e idField vazio omite os IDs', () => {
  const result = JSON.parse(run(input(template), { count: '2', wrapper: '', idField: '' }))
  assert.ok(Array.isArray(result))
  assert.equal(result.length, 2)
  assert.equal(Object.hasOwn(result[0], 'id'), false)
})

test('aceita limites válidos de count, wrapper e idField', () => {
  assert.equal(JSON.parse(run('{}', { count: '1', wrapper: 'w'.repeat(64), idField: 'i'.repeat(64) }))[`w${'w'.repeat(63)}`][0][`i${'i'.repeat(63)}`], 1)
  assert.equal(JSON.parse(run('{}', { count: '100', wrapper: '', idField: '' })).length, 100)
  const padded = `${' '.repeat(100_000 - 2)}{}`
  assert.equal(padded.length, 100_000)
  assert.equal(JSON.parse(run(padded, { count: '1', wrapper: '', idField: '' })).length, 1)
})

test('rejeita JSON inválido, raiz que não seja objeto e entradas acima de 100.000 caracteres', () => {
  assert.throws(() => run(''), /objeto-template/i)
  assert.throws(() => run('{quebrado'), /JSON inválido/i)
  for (const invalidRoot of ['null', '[]', '"texto"', '42', 'true']) {
    assert.throws(() => run(invalidRoot), /objeto JSON simples/i)
  }
  assert.throws(() => run(`${' '.repeat(100_001)}{}`), /100\.000 caracteres/i)
})

test('rejeita profundidade excessiva, números não finitos e coleções excessivas', () => {
  let nested = '{}'
  for (let index = 0; index < 21; index++) nested = `{"child":${nested}}`
  assert.throws(() => run(nested), /profundidade máxima de 20/i)
  assert.throws(() => run('{"value":1e400}'), /número fora dos limites/i)
  const tooManyArrayItems = `[${Array(10_001).fill('null').join(',')}]`
  assert.throws(() => run(`{"items":${tooManyArrayItems}}`), /Arrays podem conter no máximo 10\.000 itens/i)
  const entries = Array.from({ length: 10_001 }, (_, index) => `"k${index}":0`).join(',')
  assert.ok(entries.length < 100_000)
  assert.throws(() => run(`{${entries}}`), /Objetos podem conter no máximo 10\.000 propriedades/i)
})

test('valida opções, contagem, nomes e caracteres de controle', () => {
  assert.throws(() => run('{}', { unexpected: 'yes' }), /Opção não reconhecida/i)
  assert.throws(() => run('{}', { count: '0' }), /count deve ser um número inteiro/i)
  assert.throws(() => run('{}', { count: '101' }), /count deve ser um número inteiro/i)
  assert.throws(() => run('{}', { count: '1.5' }), /count deve ser um número inteiro/i)
  assert.throws(() => run('{}', { wrapper: 'w'.repeat(65) }), /wrapper deve ter no máximo 64/i)
  assert.throws(() => run('{}', { idField: 'i'.repeat(65) }), /idField deve ter no máximo 64/i)
  assert.throws(() => run('{}', { wrapper: 'bad\nname' }), /wrapper não pode conter caracteres de controle/i)
  assert.throws(() => run('{}', { idField: 'bad\u0085name' }), /idField não pode conter caracteres de controle/i)
  assert.throws(() => run('{}', { wrapper: 'meta' }), /reservado/i)
})

test('rejeita saída que ultrapasse 1 MB', () => {
  const largeTemplate = { payload: 'x'.repeat(12_000) }
  assert.throws(() => run(input(largeTemplate), { count: '100', wrapper: '', idField: '' }), /saída excede o limite de 1\.000\.000 bytes/i)
})

test('trata com segurança nomes de propriedade especiais', () => {
  const source = JSON.parse('{"__proto__":{"safe":true}}')
  const result = JSON.parse(run(input(source), { count: '1', wrapper: '__proto__', idField: '__proto__' }))
  assert.deepEqual(result.__proto__[0].__proto__, 1)
  assert.equal(Object.getPrototypeOf(result), Object.prototype)
})
