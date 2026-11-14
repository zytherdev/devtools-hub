'use client'

import { FormEvent, useState } from 'react'
import { ToolPanel } from '@/app/components/ToolPanel'
import { lookupVendor, MacLookupError, MacLookupResult, normalizeOui } from './logic'

const inputClass = 'w-full rounded-lg border border-border bg-input p-3 font-mono text-sm text-primary focus:outline-none focus:ring-2 focus:ring-border-focus'
const buttonClass = 'rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus disabled:cursor-not-allowed disabled:opacity-50'

function messageFor(error: unknown): string {
  if (error instanceof MacLookupError) return error.message
  return 'The lookup could not be completed. Please try again.'
}

export default function Tool() {
  const [address, setAddress] = useState('')
  const [result, setResult] = useState<MacLookupResult | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setError('')
    setResult(null)

    try {
      normalizeOui(address)
    } catch (cause) {
      setError(messageFor(cause))
      return
    }

    setBusy(true)
    try {
      setResult(await lookupVendor(address))
    } catch (cause) {
      setError(messageFor(cause))
    } finally {
      setBusy(false)
    }
  }

  function clear() {
    setAddress('')
    setResult(null)
    setError('')
  }

  return (
    <div className="space-y-4">
      <ToolPanel className="p-4 sm:p-5">
        <section aria-labelledby="mac-lookup-privacy-title" className="mb-5 rounded-lg border border-amber-400/50 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950 dark:bg-amber-950/30 dark:text-amber-100">
          <h2 id="mac-lookup-privacy-title" className="font-semibold">External lookup and privacy</h2>
          <p className="mt-1">
            Nothing is sent while you type. When you press <strong>Lookup</strong>, this tool sends only the first 24-bit OUI prefix (the first 6 hexadecimal digits) to{' '}
            <a href="https://macvendors.com/api" target="_blank" rel="noreferrer" className="underline underline-offset-2">MACVendors</a> over HTTPS. The remaining device-specific MAC bytes are never sent.
          </p>
          <p className="mt-1">
            MACVendors can also receive your IP address and standard browser/connection metadata. Its <a href="https://macvendors.com/privacy-policy" target="_blank" rel="noreferrer" className="underline underline-offset-2">privacy policy</a> says its servers may log IP addresses and describes its own data handling. This page does not save or log your address or result.
          </p>
        </section>

        <form onSubmit={event => void submit(event)} aria-busy={busy}>
          <label htmlFor="mac-lookup-address" className="mb-2 block text-sm font-semibold text-primary">MAC address or OUI</label>
          <input
            id="mac-lookup-address"
            type="text"
            inputMode="text"
            autoComplete="off"
            spellCheck={false}
            maxLength={32}
            value={address}
            disabled={busy}
            onChange={event => { setAddress(event.target.value); setResult(null); setError('') }}
            placeholder="00:11:22:AA:BB:CC or 00:11:22"
            aria-describedby="mac-lookup-help"
            className={`${inputClass} disabled:cursor-wait disabled:opacity-60`}
          />
          <p id="mac-lookup-help" className="mt-2 text-xs leading-5 text-secondary">
            Enter a 24-bit OUI or 48-bit MAC in hexadecimal, colon, dash, or Cisco dotted notation. Only its first three bytes are queried.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="submit" disabled={busy || !address.trim()} className={buttonClass}>{busy ? 'Looking up…' : 'Lookup'}</button>
            <button type="button" onClick={clear} disabled={busy} className="rounded-lg border border-border px-4 py-2 text-sm text-primary transition hover:bg-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus disabled:cursor-not-allowed disabled:opacity-50">Clear</button>
          </div>
        </form>

        {error && <p className="mt-4 rounded-lg border border-red-300/50 bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300" role="alert">{error}</p>}
      </ToolPanel>

      <ToolPanel className="p-4 sm:p-5">
        <h2 className="mb-3 text-sm font-semibold text-primary">Vendor result</h2>
        {result ? (
          <div role="status" aria-live="polite" className="rounded-lg border border-border bg-input-readonly p-4">
            <p className="text-xs uppercase tracking-wide text-secondary">OUI prefix</p>
            <p className="mt-1 font-mono text-sm text-primary">{result.oui.match(/.{2}/g)?.join(':')}</p>
            <p className="mt-4 text-xs uppercase tracking-wide text-secondary">Registered vendor</p>
            <p className="mt-1 break-words text-lg font-semibold text-primary">{result.vendor}</p>
          </div>
        ) : (
          <p className="min-h-14 rounded-lg border border-border bg-input-readonly p-4 text-sm leading-6 text-secondary" aria-live="polite">
            {busy ? 'Waiting for the provider response…' : 'Submit an address to view its registered vendor.'}
          </p>
        )}
        <p className="mt-3 text-xs leading-5 text-secondary">
          Vendor records may be incomplete or stale. Locally administered, randomized, or unregistered addresses may not identify a manufacturer. A vendor match identifies an OUI registration, not a specific device.
        </p>
      </ToolPanel>
    </div>
  )
}
