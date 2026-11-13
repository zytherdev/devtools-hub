'use client'

import { useState } from 'react'
import { ToolPanel } from '@/app/components/ToolPanel'
import { generateRsaKeyPair, type RsaKeyPairOutput } from './logic'

export default function Tool() {
  const [modulusLength, setModulusLength] = useState('2048')
  const [algorithm, setAlgorithm] = useState<'RSA-OAEP' | 'RSA-PSS'>('RSA-OAEP')
  const [format, setFormat] = useState<'pem' | 'jwk'>('pem')
  const [result, setResult] = useState<RsaKeyPairOutput | null>(null)
  const [privateKeyVisible, setPrivateKeyVisible] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function generate() {
    setError('')
    setNotice('')
    setResult(null)
    setPrivateKeyVisible(false)
    setBusy(true)
    try {
      const pair = await generateRsaKeyPair({ modulusLength, algorithm, format })
      setResult(pair)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'RSA key generation failed.')
    } finally {
      setBusy(false)
    }
  }

  async function copyPrivateKey() {
    if (!result || !privateKeyVisible) return
    try {
      await navigator.clipboard.writeText(result.privateKey)
      setNotice('Private key copied. Treat the clipboard as sensitive; clear it if appropriate.')
    } catch {
      setError('Clipboard access was denied by this browser.')
    }
  }

  function clearKeys() {
    setResult(null)
    setPrivateKeyVisible(false)
    setError('')
    setNotice('Key output cleared from the page. This does not guarantee secure memory erasure.')
  }

  return (
    <div className="space-y-4">
      <p role="note" className="rounded-xl border border-amber-400/50 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950 dark:bg-amber-950/30 dark:text-amber-100">
        <strong>Private-key warning:</strong> Keys are generated in this browser with Web Crypto; this tool does not send key material to its server. Private-key output is hidden until you reveal it. Revealed or copied keys can be seen by anyone with access to this page, browser, clipboard, or device. Store private keys securely and never share them.
      </p>

      <ToolPanel className="p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block text-sm font-medium text-primary">
            RSA key size
            <select value={modulusLength} onChange={event => setModulusLength(event.target.value)} className="mt-2 min-h-11 w-full rounded-lg border border-border bg-input px-3 text-sm text-primary focus:border-[#347a58] focus:outline-none">
              <option value="2048">2048 bits</option>
              <option value="3072">3072 bits</option>
              <option value="4096">4096 bits</option>
            </select>
          </label>
          <label className="block text-sm font-medium text-primary">
            Key purpose
            <select value={algorithm} onChange={event => setAlgorithm(event.target.value as 'RSA-OAEP' | 'RSA-PSS')} className="mt-2 min-h-11 w-full rounded-lg border border-border bg-input px-3 text-sm text-primary focus:border-[#347a58] focus:outline-none">
              <option value="RSA-OAEP">RSA-OAEP · encryption</option>
              <option value="RSA-PSS">RSA-PSS · signatures</option>
            </select>
          </label>
          <label className="block text-sm font-medium text-primary">
            Export format
            <select value={format} onChange={event => setFormat(event.target.value as 'pem' | 'jwk')} className="mt-2 min-h-11 w-full rounded-lg border border-border bg-input px-3 text-sm text-primary focus:border-[#347a58] focus:outline-none">
              <option value="pem">PEM (SPKI public / PKCS#8 private)</option>
              <option value="jwk">JSON Web Key (JWK)</option>
            </select>
          </label>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button type="button" onClick={generate} disabled={busy} className="btn btn-primary min-h-11 px-5 text-sm disabled:cursor-wait disabled:opacity-60">
            <i className={`fa-solid ${busy ? 'fa-spinner fa-spin' : 'fa-key'}`} aria-hidden="true" />
            {busy ? 'Generating locally…' : 'Generate key pair'}
          </button>
          {result && <button type="button" onClick={clearKeys} className="btn btn-outline min-h-11 px-4 text-sm">Clear keys</button>}
          <span className="text-xs text-secondary">Uses RSA exponent 65537 and SHA-256.</span>
        </div>
      </ToolPanel>

      {error && <p role="alert" className="rounded-xl border border-red-300/50 bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">{error}</p>}
      {notice && <p role="status" className="rounded-xl border border-border bg-panel px-4 py-3 text-sm text-secondary">{notice}</p>}

      {result && (
        <div className="grid gap-4 lg:grid-cols-2">
          <ToolPanel className="p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <label htmlFor="rsa-public-key" className="text-sm font-semibold text-primary">Public key</label>
              <span className="text-xs text-secondary">{result.modulusLength}-bit · {result.algorithm}</span>
            </div>
            <textarea id="rsa-public-key" readOnly value={result.publicKey} spellCheck={false} className="min-h-64 w-full resize-y rounded-xl border border-border bg-input-readonly p-3 font-mono text-xs leading-5 text-primary focus:outline-none" />
            <button type="button" onClick={async () => {
              try {
                await navigator.clipboard.writeText(result.publicKey)
                setNotice('Public key copied.')
              } catch {
                setError('Clipboard access was denied by this browser.')
              }
            }} className="btn btn-outline mt-3 min-h-10 px-4 text-sm"><i className="fa-solid fa-copy" aria-hidden="true" />Copy public key</button>
          </ToolPanel>

          <ToolPanel className="p-4 sm:p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <label htmlFor="rsa-private-key" className="text-sm font-semibold text-primary">Private key <span className="font-normal text-secondary">(sensitive)</span></label>
              {!privateKeyVisible ? (
                <button type="button" onClick={() => { setNotice(''); setPrivateKeyVisible(true) }} className="btn btn-outline min-h-9 px-3 text-xs">Reveal private key</button>
              ) : (
                <button type="button" onClick={() => setPrivateKeyVisible(false)} className="btn btn-outline min-h-9 px-3 text-xs">Hide private key</button>
              )}
            </div>
            <textarea id="rsa-private-key" readOnly value={privateKeyVisible ? result.privateKey : ''} placeholder={privateKeyVisible ? '' : 'Hidden by default. Select “Reveal private key” to display this sensitive value.'} spellCheck={false} autoComplete="off" className="min-h-64 w-full resize-y rounded-xl border border-border bg-input-readonly p-3 font-mono text-xs leading-5 text-primary placeholder:font-sans placeholder:text-secondary focus:outline-none" />
            <button type="button" onClick={copyPrivateKey} disabled={!privateKeyVisible} className="btn btn-outline mt-3 min-h-10 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-40"><i className="fa-solid fa-copy" aria-hidden="true" />Copy private key</button>
            <p className="mt-3 text-xs leading-5 text-secondary">The private PEM is unencrypted PKCS#8. A private JWK includes secret RSA parameters. Anyone who obtains it may act as the key holder.</p>
          </ToolPanel>
        </div>
      )}

      <div className="rounded-xl border border-border bg-panel px-4 py-3 text-xs leading-5 text-secondary">
        <p><strong className="text-primary">Limitations:</strong> This page generates keys locally using the browser&apos;s Web Crypto implementation; it is not a server-side key-generation service. Export requires an extractable private key. Browser extensions, compromised devices, page inspection, clipboard history, and screenshots can expose revealed material; clearing the page cannot guarantee memory erasure. RSA-OAEP is for encrypting small values (use hybrid encryption for files or larger messages). RSA-PSS signatures must be verified with matching parameters. Choose a larger key size when your security policy requires it, and have production key-management requirements independently reviewed.</p>
      </div>
    </div>
  )
}
