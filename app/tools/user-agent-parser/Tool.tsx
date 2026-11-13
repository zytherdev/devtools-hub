'use client'

import { useState, type FormEvent } from 'react'
import { ToolPanel } from '@/app/components/ToolPanel'
import { MAX_USER_AGENT_LENGTH, parseUserAgent, type ParsedUserAgent } from './logic'
import { tool } from './definition'

const exampleInput = tool.exampleInput
const focusClass = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus'

export default function UserAgentParser() {
  const [userAgent, setUserAgent] = useState(exampleInput)
  const [result, setResult] = useState<ParsedUserAgent | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      setResult(parseUserAgent(userAgent))
      setError(null)
    } catch (caught) {
      setResult(null)
      setError(caught instanceof Error ? caught.message : 'Unable to parse this user-agent string.')
    }
  }

  const handleExample = () => {
    setUserAgent(exampleInput)
    try {
      setResult(parseUserAgent(exampleInput))
      setError(null)
    } catch {
      setResult(null)
      setError('The built-in example could not be parsed.')
    }
  }

  return (
    <div className="min-w-0 space-y-6">
      <ToolPanel>
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label htmlFor="user-agent-input" className="mb-2 block font-medium text-primary">User-agent string</label>
            <textarea
              id="user-agent-input"
              name="userAgent"
              value={userAgent}
              onChange={event => {
                setUserAgent(event.target.value)
                setResult(null)
                setError(null)
              }}
              maxLength={MAX_USER_AGENT_LENGTH}
              rows={4}
              autoComplete="off"
              spellCheck={false}
              aria-invalid={error !== null}
              aria-describedby="user-agent-help user-agent-feedback"
              className={`w-full resize-y rounded-lg border border-border bg-input p-3 font-mono text-sm text-primary ${focusClass}`}
              placeholder="Paste a browser user-agent string"
            />
            <p id="user-agent-help" className="mt-2 text-sm text-secondary">
              Parsing runs locally in your browser. User-agent strings are spoofable, and uncommon clients may be classified as unknown.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="submit" className={`rounded-lg bg-primary px-4 py-2 text-white transition hover:opacity-90 ${focusClass}`}>
              Parse user agent
            </button>
            <button type="button" onClick={handleExample} className={`rounded-lg border border-border px-4 py-2 text-primary transition hover:bg-hover ${focusClass}`}>
              Load example
            </button>
          </div>
          <div
            id="user-agent-feedback"
            role={error ? 'alert' : 'status'}
            aria-live={error ? 'assertive' : 'polite'}
            className={`min-h-6 text-sm ${error ? 'text-red-600 dark:text-red-300' : 'text-secondary'}`}
          >
            {error ?? (result ? 'Parsed locally. Treat the reported client details as an estimate.' : 'No network requests are made.')}
          </div>
        </form>
      </ToolPanel>

      {result && (
        <ToolPanel>
          <section aria-labelledby="user-agent-result-heading" className="space-y-4">
            <h2 id="user-agent-result-heading" className="font-medium text-primary">Parsed details</h2>
            <dl className="grid gap-4 sm:grid-cols-2">
              {([
                ['Browser', result.browser.name, result.browser.version],
                ['Engine', result.engine.name, result.engine.version],
                ['Operating system', result.os.name, result.os.version],
                ['Device', result.device.type, [result.device.vendor, result.device.model].filter(Boolean).join(' ') || null]
              ] as const).map(([label, name, version]) => (
                <div key={label} className="rounded-lg border border-border p-3">
                  <dt className="text-sm text-secondary">{label}</dt>
                  <dd className="mt-1 font-medium text-primary">
                    {name ?? 'Unknown'}{version ? <span className="font-normal text-secondary"> · {version}</span> : null}
                  </dd>
                </div>
              ))}
            </dl>
            <details>
              <summary className="cursor-pointer text-sm text-secondary">Show structured result</summary>
              <pre className="mt-3 overflow-x-auto rounded-lg bg-input p-3 text-xs text-primary" aria-label="Structured parser result">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </section>
        </ToolPanel>
      )}
    </div>
  )
}
