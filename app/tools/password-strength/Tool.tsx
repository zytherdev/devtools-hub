'use client'

import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { ToolPanel } from '@/app/components/ToolPanel'
import { estimatePasswordStrength, MAX_PASSWORD_LENGTH } from './logic'
import type { PasswordStrengthEstimate } from './logic'

export default function Tool() {
  const passwordRef = useRef<HTMLInputElement>(null)
  const [characterCount, setCharacterCount] = useState(0)
  const [estimate, setEstimate] = useState<PasswordStrengthEstimate | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    try {
      setEstimate(estimatePasswordStrength(passwordRef.current?.value ?? ''))
    } catch {
      setEstimate(null)
      setError(`Enter no more than ${MAX_PASSWORD_LENGTH} characters.`)
    }
  }

  function handleClear() {
    if (passwordRef.current) passwordRef.current.value = ''
    setCharacterCount(0)
    setEstimate(null)
    setShowPassword(false)
    setError('')
  }

  function handlePasswordChange(value: string) {
    const boundedValue = Array.from(value).slice(0, MAX_PASSWORD_LENGTH).join('')
    if (passwordRef.current && boundedValue !== value) passwordRef.current.value = boundedValue
    setCharacterCount(Array.from(boundedValue).length)
    setEstimate(null)
    setError('')
  }

  return (
    <div>
      <div className="grid gap-4 lg:grid-cols-2">
        <ToolPanel>
          <form onSubmit={handleSubmit}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <label htmlFor="password-strength-input" className="text-sm font-semibold text-primary">Password</label>
              <span className="rounded-full border border-border px-2.5 py-1 text-xs text-secondary">Private · local only</span>
            </div>
            <div className="flex gap-2">
              <input
                ref={passwordRef}
                id="password-strength-input"
                type={showPassword ? 'text' : 'password'}
                maxLength={MAX_PASSWORD_LENGTH * 2}
                onChange={event => handlePasswordChange(event.currentTarget.value)}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                aria-describedby="password-strength-hint password-strength-count"
                className="min-h-12 min-w-0 flex-1 rounded-lg border border-border bg-input px-3 py-2 font-mono text-sm text-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
                placeholder="Enter a password to check"
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
            <p id="password-strength-hint" className="mt-3 text-xs text-secondary">
              The estimate is calculated in this browser. Your password is not included in the result.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <span id="password-strength-count" className="text-xs text-secondary" aria-live="polite">
                {characterCount} of {MAX_PASSWORD_LENGTH} characters
              </span>
              <div className="flex gap-2">
                <button type="button" onClick={handleClear} className="btn btn-outline text-sm">Clear</button>
                <button type="submit" className="btn btn-primary min-h-10 px-4 text-sm">
                  <i className="fa-solid fa-shield-halved" aria-hidden="true" /> Check strength
                </button>
              </div>
            </div>
            {error && <p className="mt-3 text-sm text-red-700 dark:text-red-300" role="alert">{error}</p>}
          </form>
        </ToolPanel>

        <ToolPanel>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-primary">Strength estimate</h2>
            <span className="text-xs text-secondary" aria-live="polite">{estimate ? `${estimate.score} / 4` : 'Ready'}</span>
          </div>
          {estimate ? (
            <div aria-live="polite" aria-atomic="true">
              <div className="flex items-center justify-between gap-3">
                <p className="text-lg font-semibold text-primary">{estimate.level}</p>
                <p className="text-sm text-secondary">{estimate.characterCount} characters</p>
              </div>
              <div
                className="mt-3 h-2 overflow-hidden rounded-full bg-border"
                role="progressbar"
                aria-label="Estimated password strength"
                aria-valuemin={0}
                aria-valuemax={4}
                aria-valuenow={estimate.score}
                aria-valuetext={`${estimate.level}, ${estimate.score} out of 4`}
              >
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${estimate.score * 25}%` }} />
              </div>
              <h3 className="mt-5 text-sm font-semibold text-primary">Suggestions</h3>
              <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-secondary">
                {estimate.feedback.map(message => <li key={message}>{message}</li>)}
              </ul>
            </div>
          ) : (
            <p className="min-h-28 text-sm leading-6 text-secondary">Enter a password and select Check strength to see a local estimate and suggestions. The password itself is never displayed here.</p>
          )}
        </ToolPanel>
      </div>

      <p className="mt-4 text-xs leading-5 text-secondary">
        This quick heuristic is not a guarantee of security and does not check breached-password databases. The entered password is not saved or sent; clear it when you are finished.
      </p>
    </div>
  )
}
