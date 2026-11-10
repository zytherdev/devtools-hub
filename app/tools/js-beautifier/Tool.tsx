'use client'

import { useRef, useState } from 'react'
import { beautifyJS, type JSSyntax } from '@/app/tools/js-beautifier/logic'

const sample = `type ApiResponse<T> = { data: T; ok: boolean };
const Greeting = <T,>({ name, value }: { name: string; value: T }) => (
  <div className="greeting">Hello, {name}: {String(value)}</div>
);`
const syntaxOptions: { value: JSSyntax; label: string }[] = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'jsx', label: 'JSX' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'tsx', label: 'TSX' },
]
const syntaxExtensions: Record<JSSyntax, string> = { javascript: 'js', jsx: 'jsx', typescript: 'ts', tsx: 'tsx' }

export default function JSBeautifier() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [syntax, setSyntax] = useState<JSSyntax>('javascript')
  const [indentSize, setIndentSize] = useState(2)
  const [indentChar, setIndentChar] = useState<' ' | '\t'>(' ')
  const [wrapLineLength, setWrapLineLength] = useState(100)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('Ready')
  const [busy, setBusy] = useState(false)
  const runId = useRef(0)

  function invalidateResult() {
    runId.current += 1
    setOutput('')
    setError('')
    setStatus('')
    setBusy(false)
  }

  async function format() {
    const currentRun = ++runId.current
    setError('')
    setStatus('')
    setBusy(true)
    try {
      const result = await beautifyJS(input, { syntax, indentSize, indentChar, wrapLineLength })
      if (currentRun === runId.current) {
        setOutput(result)
        setStatus('Formatted successfully.')
      }
    } catch (cause) {
      if (currentRun === runId.current) {
        setOutput('')
        setError(cause instanceof Error ? cause.message : 'Could not format this source.')
      }
    } finally {
      if (currentRun === runId.current) setBusy(false)
    }
  }

  async function copy() {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      setStatus('Copied to clipboard.')
      setError('')
    } catch {
      setError('Clipboard access was denied by this browser.')
    }
  }

  function download() {
    if (!output) return
    const extension = syntaxExtensions[syntax]
    const url = URL.createObjectURL(new Blob([output], { type: 'text/plain;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `formatted.${extension}`
    anchor.click()
    URL.revokeObjectURL(url)
    setStatus(`Downloaded formatted.${extension}.`)
  }

  return <div>
    <p className="mb-4 text-sm text-secondary">Format JavaScript, JSX, TypeScript, and TSX locally. Choose the syntax explicitly so the matching parser handles ambiguous code correctly.</p>
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="tool-panel p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <label htmlFor="js-beautifier-input" className="text-sm font-semibold text-primary">Input</label>
          <button type="button" onClick={() => { setSyntax('tsx'); setInput(sample); invalidateResult(); setStatus('Example loaded as TSX.') }} className="text-xs font-medium text-secondary hover:text-primary">Load sample</button>
        </div>
        <textarea id="js-beautifier-input" value={input} onChange={event => { setInput(event.target.value); invalidateResult() }} spellCheck={false} placeholder="Paste JavaScript, JSX, TypeScript, or TSX code…" className="min-h-80 w-full resize-y rounded-xl border border-border bg-input p-4 font-mono text-sm leading-6 text-primary focus:outline-none focus:ring-2 focus:ring-[#347a58]" />
        <p className="mt-2 text-right text-xs text-secondary">{input.length.toLocaleString()} / 100,000 characters</p>
      </section>
      <section className="tool-panel p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between"><label htmlFor="js-beautifier-output" className="text-sm font-semibold text-primary">Formatted output</label><span className="text-xs text-secondary">{output.length.toLocaleString()} chars</span></div>
        <textarea id="js-beautifier-output" value={output} readOnly spellCheck={false} placeholder="Formatted code appears here…" className="min-h-80 w-full resize-y rounded-xl border border-border bg-input-readonly p-4 font-mono text-sm leading-6 text-primary focus:outline-none" />
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={copy} disabled={!output} className="btn btn-outline text-sm disabled:opacity-50"><i className="fa-solid fa-copy" aria-hidden="true" />Copy</button>
          <button type="button" onClick={download} disabled={!output} className="btn btn-outline text-sm disabled:opacity-50"><i className="fa-solid fa-download" aria-hidden="true" />Download .{syntaxExtensions[syntax]}</button>
        </div>
      </section>
    </div>
    <section className="tool-panel mt-4 flex flex-wrap items-end gap-4 p-4">
      <div><label htmlFor="js-beautifier-syntax" className="mb-1 block text-xs font-medium text-secondary">Source syntax</label><select id="js-beautifier-syntax" value={syntax} onChange={event => { setSyntax(event.target.value as JSSyntax); invalidateResult() }} className="rounded-lg border border-border bg-input px-3 py-2 text-sm text-primary">{syntaxOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>
      <div><label htmlFor="js-beautifier-indent" className="mb-1 block text-xs font-medium text-secondary">Indent</label><select id="js-beautifier-indent" value={indentSize} onChange={event => { setIndentChar(' '); setIndentSize(Number(event.target.value)); invalidateResult() }} className="rounded-lg border border-border bg-input px-3 py-2 text-sm text-primary"><option value={2}>2 spaces</option><option value={4}>4 spaces</option><option value={8}>8 spaces</option></select></div>
      <div><label htmlFor="js-beautifier-width" className="mb-1 block text-xs font-medium text-secondary">Line width</label><input id="js-beautifier-width" type="number" min={40} max={160} step={1} value={wrapLineLength} onChange={event => { setWrapLineLength(Number(event.target.value)); invalidateResult() }} className="w-24 rounded-lg border border-border bg-input px-3 py-2 text-sm text-primary" /></div>
      <button type="button" onClick={() => { setIndentChar(' '); invalidateResult() }} aria-pressed={indentChar === ' '} className="btn btn-outline text-sm">Spaces</button>
      <button type="button" onClick={() => { setIndentChar('\t'); invalidateResult() }} aria-pressed={indentChar === '\t'} className="btn btn-outline text-sm">Use tabs</button>
      <button type="button" onClick={() => void format()} disabled={busy} className="btn btn-primary ml-auto min-h-10 px-5 text-sm disabled:opacity-60"><i className={`fa-solid ${busy ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'}`} aria-hidden="true" />{busy ? 'Formatting…' : 'Format code'}</button>
    </section>
    <p role="status" aria-live="polite" className={`mt-3 min-h-6 text-sm ${error ? 'text-red-600 dark:text-red-300' : 'text-secondary'}`}>{error || status}</p>
  </div>
}
