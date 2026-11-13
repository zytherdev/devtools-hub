'use client'

import { useState } from 'react'
import { ToolPanel } from '@/app/components/ToolPanel'
import { tool } from './definition'
import { calculate, type SubnetResult } from './logic'

const SAMPLE = tool.exampleInput

export default function Tool() {
  const [input, setInput] = useState(SAMPLE)
  const [result, setResult] = useState<SubnetResult | null>(null)
  const [error, setError] = useState('')

  function process(value = input) {
    setError('')
    setResult(null)
    try {
      setResult(calculate(value))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not calculate this subnet.')
    }
  }

  function updateInput(value: string) {
    setInput(value)
    setError('')
    setResult(null)
  }

  const fields: Array<[string, string]> = result?.version === 4
    ? [
        ['IP version', 'IPv4'],
        ['Prefix length', `/${result.prefixLength}`],
        ['Network address', result.networkAddress],
        ['Broadcast address', result.broadcastAddress],
        ['Subnet mask', result.subnetMask],
        ['Wildcard mask', result.wildcardMask],
        ['First usable address', result.firstUsableAddress],
        ['Last usable address', result.lastUsableAddress],
        ['Total addresses', result.totalAddresses],
        ['Usable host count', result.usableHostCount],
        ['Input is network address', result.isNetworkAddress ? 'Yes' : 'No'],
        ['Input is broadcast address', result.isBroadcastAddress ? 'Yes' : 'No'],
      ]
    : result
      ? [
          ['IP version', 'IPv6'],
          ['Prefix length', `/${result.prefixLength}`],
          ['Network address', result.networkAddress],
          ['Last address', result.lastAddress],
          ['Total addresses', result.totalAddresses],
          ['Input is network address', result.isNetworkAddress ? 'Yes' : 'No'],
        ]
      : []

  return (
    <div className="space-y-4">
      <ToolPanel className="p-4 sm:p-5">
        <form
          onSubmit={event => {
            event.preventDefault()
            process()
          }}
          className="space-y-3"
        >
          <div>
            <label htmlFor="subnet-cidr-input" className="mb-2 block text-sm font-semibold text-primary">
              IPv4 or IPv6 CIDR address
            </label>
            <input
              id="subnet-cidr-input"
              type="text"
              value={input}
              maxLength={64}
              required
              spellCheck={false}
              autoCapitalize="none"
              autoComplete="off"
              placeholder="192.168.1.10/24 or 2001:db8::1/64"
              onChange={event => updateInput(event.target.value)}
              onKeyDown={event => {
                if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                  event.preventDefault()
                  process()
                }
              }}
              className="w-full rounded-lg border border-border bg-input px-3 py-3 font-mono text-sm text-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
              aria-describedby="subnet-cidr-help"
              aria-invalid={Boolean(error)}
            />
            <p id="subnet-cidr-help" className="mt-2 text-xs text-secondary">
              Enter one address and prefix separated by a slash. Calculation stays on this device.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="submit" className="btn btn-primary text-sm">
              <i className="fa-solid fa-calculator" aria-hidden="true" /> Calculate subnet
            </button>
            <button type="button" onClick={() => { updateInput(SAMPLE); process(SAMPLE) }} className="btn btn-outline text-sm">
              Load example
            </button>
            <button type="button" onClick={() => { updateInput(''); setResult(null); setError('') }} className="btn btn-outline text-sm">
              Clear
            </button>
          </div>
        </form>
      </ToolPanel>

      {error && <p role="alert" className="rounded-lg border border-red-300/50 bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">{error}</p>}

      {result && (
        <ToolPanel className="p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold text-primary">IPv{result.version} subnet results</h2>
            <span className="rounded-full bg-primary px-3 py-1 text-xs text-white">{result.input}</span>
          </div>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {fields.map(([label, value]) => (
              <div key={label} className="min-w-0 rounded-lg border border-border bg-input px-3 py-2">
                <dt className="text-xs text-secondary">{label}</dt>
                <dd className="mt-1 break-all font-mono text-sm text-primary">{value}</dd>
              </div>
            ))}
          </dl>
        </ToolPanel>
      )}

      <p role="status" className="text-xs text-secondary">
        Supports strict IPv4 and IPv6 CIDR addresses. IPv4 includes subnet and usable-host details; IPv6 includes address-range details without broadcast or usable-host fields.
      </p>
    </div>
  )
}
