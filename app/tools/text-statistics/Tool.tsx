'use client'

import { useState } from 'react'
import { ToolPanel } from '@/app/components/ToolPanel'
import { tool } from './definition'
import { analyzeText, DEFAULT_WORDS_PER_MINUTE, MAX_INPUT_CHARS, MAX_WORDS_PER_MINUTE, MIN_WORDS_PER_MINUTE, type TextStatistics } from './logic'

export default function TextStatisticsTool() {
  const [input, setInput] = useState('')
  const [includeReadingTime, setIncludeReadingTime] = useState(true)
  const [wordsPerMinute, setWordsPerMinute] = useState(String(DEFAULT_WORDS_PER_MINUTE))
  const [statistics, setStatistics] = useState<TextStatistics | null>(null)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('Paste text and select Count statistics to analyze it in this browser.')

  function count() {
    setError('')
    try {
      const result = analyzeText(input, {
        includeReadingTime: includeReadingTime ? 'true' : 'false',
        wordsPerMinute,
      })
      setStatistics(result)
      setStatus('Statistics updated locally. Your text is not uploaded or stored by this tool.')
    } catch (cause) {
      setStatistics(null)
      setError(cause instanceof Error ? cause.message : 'Could not count the text.')
      setStatus('')
    }
  }

  function updateInput(value: string) {
    setInput(value)
    setStatistics(null)
    setError('')
    setStatus(value ? 'Input changed. Count statistics again to update the results.' : 'Paste text and select Count statistics to analyze it in this browser.')
  }

  function clear() {
    setInput('')
    setStatistics(null)
    setError('')
    setStatus('Text and statistics cleared.')
  }

  function loadSample() {
    setInput(tool.exampleInput)
    setStatistics(null)
    setError('')
    setStatus('Sample loaded. Count statistics to see the results.')
  }

  return (
    <div>
      <ToolPanel className="p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <label htmlFor="text-statistics-input" className="text-sm font-semibold text-primary">Text to analyze</label>
          <span className="text-xs text-secondary">{input.length.toLocaleString()} / {MAX_INPUT_CHARS.toLocaleString()} UTF-16 code units</span>
        </div>
        <textarea
          id="text-statistics-input"
          value={input}
          onChange={event => updateInput(event.target.value)}
          onKeyDown={event => {
            if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
              event.preventDefault()
              count()
            }
          }}
          maxLength={MAX_INPUT_CHARS}
          spellCheck={false}
          placeholder="Paste or type text here…"
          aria-invalid={Boolean(error) || undefined}
          aria-describedby="text-statistics-hint text-statistics-feedback"
          className="min-h-64 w-full resize-y rounded-xl border border-border bg-input p-4 text-sm leading-6 text-primary placeholder:text-secondary focus:border-[#347a58] focus:outline-none"
        />
        <p id="text-statistics-hint" className="mt-2 text-xs text-secondary">
          Maximum input: {MAX_INPUT_CHARS.toLocaleString()} UTF-16 code units. Word and character counts use Unicode segmentation where available.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-primary">
            <input
              type="checkbox"
              checked={includeReadingTime}
              onChange={event => {
                setIncludeReadingTime(event.target.checked)
                setStatistics(null)
              }}
              className="accent-primary"
            />
            Include estimated reading time
          </label>
          <label htmlFor="text-statistics-wpm" className="flex items-center gap-2 text-sm text-secondary">
            Words per minute
            <input
              id="text-statistics-wpm"
              type="number"
              min={MIN_WORDS_PER_MINUTE}
              max={MAX_WORDS_PER_MINUTE}
              step="1"
              value={wordsPerMinute}
              onChange={event => {
                setWordsPerMinute(event.target.value)
                setStatistics(null)
              }}
              disabled={!includeReadingTime}
              className="w-24 rounded border border-border bg-input px-2 py-1 text-primary disabled:opacity-50"
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={count} className="btn btn-primary text-sm"><i className="fa-solid fa-calculator" aria-hidden="true" />Count statistics</button>
          <button type="button" onClick={clear} className="btn btn-outline text-sm"><i className="fa-solid fa-eraser" aria-hidden="true" />Clear</button>
          <button type="button" onClick={loadSample} className="btn btn-outline text-sm"><i className="fa-solid fa-rotate-right" aria-hidden="true" />Load sample</button>
        </div>
      </ToolPanel>

      <p id="text-statistics-feedback" role={error ? 'alert' : 'status'} aria-live="polite" className={`mt-3 min-h-6 text-sm ${error ? 'text-red-600 dark:text-red-300' : 'text-secondary'}`}>
        {error || status}
      </p>

      {statistics && (
        <ToolPanel className="mt-4 p-4 sm:p-5">
          <h2 className="mb-4 text-sm font-semibold text-primary">Text statistics</h2>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <div><dt className="text-sm text-secondary">Words</dt><dd className="mt-1 text-2xl font-semibold text-primary">{statistics.words.toLocaleString()}</dd></div>
            <div><dt className="text-sm text-secondary">Characters</dt><dd className="mt-1 text-2xl font-semibold text-primary">{statistics.characters.toLocaleString()}</dd><dd className="text-xs text-secondary">Grapheme clusters, including whitespace</dd></div>
            <div><dt className="text-sm text-secondary">Characters excluding whitespace</dt><dd className="mt-1 text-2xl font-semibold text-primary">{statistics.charactersWithoutWhitespace.toLocaleString()}</dd></div>
            <div><dt className="text-sm text-secondary">Lines</dt><dd className="mt-1 text-2xl font-semibold text-primary">{statistics.lines.toLocaleString()}</dd></div>
            <div><dt className="text-sm text-secondary">Paragraphs</dt><dd className="mt-1 text-2xl font-semibold text-primary">{statistics.paragraphs.toLocaleString()}</dd></div>
            {statistics.readingTimeMinutes !== undefined && (
              <div><dt className="text-sm text-secondary">Estimated reading time</dt><dd className="mt-1 text-2xl font-semibold text-primary">{statistics.readingTimeMinutes.toLocaleString()} min</dd><dd className="text-xs text-secondary">At {statistics.wordsPerMinute} words per minute</dd></div>
            )}
          </dl>
        </ToolPanel>
      )}

      <section className="tool-panel mt-4 p-4" aria-labelledby="text-statistics-notes-title">
        <h2 id="text-statistics-notes-title" className="mb-2 text-sm font-semibold text-primary">Counting details and privacy</h2>
        <ul className="space-y-1 text-sm text-secondary">
          <li>Words follow Unicode word boundaries and count word-like segments; punctuation and spaces are not words.</li>
          <li>Characters are grapheme clusters, so a joined emoji or a base letter with combining marks counts as one character. The second character count excludes whitespace-only clusters.</li>
          <li>CRLF, LF, CR, and Unicode line separators each divide lines. Empty input has zero lines; a final line break adds an empty final line.</li>
          <li>A paragraph is a group of one or more nonblank lines. Reading time rounds up to whole minutes at the selected words-per-minute rate.</li>
          <li>All counting runs locally in your browser. This tool does not transmit or store your text.</li>
        </ul>
      </section>
    </div>
  )
}
