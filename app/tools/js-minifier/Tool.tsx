'use client'

import { useState } from 'react'
import { ToolPanel } from '@/app/components/ToolPanel'
import { tool } from './definition'
import { MAX_INPUT_LENGTH, minifyJS, summarizeSizeChange } from './logic'

type Feedback = { kind: 'success' | 'error' | 'info'; message: string } | null

export default function JSMinifier() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [sizeSummary, setSizeSummary] = useState('')

  const handleMinify = () => {
    setOutput(null)
    setSizeSummary('')

    try {
      const result = minifyJS(input)
      setOutput(result)
      setSizeSummary(summarizeSizeChange(input.length, result.length))
      setFeedback({ kind: 'success', message: 'JavaScript minified locally. Review the output before using it.' })
    } catch (error) {
      setFeedback({
        kind: 'error',
        message: error instanceof Error ? error.message : 'Could not minify this JavaScript input.',
      })
    }
  }

  const handleInputChange = (value: string) => {
    const hadOutput = output !== null
    setInput(value)
    setOutput(null)
    setSizeSummary('')
    setFeedback(hadOutput
      ? { kind: 'info', message: 'Input changed. Minify again to refresh the output.' }
      : null)
  }

  const handleClear = () => {
    setInput('')
    setOutput(null)
    setSizeSummary('')
    setFeedback({ kind: 'info', message: 'Input and output cleared.' })
  }

  const loadSample = () => {
    setInput(tool.exampleInput)
    setOutput(null)
    setSizeSummary('')
    setFeedback({ kind: 'info', message: 'Sample loaded. Minify it to create fresh output.' })
  }

  const handleCopy = async () => {
    if (output === null) return

    try {
      await navigator.clipboard.writeText(output)
      setFeedback({ kind: 'success', message: 'Minified JavaScript copied to the clipboard.' })
    } catch {
      setFeedback({ kind: 'error', message: 'Clipboard access is unavailable. Select and copy the output manually.' })
    }
  }

  const handleDownload = () => {
    if (output === null) return

    const blob = new Blob([output], { type: 'text/javascript;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `minified.${tool.outputExtension}`
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
  }

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault()
      handleMinify()
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ToolPanel className="p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="js-minifier-input" className="font-medium">JavaScript input</label>
            <span id="js-minifier-input-count" className="text-sm text-secondary">
              {input.length.toLocaleString()} / {MAX_INPUT_LENGTH.toLocaleString()} characters
            </span>
          </div>
          <textarea
            id="js-minifier-input"
            aria-describedby="js-minifier-input-count js-minifier-shortcut"
            className="min-h-72 w-full resize-y rounded-lg border border-border bg-input p-4 font-mono text-sm text-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
            value={input}
            maxLength={MAX_INPUT_LENGTH}
            onChange={event => handleInputChange(event.target.value)}
            onKeyDown={handleInputKeyDown}
            spellCheck={false}
            placeholder="Paste supported JavaScript here…"
          />
          <p id="js-minifier-shortcut" className="mt-2 text-xs text-secondary">
            Press Ctrl+Enter (or ⌘+Enter) while this input is focused to minify.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={handleMinify} className="btn btn-primary text-sm">
              <i aria-hidden="true" className="fa-solid fa-bolt" /> Minify
            </button>
            <button type="button" onClick={handleClear} className="btn btn-outline text-sm">
              <i aria-hidden="true" className="fa-solid fa-eraser" /> Clear
            </button>
            <button type="button" onClick={loadSample} className="btn btn-outline text-sm">
              <i aria-hidden="true" className="fa-solid fa-rotate-right" /> Load sample
            </button>
          </div>
        </ToolPanel>

        <ToolPanel className="p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="js-minifier-output" className="font-medium">Minified JavaScript</label>
            <span className="text-sm text-secondary">
              {(output?.length ?? 0).toLocaleString()} characters
            </span>
          </div>
          <textarea
            id="js-minifier-output"
            aria-label="Minified JavaScript output"
            className="min-h-72 w-full resize-y rounded-lg border border-border bg-input-readonly p-4 font-mono text-sm text-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
            value={output ?? ''}
            readOnly
            spellCheck={false}
            placeholder="Minified JavaScript appears here after processing."
          />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={handleCopy} disabled={output === null} className="btn btn-outline text-sm disabled:cursor-not-allowed disabled:opacity-40">
                <i aria-hidden="true" className="fa-solid fa-copy" /> Copy output
              </button>
              <button type="button" onClick={handleDownload} disabled={output === null} className="btn btn-outline text-sm disabled:cursor-not-allowed disabled:opacity-40">
                <i aria-hidden="true" className="fa-solid fa-download" /> Download .js
              </button>
            </div>
            {sizeSummary && <span className="text-sm text-secondary" aria-label="Output size comparison">{sizeSummary}</span>}
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
          <i aria-hidden="true" className="fa-solid fa-lightbulb text-yellow-500" /> How it works and limits
        </h2>
        <ul className="space-y-1 text-sm text-secondary">
          <li>Processing happens locally in your browser; pasted source is not uploaded.</li>
          <li>Ordinary comments are removed. Block comments beginning with /*! are retained.</li>
          <li>Parsing and code generation use Esprima 4 and Escodegen: supported input is limited to their ECMAScript 2017-era JavaScript grammar. This tool does not transpile or bundle code.</li>
          <li>JSX, TypeScript, Flow, optional chaining, nullish coalescing, and other syntax unsupported by those packages are not accepted.</li>
          <li>Input is limited to {MAX_INPUT_LENGTH.toLocaleString()} characters to bound synchronous browser work.</li>
          <li>Ctrl/⌘+Enter is handled only while the input editor is focused.</li>
        </ul>
      </div>
    </div>
  )
}
