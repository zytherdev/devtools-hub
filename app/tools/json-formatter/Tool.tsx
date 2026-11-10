'use client'

import { useState } from 'react'
import { ToolPanel } from '@/app/components/ToolPanel'
import { tool } from './definition'
import { run, validateJSON, type FormatterMode } from './logic'

type FileFormat = { extension: string; mimeType: string; name: string }
const outputFormats: Record<FormatterMode, FileFormat> = {
  format: { extension: 'json', mimeType: 'application/json;charset=utf-8', name: 'formatted' },
  minify: { extension: 'json', mimeType: 'application/json;charset=utf-8', name: 'minified' },
  validate: { extension: 'json', mimeType: 'application/json;charset=utf-8', name: 'validated' },
  sort: { extension: 'json', mimeType: 'application/json;charset=utf-8', name: 'sorted' },
  csv: { extension: 'csv', mimeType: 'text/csv;charset=utf-8', name: 'converted' },
  yaml: { extension: 'yaml', mimeType: 'text/yaml;charset=utf-8', name: 'converted' },
  escape: { extension: 'txt', mimeType: 'text/plain;charset=utf-8', name: 'escaped' },
  unescape: { extension: 'txt', mimeType: 'text/plain;charset=utf-8', name: 'unescaped' },
}

const modes: { value: FormatterMode; label: string; icon: string }[] = [
  { value: 'format', label: 'Format', icon: 'fa-bars' },
  { value: 'minify', label: 'Minify', icon: 'fa-compress' },
  { value: 'validate', label: 'Validate', icon: 'fa-check-circle' },
  { value: 'sort', label: 'Sort Keys', icon: 'fa-sort' },
  { value: 'csv', label: 'To CSV', icon: 'fa-table' },
  { value: 'yaml', label: 'To YAML', icon: 'fa-code' },
  { value: 'escape', label: 'Escape', icon: 'fa-forward' },
  { value: 'unescape', label: 'Unescape', icon: 'fa-backward' },
]

export default function JSONFormatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<FormatterMode>('format')
  const [indentSize, setIndentSize] = useState(2)
  const [protectCSVFormulas, setProtectCSVFormulas] = useState(true)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('Ready')
  const [isValid, setIsValid] = useState<boolean | null>(null)

  function handleProcess() {
    setOutput('')
    setError('')
    setIsValid(null)
    if (mode === 'validate') {
      const validation = validateJSON(input)
      if (!validation.valid) {
        setIsValid(false)
        setError(validation.error ?? 'Invalid JSON.')
        setStatus('Invalid JSON. Correct the input and validate again.')
        return
      }
      try {
        setOutput(run(input, { mode, indentSize }))
        setIsValid(true)
        setStatus('Valid JSON.')
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Could not format the validated JSON.')
        setStatus('Could not process the input.')
      }
      return
    }

    if (!input.trim()) {
      setError('Paste JSON or text in the input before processing.')
      setStatus('Input is required.')
      return
    }

    try {
      const result = run(input, { mode, indentSize, escapeFormulaInjection: protectCSVFormulas })
      setOutput(result)
      setStatus(`${modes.find(item => item.value === mode)?.label ?? 'Processing'} completed.`)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not process the input.')
      setStatus('Could not process the input.')
    }
  }

  function handleInputChange(value: string) {
    setInput(value)
    setOutput('')
    setError('')
    setIsValid(null)
    setStatus(value ? 'Input changed. Process again to refresh the result.' : 'Ready')
  }

  function handleModeChange(value: FormatterMode) {
    setMode(value)
    setOutput('')
    setError('')
    setIsValid(null)
    setStatus('Mode changed. Process again to generate a result.')
  }

  function clear() {
    setInput('')
    setOutput('')
    setError('')
    setIsValid(null)
    setStatus('Cleared.')
  }

  function loadSample() {
    handleInputChange(tool.exampleInput)
    setStatus('Sample loaded. Process it to see the result.')
  }

  async function copy() {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      setError('')
      setStatus('Output copied to the clipboard.')
    } catch {
      setError('Clipboard access was denied by this browser.')
      setStatus('Could not copy the output.')
    }
  }

  function download() {
    if (!output) return
    const file = outputFormats[mode]
    const url = URL.createObjectURL(new Blob([output], { type: file.mimeType }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${file.name}.${file.extension}`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
    setError('')
    setStatus(`Download started: ${anchor.download}`)
  }

  const selectedFormat = outputFormats[mode]

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ToolPanel className="p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="json-formatter-input" className="flex items-center gap-2 font-medium">
              <i className="fas fa-file-code text-secondary" aria-hidden="true" />
              Input
              <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-white">JSON / text</span>
            </label>
            <span className="rounded-full border border-border bg-input px-3 py-1 text-sm text-secondary">{input.length.toLocaleString()} chars</span>
          </div>
          <textarea
            id="json-formatter-input"
            className="min-h-72 w-full resize-y rounded-xl border border-border bg-input p-4 font-mono text-sm leading-6 text-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
            value={input}
            onChange={event => handleInputChange(event.target.value)}
            onKeyDown={event => {
              if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                event.preventDefault()
                handleProcess()
              }
            }}
            spellCheck={false}
            placeholder="Paste JSON or text here…"
          />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={handleProcess} className="btn btn-primary text-sm"><i className="fa-solid fa-play" aria-hidden="true" />Process</button>
              <button type="button" onClick={clear} className="btn btn-outline text-sm"><i className="fa-solid fa-eraser" aria-hidden="true" />Clear</button>
            </div>
            <span className="text-sm" aria-label={isValid === null ? 'JSON has not been validated' : isValid ? 'JSON is valid' : 'JSON is invalid'}>
              {isValid === true && <span className="text-green-600 dark:text-green-400"><i className="fas fa-check" aria-hidden="true" /> Valid JSON</span>}
              {isValid === false && <span className="text-red-600 dark:text-red-400"><i className="fas fa-times" aria-hidden="true" /> Invalid JSON</span>}
              {isValid === null && <span className="text-secondary">Ready</span>}
            </span>
          </div>
        </ToolPanel>

        <ToolPanel className="p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="json-formatter-output" className="flex items-center gap-2 font-medium">
              <i className="fas fa-file-code text-green-500" aria-hidden="true" />Output
              <span className="rounded-full bg-green-600 px-2 py-0.5 text-xs text-white">.{selectedFormat.extension}</span>
            </label>
            <span className="rounded-full border border-border bg-input px-3 py-1 text-sm text-secondary">{output.length.toLocaleString()} chars</span>
          </div>
          <textarea
            id="json-formatter-output"
            className="min-h-72 w-full resize-y rounded-xl border border-border bg-input-readonly p-4 font-mono text-sm leading-6 text-primary focus:outline-none"
            value={output}
            readOnly
            spellCheck={false}
            placeholder="Output will appear here…"
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={copy} disabled={!output} className="btn btn-outline text-sm disabled:cursor-not-allowed disabled:opacity-40"><i className="fa-solid fa-copy" aria-hidden="true" />Copy</button>
            <button type="button" onClick={download} disabled={!output} className="btn btn-outline text-sm disabled:cursor-not-allowed disabled:opacity-40"><i className="fa-solid fa-download" aria-hidden="true" />Download .{selectedFormat.extension}</button>
            <button type="button" onClick={loadSample} className="btn btn-outline text-sm"><i className="fa-solid fa-rotate-right" aria-hidden="true" />Load sample</button>
          </div>
        </ToolPanel>
      </div>

      <p role={error ? 'alert' : 'status'} aria-live={error ? 'assertive' : 'polite'} className={`mt-3 min-h-6 text-sm ${error ? 'text-red-600 dark:text-red-300' : 'text-secondary'}`}>
        {error || status}
      </p>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <section className="tool-panel p-4" aria-labelledby="json-formatter-mode-heading">
          <h2 id="json-formatter-mode-heading" className="mb-2 block font-medium text-primary">Mode</h2>
          <div className="flex flex-wrap gap-2">
            {modes.map(item => (
              <button
                key={item.value}
                type="button"
                onClick={() => handleModeChange(item.value)}
                aria-pressed={mode === item.value}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition ${mode === item.value ? 'bg-primary text-white' : 'border border-border text-primary hover:bg-hover'}`}
              >
                <i className={`fas ${item.icon}`} aria-hidden="true" />{item.label}
              </button>
            ))}
          </div>
        </section>

        <section className="tool-panel p-4" aria-labelledby="json-formatter-options-heading">
          <h2 id="json-formatter-options-heading" className="mb-2 block font-medium text-primary">Options</h2>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            {(mode === 'format' || mode === 'sort') && (
              <label className="flex items-center gap-2 text-sm text-secondary">
                Indent:
                <select
                  value={indentSize}
                  onChange={event => {
                    setIndentSize(Number(event.target.value))
                    setOutput('')
                    setError('')
                    setIsValid(null)
                    setStatus('Indentation changed. Process again to refresh the result.')
                  }}
                  className="rounded border border-border bg-input px-2 py-1 text-primary"
                >
                  <option value={2}>2 spaces</option>
                  <option value={4}>4 spaces</option>
                  <option value={1}>1 space</option>
                  <option value={0}>No indent</option>
                </select>
              </label>
            )}
            {mode === 'csv' && (
              <label className="flex items-center gap-2 text-sm text-primary">
                <input
                  type="checkbox"
                  checked={protectCSVFormulas}
                  onChange={event => {
                    setProtectCSVFormulas(event.target.checked)
                    setOutput('')
                    setError('')
                    setIsValid(null)
                    setStatus('CSV safety option changed. Convert again to refresh the result.')
                  }}
                  className="accent-primary"
                />
                Protect spreadsheet formulas (recommended)
              </label>
            )}
            {mode !== 'format' && mode !== 'sort' && mode !== 'csv' && <span className="text-sm text-secondary">No additional options for this mode.</span>}
          </div>
        </section>
      </div>

      <section className="tool-panel mt-4 p-4" aria-labelledby="json-formatter-tips-heading">
        <h2 id="json-formatter-tips-heading" className="mb-2 flex items-center gap-2 font-semibold text-primary"><i className="fas fa-lightbulb text-yellow-500" aria-hidden="true" />Quick tips</h2>
        <ul className="space-y-1 text-sm text-secondary">
          <li>Press <kbd className="rounded border border-border bg-input px-1.5 py-0.5">Ctrl</kbd> or <kbd className="rounded border border-border bg-input px-1.5 py-0.5">⌘</kbd> + <kbd className="rounded border border-border bg-input px-1.5 py-0.5">Enter</kbd> to process.</li>
          <li>Processing happens locally in your browser; input is not uploaded.</li>
          <li>CSV formula protection prefixes spreadsheet formula-like cells with an apostrophe; disable it only when you explicitly need the original cell contents.</li>
          <li>CSV accepts a non-empty array of objects; YAML output uses the installed YAML serializer.</li>
        </ul>
      </section>
    </div>
  )
}
