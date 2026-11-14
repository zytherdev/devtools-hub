'use client'

import { useState } from 'react'
import { ToolPanel } from '@/app/components/ToolPanel'
import { maskMnemonic, run } from './logic'

const STRENGTHS = [
  { bits: '128', words: 12 },
  { bits: '160', words: 15 },
  { bits: '192', words: 18 },
  { bits: '224', words: 21 },
  { bits: '256', words: 24 },
]

export default function Tool() {
  const [strength, setStrength] = useState('128')
  const [mnemonic, setMnemonic] = useState('')
  const [revealed, setRevealed] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  function generate() {
    setError('')
    setCopied(false)
    try {
      setMnemonic(run('', { strength }))
      setRevealed(false)
    } catch (cause) {
      setMnemonic('')
      setRevealed(false)
      setError(cause instanceof Error ? cause.message : 'Could not generate a mnemonic.')
    }
  }

  async function copyMnemonic() {
    if (!mnemonic) return
    setError('')
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard access is unavailable.')
      await navigator.clipboard.writeText(mnemonic)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
      setError('Could not copy the mnemonic. Clipboard access was denied or is unavailable.')
    }
  }

  function clearMnemonic() {
    setMnemonic('')
    setRevealed(false)
    setCopied(false)
    setError('')
  }

  return (
    <div>
      <div className="grid gap-4 lg:grid-cols-2">
        <ToolPanel>
          <div className="mb-4 flex items-center justify-between gap-3">
            <label htmlFor="bip39-strength" className="text-sm font-semibold text-primary">Mnemonic strength</label>
            <span className="rounded-full border border-border px-2.5 py-1 text-xs text-secondary">Generated locally</span>
          </div>
          <select
            id="bip39-strength"
            value={strength}
            onChange={event => {
              setStrength(event.target.value)
              clearMnemonic()
            }}
            className="min-h-12 w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
          >
            {STRENGTHS.map(option => (
              <option key={option.bits} value={option.bits}>{option.bits} bits · {option.words} words</option>
            ))}
          </select>
          <p className="mt-3 text-xs leading-5 text-secondary">Only standard BIP39 strengths are supported. Secure random bytes come from this browser’s Web Crypto API.</p>
          <button type="button" onClick={generate} className="btn btn-primary mt-5 min-h-11 w-full px-5 text-sm">
            <i className="fa-solid fa-shield-halved" aria-hidden="true" /> Generate mnemonic
          </button>
        </ToolPanel>

        <ToolPanel>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-primary">English BIP39 phrase</h2>
            <span className="text-xs text-secondary" aria-live="polite">{mnemonic ? `${STRENGTHS.find(option => option.bits === strength)?.words} words` : 'Not generated'}</span>
          </div>
          <div
            className="flex min-h-40 items-center rounded-xl border border-border bg-input-readonly p-4 font-mono text-sm leading-7 text-primary"
            aria-label={mnemonic ? (revealed ? 'Mnemonic phrase revealed' : 'Mnemonic phrase hidden') : 'No mnemonic generated'}
            aria-live="polite"
            aria-atomic="true"
          >
            {mnemonic ? (revealed ? mnemonic : maskMnemonic(mnemonic)) : <span className="text-secondary">Your phrase will appear here, hidden by default.</span>}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => setRevealed(value => !value)} disabled={!mnemonic} className="btn btn-outline text-sm disabled:cursor-not-allowed disabled:opacity-40">
              <i className={`fa-solid ${revealed ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true" />{revealed ? 'Hide phrase' : 'Reveal phrase'}
            </button>
            <button type="button" onClick={() => void copyMnemonic()} disabled={!mnemonic} className="btn btn-outline text-sm disabled:cursor-not-allowed disabled:opacity-40">
              <i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'}`} aria-hidden="true" />{copied ? 'Copied' : 'Copy phrase'}
            </button>
            <button type="button" onClick={clearMnemonic} disabled={!mnemonic && !error} className="btn btn-outline text-sm disabled:cursor-not-allowed disabled:opacity-40">
              <i className="fa-solid fa-trash" aria-hidden="true" />Clear
            </button>
          </div>
        </ToolPanel>
      </div>

      <p role="note" className="mt-4 rounded-xl border border-amber-400/50 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950 dark:bg-amber-950/30 dark:text-amber-100">
        The phrase is kept only in this page’s memory until you clear it or leave. It is not saved or sent. Keep it private; revealing or copying it may expose it to others.
      </p>
      {error && <p role="alert" className="mt-4 rounded-xl border border-red-300/50 bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">{error}</p>}
    </div>
  )
}
