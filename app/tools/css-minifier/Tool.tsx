'use client'

import { useState } from 'react'
import { ToolPanel } from '@/app/components/ToolPanel'
import { tool } from './definition'
import { minifyCSS } from './logic'

export default function CSSMinifier() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState('Ready')

  function minify() {
    setError('')
    setStatus('')
    if (!input.trim()) {
      setOutput('')
      setError('Paste some CSS code before minifying.')
      return
    }

    try {
      const result = minifyCSS(input)
      setOutput(result)
      if (!result) setStatus('The input contained no CSS after comments and whitespace were removed.')
      else setStatus('CSS minified successfully.')
    } catch (cause) {
      setOutput('')
      setError(cause instanceof Error ? cause.message : 'Could not minify this CSS.')
    }
  }

  function clear() {
    setInput('')
    setOutput('')
    setError('')
    setStatus('Ready')
  }

  function loadSample() {
    setInput(tool.exampleInput)
    setOutput('')
    setError('')
    setStatus('Sample loaded. Minify it to see the result.')
  }

  async function copy() {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      setError('')
      setStatus('CSS copied to the clipboard.')
    } catch {
      setError('Clipboard access was denied by this browser.')
      setStatus('')
    }
  }

  function download() {
    if (!output) return
    const url = URL.createObjectURL(new Blob([output], { type: 'text/css;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'minified.css'
    anchor.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
    setError('')
    setStatus('CSS download started.')
  }

  function handleInputChange(value: string) {
    setInput(value)
    setOutput('')
    setError('')
    setStatus(value ? 'Input changed. Minify again to update the result.' : 'Ready')
  }

  return (
    <div>
      <div className="grid gap-4 lg:grid-cols-2">
        <ToolPanel className="p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <label htmlFor="css-minifier-input" className="text-sm font-semibold text-primary">Input CSS</label>
            <span className="text-xs text-secondary">{input.length.toLocaleString()} chars</span>
          </div>
          <textarea
            id="css-minifier-input"
            value={input}
            onChange={event => handleInputChange(event.target.value)}
            onKeyDown={event => {
              if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                event.preventDefault()
                minify()
              }
            }}
            spellCheck={false}
            placeholder="Paste your CSS here…"
            className="min-h-72 w-full resize-y rounded-xl border border-border bg-input p-4 font-mono text-sm leading-6 text-primary placeholder:text-secondary focus:border-[#347a58] focus:outline-none"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={minify} className="btn btn-primary text-sm"><i className="fa-solid fa-wand-magic-sparkles" aria-hidden="true" />Minify</button>
            <button type="button" onClick={clear} className="btn btn-outline text-sm"><i className="fa-solid fa-eraser" aria-hidden="true" />Clear</button>
          </div>
        </ToolPanel>

        <ToolPanel className="p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <label htmlFor="css-minifier-output" className="text-sm font-semibold text-primary">Minified CSS</label>
            <span className="text-xs text-secondary">{output.length.toLocaleString()} chars</span>
          </div>
          <textarea
            id="css-minifier-output"
            value={output}
            readOnly
            spellCheck={false}
            placeholder="Minified CSS will appear here…"
            className="min-h-72 w-full resize-y rounded-xl border border-border bg-input-readonly p-4 font-mono text-sm leading-6 text-primary placeholder:text-secondary focus:outline-none"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={copy} disabled={!output} className="btn btn-outline text-sm disabled:cursor-not-allowed disabled:opacity-40"><i className="fa-solid fa-copy" aria-hidden="true" />Copy</button>
            <button type="button" onClick={download} disabled={!output} className="btn btn-outline text-sm disabled:cursor-not-allowed disabled:opacity-40"><i className="fa-solid fa-download" aria-hidden="true" />Download .css</button>
            <button type="button" onClick={loadSample} className="btn btn-outline text-sm"><i className="fa-solid fa-rotate-right" aria-hidden="true" />Load sample</button>
          </div>
        </ToolPanel>
      </div>

      <p role={error ? 'alert' : 'status'} aria-live="polite" className={`mt-3 min-h-6 text-sm ${error ? 'text-red-600 dark:text-red-300' : 'text-secondary'}`}>
        {error || status}
      </p>

      {output && (
        <section className="tool-panel mt-4 grid grid-cols-2 gap-4 p-4 text-sm md:grid-cols-4" aria-label="Minification statistics">
          <div><span className="text-secondary">Original size</span><p className="font-semibold text-primary">{input.length.toLocaleString()} chars</p></div>
          <div><span className="text-secondary">Minified size</span><p className="font-semibold text-primary">{output.length.toLocaleString()} chars</p></div>
          <div><span className="text-secondary">Saved</span><p className="font-semibold text-primary">{(input.length - output.length).toLocaleString()} chars</p></div>
          <div><span className="text-secondary">Reduction</span><p className="font-semibold text-primary">{input.length ? Math.round(((input.length - output.length) / input.length) * 100) : 0}%</p></div>
        </section>
      )}

      <div className="tool-panel mt-4 p-4">
        <h2 className="mb-2 text-sm font-semibold text-primary">Quick tips</h2>
        <ul className="space-y-1 text-sm text-secondary">
          <li>Press <kbd className="rounded border border-border px-1.5 py-0.5">Ctrl</kbd> or <kbd className="rounded border border-border px-1.5 py-0.5">⌘</kbd> + <kbd className="rounded border border-border px-1.5 py-0.5">Enter</kbd> to minify.</li>
          <li>Processing happens in your browser; your CSS is not uploaded.</li>
          <li>Regular comments are removed, license comments are kept, and custom property values retain their internal whitespace.</li>
        </ul>
      </div>
    </div>
  )
}
