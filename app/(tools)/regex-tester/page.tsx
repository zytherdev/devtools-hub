'use client'

import { useMemo, useRef, useState } from 'react'
import { ToolPanel } from '@/app/components/ToolPanel'
import * as Regex from '@/app/lib/tools/text/testRegex'

type SafeMatch = { match: string; index: number; groups?: Record<string, string> }
type WorkerResult = { matches: SafeMatch[]; count: number; flags: string; pattern: string; display?: string; error?: string }

function runInWorker(pattern: string, flags: string, text: string, mode: 'test' | 'replace' | 'split', replacement: string) {
  return new Promise<WorkerResult>((resolve, reject) => {
    const workerCode = `self.onmessage = ({data}) => { try {
      const {pattern,flags,text,mode,replacement} = data;
      const re = new RegExp(pattern, flags);
      if (mode === 'replace') { const display = text.replace(re, replacement); if (display.length > 500000) throw new Error('Replacement output is too large.'); self.postMessage({matches:[],count:0,flags,pattern,display}); return; }
      if (mode === 'split') { const parts = text.split(re); if (parts.length > 10001) throw new Error('Split produced too many parts.'); self.postMessage({matches:[],count:Math.max(0,parts.length-1),flags,pattern,display:parts.join('\\n\\n─────\\n\\n')}); return; }
      const matches = []; let match;
      while ((match = re.exec(text)) !== null) {
        const groups = {}; if (match.groups) Object.assign(groups, match.groups);
        for (let i=1;i<match.length;i++) if (match[i] !== undefined && !Object.prototype.hasOwnProperty.call(groups,String(i))) groups[String(i)] = match[i];
        matches.push({match:match[0],index:match.index,groups:Object.keys(groups).length ? groups : undefined});
        if (matches.length > 5000) throw new Error('More than 5,000 matches. Refine your pattern or shorten the input.');
        if (!flags.includes('g')) break;
        if (match[0].length === 0) { const cp = text.codePointAt(re.lastIndex); re.lastIndex += (flags.includes('u') && cp !== undefined && cp > 0xFFFF) ? 2 : 1; }
      }
      self.postMessage({matches,count:matches.length,flags,pattern});
    } catch(e) { self.postMessage({matches:[],count:0,flags:data.flags,pattern:data.pattern,error:e instanceof Error ? e.message : 'Regex failed.'}); } };`
    const url = URL.createObjectURL(new Blob([workerCode], { type: 'text/javascript' }))
    const worker = new Worker(url)
    let settled = false
    const timer = window.setTimeout(() => {
      if (settled) return
      settled = true; worker.terminate(); URL.revokeObjectURL(url)
      reject(new Error('Pattern took too long and was stopped. Check for catastrophic backtracking.'))
    }, 500)
    worker.onmessage = event => { if (settled) return; settled = true; clearTimeout(timer); worker.terminate(); URL.revokeObjectURL(url); resolve(event.data as WorkerResult) }
    worker.onerror = () => { if (settled) return; settled = true; clearTimeout(timer); worker.terminate(); URL.revokeObjectURL(url); reject(new Error('The isolated regex worker failed.')) }
    worker.postMessage({ pattern, flags, text, mode, replacement })
  })
}

export default function RegexTester() {
  const [pattern, setPattern] = useState('')
  const [flags, setFlags] = useState<string[]>(['g', 'i'])
  const [testText, setTestText] = useState('')
  const [replacement, setReplacement] = useState('')
  const [mode, setMode] = useState<'test' | 'replace' | 'split'>('test')
  const [result, setResult] = useState<WorkerResult | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const requestId = useRef(0)
  const currentFlags = useMemo(() => [...flags].sort().join(''), [flags])
  const samplePatterns = [{name:'Email',pattern:'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}'},{name:'URL',pattern:'https?://[^\\s]+'},{name:'Phone',pattern:'\\d{3}[-.]?\\d{3}[-.]?\\d{4}'},{name:'Word',pattern:'\\b\\w+\\b'},{name:'Number',pattern:'\\d+'}]
  const sampleText = 'Hello world! Contact email@example.com or visit https://example.com. Call 123-456-7890.'

  async function handleRun() {
    const id = ++requestId.current
    setError(''); setBusy(true); setResult(null)
    if (pattern.length > 500 || testText.length > 200000) { setError('Pattern limit: 500 characters; input limit: 200,000 characters.'); setBusy(false); return }
    try {
      const value = await runInWorker(pattern, currentFlags, testText, mode, replacement)
      if (id !== requestId.current) return
      if (value.error) setError(value.error)
      setResult(value)
    } catch (cause) { if (id === requestId.current) setError(cause instanceof Error ? cause.message : 'Regex failed.') }
    finally { if (id === requestId.current) setBusy(false) }
  }

  function toggleFlag(flag: string) { setFlags(current => current.includes(flag) ? current.filter(value => value !== flag) : [...current, flag]) }
  async function copyMatches() {
    if (!result?.matches.length) return
    try { await navigator.clipboard.writeText(result.matches.map(item => item.match).join('\n')) }
    catch { setError('Clipboard access was denied by this browser.') }
  }
  function loadSample(p = samplePatterns[0].pattern) { setPattern(p); setTestText(sampleText); setMode('test'); setResult(null); setError('') }

  const highlighted = useMemo(() => {
    if (!result || result.display !== undefined || result.error) return null
    const pieces: { text: string; matched?: boolean }[] = []
    let cursor = 0
    for (const item of result.matches) {
      if (item.index > cursor) pieces.push({ text: testText.slice(cursor, item.index) })
      if (item.match.length === 0) { pieces.push({ text: '∅', matched: true }); cursor = item.index }
      else { pieces.push({ text: item.match, matched: true }); cursor = item.index + item.match.length }
    }
    if (cursor < testText.length) pieces.push({ text: testText.slice(cursor) })
    return pieces.length ? pieces : [{ text: testText }]
  }, [result, testText])

  return <div>
    <div className="mb-8"><div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600"><i className="fa-solid fa-code" aria-hidden="true" /></div><h1 className="text-3xl font-semibold tracking-tight text-primary sm:text-4xl">Regex Tester</h1><p className="mt-2 max-w-2xl text-secondary">Test, debug, and visualize regular expressions. Runs in an isolated worker with a time limit.</p></div>
    <div className="grid gap-5 lg:grid-cols-2">
      <ToolPanel>
        <div className="space-y-5">
          <fieldset><legend className="mb-2 text-sm font-semibold text-primary">Mode</legend><div className="flex gap-2">{(['test','replace','split'] as const).map(value => <button key={value} type="button" onClick={() => { setMode(value); setResult(null) }} aria-pressed={mode === value} className={`rounded-lg px-3 py-2 text-sm capitalize ${mode === value ? 'bg-[#347a58] text-white' : 'border border-border text-secondary hover:bg-hover'}`}>{value}</button>)}</div></fieldset>
          <div><label htmlFor="regex-pattern" className="mb-2 block text-sm font-semibold text-primary">Pattern <span className="font-normal text-secondary">/{pattern || 'pattern'}/{currentFlags}</span></label><input id="regex-pattern" value={pattern} onChange={event => { setPattern(event.target.value); setResult(null) }} placeholder="[a-zA-Z]+" maxLength={500} className="w-full rounded-xl border border-border bg-input p-3 font-mono text-sm text-primary focus:outline-none focus:ring-2 focus:ring-[#347a58]" /><div className="mt-2 flex flex-wrap gap-1">{samplePatterns.map(item => <button type="button" key={item.name} onClick={() => setPattern(item.pattern)} className="rounded-md border border-border px-2 py-1 text-xs text-secondary hover:bg-hover">{item.name}</button>)}</div></div>
          <fieldset><legend className="mb-2 text-sm font-semibold text-primary">Flags</legend><div className="flex flex-wrap gap-2">{Regex.flagOptions.map(flag => <button type="button" key={flag.value} onClick={() => toggleFlag(flag.value)} aria-pressed={flags.includes(flag.value)} title={flag.description} className={`rounded-lg border px-3 py-1.5 text-xs ${flags.includes(flag.value) ? 'border-[#347a58] bg-[#347a58] text-white' : 'border-border text-secondary hover:bg-hover'}`}>{flag.label}</button>)}</div></fieldset>
          <div><label htmlFor="regex-test-text" className="mb-2 block text-sm font-semibold text-primary">Test text</label><textarea id="regex-test-text" value={testText} onChange={event => { setTestText(event.target.value); setResult(null) }} maxLength={200000} placeholder="Paste text to test…" className="min-h-36 w-full rounded-xl border border-border bg-input p-3 font-mono text-sm text-primary focus:outline-none focus:ring-2 focus:ring-[#347a58]" /><p className="mt-1 text-right text-xs text-secondary">{testText.length.toLocaleString()} / 200,000</p></div>
          {mode === 'replace' && <div><label htmlFor="regex-replacement" className="mb-2 block text-sm font-semibold text-primary">Replacement</label><input id="regex-replacement" value={replacement} onChange={event => setReplacement(event.target.value)} placeholder="$1 replacement" className="w-full rounded-xl border border-border bg-input p-3 font-mono text-sm text-primary" /></div>}
          <div className="flex flex-wrap gap-2"><button type="button" onClick={handleRun} disabled={busy} className="btn btn-primary"><i className={`fa-solid ${busy ? 'fa-spinner fa-spin' : 'fa-play'}`} aria-hidden="true" />{busy ? 'Testing…' : 'Run test'}</button><button type="button" onClick={() => { requestId.current++; setPattern(''); setTestText(''); setReplacement(''); setResult(null); setError(''); setBusy(false) }} className="btn btn-outline">Clear</button><button type="button" onClick={() => loadSample()} className="btn btn-outline">Load sample</button></div>
        </div>
      </ToolPanel>
      <ToolPanel>
        <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-semibold text-primary">Results</h2><span className="text-xs text-secondary">{result ? `${result.count} matches` : 'Ready'}</span></div>
        <div aria-label="Regex result text" className="min-h-48 max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-border bg-input p-4 font-mono text-sm text-primary" aria-live="polite">
          {result?.display !== undefined ? result.display : highlighted ? highlighted.map((piece, index) => piece.matched ? <mark key={index} className="rounded bg-yellow-300/70 px-0.5 text-inherit dark:bg-yellow-500/30">{piece.text}</mark> : <span key={index}>{piece.text}</span>) : 'Run a pattern to see the result.'}
        </div>
        {result?.matches.length ? <div className="mt-4 max-h-56 overflow-auto rounded-xl border border-border p-3"><h3 className="mb-2 text-sm font-semibold text-primary">Matches and capture groups</h3>{result.matches.map((item,index) => <div key={`${item.index}-${index}`} className="border-b border-border py-2 text-sm last:border-0"><code className="break-all text-primary">{item.match || '∅ (zero-width)'}</code><span className="ml-2 text-xs text-secondary">index {item.index}</span>{item.groups && Object.entries(item.groups).map(([key,value]) => <div key={key} className="pl-3 text-xs text-secondary">${key}: {value}</div>)}</div>)}</div> : null}
        <button type="button" onClick={copyMatches} disabled={!result?.matches.length} className="btn btn-outline mt-4 text-sm disabled:opacity-50"><i className="fa-solid fa-copy" aria-hidden="true" />Copy matches</button>
      </ToolPanel>
    </div>
    <p role="status" aria-live="polite" className={`mt-4 min-h-6 text-sm ${error ? 'text-red-600 dark:text-red-300' : 'text-secondary'}`}>{error || (result && !result.error ? `${result.count} ${result.count === 1 ? 'match' : 'matches'} found.` : '')}</p>
  </div>
}
