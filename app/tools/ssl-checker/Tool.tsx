'use client'
import { useState } from 'react'
import { ToolPanel } from '@/app/components/ToolPanel'
import { inspectCertificate, MAX_HOSTNAME_LENGTH, MAX_PEM_TEXT_BYTES, type CertificateCheckResult } from './logic'
import { tool } from './definition'

const validityLabels = {
  valid: 'Within validity dates',
  'not-yet-valid': 'Not yet valid',
  expired: 'Expired',
}

const hostnameLabels = {
  'not-requested': 'Not checked',
  matched: 'Match',
  mismatched: 'No SAN match',
  unavailable: 'Unavailable',
}

export default function Tool() {
  const [pem, setPem] = useState('')
  const [hostname, setHostname] = useState('')
  const [result, setResult] = useState<CertificateCheckResult | null>(null)
  const [error, setError] = useState('')

  function clear() {
    setPem('')
    setHostname('')
    setResult(null)
    setError('')
  }

  function checkCertificate() {
    setResult(null)
    setError('')
    try {
      setResult(inspectCertificate(pem, hostname))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not check this certificate.')
    }
  }

  return (
    <div className="space-y-6" aria-label={tool.name}>
      <ToolPanel>
        <label htmlFor="ssl-checker-pem" className="mb-3 block font-medium text-primary">PEM X.509 certificate</label>
        <textarea
          id="ssl-checker-pem"
          value={pem}
          onChange={event => { setPem(event.target.value); setResult(null); setError('') }}
          placeholder="Paste one -----BEGIN CERTIFICATE----- PEM block"
          spellCheck={false}
          autoComplete="off"
          maxLength={MAX_PEM_TEXT_BYTES}
          className="min-h-56 w-full resize-y rounded-lg border border-border bg-input p-3 font-mono text-sm text-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
          aria-describedby="ssl-checker-pem-hint"
        />
        <p id="ssl-checker-pem-hint" className="mt-2 text-xs text-secondary">
          Paste one certificate PEM block. PEM text is limited to 256 KiB; decoded certificate data is limited to 128 KiB.
        </p>
        <label htmlFor="ssl-checker-hostname" className="mb-2 mt-5 block font-medium text-primary">Hostname (optional)</label>
        <input
          id="ssl-checker-hostname"
          type="text"
          value={hostname}
          onChange={event => { setHostname(event.target.value); setResult(null); setError('') }}
          placeholder="example.com"
          autoComplete="off"
          spellCheck={false}
          maxLength={MAX_HOSTNAME_LENGTH}
          className="w-full rounded-lg border border-border bg-input p-3 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
          aria-describedby="ssl-checker-hostname-hint"
        />
        <p id="ssl-checker-hostname-hint" className="mt-2 text-xs text-secondary">
          Enter a DNS name or IP address only, without a URL or port. Matching uses certificate subject alternative names (SANs), not the common name.
        </p>
      </ToolPanel>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={checkCertificate} disabled={!pem.trim()} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
          <i className="fas fa-shield-halved" aria-hidden="true" />
          Check certificate
        </button>
        <button type="button" onClick={clear} className="rounded-lg border border-border px-4 py-2 text-primary transition hover:bg-hover">Clear</button>
      </div>

      <ToolPanel>
        <h2 className="font-medium text-primary">Privacy and scope</h2>
        <p className="mt-2 text-sm text-secondary">Certificate parsing and checks run locally in this browser. This tool does not send the hostname or certificate to a server, does not save them, and does not log their contents. They remain in page memory until cleared or the page is closed. Normal website hosting and asset requests still occur.</p>
        <p className="mt-2 text-sm text-secondary">This tool decodes the supplied certificate and compares its validity dates with your device clock. It does not connect to the hostname, perform a live TLS handshake, verify certificate signatures, build or validate a trust chain, check revocation, or determine whether the certificate is trustworthy. Hostname matching checks SAN entries only; a missing SAN match is reported as unavailable or mismatched, and the common name is not used as a fallback.</p>
      </ToolPanel>

      {error && <ToolPanel><p role="alert" className="font-medium text-red-600 dark:text-red-300">{error}</p></ToolPanel>}

      {result && <ToolPanel>
        <h2 className="mb-4 font-semibold text-primary">Certificate check result</h2>
        <div role="status" aria-live="polite" className="space-y-5">
          <section aria-labelledby="ssl-checker-validity-heading">
            <h3 id="ssl-checker-validity-heading" className="font-medium text-primary">Validity dates</h3>
            <p className="mt-2 text-primary"><span className="font-semibold">{validityLabels[result.validityCheck.status]}</span> <span className="text-secondary">(date-only check)</span></p>
            <dl className="mt-2 grid gap-2 text-sm text-secondary sm:grid-cols-2">
              <div><dt className="font-medium text-primary">Valid from</dt><dd>{result.validityCheck.notBefore}</dd></div>
              <div><dt className="font-medium text-primary">Valid until</dt><dd>{result.validityCheck.notAfter}</dd></div>
              <div><dt className="font-medium text-primary">Checked against local clock</dt><dd>{result.validityCheck.checkedAt}</dd></div>
            </dl>
          </section>

          <section aria-labelledby="ssl-checker-hostname-heading">
            <h3 id="ssl-checker-hostname-heading" className="font-medium text-primary">Hostname and SAN</h3>
            <p className="mt-2 text-sm text-secondary">{hostnameLabels[result.hostnameCheck.status]}{result.hostnameCheck.hostname ? `: ${result.hostnameCheck.hostname}` : ''}</p>
            <p className="mt-1 text-sm text-secondary">{result.hostnameCheck.message}</p>
            {result.hostnameCheck.matchedSan && <p className="mt-1 text-sm text-secondary">Matched SAN: <span className="font-mono text-primary">{result.hostnameCheck.matchedSan}</span></p>}
            <p className="mt-3 text-sm font-medium text-primary">Subject alternative names</p>
            {result.subjectAlternativeNames.length > 0
              ? <ul className="mt-1 max-h-48 list-inside list-disc overflow-auto text-sm text-secondary">
                  {result.subjectAlternativeNames.map((san, index) => <li key={`${san.type}-${san.value}-${index}`}><span className="font-medium">{san.type}:</span> <span className="font-mono break-all">{san.value}</span></li>)}
                </ul>
              : <p className="mt-1 text-sm text-secondary">No subject alternative names were found.</p>}
          </section>

          <p className="border-t border-border pt-3 text-xs text-secondary">Decoding succeeded. Signature verification, trust-chain validation, and revocation checking were not performed.</p>
        </div>
      </ToolPanel>}
    </div>
  )
}
