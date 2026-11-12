'use client'

import { useState } from 'react'
import { ToolPanel } from '@/app/components/ToolPanel'
import { HASH_ALGORITHMS, MAX_INPUT_BYTES, verifyHash, type HashAlgorithm } from './logic'

export default function Tool() {
  const [input, setInput] = useState('')
  const [expectedDigest, setExpectedDigest] = useState('')
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>('SHA-256')
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; message: string; digest?: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const inputBytes = new TextEncoder().encode(input).byteLength

  async function verify() {
    setFeedback(null)
    setBusy(true)
    try {
      const result = await verifyHash(input, expectedDigest, algorithm)
      setFeedback({
        kind: 'success',
        message: result.matches ? 'Match: the text produces the expected digest.' : 'No match: the text does not produce the expected digest.',
        digest: result.computedDigest,
      })
    } catch (error) {
      setFeedback({ kind: 'error', message: error instanceof Error ? error.message : 'Could not verify this digest.' })
    } finally {
      setBusy(false)
    }
  }

  function clear() {
    setInput('')
    setExpectedDigest('')
    setFeedback(null)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ToolPanel>
          <label htmlFor="hash-verifier-input" className="mb-3 block font-medium text-primary">Text to verify</label>
          <textarea
            id="hash-verifier-input"
            value={input}
            maxLength={MAX_INPUT_BYTES}
            onChange={event => { setInput(event.target.value); setFeedback(null) }}
            placeholder="Enter or paste the original text"
            spellCheck={false}
            className="min-h-56 w-full resize-y rounded-lg border border-border bg-input p-3 font-mono text-sm text-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
            aria-describedby="hash-verifier-input-hint"
          />
          <p id="hash-verifier-input-hint" className="mt-2 text-xs text-secondary">
            UTF-8 input limit: 1 MiB ({inputBytes.toLocaleString()} bytes used).
          </p>
        </ToolPanel>

        <ToolPanel>
          <label htmlFor="hash-verifier-digest" className="mb-3 block font-medium text-primary">Expected digest</label>
          <textarea
            id="hash-verifier-digest"
            value={expectedDigest}
            maxLength={128}
            onChange={event => { setExpectedDigest(event.target.value); setFeedback(null) }}
            placeholder="Paste the expected hexadecimal digest"
            spellCheck={false}
            autoComplete="off"
            className="min-h-28 w-full resize-y rounded-lg border border-border bg-input p-3 font-mono text-sm text-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
            aria-describedby="hash-verifier-digest-hint"
          />
          <p id="hash-verifier-digest-hint" className="mt-2 text-xs text-secondary">
            Use only hexadecimal characters, with no prefix or whitespace.
          </p>
          <label htmlFor="hash-verifier-algorithm" className="mb-2 mt-5 block text-sm font-medium text-primary">Algorithm</label>
          <select
            id="hash-verifier-algorithm"
            value={algorithm}
            onChange={event => { setAlgorithm(event.target.value as HashAlgorithm); setFeedback(null) }}
            className="w-full rounded-lg border border-border bg-input p-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
          >
            {HASH_ALGORITHMS.map(value => <option key={value} value={value}>{value}</option>)}
          </select>
          <p className="mt-2 text-xs text-secondary">MD5 is not supported. Verification runs locally with browser Web Crypto.</p>
        </ToolPanel>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void verify()}
          disabled={busy}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <i className={`fas ${busy ? 'fa-spinner fa-spin' : 'fa-shield-halved'}`} aria-hidden="true" />
          {busy ? 'Verifying…' : 'Verify digest'}
        </button>
        <button type="button" onClick={clear} className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-primary transition hover:bg-hover">
          <i className="fas fa-eraser" aria-hidden="true" /> Clear
        </button>
      </div>

      {feedback && (
        <ToolPanel>
          <p role={feedback.kind === 'error' ? 'alert' : 'status'} className={`font-medium ${feedback.kind === 'error' ? 'text-red-600 dark:text-red-300' : 'text-primary'}`}>
            {feedback.message}
          </p>
          {feedback.digest && (
            <p className="mt-3 break-all font-mono text-sm text-secondary">
              Computed {algorithm} digest: {feedback.digest}
            </p>
          )}
        </ToolPanel>
      )}
    </div>
  )
}
