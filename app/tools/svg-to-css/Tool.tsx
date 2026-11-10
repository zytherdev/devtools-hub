'use client'

import { useState } from 'react'
import { ToolPanel } from '@/app/components/ToolPanel'
import {
  defaultSVGOptions,
  MAX_SVG_INPUT_LENGTH,
  run,
  sampleSVGs,
  type SVGConversionOptions,
} from './logic'

type Feedback = { kind: 'success' | 'error' | 'info'; message: string } | null

export default function SVGToCSS() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [options, setOptions] = useState<SVGConversionOptions>(defaultSVGOptions)
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [isStale, setIsStale] = useState(false)
  const [preview, setPreview] = useState('')

  function handleInputChange(value: string) {
    setInput(value)
    setIsStale(true)
    setPreview('')
    if (value.length > MAX_SVG_INPUT_LENGTH) {
      setFeedback({ kind: 'error', message: `SVG input exceeds the ${MAX_SVG_INPUT_LENGTH.toLocaleString()} character limit. Preview and conversion are disabled until it is shortened.` })
    } else {
      setFeedback(value ? { kind: 'info', message: 'Input changed. Convert again to generate fresh CSS.' } : null)
    }
  }

  function updateOption<K extends keyof SVGConversionOptions>(key: K, value: SVGConversionOptions[K]) {
    setOptions(current => ({ ...current, [key]: value }))
    setIsStale(true)
    setPreview('')
    setFeedback({ kind: 'info', message: 'Options changed. Convert again to generate fresh CSS.' })
  }

  function handleConvert() {
    if (!input.trim()) {
      setIsStale(Boolean(output))
      setFeedback({ kind: 'error', message: 'Paste SVG markup before converting.' })
      return
    }

    try {
      const result = run(input, options)
      const dataURI = /url\("(data:image\/svg\+xml,[^"]+)"\)/.exec(result)?.[1] ?? ''
      setOutput(result)
      setIsStale(false)
      setPreview(dataURI)
      setFeedback({ kind: 'success', message: 'CSS generated locally. Review the output before using it.' })
    } catch (cause) {
      setIsStale(Boolean(output))
      setPreview('')
      setFeedback({
        kind: 'error',
        message: cause instanceof Error ? cause.message : 'Could not convert this SVG input.',
      })
    }
  }

  function handleClear() {
    setInput('')
    setOutput('')
    setPreview('')
    setIsStale(false)
    setFeedback({ kind: 'info', message: 'Input and output cleared.' })
  }

  function loadSample(index: number) {
    const sample = sampleSVGs[index]
    if (!sample) return
    handleInputChange(sample.svg)
    setFeedback({ kind: 'info', message: `${sample.name} sample loaded. Convert it to create CSS.` })
  }

  async function handleCopy() {
    if (!output || isStale) {
      setFeedback({ kind: 'error', message: isStale ? 'Convert the current input and options before copying; the displayed CSS is stale.' : 'Convert an SVG before copying CSS.' })
      return
    }
    try {
      await navigator.clipboard.writeText(output)
      setFeedback({ kind: 'success', message: 'CSS copied to the clipboard.' })
    } catch {
      setFeedback({ kind: 'error', message: 'Clipboard access was denied. Select and copy the CSS output manually.' })
    }
  }

  function handleInputKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault()
      handleConvert()
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ToolPanel className="p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="svg-to-css-input" className="flex items-center gap-2 font-medium text-primary">
              <i aria-hidden="true" className="fas fa-file-code text-secondary" />
              SVG input
              <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-white">SVG</span>
            </label>
            <span id="svg-to-css-input-count" className={`text-sm ${input.length > MAX_SVG_INPUT_LENGTH ? 'text-red-600 dark:text-red-300' : 'text-secondary'}`}>
              {input.length.toLocaleString()} / {MAX_SVG_INPUT_LENGTH.toLocaleString()} characters
            </span>
          </div>
          <textarea
            id="svg-to-css-input"
            aria-describedby="svg-to-css-input-count svg-to-css-shortcut svg-to-css-status"
            className="min-h-72 w-full resize-y rounded-lg border border-border bg-input p-4 font-mono text-sm text-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
            value={input}
            onChange={event => handleInputChange(event.target.value)}
            onKeyDown={handleInputKeyDown}
            spellCheck={false}
            placeholder='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">…</svg>'
          />
          <p id="svg-to-css-shortcut" className="mt-2 text-xs text-secondary">
            Press <kbd className="rounded border border-border bg-input px-1.5 py-0.5">Ctrl</kbd> + <kbd className="rounded border border-border bg-input px-1.5 py-0.5">Enter</kbd> (or ⌘+Enter) while editing to convert.
          </p>
          <div className="mt-4">
            <span className="text-sm text-secondary">Load a sample:</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {sampleSVGs.map((sample, index) => (
                <button
                  key={sample.name}
                  type="button"
                  onClick={() => loadSample(index)}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm transition hover:bg-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
                >
                  {sample.name}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={handleConvert} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus">
              <i aria-hidden="true" className="fas fa-exchange-alt" /> Convert to CSS
            </button>
            <button type="button" onClick={handleClear} className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 transition hover:bg-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus">
              <i aria-hidden="true" className="fas fa-eraser" /> Clear
            </button>
          </div>
        </ToolPanel>

        <ToolPanel className="p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="svg-to-css-output" className="flex items-center gap-2 font-medium text-primary">
              <i aria-hidden="true" className="fas fa-file-code text-green-500" />
              CSS output
              <span className="rounded-full bg-green-600 px-2 py-0.5 text-xs text-white">.CSS</span>
            </label>
            {output && (
              <span className={`text-sm ${isStale ? 'text-amber-700 dark:text-amber-300' : 'text-secondary'}`}>
                {isStale ? 'Stale — convert again' : `${output.length.toLocaleString()} characters`}
              </span>
            )}
          </div>
          <textarea
            id="svg-to-css-output"
            aria-describedby="svg-to-css-status"
            className="min-h-72 w-full resize-y rounded-lg border border-border bg-input-readonly p-4 font-mono text-sm text-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
            value={output}
            readOnly
            spellCheck={false}
            placeholder="CSS appears here after conversion."
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={handleCopy} disabled={!output || isStale} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus">
              <i aria-hidden="true" className="fas fa-copy" /> Copy CSS
            </button>
          </div>
          {preview && !isStale && (
            <div className="mt-5" aria-label="Preview of converted SVG">
              <h2 className="mb-2 flex items-center gap-2 font-medium text-primary">
                <i aria-hidden="true" className="fas fa-eye text-secondary" /> Preview
              </h2>
              <div role="img" aria-label="Converted SVG preview" className="h-20 w-20 rounded-lg border border-border bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url("${preview}")` }} />
            </div>
          )}
        </ToolPanel>
      </div>

      <p id="svg-to-css-status" role={feedback?.kind === 'error' ? 'alert' : 'status'} aria-live={feedback?.kind === 'error' ? 'assertive' : 'polite'} aria-atomic="true" className={`min-h-6 text-sm ${feedback?.kind === 'error' ? 'text-red-600 dark:text-red-300' : feedback?.kind === 'success' ? 'text-green-700 dark:text-green-300' : 'text-secondary'}`}>
        {feedback?.message ?? ''}
      </p>

      <section className="tool-panel p-4 sm:p-5" aria-labelledby="svg-to-css-options-heading">
        <h2 id="svg-to-css-options-heading" className="mb-3 flex items-center gap-2 font-semibold text-primary">
          <i aria-hidden="true" className="fas fa-sliders-h text-secondary" /> Conversion options
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-sm text-secondary">
            Output format
            <select value={options.format} onChange={event => updateOption('format', event.target.value as SVGConversionOptions['format'])} className="mt-1 w-full rounded-lg border border-border bg-input px-3 py-2 text-primary focus:outline-none focus:ring-2 focus:ring-border-focus">
              <option value="background-image">Background image</option>
              <option value="mask-image">Mask image</option>
              <option value="content">Content pseudo-element</option>
              <option value="url">URL only</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-secondary">
            <input type="checkbox" checked={options.addPrefix} onChange={event => updateOption('addPrefix', event.target.checked)} className="h-4 w-4 accent-primary" />
            Add CSS class selector
          </label>
          <label className="text-sm text-secondary">
            CSS class (without .)
            <input type="text" value={options.prefix} onChange={event => updateOption('prefix', event.target.value)} disabled={!options.addPrefix || options.format === 'url'} className="mt-1 w-full rounded-lg border border-border bg-input px-3 py-2 text-primary focus:outline-none focus:ring-2 focus:ring-border-focus disabled:opacity-50" placeholder="icon" />
          </label>
          <label className="flex items-center gap-2 text-sm text-secondary">
            <input type="checkbox" checked={options.optimize} onChange={event => updateOption('optimize', event.target.checked)} className="h-4 w-4 accent-primary" />
            Remove XML declaration/comments
          </label>
          <label className="flex items-center gap-2 text-sm text-secondary">
            <input type="checkbox" checked={options.minify} onChange={event => updateOption('minify', event.target.checked)} className="h-4 w-4 accent-primary" />
            Compact CSS formatting
          </label>
        </div>
      </section>

      <section className="tool-panel p-4 sm:p-5" aria-labelledby="svg-to-css-notes-heading">
        <h2 id="svg-to-css-notes-heading" className="mb-2 flex items-center gap-2 font-semibold text-primary">
          <i aria-hidden="true" className="fas fa-circle-info text-secondary" /> How it works and limitations
        </h2>
        <ul className="space-y-1 text-sm text-secondary">
          <li>All processing is local in this browser; input is not sent to a provider.</li>
          <li>Input is limited to {MAX_SVG_INPUT_LENGTH.toLocaleString()} characters. Preview is generated only after conversion, not on every keystroke.</li>
          <li>The structural scanner checks XML tag nesting, quoted attributes, character/entity references and a single SVG root. It is not a complete XML or SVG conformance validator.</li>
          <li>DOCTYPE declarations, custom entities and namespace binding checks are not supported. This tool does not sanitize SVG content.</li>
          <li>Without a CSS class, background/mask rules target <code>:root</code> and content targets <code>:root::before</code>.</li>
        </ul>
      </section>
    </div>
  )
}
