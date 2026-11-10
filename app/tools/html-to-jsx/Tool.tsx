'use client'

import { useState } from 'react'
import { ToolPanel } from '@/app/components/ToolPanel'
import { defaultHTMLToJSXOptions, htmlToJSX, sampleHTML, type HTMLToJSXOptions } from './logic'
import { MAX_HTML_INPUT_LENGTH } from './lib/constants'

export default function HTMLToJSX() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [options, setOptions] = useState<HTMLToJSXOptions>(defaultHTMLToJSXOptions)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('Ready. Paste HTML and convert it to JSX.')

  function handleInputChange(value: string) {
    setInput(value)
    setOutput('')
    setError(value.length > MAX_HTML_INPUT_LENGTH
      ? `Input exceeds the ${MAX_HTML_INPUT_LENGTH.toLocaleString()} character limit.`
      : '')
    setStatus(value ? 'Input changed. Convert again to generate a fresh result.' : 'Ready. Paste HTML and convert it to JSX.')
  }

  function updateOption<K extends keyof HTMLToJSXOptions>(key: K, value: HTMLToJSXOptions[K]) {
    setOptions(current => ({ ...current, [key]: value }))
    setOutput('')
    setError('')
    setStatus('Options changed. Convert again to generate a fresh result.')
  }

  function handleConvert() {
    setOutput('')
    setError('')
    if (!input.trim()) {
      setError('Paste HTML in the input before converting.')
      setStatus('Input is required.')
      return
    }
    try {
      const result = htmlToJSX(input, options)
      setOutput(result)
      setStatus('Conversion completed.')
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Could not convert this HTML to JSX.'
      setError(message)
      setStatus('Conversion failed. Correct the input or options and try again.')
    }
  }

  function clear() {
    setInput('')
    setOutput('')
    setError('')
    setStatus('Cleared.')
  }

  function loadSample() {
    handleInputChange(sampleHTML)
    setStatus('Sample loaded. Convert it to see the JSX output.')
  }

  async function copyOutput() {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      setError('')
      setStatus('JSX copied to the clipboard.')
    } catch {
      setError('Clipboard access was denied by this browser.')
      setStatus('Could not copy the output.')
    }
  }

  function downloadOutput() {
    if (!output) return
    const url = URL.createObjectURL(new Blob([output], { type: 'text/plain;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'converted.jsx'
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
    setError('')
    setStatus('Download started: converted.jsx')
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ToolPanel className="p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="html-to-jsx-input" className="flex items-center gap-2 font-medium">
              <i className="fas fa-file-code text-secondary" aria-hidden="true" />
              Input HTML
              <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-white">HTML</span>
            </label>
            <span className="rounded-full border border-border bg-input px-3 py-1 text-sm text-secondary">
              {input.length.toLocaleString()} / {MAX_HTML_INPUT_LENGTH.toLocaleString()} chars
            </span>
          </div>
          <textarea
            id="html-to-jsx-input"
            className="min-h-72 w-full resize-y rounded-xl border border-border bg-input p-4 font-mono text-sm leading-6 text-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
            value={input}
            onChange={event => handleInputChange(event.target.value)}
            onKeyDown={event => {
              if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                event.preventDefault()
                handleConvert()
              }
            }}
            aria-describedby="html-to-jsx-status"
            spellCheck={false}
            placeholder="Paste your HTML here…"
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={handleConvert} className="btn btn-primary text-sm">
              <i className="fa-solid fa-play" aria-hidden="true" />Convert
            </button>
            <button type="button" onClick={clear} className="btn btn-outline text-sm">
              <i className="fa-solid fa-eraser" aria-hidden="true" />Clear
            </button>
            <button type="button" onClick={loadSample} className="btn btn-outline text-sm">
              <i className="fa-solid fa-rotate-right" aria-hidden="true" />Load sample
            </button>
          </div>
        </ToolPanel>

        <ToolPanel className="p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="html-to-jsx-output" className="flex items-center gap-2 font-medium">
              <i className="fas fa-file-code text-green-500" aria-hidden="true" />
              JSX Output
              <span className="rounded-full bg-green-600 px-2 py-0.5 text-xs text-white">.jsx</span>
            </label>
            <span className="rounded-full border border-border bg-input px-3 py-1 text-sm text-secondary">
              {output.length.toLocaleString()} chars
            </span>
          </div>
          <textarea
            id="html-to-jsx-output"
            className="min-h-72 w-full resize-y rounded-xl border border-border bg-input-readonly p-4 font-mono text-sm leading-6 text-primary focus:outline-none"
            value={output}
            readOnly
            spellCheck={false}
            placeholder="JSX output will appear here…"
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={copyOutput} disabled={!output} className="btn btn-outline text-sm disabled:cursor-not-allowed disabled:opacity-40">
              <i className="fa-solid fa-copy" aria-hidden="true" />Copy
            </button>
            <button type="button" onClick={downloadOutput} disabled={!output} className="btn btn-outline text-sm disabled:cursor-not-allowed disabled:opacity-40">
              <i className="fa-solid fa-download" aria-hidden="true" />Download .jsx
            </button>
          </div>
        </ToolPanel>
      </div>

      <p id="html-to-jsx-status" role={error ? 'alert' : 'status'} aria-live={error ? 'assertive' : 'polite'} className={`mt-3 min-h-6 text-sm ${error ? 'text-red-600 dark:text-red-300' : 'text-secondary'}`}>
        {error || status}
      </p>

      <section className="tool-panel mt-4 p-4" aria-labelledby="html-to-jsx-options-heading">
        <h2 id="html-to-jsx-options-heading" className="mb-3 font-semibold text-primary">
          <i className="fas fa-sliders-h mr-2 text-secondary" aria-hidden="true" />Conversion options
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="flex items-center gap-2 text-sm text-secondary">
            <input type="checkbox" checked={options.preserveComments} onChange={event => updateOption('preserveComments', event.target.checked)} className="h-4 w-4 accent-primary" />
            Preserve comments
          </label>
          <label className="flex items-center gap-2 text-sm text-secondary">
            <input type="checkbox" checked={options.preserveWhitespace} onChange={event => updateOption('preserveWhitespace', event.target.checked)} className="h-4 w-4 accent-primary" />
            Preserve whitespace
          </label>
          <label className="flex items-center gap-2 text-sm text-secondary">
            <input type="checkbox" checked={options.selfClosingTags} onChange={event => updateOption('selfClosingTags', event.target.checked)} className="h-4 w-4 accent-primary" />
            Self-close empty tags
          </label>
          <label className="flex items-center gap-2 text-sm text-secondary">
            <input type="checkbox" checked={options.convertStyle} onChange={event => updateOption('convertStyle', event.target.checked)} className="h-4 w-4 accent-primary" />
            Convert inline styles
          </label>
          <label className="text-sm text-secondary">
            class attribute
            <select value={options.className} onChange={event => updateOption('className', event.target.value as 'class' | 'className')} className="mt-1 w-full rounded-lg border border-border bg-input px-3 py-2 text-primary focus:outline-none focus:ring-2 focus:ring-border-focus">
              <option value="className">className</option>
              <option value="class">class</option>
            </select>
          </label>
          <label className="text-sm text-secondary">
            for attribute
            <select value={options.htmlFor} onChange={event => updateOption('htmlFor', event.target.value as 'for' | 'htmlFor')} className="mt-1 w-full rounded-lg border border-border bg-input px-3 py-2 text-primary focus:outline-none focus:ring-2 focus:ring-border-focus">
              <option value="htmlFor">htmlFor</option>
              <option value="for">for</option>
            </select>
          </label>
        </div>
      </section>

      <p className="mt-4 text-sm text-secondary">
        Conversion runs locally in your browser. This converter applies targeted attribute filtering; it is not a security sanitizer.
        Press <kbd className="rounded border border-border bg-input px-1.5 py-0.5 text-xs">Ctrl</kbd> + <kbd className="rounded border border-border bg-input px-1.5 py-0.5 text-xs">Enter</kbd> to convert.
      </p>
    </div>
  )
}
