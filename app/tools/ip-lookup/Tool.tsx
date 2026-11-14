'use client'

import { useState, type FormEvent } from 'react'
import { ToolPanel } from '@/app/components/ToolPanel'
import { lookupIpAddress, validatePublicIp, type LookupResult } from './logic'

const focusClass = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus'

function show(value: string | number | null | undefined): string {
  return value === null || value === undefined || value === '' ? 'Not available' : String(value)
}

export default function Tool() {
  const [address, setAddress] = useState('')
  const [result, setResult] = useState<LookupResult | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setResult(null)
    setError('')
    const validation = validatePublicIp(address)
    if (!validation.valid) {
      setError(validation.reason)
      return
    }

    setLoading(true)
    try {
      setResult(await lookupIpAddress(address))
    } catch (lookupError) {
      setError(lookupError instanceof Error ? lookupError.message : 'The lookup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-w-0">
      <ToolPanel>
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label htmlFor="ip-address" className="mb-2 block font-medium text-primary">Public IPv4 or IPv6 address</label>
            <input
              id="ip-address"
              name="ip-address"
              type="text"
              inputMode="text"
              autoComplete="off"
              spellCheck={false}
              maxLength={45}
              value={address}
              onChange={event => {
                setAddress(event.target.value)
                setResult(null)
                setError('')
              }}
              aria-invalid={Boolean(error)}
              aria-describedby="ip-help ip-privacy ip-status"
              className={`w-full rounded-lg border border-border bg-input p-3 font-mono text-sm text-primary ${focusClass}`}
              placeholder="8.8.8.8 or 2001:4860:4860::8888"
            />
            <p id="ip-help" className="mt-2 text-sm text-secondary">Enter one public address only. Private, reserved, and special-use addresses are rejected locally.</p>
          </div>

          <p id="ip-privacy" className="rounded-lg border border-border bg-input p-3 text-sm text-secondary">
            Privacy: submitting a valid public IP sends that address to <strong className="font-semibold text-primary">ipwho.is</strong> over HTTPS for lookup. This tool does not look up an address automatically or store query results. The provider may process request data under its own policies.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className={`rounded-lg bg-primary px-4 py-2 text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 ${focusClass}`}
            >
              {loading ? 'Looking up…' : 'Look up IP'}
            </button>
            <span className="text-xs text-secondary">No request is made until you select “Look up IP”.</span>
          </div>

          <p
            id="ip-status"
            role={error ? 'alert' : 'status'}
            aria-live={error ? 'assertive' : 'polite'}
            className={`min-h-6 text-sm ${error ? 'text-red-600 dark:text-red-300' : 'text-secondary'}`}
          >
            {error || (loading ? 'Contacting ipwho.is…' : '')}
          </p>
        </form>
      </ToolPanel>

      {result && (
        <ToolPanel className="mt-6">
          <section aria-labelledby="ip-result-heading">
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="ip-result-heading" className="font-medium text-primary">Lookup result</h2>
              <span className="font-mono text-sm text-secondary">{result.ip} · {result.type}</span>
            </div>
            <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {[
                ['Continent', result.continent],
                ['Country', result.country],
                ['Country code', result.country_code],
                ['Region', result.region],
                ['City', result.city],
                ['Postal code', result.postal],
                ['Latitude', result.latitude],
                ['Longitude', result.longitude],
                ['ASN', result.connection.asn],
                ['Organization', result.connection.org],
                ['Internet provider', result.connection.isp],
                ['Network domain', result.connection.domain],
                ['Time zone', result.timezone.id],
                ['UTC offset', result.timezone.utc],
              ].map(([label, value]) => (
                <div key={label as string} className="border-b border-border pb-2">
                  <dt className="text-xs text-secondary">{label}</dt>
                  <dd className="mt-1 break-words text-sm text-primary">{show(value as string | number | null)}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-xs text-secondary">IP geolocation is approximate and may not identify a person, device, or precise physical location.</p>
          </section>
        </ToolPanel>
      )}

      <ToolPanel className="mt-6">
        <section aria-labelledby="ip-lookup-about">
          <h2 id="ip-lookup-about" className="mb-2 font-medium text-primary">About this lookup</h2>
          <p className="text-sm text-secondary">Results are supplied by ipwho.is and can be incomplete or inaccurate. The free provider service may be rate-limited or unavailable. Review the provider’s privacy policy before submitting an address.</p>
        </section>
      </ToolPanel>
    </div>
  )
}
