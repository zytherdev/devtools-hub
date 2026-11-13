'use client'
import { useState } from 'react'
import { ToolPanel } from '@/app/components/ToolPanel'
import { decodeCertificate, MAX_CERTIFICATE_BYTES, MAX_PEM_TEXT_BYTES } from './logic'
import { tool } from './definition'

export default function Tool() {
  const [pem, setPem] = useState('')
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [fileName, setFileName] = useState('')

  function clear() {
    setPem('')
    setResult('')
    setError('')
    setFileName('')
  }

  async function loadFile(file?: File) {
    if (!file) return
    setError('')
    setResult('')
    setFileName('')
    try {
      if (file.size > MAX_PEM_TEXT_BYTES) throw new RangeError('Selected file exceeds the 256 KiB file limit.')
      const bytes = new Uint8Array(await file.arrayBuffer())
      if (new TextDecoder().decode(bytes.subarray(0, 32)).includes('-----BEGIN CERTIFICATE-----')) {
        const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes)
        setPem(text)
        setFileName(file.name)
      } else {
        if (bytes.byteLength > MAX_CERTIFICATE_BYTES) throw new RangeError('Selected DER certificate exceeds the 128 KiB processing limit.')
        setPem('')
        setBusy(true)
        try { setResult(decodeCertificate(bytes)); setFileName(file.name) }
        finally { setBusy(false) }
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not read this certificate file.')
    }
  }

  function decodePem() {
    setError('')
    setResult('')
    setBusy(true)
    try { setResult(decodeCertificate(pem)); setFileName('') }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not decode this certificate.') }
    finally { setBusy(false) }
  }

  return (
    <div className="space-y-6" aria-label={tool.name}>
      <ToolPanel>
        <label htmlFor="certificate-decoder-pem" className="mb-3 block font-medium text-primary">PEM X.509 certificate</label>
        <textarea
          id="certificate-decoder-pem"
          value={pem}
          onChange={event => { setPem(event.target.value); setResult(''); setError(''); setFileName('') }}
          placeholder="Paste one -----BEGIN CERTIFICATE----- PEM block"
          spellCheck={false}
          autoComplete="off"
          maxLength={MAX_PEM_TEXT_BYTES}
          className="min-h-56 w-full resize-y rounded-lg border border-border bg-input p-3 font-mono text-sm text-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
          aria-describedby="certificate-decoder-hint"
        />
        <p id="certificate-decoder-hint" className="mt-2 text-xs text-secondary">
          PEM text limit: 256 KiB. For binary DER, choose a certificate file (maximum 128 KiB). The input starts empty and is never saved by this tool.
        </p>
      </ToolPanel>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={decodePem} disabled={busy || !pem.trim()} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
          <i className={`fas ${busy ? 'fa-spinner fa-spin' : 'fa-certificate'}`} aria-hidden="true" />
          {busy ? 'Decoding…' : 'Decode certificate'}
        </button>
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-4 py-2 text-primary transition hover:bg-hover">
          <i className="fas fa-file-arrow-up" aria-hidden="true" />
          Choose PEM or DER file
          <input type="file" accept=".pem,.crt,.cer,.der,application/x-pem-file,application/pkix-cert,application/x-x509-ca-cert" className="sr-only" onChange={event => { void loadFile(event.target.files?.[0]); event.currentTarget.value = '' }} />
        </label>
        <button type="button" onClick={clear} className="rounded-lg border border-border px-4 py-2 text-primary transition hover:bg-hover">Clear</button>
        {fileName && <span className="text-sm text-secondary">Loaded locally: {fileName}</span>}
      </div>

      <ToolPanel>
        <p className="font-medium text-primary">Privacy and scope</p>
        <p className="mt-2 text-sm text-secondary">Decoding runs in this browser. Certificate contents are not intentionally transmitted, logged, or persisted by this tool; clearing the page removes its in-memory result. Normal website hosting and asset requests still occur.</p>
        <p className="mt-2 text-sm font-medium text-secondary">Decoding is not trust-chain validation. This tool does not verify signatures, certificate chains, revocation, hostname matching, or whether a certificate should be trusted.</p>
      </ToolPanel>

      {error && <ToolPanel><p role="alert" className="font-medium text-red-600 dark:text-red-300">{error}</p></ToolPanel>}
      {result && <ToolPanel>
        <h2 className="mb-3 font-semibold text-primary">Decoded certificate metadata{fileName ? ` — ${fileName}` : ''}</h2>
        <pre role="status" className="max-h-[36rem] overflow-auto whitespace-pre-wrap break-words rounded-lg bg-input p-4 font-mono text-sm text-primary">{result}</pre>
      </ToolPanel>}
    </div>
  )
}
