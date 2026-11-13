'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'
import { ToolPanel } from '@/app/components/ToolPanel'
import { tool } from './definition'
import { AES_MODES, MAX_PAYLOAD_CHARACTERS, MAX_PLAINTEXT_BYTES } from './logic'
import type { AesMode } from './logic'
import { runTool } from '@/app/lib/tools/toolEngine'

const MAX_PASSWORD_CHARACTERS = 4096

export default function Tool() {
  const [mode, setMode] = useState<AesMode>('encrypt')
  const [input, setInput] = useState('')
  const [password, setPassword] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState('Ready. Your text and password stay in this browser.')
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)

  const inputLimit = mode === 'encrypt' ? MAX_PLAINTEXT_BYTES : MAX_PAYLOAD_CHARACTERS
  const inputBytes = new TextEncoder().encode(input).byteLength

  function clearResult() {
    setOutput('')
    setError('')
    setCopied(false)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setOutput('')
    setCopied(false)
    setBusy(true)
    try {
      const result = await runTool(tool.id, input, { mode, password })
      setOutput(result)
      setStatus(mode === 'encrypt' ? 'Encryption complete. Save the payload and remember the password.' : 'Decryption complete. The plaintext is displayed below.')
    } catch (cause) {
      setStatus('No result was produced.')
      setError(cause instanceof Error ? cause.message : 'The AES operation could not be completed.')
    } finally {
      setBusy(false)
    }
  }

  async function copyOutput() {
    if (output.length === 0) return
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setError('Clipboard access was denied by this browser.')
    }
  }

  function clearAll() {
    setInput('')
    setPassword('')
    setOutput('')
    setError('')
    setCopied(false)
    setStatus('Cleared. Your password and text were removed from the form.')
  }

  return (
    <div className="space-y-4">
      <form onSubmit={event => void handleSubmit(event)}>
        <div className="grid gap-4 lg:grid-cols-2">
          <ToolPanel>
            <div className="mb-4">
              <label htmlFor="aes-mode" className="mb-2 block text-sm font-semibold text-primary">Operation</label>
              <select
                id="aes-mode"
                value={mode}
                onChange={event => { setMode(event.currentTarget.value as AesMode); clearResult(); setStatus('Ready. Your text and password stay in this browser.') }}
                className="w-full rounded-lg border border-border bg-input p-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
              >
                {AES_MODES.map(value => <option key={value} value={value}>{value === 'encrypt' ? 'Encrypt text' : 'Decrypt payload'}</option>)}
              </select>
            </div>
            <label htmlFor="aes-input" className="mb-2 block text-sm font-semibold text-primary">
              {mode === 'encrypt' ? 'Plaintext' : 'Encrypted JSON payload'}
            </label>
            <textarea
              id="aes-input"
              value={input}
              maxLength={inputLimit}
              onChange={event => { setInput(event.currentTarget.value); clearResult(); setStatus('Input changed. Run the operation to produce a result.') }}
              spellCheck={false}
              autoComplete="off"
              className="min-h-48 w-full resize-y rounded-lg border border-border bg-input p-3 font-mono text-sm text-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
              aria-describedby="aes-input-hint"
              placeholder={mode === 'encrypt' ? 'Enter text to encrypt…' : 'Paste the complete encrypted JSON payload…'}
            />
            <p id="aes-input-hint" className="mt-2 text-xs text-secondary">
              {mode === 'encrypt' ? 'Plaintext limit: 1 MiB UTF-8.' : 'Payload limit: 2 MiB.'} {inputBytes.toLocaleString()} bytes currently entered.
            </p>
          </ToolPanel>

          <ToolPanel>
            <label htmlFor="aes-password" className="mb-2 block text-sm font-semibold text-primary">Password</label>
            <input
              id="aes-password"
              type="password"
              value={password}
              maxLength={MAX_PASSWORD_CHARACTERS}
              onChange={event => { setPassword(event.currentTarget.value); clearResult() }}
              autoComplete="new-password"
              autoCapitalize="none"
              spellCheck={false}
              required
              className="min-h-11 w-full rounded-lg border border-border bg-input px-3 py-2 font-mono text-sm text-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
              aria-describedby="aes-password-hint"
            />
            <p id="aes-password-hint" className="mt-2 text-xs leading-5 text-secondary">
              {mode === 'encrypt' ? 'Use a strong passphrase of at least 12 characters. It is masked and is never included in the encrypted payload.' : 'Enter the exact passphrase used during encryption. It is masked and is never included in the payload.'}
            </p>
            <div className="mt-5 rounded-lg border border-border bg-input-readonly p-3 text-xs leading-5 text-secondary">
              AES-256-GCM authentication detects changes to the payload. A new random 96-bit nonce is used for each encryption; duplicate nonces are rejected during this page session.
            </div>
          </ToolPanel>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="submit" disabled={busy} className="btn btn-primary min-h-10 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-50">
            <i className={`fa-solid ${busy ? 'fa-spinner fa-spin' : mode === 'encrypt' ? 'fa-lock' : 'fa-lock-open'}`} aria-hidden="true" />
            {busy ? 'Processing…' : mode === 'encrypt' ? 'Encrypt' : 'Decrypt'}
          </button>
          <button type="button" onClick={clearAll} className="btn btn-outline text-sm">Clear</button>
        </div>
      </form>

      {error && <p role="alert" className="rounded-lg border border-red-300/50 bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">{error}</p>}

      <ToolPanel>
        <div className="mb-3 flex items-center justify-between gap-3">
          <label htmlFor="aes-output" className="text-sm font-semibold text-primary">{mode === 'encrypt' ? 'Encrypted payload' : 'Decrypted plaintext'}</label>
          <span role="status" className="text-xs text-secondary">{status}</span>
        </div>
        <textarea
          id="aes-output"
          value={output}
          readOnly
          spellCheck={false}
          placeholder={mode === 'encrypt' ? 'Your encrypted JSON payload will appear here…' : 'Decrypted text will appear here…'}
          className="min-h-36 w-full resize-y rounded-lg border border-border bg-input-readonly p-3 font-mono text-sm text-primary placeholder:text-secondary focus:outline-none"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => void copyOutput()} disabled={output.length === 0} className="btn btn-outline text-sm disabled:cursor-not-allowed disabled:opacity-40">
            <i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'}`} aria-hidden="true" />{copied ? 'Copied' : 'Copy result'}
          </button>
        </div>
      </ToolPanel>

      <p className="text-xs leading-5 text-secondary">
        Processing uses browser Web Crypto locally; this tool does not send or store your text, password, or payload. The encrypted payload contains the random salt, nonce, algorithm parameters, and ciphertext, but not the password. If you lose the password or payload, the plaintext cannot be recovered. Anyone who obtains the payload and password can decrypt it. Password strength matters: PBKDF2 slows guessing but cannot make a weak password strong. Do not use this page on a device or browser you do not trust.
      </p>
    </div>
  )
}
