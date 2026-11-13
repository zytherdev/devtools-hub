'use client'

import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { ToolPanel } from '@/app/components/ToolPanel'
import { DEFAULT_COST, MAX_COST, MAX_PASSWORD_BYTES, MIN_COST, hashPassword, verifyPassword } from './logic'

type Mode = 'hash' | 'verify'

export default function Tool() {
  const passwordRef = useRef<HTMLInputElement>(null)
  const hashRef = useRef<HTMLTextAreaElement>(null)
  const [mode, setMode] = useState<Mode>('hash')
  const [cost, setCost] = useState(String(DEFAULT_COST))
  const [passwordBytes, setPasswordBytes] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [outputHash, setOutputHash] = useState('')
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; message: string } | null>(null)
  const [busy, setBusy] = useState(false)

  function clear() {
    if (passwordRef.current) passwordRef.current.value = ''
    if (hashRef.current) hashRef.current.value = ''
    setPasswordBytes(0)
    setOutputHash('')
    setFeedback(null)
    setShowPassword(false)
  }

  function changeMode(nextMode: Mode) {
    clear()
    setMode(nextMode)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFeedback(null)
    setOutputHash('')
    setBusy(true)
    try {
      const password = passwordRef.current?.value ?? ''
      if (mode === 'hash') {
        const generatedHash = await hashPassword(password, Number(cost))
        setOutputHash(generatedHash)
        setFeedback({ kind: 'success', message: 'Bcrypt hash generated locally. The password field was cleared.' })
      } else {
        const encodedHash = hashRef.current?.value ?? ''
        const matches = await verifyPassword(password, encodedHash)
        setFeedback({
          kind: matches ? 'success' : 'error',
          message: matches ? 'Match: the password matches this bcrypt hash.' : 'No match: the password does not match this bcrypt hash.',
        })
      }
      if (passwordRef.current) passwordRef.current.value = ''
      setPasswordBytes(0)
    } catch (error) {
      setFeedback({ kind: 'error', message: error instanceof Error ? error.message : 'Could not process this password.' })
    } finally {
      setBusy(false)
    }
  }

  async function copyHash() {
    try {
      await navigator.clipboard.writeText(outputHash)
      setFeedback({ kind: 'success', message: 'Bcrypt hash copied to the clipboard.' })
    } catch {
      setFeedback({ kind: 'error', message: 'Clipboard access is unavailable. Select and copy the hash manually.' })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Bcrypt operation">
        <button
          type="button"
          onClick={() => changeMode('hash')}
          aria-pressed={mode === 'hash'}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${mode === 'hash' ? 'bg-primary text-white' : 'border border-border text-primary hover:bg-hover'}`}
        >
          Generate hash
        </button>
        <button
          type="button"
          onClick={() => changeMode('verify')}
          aria-pressed={mode === 'verify'}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${mode === 'verify' ? 'bg-primary text-white' : 'border border-border text-primary hover:bg-hover'}`}
        >
          Verify password
        </button>
      </div>

      <ToolPanel>
        <form onSubmit={event => void handleSubmit(event)}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="bcrypt-password" className="font-medium text-primary">Password</label>
            <span className="rounded-full border border-border px-2.5 py-1 text-xs text-secondary">Private · local processing</span>
          </div>
          <div className="flex gap-2">
            <input
              ref={passwordRef}
              id="bcrypt-password"
              type={showPassword ? 'text' : 'password'}
              maxLength={MAX_PASSWORD_BYTES * 2}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              onChange={event => {
                setPasswordBytes(new TextEncoder().encode(event.currentTarget.value).byteLength)
                setFeedback(null)
              }}
              aria-describedby="bcrypt-password-hint bcrypt-password-count"
              className="min-h-12 min-w-0 flex-1 rounded-lg border border-border bg-input px-3 py-2 font-mono text-sm text-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
              placeholder="Enter a password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(value => !value)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="rounded-lg border border-border px-3 text-sm text-secondary transition hover:bg-hover"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <p id="bcrypt-password-hint" className="mt-2 text-xs leading-5 text-secondary">
            Passwords are never displayed in results or sent by the hashing/verifying operation. The field is cleared after a successful operation.
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <span id="bcrypt-password-count" className={`text-xs ${passwordBytes > MAX_PASSWORD_BYTES ? 'text-red-700 dark:text-red-300' : 'text-secondary'}`} aria-live="polite">
              {passwordBytes} of {MAX_PASSWORD_BYTES} UTF-8 bytes
            </span>
            {mode === 'hash' ? (
              <label htmlFor="bcrypt-cost" className="flex items-center gap-2 text-sm text-primary">
                Cost
                <select
                  id="bcrypt-cost"
                  value={cost}
                  onChange={event => { setCost(event.target.value); setFeedback(null) }}
                  className="rounded-lg border border-border bg-input px-2.5 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
                >
                  {Array.from({ length: MAX_COST - MIN_COST + 1 }, (_, index) => MIN_COST + index).map(value => (
                    <option key={value} value={value}>{value}{value === DEFAULT_COST ? ' (default)' : ''}</option>
                  ))}
                </select>
              </label>
            ) : null}
          </div>

          {mode === 'verify' && (
            <div className="mt-5">
              <label htmlFor="bcrypt-hash" className="mb-2 block text-sm font-medium text-primary">Bcrypt hash</label>
              <textarea
                ref={hashRef}
                id="bcrypt-hash"
                maxLength={60}
                spellCheck={false}
                autoComplete="off"
                className="min-h-20 w-full resize-y rounded-lg border border-border bg-input p-3 font-mono text-sm text-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
                placeholder="$2b$10$…"
                aria-describedby="bcrypt-hash-hint"
              />
              <p id="bcrypt-hash-hint" className="mt-2 text-xs text-secondary">
                Verification accepts a 60-character $2a$ or $2b$ hash with a cost from {MIN_COST} to {MAX_COST}.
              </p>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={busy}
              className="flex min-h-10 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <i className={`fa-solid ${busy ? 'fa-spinner fa-spin' : mode === 'hash' ? 'fa-lock' : 'fa-shield-halved'}`} aria-hidden="true" />
              {busy ? 'Working…' : mode === 'hash' ? 'Generate bcrypt hash' : 'Verify password'}
            </button>
            <button type="button" onClick={clear} className="min-h-10 rounded-lg border border-border px-4 py-2 text-sm text-primary transition hover:bg-hover">
              Clear
            </button>
          </div>
        </form>
      </ToolPanel>

      {(outputHash || feedback) && (
        <ToolPanel>
          {outputHash && (
            <div>
              <label htmlFor="bcrypt-output" className="mb-2 block text-sm font-medium text-primary">Bcrypt hash</label>
              <textarea
                id="bcrypt-output"
                value={outputHash}
                readOnly
                rows={3}
                className="w-full resize-y rounded-lg border border-border bg-input p-3 font-mono text-sm text-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
                aria-label="Generated bcrypt hash"
              />
              <button type="button" onClick={() => void copyHash()} className="mt-3 rounded-lg border border-border px-3 py-2 text-sm text-primary transition hover:bg-hover">
                <i className="fa-solid fa-copy mr-2" aria-hidden="true" />Copy hash
              </button>
            </div>
          )}
          {feedback && (
            <p role={feedback.kind === 'error' ? 'alert' : 'status'} className={`${outputHash ? 'mt-3 ' : ''}text-sm font-medium ${feedback.kind === 'error' ? 'text-red-700 dark:text-red-300' : 'text-primary'}`}>
              {feedback.message}
            </p>
          )}
        </ToolPanel>
      )}

      <p className="text-xs leading-5 text-secondary">
        Bcrypt is deliberately slow; cost {MIN_COST}–{MAX_COST} is permitted here to limit browser workload. Each cost step roughly doubles work. Passwords above {MAX_PASSWORD_BYTES} UTF-8 bytes are rejected instead of silently truncated.
      </p>
    </div>
  )
}
