'use client'
import { useState } from 'react'
import { ToolPanel } from '@/app/components/ToolPanel'
import { tool } from './definition'
import { run } from './logic'

type ConvertedZone = {
  timeZone: string
  localDateTime: string
  utcOffset: string
  timeZoneName: string
  daylightSavingTime: boolean | null
  daylightSavingLabel: string
}
type Conversion = { instant: string; source: ConvertedZone; target: ConvertedZone }

const fieldClass = 'w-full rounded-lg border border-border bg-input p-3 font-mono text-sm text-primary focus:outline-none focus:ring-2 focus:ring-border-focus'
const buttonClass = 'rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus'

export default function Tool() {
  const [instant, setInstant] = useState('2024-06-15T12:00:00Z')
  const [fromTimeZone, setFromTimeZone] = useState('UTC')
  const [toTimeZone, setToTimeZone] = useState('America/New_York')
  const [result, setResult] = useState<Conversion | null>(null)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('Ready to convert.')

  function convert() {
    setError('')
    setResult(null)
    try {
      const converted = JSON.parse(run(JSON.stringify({ instant, fromTimeZone, toTimeZone }), {})) as Conversion
      setResult(converted)
      setStatus('Conversion complete. The input instant is identical in both time zones.')
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Could not convert this instant.'
      setError(message)
      setStatus('Conversion failed.')
    }
  }

  function clear() {
    setInstant('')
    setFromTimeZone('')
    setToTimeZone('')
    setResult(null)
    setError('')
    setStatus('Cleared.')
  }

  function loadSample() {
    const sample = JSON.parse(tool.exampleInput) as { instant: string; fromTimeZone: string; toTimeZone: string }
    setInstant(sample.instant)
    setFromTimeZone(sample.fromTimeZone)
    setToTimeZone(sample.toTimeZone)
    setResult(null)
    setError('')
    setStatus('Sample loaded. Convert it to see the result.')
  }

  async function copyResult() {
    if (!result) return
    try {
      await navigator.clipboard.writeText(JSON.stringify(result, null, 2))
      setError('')
      setStatus('JSON result copied to the clipboard.')
    } catch {
      setError('Clipboard access was denied by this browser.')
      setStatus('Could not copy the result.')
    }
  }

  function zoneCard(label: string, zone: ConvertedZone) {
    return (
      <section className="rounded-xl border border-border bg-input/40 p-4" aria-label={`${label} time`}>
        <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-primary">{label}</h3>
            <p className="mt-1 text-sm text-secondary">{zone.timeZone} · {zone.timeZoneName}</p>
          </div>
          <span className="rounded-full border border-border px-2.5 py-1 text-xs text-secondary">{zone.utcOffset}</span>
        </div>
        <p className="break-all font-mono text-lg font-semibold text-primary">{zone.localDateTime}</p>
        <p className="mt-3 text-sm text-secondary">
          {zone.daylightSavingTime === true ? 'Daylight saving time: in effect.' : zone.daylightSavingTime === false ? 'Daylight saving time: not in effect.' : 'Daylight saving time: undetermined.'}
        </p>
        <p className="mt-1 text-xs leading-5 text-secondary">{zone.daylightSavingLabel}</p>
      </section>
    )
  }

  return (
    <div className="space-y-4">
      <ToolPanel className="p-4 sm:p-5">
        <form onSubmit={event => { event.preventDefault(); convert() }}>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-3">
              <label htmlFor="timezone-converter-instant" className="mb-2 block text-sm font-semibold text-primary">ISO-8601 instant</label>
              <input id="timezone-converter-instant" value={instant} onChange={event => setInstant(event.target.value)} className={fieldClass} autoComplete="off" spellCheck={false} placeholder="2024-06-15T12:00:00Z" />
              <p className="mt-2 text-xs leading-5 text-secondary">Include an explicit UTC offset: Z or ±HH:MM. Seconds are optional; fractional seconds may contain up to three digits.</p>
            </div>
            <div>
              <label htmlFor="timezone-converter-from" className="mb-2 block text-sm font-semibold text-primary">Source IANA time zone</label>
              <input id="timezone-converter-from" value={fromTimeZone} onChange={event => setFromTimeZone(event.target.value)} className={fieldClass} autoComplete="off" spellCheck={false} placeholder="UTC" />
            </div>
            <div className="flex items-end justify-center pb-3 text-secondary" aria-hidden="true"><i className="fa-solid fa-arrow-right-long" /></div>
            <div>
              <label htmlFor="timezone-converter-to" className="mb-2 block text-sm font-semibold text-primary">Target IANA time zone</label>
              <input id="timezone-converter-to" value={toTimeZone} onChange={event => setToTimeZone(event.target.value)} className={fieldClass} autoComplete="off" spellCheck={false} placeholder="America/New_York" />
            </div>
          </div>
          <p className="mt-3 text-xs leading-5 text-secondary">This converter runs locally with the browser’s Intl time-zone database. It does not make network requests. Daylight-saving status is inferred from offsets observed across the instant’s UTC calendar year.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="submit" className={buttonClass}>Convert instant</button>
            <button type="button" onClick={clear} className="rounded-lg border border-border px-4 py-2 text-sm transition hover:bg-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus">Clear</button>
            <button type="button" onClick={loadSample} className="rounded-lg border border-border px-4 py-2 text-sm transition hover:bg-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus">Load sample</button>
          </div>
        </form>
        <p role={error ? 'alert' : 'status'} aria-live={error ? 'assertive' : 'polite'} className={`mt-4 min-h-6 text-sm ${error ? 'text-red-600 dark:text-red-300' : 'text-secondary'}`}>
          {error || status}
        </p>
      </ToolPanel>

      {result && (
        <ToolPanel className="p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-primary">Converted instant</h2>
              <p className="mt-1 break-all font-mono text-sm text-secondary">{result.instant}</p>
            </div>
            <button type="button" onClick={copyResult} className="rounded-lg border border-border px-3 py-2 text-sm transition hover:bg-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus">Copy JSON</button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {zoneCard('Source time', result.source)}
            {zoneCard('Target time', result.target)}
          </div>
        </ToolPanel>
      )}
    </div>
  )
}
