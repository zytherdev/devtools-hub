'use client'

import { useMemo, useState } from 'react'
import type { ToolOptions } from '../lib/tools/toolEngine'
import { runTool } from '../lib/tools/toolEngine'
import type { ToolDefinition } from '../lib/utils/tools'

const samples: Record<string, string> = {
  'html-beautifier': '<main><h1>Tools</h1><p>Format this markup.</p><ul><li>Fast</li><li>Private</li></ul></main>',
  'markdown-to-html': '# Hello, developer\n\nTurn **Markdown** into HTML.\n\n- Fast\n- In your browser\n\n[Learn more](https://example.com)',
  'favicon-generator': 'DH',
  'xml-formatter': '<?xml version="1.0"?><catalog><item id="1"><name>DevTools</name><active>true</active></item></catalog>',
  'yaml-formatter': 'name: DevTools Hub\nversion: 1\ntools:\n  - formatter\n  - converter\nprivate: true',
  'csv-formatter': 'name,category,free\nJSON Formatter,data,true\nUUID Generator,generator,true',
  'toml-formatter': 'name="DevTools Hub"\nversion=1\n\n[tools]\ncount=5\nprivate=true',
  'xml-to-json': '<catalog><item id="1"><name>DevTools</name></item><item id="2"><name>Hub</name></item></catalog>',
  'yaml-to-json': 'app:\n  name: DevTools Hub\n  version: 1\nfeatures:\n  - private\n  - fast',
  'json-to-xml': '{\n  "catalog": { "item": [{ "id": 1 }, { "id": 2 }] }\n}',
  'csv-to-json': 'name,score,active\nAda,42,true\nGrace,36,false',
  'toml-json-converter': '[server]\nhost = "localhost"\nport = 8080\n',
  'php-json-converter': 'array("name" => "Ada", "active" => true, "roles" => array("editor", "admin"))',
  'json-schema-generator': '{\n  "name": "Ada",\n  "active": true,\n  "roles": ["editor", "admin"]\n}',
  'base64-encoder': 'DevTools Hub — text is encoded as UTF-8.',
}

const optionSamples: Record<string, ToolOptions> = {
  'favicon-generator': { foreground: '#ffffff', background: '#347a58', shape: 'rounded' },
  'yaml-formatter': { indent: '2', sortKeys: 'false' },
  'csv-formatter': { delimiter: ',' },
  'json-to-xml': { rootName: 'root' },
  'csv-to-json': { delimiter: ',', headers: 'true', structure: 'objects', infer: 'true', trimHeaders: 'true', rowWidth: 'pad', blankRows: 'skip', indent: '2' },
  'toml-json-converter': { direction: 'toml-to-json', indent: '2' },
  'php-json-converter': { format: 'array', indent: '2' },
  'json-schema-generator': { draft: '2020-12', required: 'observed', additionalProperties: 'true', indent: '2', title: 'Example' },
  'base64-encoder': { operation: 'encode', urlSafe: 'false', padding: 'true', allowWhitespace: 'false', allowUnpadded: 'false' },
}

const extensions: Record<string, string> = {
  'favicon-generator': 'svg',
  'markdown-to-html': 'html',
  'xml-formatter': 'xml',
  'yaml-formatter': 'yaml',
  'csv-formatter': 'csv',
  'toml-formatter': 'toml',
  'xml-to-json': 'json',
  'yaml-to-json': 'json',
  'json-to-xml': 'xml',
  'csv-to-json': 'json',
  'php-json-converter': 'json',
  'json-schema-generator': 'json',
  'base64-encoder': 'txt',
}

function parseOptions(value: string): ToolOptions {
  const parsed: unknown = JSON.parse(value || '{}')
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Tool options must be a JSON object.')
  }
  const options: ToolOptions = {}
  for (const [key, item] of Object.entries(parsed)) {
    if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') options[key] = String(item)
    else throw new Error(`Option "${key}" must be a string, number, or boolean.`)
  }
  return options
}

export function UniversalTool({ tool, slug }: { tool: ToolDefinition; slug: string }) {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [optionsText, setOptionsText] = useState(JSON.stringify(optionSamples[slug] ?? {}, null, 2))
  const [resultOptions, setResultOptions] = useState<ToolOptions>({})
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const svgData = useMemo(() => output.trim().startsWith('<svg') ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(output)}` : '', [output])

  async function process() {
    setError('')
    setCopied(false)
    setBusy(true)
    try {
      const options = parseOptions(optionsText)
      const result = await runTool(slug, input, options)
      setOutput(result)
      setResultOptions(options)
    } catch (cause) {
      setOutput('')
      setError(cause instanceof Error ? cause.message : 'Could not process this input.')
    } finally {
      setBusy(false)
    }
  }

  async function copy() {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setError('Clipboard access was denied by this browser.')
    }
  }

  function download() {
    if (!output) return
    const extension = slug === 'toml-json-converter' && resultOptions.direction === 'json-to-toml'
      ? 'toml'
      : extensions[slug] ?? 'txt'
    const mime = extension === 'svg' ? 'image/svg+xml' : extension === 'json' ? 'application/json' : 'text/plain;charset=utf-8'
    const url = URL.createObjectURL(new Blob([output], { type: mime }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${slug}.${extension}`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  function clear() {
    setInput('')
    setOutput('')
    setError('')
    setCopied(false)
  }

  return (
    <div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="tool-panel p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <label htmlFor="tool-input" className="text-sm font-semibold text-primary">Input</label>
            <button type="button" onClick={() => { setInput(samples[slug] ?? ''); setOutput(''); setError('') }} className="text-xs font-medium text-secondary hover:text-primary">Load example</button>
          </div>
          <textarea
            id="tool-input"
            value={input}
            onChange={event => setInput(event.target.value)}
            spellCheck={false}
            placeholder={`Paste input for ${tool.name.toLowerCase()}…`}
            onKeyDown={event => {
              if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                event.preventDefault()
                void process()
              }
            }}
            className="min-h-72 w-full resize-y rounded-xl border border-border bg-input p-4 font-mono text-sm leading-6 text-primary placeholder:text-secondary focus:border-[#347a58] focus:outline-none"
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-secondary">{input.length.toLocaleString()} characters · Ctrl/⌘ + Enter to run</span>
            <button type="button" onClick={clear} className="text-xs text-secondary hover:text-primary">Clear</button>
          </div>
        </section>

        <section className="tool-panel p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <label htmlFor="tool-output" className="text-sm font-semibold text-primary">Output</label>
            <span className="text-xs text-secondary">{output.length ? `${output.length.toLocaleString()} chars` : 'Ready'}</span>
          </div>
          <textarea id="tool-output" value={output} readOnly spellCheck={false} placeholder="Your result will appear here…" className="min-h-72 w-full resize-y rounded-xl border border-border bg-input-readonly p-4 font-mono text-sm leading-6 text-primary placeholder:text-secondary focus:outline-none" />
          {svgData && <div className="mt-3 flex items-center gap-3 rounded-xl border border-border bg-panel p-3"><div role="img" aria-label="Generated favicon preview" style={{ backgroundImage: `url("${svgData}")` }} className="h-16 w-16 rounded-lg border border-border bg-white bg-contain bg-center bg-no-repeat p-1" /><span className="text-sm text-secondary">SVG preview</span></div>}
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={copy} disabled={!output} className="btn btn-outline text-sm disabled:cursor-not-allowed disabled:opacity-40"><i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'}`} aria-hidden="true" />{copied ? 'Copied' : 'Copy'}</button>
            <button type="button" onClick={download} disabled={!output} className="btn btn-outline text-sm disabled:cursor-not-allowed disabled:opacity-40"><i className="fa-solid fa-download" aria-hidden="true" />Download</button>
          </div>
        </section>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto]">
        <details className="tool-panel p-4">
          <summary className="cursor-pointer text-sm font-medium text-primary">Options (JSON)</summary>
          <textarea value={optionsText} onChange={event => setOptionsText(event.target.value)} spellCheck={false} aria-label="Tool options as JSON" className="mt-3 min-h-24 w-full rounded-lg border border-border bg-input p-3 font-mono text-xs text-primary focus:outline-none" />
        </details>
        <div className="flex flex-col justify-end gap-2">
          <button type="button" onClick={process} disabled={busy} className="btn btn-primary min-h-11 px-6 text-sm disabled:opacity-60"><i className={`fa-solid ${busy ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'}`} aria-hidden="true" />{busy ? 'Processing…' : 'Run tool'}</button>
          <p className="max-w-56 text-center text-[11px] leading-4 text-secondary">This tool processes data locally in your browser.</p>
        </div>
      </div>
      {error && <p role="alert" className="mt-4 rounded-xl border border-red-300/50 bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300"><i className="fa-solid fa-circle-exclamation mr-2" aria-hidden="true" />{error}</p>}
      <div className="mt-4 text-xs text-secondary">Tip: press <kbd className="rounded border border-border px-1.5 py-0.5">Ctrl</kbd> + <kbd className="rounded border border-border px-1.5 py-0.5">Enter</kbd> after entering data.</div>
    </div>
  )
}
