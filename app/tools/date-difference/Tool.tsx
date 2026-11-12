'use client'
import { useState } from 'react'
import { ToolPanel } from '@/app/components/ToolPanel'
import { run } from './logic'

const fieldClass = 'w-full rounded-lg border border-border bg-input p-3 font-mono text-sm text-primary focus:outline-none focus:ring-2 focus:ring-border-focus'
const buttonClass = 'rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus'

export default function Tool() {
  const [start, setStart] = useState('2024-02-29')
  const [end, setEnd] = useState('2025-03-01')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  function calculate() {
    setError('')
    setOutput('')
    try {
      setOutput(run(JSON.stringify({ start, end }), {}))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not calculate this date difference.')
    }
  }

  function clear() {
    setStart('')
    setEnd('')
    setOutput('')
    setError('')
  }

  return (
    <div className="space-y-4">
      <ToolPanel className="p-4 sm:p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="date-difference-start" className="mb-2 block text-sm font-semibold text-primary">Start date or date-time</label>
            <input id="date-difference-start" value={start} onChange={event => setStart(event.target.value)} className={fieldClass} autoComplete="off" spellCheck={false} placeholder="2024-02-29 or 2024-02-29T12:00:00Z" />
          </div>
          <div>
            <label htmlFor="date-difference-end" className="mb-2 block text-sm font-semibold text-primary">End date or date-time</label>
            <input id="date-difference-end" value={end} onChange={event => setEnd(event.target.value)} className={fieldClass} autoComplete="off" spellCheck={false} placeholder="2025-03-01 or 2025-03-01T12:00:00-04:00" />
          </div>
        </div>
        <p className="mt-3 text-xs leading-5 text-secondary">
          Date-only values are interpreted as midnight UTC. Date-times must include seconds and an explicit Z or ±HH:MM offset; they are normalized to UTC. No local time zone or locale parsing is used.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={calculate} className={buttonClass}>Calculate difference</button>
          <button type="button" onClick={clear} className="rounded-lg border border-border px-4 py-2 text-sm transition hover:bg-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus">Clear</button>
        </div>
        {error && <p className="mt-4 rounded-lg border border-red-300/50 bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300" role="alert">{error}</p>}
      </ToolPanel>
      <ToolPanel className="p-4 sm:p-5">
        <h2 className="mb-3 text-sm font-semibold text-primary">Difference result</h2>
        <pre className="min-h-28 overflow-x-auto rounded-lg border border-border bg-input-readonly p-4 font-mono text-sm leading-6 text-primary" aria-live="polite">{output || 'Calculate to see the calendar and elapsed-time difference.'}</pre>
      </ToolPanel>
    </div>
  )
}
