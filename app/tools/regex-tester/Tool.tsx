'use client'

import { useMemo, useRef, useState } from 'react'
import { ToolPanel } from '@/app/components/ToolPanel'
import * as Regex from './logic'

const samplePatterns = [
  { name: 'Email', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}' },
  { name: 'URL', pattern: 'https?://[^\\s]+' },
  { name: 'Phone', pattern: '\\d{3}[-.]?\\d{3}[-.]?\\d{4}' },
  { name: 'Word', pattern: '\\b\\w+\\b' },
  { name: 'Number', pattern: '\\d+' },
]
const sampleText = 'Hello world! Contact email@example.com or visit https://example.com. Call 123-456-7890.'

type Mode = Regex.RegexMode

export default function RegexTester() {
  const [pattern, setPattern] = useState('')
  const [flags, setFlags] = useState<string[]>(['g', 'i'])
  const [testText, setTestText] = useState('')
  const [replacement, setReplacement] = useState('')
  const [mode, setMode] = useState<Mode>('test')
  const [result, setResult] = useState<Regex.RegexResult | null>(null)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const requestId = useRef(0)
  const currentFlags = useMemo(() => Regex.getFlagString(flags), [flags])

  function invalidate() {
    requestId.current += 1
    setResult(null)
    setError('')
    setStatus('')
    setBusy(false)
  }

  async function handleRun() {
    const id = ++requestId.current
    setError('')
    setStatus('')
    setResult(null)
    setBusy(true)
    try {
      const value = await Regex.runRegexInWorker({ pattern, flags: currentFlags, text: testText, mode, replacement })
      if (id !== requestId.current) return
      if (value.error) {
        setError(value.error)
        return
      }
      setResult(value)
      setStatus(`${value.count.toLocaleString()} ${mode === 'split' ? (value.count === 1 ? 'delimiter' : 'delimiters') : (value.count === 1 ? 'match' : 'matches')}.`)
    } catch (cause) {
      if (id === requestId.current) setError(cause instanceof Error ? cause.message : 'Regex failed.')
    } finally {
      if (id === requestId.current) setBusy(false)
    }
  }

  function toggleFlag(flag: string) {
    invalidate()
    setFlags(current => current.includes(flag) ? current.filter(value => value !== flag) : [...current, flag])
  }

  async function copyOutput() {
    if (!result) return
    const output = result.display !== undefined
      ? result.display
      : result.matches.map(item => item.match).join('\n')
    try {
      await navigator.clipboard.writeText(output)
      setStatus('Result copied.')
      setError('')
    } catch {
      setError('Clipboard unavailable.')
    }
  }

  function loadSample(patternValue = samplePatterns[0].pattern) {
    invalidate()
    setPattern(patternValue)
    setTestText(sampleText)
    setMode('test')
  }

  const highlighted = useMemo(() => {
    if (!result || result.display !== undefined) return null
    const pieces: { text: string; matched?: boolean }[] = []
    let cursor = 0
    for (const item of result.matches) {
      if (item.index > cursor) pieces.push({ text: testText.slice(cursor, item.index) })
      if (item.match.length === 0) {
        pieces.push({ text: '∅', matched: true })
        cursor = item.index
      } else {
        pieces.push({ text: item.match, matched: true })
        cursor = item.index + item.match.length
      }
    }
    if (cursor < testText.length) pieces.push({ text: testText.slice(cursor) })
    return pieces.length ? pieces : [{ text: testText }]
  }, [result, testText])

  const canCopy = Boolean(result && (result.display !== undefined || result.matches.length > 0))
  const outputLabel = mode === 'replace' ? 'Replacement result' : mode === 'split' ? 'Split result' : 'Highlighted test text'

  return <div>
    <div className="grid gap-5 lg:grid-cols-2">
      <ToolPanel>
        <div className="space-y-5">
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-primary">Mode</legend>
            <div className="flex flex-wrap gap-2">
              {(['test', 'replace', 'split'] as const).map(value => <button key={value} type="button" onClick={() => { invalidate(); setMode(value) }} aria-pressed={mode === value} className={`rounded-lg px-3 py-2 text-sm capitalize ${mode === value ? 'bg-[#347a58] text-white' : 'border border-border text-secondary hover:bg-hover'}`}>{value}</button>)}
            </div>
          </fieldset>
          <div>
            <label htmlFor="regex-pattern" className="mb-2 block text-sm font-semibold text-primary">Pattern <span className="font-normal text-secondary">/{pattern || 'pattern'}/{currentFlags}</span></label>
            <input id="regex-pattern" value={pattern} onChange={event => { invalidate(); setPattern(event.target.value) }} placeholder="[a-zA-Z]+" maxLength={Regex.MAX_PATTERN_CHARS} className="w-full rounded-xl border border-border bg-input p-3 font-mono text-sm text-primary focus:outline-none focus:ring-2 focus:ring-[#347a58]" />
            <div className="mt-2 flex flex-wrap gap-1">{samplePatterns.map(item => <button type="button" key={item.name} onClick={() => { invalidate(); setPattern(item.pattern) }} className="rounded-md border border-border px-2 py-1 text-xs text-secondary hover:bg-hover">{item.name}</button>)}</div>
          </div>
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-primary">Flags</legend>
            <div className="flex flex-wrap gap-2">{Regex.flagOptions.map(flag => <button type="button" key={flag.value} onClick={() => toggleFlag(flag.value)} aria-pressed={flags.includes(flag.value)} title={flag.description} className={`rounded-lg border px-3 py-1.5 text-xs ${flags.includes(flag.value) ? 'border-[#347a58] bg-[#347a58] text-white' : 'border-border text-secondary hover:bg-hover'}`}>{flag.label}</button>)}</div>
          </fieldset>
          <div>
            <label htmlFor="regex-test-text" className="mb-2 block text-sm font-semibold text-primary">Test text</label>
            <textarea id="regex-test-text" value={testText} onChange={event => { invalidate(); setTestText(event.target.value) }} maxLength={Regex.MAX_INPUT_CHARS} placeholder="Paste text to test…" className="min-h-36 w-full rounded-xl border border-border bg-input p-3 font-mono text-sm text-primary focus:outline-none focus:ring-2 focus:ring-[#347a58]" />
            <p className="mt-1 text-right text-xs text-secondary">{testText.length.toLocaleString()} / {Regex.MAX_INPUT_CHARS.toLocaleString()}</p>
          </div>
          {mode === 'replace' && <div>
            <label htmlFor="regex-replacement" className="mb-2 block text-sm font-semibold text-primary">Replacement</label>
            <input id="regex-replacement" value={replacement} onChange={event => { invalidate(); setReplacement(event.target.value) }} maxLength={Regex.MAX_REPLACEMENT_CHARS} placeholder="$1 replacement" className="w-full rounded-xl border border-border bg-input p-3 font-mono text-sm text-primary focus:outline-none focus:ring-2 focus:ring-[#347a58]" />
            <p className="mt-1 text-right text-xs text-secondary">Up to {Regex.MAX_REPLACEMENT_CHARS.toLocaleString()} characters</p>
          </div>}
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={handleRun} disabled={busy} className="btn btn-primary"><i className={`fa-solid ${busy ? 'fa-spinner fa-spin' : 'fa-play'}`} aria-hidden="true" />{busy ? 'Running…' : 'Run regex'}</button>
            <button type="button" onClick={() => { invalidate(); setPattern(''); setTestText(''); setReplacement('') }} className="btn btn-outline">Clear</button>
            <button type="button" onClick={() => loadSample()} className="btn btn-outline">Load sample</button>
          </div>
        </div>
      </ToolPanel>
      <ToolPanel>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-primary">Results</h2>
          <span className="text-xs text-secondary">{result ? `${result.count.toLocaleString()} ${mode === 'split' ? 'delimiters' : 'matches'}` : busy ? 'Running' : 'Ready'}</span>
        </div>
        <div aria-label={outputLabel} className="min-h-48 max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-border bg-input p-4 font-mono text-sm text-primary">
          {result?.display !== undefined ? result.display : highlighted ? highlighted.map((piece, index) => piece.matched ? <mark key={index} className="rounded bg-yellow-300/70 px-0.5 text-inherit dark:bg-yellow-500/30">{piece.text}</mark> : <span key={index}>{piece.text}</span>) : 'Run a pattern to see the result.'}
        </div>
        {mode === 'test' && result?.matches.length ? <div className="mt-4 max-h-56 overflow-auto rounded-xl border border-border p-3">
          <h3 className="mb-2 text-sm font-semibold text-primary">Matches and capture groups</h3>
          {result.matches.map((item, index) => <div key={`${item.index}-${index}`} className="border-b border-border py-2 text-sm last:border-0"><code className="break-all text-primary">{item.match || '∅ (zero-width)'}</code><span className="ml-2 text-xs text-secondary">index {item.index}</span>{item.groups && Object.entries(item.groups).map(([key, value]) => <div key={key} className="pl-3 text-xs text-secondary">${key}: {value}</div>)}</div>)}
        </div> : null}
        <button type="button" onClick={copyOutput} disabled={!canCopy} className="btn btn-outline mt-4 text-sm disabled:opacity-50"><i className="fa-solid fa-copy" aria-hidden="true" />{mode === 'test' ? 'Copy matches' : 'Copy result'}</button>
      </ToolPanel>
    </div>
    <p role={error ? 'alert' : 'status'} aria-live={error ? 'assertive' : 'polite'} className={`mt-4 min-h-6 text-sm ${error ? 'text-red-600 dark:text-red-300' : 'text-secondary'}`}>{error || status}</p>
  </div>
}
