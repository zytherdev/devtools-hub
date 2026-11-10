'use client'

import { useMemo, useState } from 'react'
import type { ToolOptions } from '../lib/tools/toolEngine'
import { runTool } from '../lib/tools/toolEngine'

export interface ToolInfo { id: string; name: string; description: string; icon: string; color: string; href: string }

const samples: Record<string, string> = {
  'html-beautifier': '<main><h1>Tools</h1><p>Format this markup.</p><ul><li>Fast</li><li>Private</li></ul></main>',
  'markdown-to-html': '# Hello, developer\n\nTurn **Markdown** into HTML.\n\n- Fast\n- In your browser\n\n[Learn more](https://example.com)',
  'favicon-generator': 'DH',
  'xml-formatter': '<?xml version="1.0"?><catalog><item id="1"><name>DevTools</name><active>true</active></item></catalog>',
  'yaml-formatter': 'name: DevTools Hub\nversion: 1\ntools:\n  - formatter\n  - converter\nprivate: true',
  'csv-formatter': 'name,category,free\nJSON Formatter,data,true\nUUID Generator,generator,true',
  'toml-formatter': 'name="DevTools Hub"\nversion=1\n\n[tools]\ncount=86\nprivate=true',
  'xml-to-json': '<catalog><item id="1"><name>DevTools</name></item><item id="2"><name>Hub</name></item></catalog>',
  'yaml-to-json': 'app:\n  name: DevTools Hub\n  version: 1\nfeatures:\n  - private\n  - fast',
  'json-to-xml': '{\n  "catalog": { "item": [{ "id": 1 }, { "id": 2 }] }\n}',
}
const optionSamples: Record<string, ToolOptions> = {
  'favicon-generator': { foreground: '#ffffff', background: '#347a58', shape: 'rounded' },
  'yaml-formatter': { indent: '2', sortKeys: 'false' },
  'csv-formatter': { delimiter: ',' },
  'json-to-xml': { rootName: 'root' },
}

export function UniversalTool({ tool, slug }: { tool: ToolInfo; slug: string }) {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [optionsText, setOptionsText] = useState(JSON.stringify(optionSamples[slug] ?? {}, null, 2))
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const svgData = useMemo(() => output.trim().startsWith('<svg') ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(output)}` : '', [output])

  async function process() {
    setError('')
    setCopied(false)
    setBusy(true)
    try {
      const options = JSON.parse(optionsText || '{}') as ToolOptions
      const result = await runTool(slug, input, options)
      setOutput(result)
    } catch (cause) {
      setOutput('')
      setError(cause instanceof Error ? cause.message : 'Could not process this input.')
    } finally { setBusy(false) }
  }

  async function copy() {
    if (!output) return
    try { await navigator.clipboard.writeText(output); setCopied(true); window.setTimeout(() => setCopied(false), 1800) }
    catch { setError('Clipboard access was denied by this browser.') }
  }

  function download() {
    if (!output) return
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
    }
    const extension = extensions[slug] ?? 'txt'
    const blob = new Blob([output], { type: extension === 'svg' ? 'image/svg+xml' : 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${slug}.${extension}`; anchor.click(); URL.revokeObjectURL(url)
  }

  return <div>
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="tool-panel p-4 sm:p-5"><div className="mb-3 flex items-center justify-between"><label htmlFor="tool-input" className="text-sm font-semibold text-primary">Input</label><button type="button" onClick={() => { setInput(samples[slug] ?? ''); setOutput(''); setError('') }} className="text-xs font-medium text-secondary hover:text-primary">Load example</button></div><textarea id="tool-input" value={input} onChange={event => setInput(event.target.value)} spellCheck={false} placeholder={`Paste input for ${tool.name.toLowerCase()}…`} onKeyDown={event => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); void process() } }} className="min-h-72 w-full resize-y rounded-xl border border-border bg-input p-4 font-mono text-sm leading-6 text-primary placeholder:text-secondary focus:border-[#347a58] focus:outline-none" /><div className="mt-3 flex flex-wrap items-center justify-between gap-3"><span className="text-xs text-secondary">{input.length.toLocaleString()} characters · Ctrl/⌘ + Enter to run</span><button type="button" onClick={() => { setInput(''); setOutput(''); setError('') }} className="text-xs text-secondary hover:text-primary">Clear</button></div>
      </section>
      <section className="tool-panel p-4 sm:p-5"><div className="mb-3 flex items-center justify-between"><label htmlFor="tool-output" className="text-sm font-semibold text-primary">Output</label><span className="text-xs text-secondary">{output.length ? `${output.length.toLocaleString()} chars` : 'Ready'}</span></div><textarea id="tool-output" value={output} readOnly spellCheck={false} placeholder="Your result will appear here…" className="min-h-72 w-full resize-y rounded-xl border border-border bg-input-readonly p-4 font-mono text-sm leading-6 text-primary placeholder:text-secondary focus:outline-none" />{svgData && <div className="mt-3 flex items-center gap-3 rounded-xl border border-border bg-panel p-3"><div role="img" aria-label="Generated favicon preview" style={{ backgroundImage: `url("${svgData}")` }} className="h-16 w-16 rounded-lg border border-border bg-white bg-contain bg-center bg-no-repeat p-1" /><span className="text-sm text-secondary">SVG preview</span></div>}<div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={copy} disabled={!output} className="btn btn-outline text-sm disabled:cursor-not-allowed disabled:opacity-40"><i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'}`} aria-hidden="true" />{copied ? 'Copied' : 'Copy'}</button><button type="button" onClick={download} disabled={!output} className="btn btn-outline text-sm disabled:cursor-not-allowed disabled:opacity-40"><i className="fa-solid fa-download" aria-hidden="true" />Download</button></div></section>
    </div>
    <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto]">
      <details className="tool-panel p-4"><summary className="cursor-pointer text-sm font-medium text-primary">Options (JSON)</summary><textarea value={optionsText} onChange={event => setOptionsText(event.target.value)} spellCheck={false} aria-label="Tool options as JSON" className="mt-3 min-h-24 w-full rounded-lg border border-border bg-input p-3 font-mono text-xs text-primary focus:outline-none" /></details>
      <div className="flex flex-col justify-end gap-2"><button type="button" onClick={process} disabled={busy} className="btn btn-primary min-h-11 px-6 text-sm disabled:opacity-60"><i className={`fa-solid ${busy ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'}`} aria-hidden="true" />{busy ? 'Processing…' : 'Run tool'}</button><p className="max-w-56 text-center text-[11px] leading-4 text-secondary">Your input is processed locally and is not uploaded.</p></div>
    </div>
    {error && <p role="alert" className="mt-4 rounded-xl border border-red-300/50 bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300"><i className="fa-solid fa-circle-exclamation mr-2" aria-hidden="true" />{error}</p>}
    <div className="mt-4 text-xs text-secondary">Tip: press <kbd className="rounded border border-border px-1.5 py-0.5">Ctrl</kbd> + <kbd className="rounded border border-border px-1.5 py-0.5">Enter</kbd> after entering data.</div>
  </div>
}
