'use client'

import { useEffect, useState } from 'react'

type FormatPreferences = { indentSize: number; indentChar: ' ' | '\t'; wrapLineLength: number }
type Props = { title: string; description: string; language: string; sample: string; format: (source: string, preferences: FormatPreferences) => Promise<string> }

export function CodeFormatter({ language, sample, format }: Props) {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [indentSize, setIndentSize] = useState(2)
  const [indentChar, setIndentChar] = useState<' ' | '\t'>(' ')
  const [wrapLineLength, setWrapLineLength] = useState(100)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('Ready')
  const [busy, setBusy] = useState(false)

  async function run() {
    setError(''); setStatus(''); setBusy(true)
    try {
      const result = await format(input, { indentSize, indentChar, wrapLineLength })
      setOutput(result); setStatus('Formatted successfully.')
    } catch (cause) {
      setOutput(''); setError(cause instanceof Error ? cause.message : 'Could not format this source.')
    } finally { setBusy(false) }
  }

  useEffect(() => {
    const listener = (event: KeyboardEvent) => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); void run() } }
    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  })

  async function copy() {
    if (!output) return
    try { await navigator.clipboard.writeText(output); setStatus('Copied to clipboard.') }
    catch { setError('Clipboard access was denied by this browser.') }
  }

  return <div>
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="tool-panel p-4 sm:p-5"><div className="mb-3 flex items-center justify-between"><label htmlFor="formatter-input" className="text-sm font-semibold text-primary">Input</label><button type="button" onClick={() => { setInput(sample); setOutput(''); setError(''); setStatus('Example loaded.') }} className="text-xs font-medium text-secondary hover:text-primary">Load sample</button></div><textarea id="formatter-input" value={input} onChange={event => { setInput(event.target.value); setOutput(''); setStatus('') }} spellCheck={false} placeholder={`Paste ${language} code…`} className="min-h-80 w-full resize-y rounded-xl border border-border bg-input p-4 font-mono text-sm leading-6 text-primary focus:outline-none focus:ring-2 focus:ring-[#347a58]" /><p className="mt-2 text-right text-xs text-secondary">{input.length.toLocaleString()} characters</p></section>
      <section className="tool-panel p-4 sm:p-5"><div className="mb-3 flex items-center justify-between"><label htmlFor="formatter-output" className="text-sm font-semibold text-primary">Formatted output</label><span className="text-xs text-secondary">{output.length.toLocaleString()} chars</span></div><textarea id="formatter-output" value={output} readOnly spellCheck={false} placeholder="Formatted code appears here…" className="min-h-80 w-full resize-y rounded-xl border border-border bg-input-readonly p-4 font-mono text-sm leading-6 text-primary focus:outline-none" /><button type="button" onClick={copy} disabled={!output} className="btn btn-outline mt-3 text-sm disabled:opacity-50"><i className="fa-solid fa-copy" aria-hidden="true" />Copy</button></section>
    </div>
    <section className="tool-panel mt-4 flex flex-wrap items-end gap-4 p-4">
      <div><label htmlFor="format-indent" className="mb-1 block text-xs font-medium text-secondary">Indent</label><select id="format-indent" value={indentSize} onChange={event => { setIndentChar(' '); setIndentSize(Number(event.target.value)) }} className="rounded-lg border border-border bg-input px-3 py-2 text-sm text-primary"><option value={2}>2 spaces</option><option value={4}>4 spaces</option></select></div>
      <div><label htmlFor="format-width" className="mb-1 block text-xs font-medium text-secondary">Line width</label><input id="format-width" type="number" min={40} max={160} value={wrapLineLength} onChange={event => setWrapLineLength(Number(event.target.value))} className="w-24 rounded-lg border border-border bg-input px-3 py-2 text-sm text-primary" /></div>
      <button type="button" onClick={() => { setIndentChar(' '); setIndentSize(2) }} className="btn btn-outline text-sm">Spaces</button>
      <button type="button" onClick={() => { setIndentChar('\t'); setIndentSize(2) }} className="btn btn-outline text-sm">Use tabs</button>
      <button type="button" onClick={run} disabled={busy} className="btn btn-primary ml-auto min-h-10 px-5 text-sm disabled:opacity-60"><i className={`fa-solid ${busy ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'}`} aria-hidden="true" />{busy ? 'Formatting…' : 'Format code'}</button>
    </section>
    <p role="status" aria-live="polite" className={`mt-3 min-h-6 text-sm ${error ? 'text-red-600 dark:text-red-300' : 'text-secondary'}`}>{error || status}</p>
  </div>
}
