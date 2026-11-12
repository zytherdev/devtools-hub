'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'
import { runTool } from '@/app/lib/tools/toolEngine'
import { ToolPanel } from '@/app/components/ToolPanel'
import { HMAC_ALGORITHMS, HMAC_ENCODINGS } from './logic'
import type { HmacAlgorithm, HmacEncoding } from './logic'
import { tool } from './definition'

const MAX_INPUT_CHARACTERS = 1024 * 1024
const MAX_KEY_CHARACTERS = 64 * 1024

export default function Tool() {
  const [input, setInput] = useState(tool.exampleInput)
  const [secretKey, setSecretKey] = useState('')
  const [algorithm, setAlgorithm] = useState<HmacAlgorithm>('SHA-256')
  const [encoding, setEncoding] = useState<HmacEncoding>('hex')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [showSecretKey, setShowSecretKey] = useState(false)
  const [copied, setCopied] = useState(false)

  const inputBytes = new TextEncoder().encode(input).byteLength
  const keyBytes = new TextEncoder().encode(secretKey).byteLength

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setOutput('')
    setCopied(false)
    setBusy(true)
    try {
      const result = await runTool(tool.id, input, { secretKey, algorithm, encoding })
      setOutput(result)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not generate the HMAC.')
    } finally {
      setBusy(false)
    }
  }

  async function copyOutput() {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setError('Clipboard access was denied by this browser.')
    }
  }

  function downloadOutput() {
    if (!output) return
    const url = URL.createObjectURL(new Blob([output], { type: 'text/plain;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${tool.id}.txt`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  function clear() {
    setInput('')
    setSecretKey('')
    setOutput('')
    setError('')
    setCopied(false)
    setShowSecretKey(false)
  }

  return (
    <div className="space-y-4">
      <form onSubmit={event => void handleSubmit(event)}>
        <div className="grid gap-4 lg:grid-cols-2">
          <ToolPanel>
            <label htmlFor="hmac-input" className="mb-3 block text-sm font-semibold text-primary">Message</label>
            <textarea
              id="hmac-input"
              value={input}
              maxLength={MAX_INPUT_CHARACTERS}
              onChange={event => { setInput(event.currentTarget.value); setOutput(''); setError('') }}
              spellCheck={false}
              className="min-h-48 w-full resize-y rounded-lg border border-border bg-input p-3 font-mono text-sm text-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
              aria-describedby="hmac-input-hint"
            />
            <p id="hmac-input-hint" className="mt-2 text-xs text-secondary">
              UTF-8 input limit: 1 MiB ({inputBytes.toLocaleString()} bytes used). Empty messages are allowed.
            </p>
          </ToolPanel>

          <ToolPanel>
            <label htmlFor="hmac-secret" className="mb-3 block text-sm font-semibold text-primary">Secret key</label>
            <div className="flex gap-2">
              <input
                id="hmac-secret"
                type={showSecretKey ? 'text' : 'password'}
                value={secretKey}
                maxLength={MAX_KEY_CHARACTERS}
                onChange={event => { setSecretKey(event.currentTarget.value); setOutput(''); setError('') }}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                className="min-h-11 min-w-0 flex-1 rounded-lg border border-border bg-input px-3 py-2 font-mono text-sm text-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
                aria-describedby="hmac-secret-hint"
              />
              <button
                type="button"
                onClick={() => setShowSecretKey(value => !value)}
                aria-label={showSecretKey ? 'Hide secret key' : 'Show secret key'}
                className="rounded-lg border border-border px-3 text-sm text-secondary transition hover:bg-hover"
              >
                {showSecretKey ? 'Hide' : 'Show'}
              </button>
            </div>
            <p id="hmac-secret-hint" className="mt-2 text-xs text-secondary">
              Required. UTF-8 key limit: 64 KiB ({keyBytes.toLocaleString()} bytes used). The key is masked by default.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="hmac-algorithm" className="mb-2 block text-sm font-medium text-primary">Algorithm</label>
                <select
                  id="hmac-algorithm"
                  value={algorithm}
                  onChange={event => { setAlgorithm(event.currentTarget.value as HmacAlgorithm); setOutput(''); setError('') }}
                  className="w-full rounded-lg border border-border bg-input p-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
                >
                  {HMAC_ALGORITHMS.map(value => <option key={value} value={value}>{value}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="hmac-encoding" className="mb-2 block text-sm font-medium text-primary">Output encoding</label>
                <select
                  id="hmac-encoding"
                  value={encoding}
                  onChange={event => { setEncoding(event.currentTarget.value as HmacEncoding); setOutput(''); setError('') }}
                  className="w-full rounded-lg border border-border bg-input p-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
                >
                  {HMAC_ENCODINGS.map(value => <option key={value} value={value}>{value}</option>)}
                </select>
              </div>
            </div>
          </ToolPanel>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="submit" disabled={busy} className="btn btn-primary min-h-10 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-50">
            <i className={`fa-solid ${busy ? 'fa-spinner fa-spin' : 'fa-key'}`} aria-hidden="true" />
            {busy ? 'Generating…' : 'Generate HMAC'}
          </button>
          <button type="button" onClick={clear} className="btn btn-outline text-sm">Clear</button>
        </div>
      </form>

      {error && <p role="alert" className="rounded-lg border border-red-300/50 bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">{error}</p>}

      <ToolPanel>
        <div className="mb-3 flex items-center justify-between gap-3">
          <label htmlFor="hmac-output" className="text-sm font-semibold text-primary">HMAC output</label>
          <span className="text-xs text-secondary">{output ? `${output.length.toLocaleString()} characters` : 'Ready'}</span>
        </div>
        <textarea
          id="hmac-output"
          value={output}
          readOnly
          spellCheck={false}
          placeholder="Your HMAC will appear here…"
          className="min-h-28 w-full resize-y rounded-lg border border-border bg-input-readonly p-3 font-mono text-sm text-primary placeholder:text-secondary focus:outline-none"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => void copyOutput()} disabled={!output} className="btn btn-outline text-sm disabled:cursor-not-allowed disabled:opacity-40">
            <i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'}`} aria-hidden="true" />{copied ? 'Copied' : 'Copy'}
          </button>
          <button type="button" onClick={downloadOutput} disabled={!output} className="btn btn-outline text-sm disabled:cursor-not-allowed disabled:opacity-40">
            <i className="fa-solid fa-download" aria-hidden="true" />Download
          </button>
        </div>
      </ToolPanel>

      <p className="text-xs leading-5 text-secondary">
        HMAC is a message authentication code, not encryption or a password hash. The message and key are processed locally with browser Web Crypto and are not sent anywhere. Clear the key when finished.
      </p>
    </div>
  )
}
