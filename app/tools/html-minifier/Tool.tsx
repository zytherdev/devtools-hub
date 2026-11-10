'use client'

import { useState } from 'react'
import { ToolPanel } from '@/app/components/ToolPanel'
import { tool } from './definition'
import { MAX_INPUT_LENGTH, run } from './logic'

type Feedback = { kind: 'success' | 'error' | 'info'; message: string } | null

export default function HTMLMinifier() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [feedback, setFeedback] = useState<Feedback>(null)

  const handleMinify = () => {
    setOutput('')
    if (!input.trim()) {
      setFeedback({ kind: 'error', message: 'Paste HTML to minify.' })
      return
    }

    try {
      const result = run(input, {})
      setOutput(result)
      setFeedback({ kind: 'success', message: 'HTML minified. Review the output before using it.' })
    } catch (error) {
      setFeedback({
        kind: 'error',
        message: error instanceof Error ? error.message : 'Could not minify this HTML input.',
      })
    }
  }

  const handleInputChange = (value: string) => {
    setInput(value)
    setOutput('')
    setFeedback(null)
  }

  const handleClear = () => {
    setInput('')
    setOutput('')
    setFeedback({ kind: 'info', message: 'Input and output cleared.' })
  }

  const loadSample = () => {
    setInput(tool.exampleInput)
    setOutput('')
    setFeedback({ kind: 'info', message: 'Sample loaded. Minify it to create fresh output.' })
  }

  const handleCopy = async () => {
    if (!output) {
      setFeedback({ kind: 'error', message: 'Minify HTML before copying the output.' })
      return
    }

    try {
      await navigator.clipboard.writeText(output)
      setFeedback({ kind: 'success', message: 'Minified HTML copied to the clipboard.' })
    } catch {
      setFeedback({ kind: 'error', message: 'Clipboard access is unavailable. Select and copy the output manually.' })
    }
  }

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault()
      handleMinify()
    }
  }

  const savedCharacters = input.length - output.length
  const compression = input.length ? Math.round((savedCharacters / input.length) * 100) : 0
  const sizeSummary = savedCharacters >= 0
    ? `${savedCharacters} characters saved · ${compression}% smaller`
    : `${Math.abs(savedCharacters)} characters added · ${Math.abs(compression)}% larger`

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ToolPanel className="p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="html-minifier-input" className="flex items-center gap-2 font-medium">
              <i aria-hidden="true" className="fas fa-file-code text-secondary" />
              HTML input
              <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-white">HTML</span>
            </label>
            <span id="html-minifier-input-count" className="text-sm text-secondary">
              {input.length.toLocaleString()} / {MAX_INPUT_LENGTH.toLocaleString()} characters
            </span>
          </div>
          <textarea
            id="html-minifier-input"
            aria-describedby="html-minifier-input-count html-minifier-shortcut"
            className="min-h-85 w-full resize-y rounded-lg border border-border bg-input p-4 font-mono text-sm text-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
            value={input}
            maxLength={MAX_INPUT_LENGTH}
            onChange={(event) => handleInputChange(event.target.value)}
            onKeyDown={handleInputKeyDown}
            spellCheck={false}
            placeholder="<!-- Paste your HTML here -->"
          />
          <p id="html-minifier-shortcut" className="mt-2 text-xs text-secondary">
            Press Ctrl+Enter (or ⌘+Enter) to minify. Input stays in this browser.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleMinify}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
            >
              <i aria-hidden="true" className="fas fa-bolt" /> Minify
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 transition hover:bg-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
            >
              <i aria-hidden="true" className="fas fa-eraser" /> Clear
            </button>
            <button
              type="button"
              onClick={loadSample}
              className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 transition hover:bg-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
            >
              <i aria-hidden="true" className="fas fa-rotate-right" /> Load sample
            </button>
          </div>
        </ToolPanel>

        <ToolPanel className="p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="html-minifier-output" className="flex items-center gap-2 font-medium">
              <i aria-hidden="true" className="fas fa-file-code text-green-500" />
              Minified output
              <span className="rounded-full bg-green-600 px-2 py-0.5 text-xs text-white">HTML</span>
            </label>
            <span className="text-sm text-secondary">
              {output.length.toLocaleString()} characters
            </span>
          </div>
          <textarea
            id="html-minifier-output"
            aria-label="Minified HTML output"
            className="min-h-85 w-full resize-y rounded-lg border border-border bg-input-readonly p-4 font-mono text-sm text-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
            value={output}
            readOnly
            spellCheck={false}
            placeholder="Minified HTML appears here after processing."
          />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleCopy}
              disabled={!output}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
            >
              <i aria-hidden="true" className="fas fa-copy" /> Copy output
            </button>
            {output && <span className="text-sm text-secondary">{sizeSummary}</span>}
          </div>
        </ToolPanel>
      </div>

      <p
        role={feedback?.kind === 'error' ? 'alert' : 'status'}
        aria-live={feedback?.kind === 'error' ? 'assertive' : 'polite'}
        aria-atomic="true"
        className={`min-h-6 text-sm ${feedback?.kind === 'error' ? 'text-red-600 dark:text-red-300' : feedback?.kind === 'success' ? 'text-green-700 dark:text-green-300' : 'text-secondary'}`}
      >
        {feedback?.message ?? ''}
      </p>

      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-2 flex items-center gap-2 font-semibold">
          <i aria-hidden="true" className="fas fa-lightbulb text-yellow-500" /> How it works
        </h2>
        <ul className="space-y-1 text-sm text-secondary">
          <li>Processing is local; no HTML is sent to a provider.</li>
          <li>Ordinary comments and safe whitespace are compressed; conditional, SSI, and license comments are kept.</li>
          <li>Script, style, textarea, and pre contents are preserved, including whitespace and comment-like text.</li>
          <li>Input is limited to {MAX_INPUT_LENGTH.toLocaleString()} characters. The scanner does not repair or validate HTML.</li>
        </ul>
      </div>
    </div>
  )
}
