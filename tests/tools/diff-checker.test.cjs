/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const test = require('node:test')
const { tool } = require('../../app/tools/diff-checker/definition.ts')
const { MAX_INPUT_LENGTH, MAX_LINES_PER_SIDE, run } = require('../../app/tools/diff-checker/logic.ts')

const SEPARATOR = '---8<---'
const input = (original, updated, separator = SEPARATOR) => `${original}\n${separator}\n${updated}`
const HEADERS = '--- Original\n+++ Atualizado'

test('diff-checker está implementado e conectado ao UniversalTool', () => {
  assert.equal(tool.id, 'diff-checker')
  assert.equal(tool.href, '/diff-checker')
  assert.equal(tool.status, 'implemented')
  assert.equal(tool.outputExtension, 'txt')
  assert.deepEqual(tool.defaultOptions, {})
  assert.match(tool.exampleInput, /\n---8<---\n/)
  const component = fs.readFileSync(require.resolve('../../app/tools/diff-checker/Tool.tsx'), 'utf8')
  assert.match(component, /<UniversalTool\s+tool=\{tool\}\s+slug=\{tool\.id\}\s*\/>/)
})

test('gera somente os cabeçalhos para textos iguais e ignora diferença de newline final', () => {
  assert.equal(run(input('linha 1\nlinha 2', 'linha 1\nlinha 2\n')), `${HEADERS}\n linha 1\n linha 2`)
  assert.equal(run(input('', '')), HEADERS)
})

test('marca linhas inseridas com + e preserva linhas comuns com espaço', () => {
  assert.equal(run(input('a\nc', 'a\nb\nc')), `${HEADERS}\n a\n+b\n c`)
})

test('marca linhas removidas com -', () => {
  assert.equal(run(input('a\nb\nc', 'a\nc')), `${HEADERS}\n a\n-b\n c`)
})

test('representa substituições deterministicamente como remoção seguida de adição', () => {
  assert.equal(run(input('antes', 'depois')), `${HEADERS}\n-antes\n+depois`)
})

test('compara linhas vazias sem confundi-las com newline final', () => {
  assert.equal(run(input('a\n\n\n', 'a\nx')), `${HEADERS}\n a\n-\n-\n+x`)
  assert.equal(run(input('\n', '')), `${HEADERS}\n-`)
})

test('aceita separador personalizado e quebras de linha CRLF', () => {
  const customInput = input('velho', 'novo', '===')
  assert.equal(run(customInput.replace(/\n/g, '\r\n'), { separator: '===' }), `${HEADERS}\n-velho\n+novo`)
})

test('aceita o limite de caracteres e rejeita entrada maior', () => {
  const accepted = `${'x'.repeat(MAX_INPUT_LENGTH - ('\n' + SEPARATOR).length)}\n${SEPARATOR}`
  assert.equal(accepted.length, MAX_INPUT_LENGTH)
  assert.equal(run(accepted), `${HEADERS}\n-${'x'.repeat(MAX_INPUT_LENGTH - ('\n' + SEPARATOR).length)}`)

  const rejected = `${'x'.repeat(MAX_INPUT_LENGTH - ('\n' + SEPARATOR).length + 1)}\n${SEPARATOR}`
  assert.equal(rejected.length, MAX_INPUT_LENGTH + 1)
  assert.throws(() => run(rejected), /no máximo 200\.000 caracteres/i)
})

test('aceita até 2.000 linhas por lado e rejeita 2.001', () => {
  const maxSide = Array(MAX_LINES_PER_SIDE).fill('linha').join('\n')
  assert.ok(run(input(maxSide, '')).startsWith(HEADERS))
  const tooMany = Array(MAX_LINES_PER_SIDE + 1).fill('linha').join('\n')
  assert.throws(() => run(input(tooMany, '')), /Original.*2\.000 linhas/i)
  assert.throws(() => run(input('', tooMany)), /Atualizado.*2\.000 linhas/i)
})

test('rejeita tipo de entrada inválido, separador ausente ou repetido', () => {
  assert.throws(() => run(null), /entrada deve ser uma string/i)
  assert.throws(() => run('sem marcador'), /exatamente uma linha/i)
  assert.throws(() => run(input('a', 'b') + `\n${SEPARATOR}`), /mais de uma linha/i)
})

test('rejeita opções inválidas e separadores fora das regras', () => {
  assert.throws(() => run(input('a', 'b'), { unexpected: 'sim' }), /opção desconhecida/i)
  assert.throws(() => run(input('a', 'b'), null), /opções devem ser um objeto/i)
  assert.throws(() => run(input('a', 'b'), []), /opções devem ser um objeto/i)
  assert.throws(() => run(input('a', 'b'), { separator: '' }), /não pode ser vazia/i)
  assert.throws(() => run(input('a', 'b'), { separator: 's'.repeat(81) }), /no máximo 80 caracteres/i)
  assert.throws(() => run(input('a', 'b'), { separator: 'linha\nquebrada' }), /caracteres de controle/i)
  assert.throws(() => run(input('a', 'b'), { separator: 42 }), /deve ser uma string/i)
})
