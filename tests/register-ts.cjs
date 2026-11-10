/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs')
const path = require('node:path')
const Module = require('node:module')
const ts = require('typescript')

const root = path.resolve(__dirname, '..')
const resolveFilename = Module._resolveFilename
Module._resolveFilename = function resolveToolAlias(request, parent, isMain, options) {
  const resolvedRequest = request.startsWith('@/')
    ? path.resolve(root, request.slice(2))
    : request
  return resolveFilename.call(this, resolvedRequest, parent, isMain, options)
}

require.extensions['.ts'] = (module, fileName) => {
  const source = fs.readFileSync(fileName, 'utf8')
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
    fileName,
  }).outputText
  module._compile(output, fileName)
}
