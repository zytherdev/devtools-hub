'use client'

import { useMemo, useState } from 'react'
import type { ToolOptions } from '@/app/tools/types'
import type { ToolDefinition } from '@/app/tools/types'
import { runTool } from '@/app/lib/tools/toolEngine'

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

function getOutputExtension(slug: string, configuredExtension: string, options: ToolOptions) {
  if (slug === 'toml-json-converter' && options.direction === 'json-to-toml') return 'toml'
  return configuredExtension || 'txt'
}

function getMimeType(extension: string) {
  const mimeTypes: Record<string, string> = {
    csv: 'text/csv;charset=utf-8',
    html: 'text/html;charset=utf-8',
    json: 'application/json;charset=utf-8',
    js: 'text/javascript;charset=utf-8',
    md: 'text/markdown;charset=utf-8',
    svg: 'image/svg+xml;charset=utf-8',
    toml: 'text/plain;charset=utf-8',
    txt: 'text/plain;charset=utf-8',
    xml: 'application/xml;charset=utf-8',
    yaml: 'text/yaml;charset=utf-8',
    yml: 'text/yaml;charset=utf-8',
  }
  return mimeTypes[extension] ?? 'text/plain;charset=utf-8'
}

export function UniversalTool({ tool, slug }: { tool: ToolDefinition; slug: string }) {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [optionsText, setOptionsText] = useState(JSON.stringify(tool.defaultOptions, null, 2))
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
    const extension = getOutputExtension(slug, tool.outputExtension, resultOptions)
    const url = URL.createObjectURL(new Blob([output], { type: getMimeType(extension) }))
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
            <button type="button" onClick={() => { setInput(tool.exampleInput); setOutput(''); setError('') }} className="text-xs font-medium text-secondary hover:text-primary">Load example</button>
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
          {svgData && <div className="mt-3 flex items-center gap-3 rounded-xl border border-border bg-panel p-3"><div role="img" aria-label="Generated SVG preview" style={{ backgroundImage: `url("${svgData}")` }} className="h-16 w-16 rounded-lg border border-border bg-white bg-contain bg-center bg-no-repeat p-1" /><span className="text-sm text-secondary">SVG preview</span></div>}
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
