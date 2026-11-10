'use client'

import { useState } from 'react'
import { ToolPanel } from '@/app/components/ToolPanel'
import {
  parseCurl,
  generateCode,
  sampleCurlCommands,
  type CurlToCodeOptions,
} from '@/app/tools/curl-to-code/logic'

type Feedback = { kind: 'error' | 'status'; message: string } | null

const MAX_INPUT_LENGTH = 100_000
const LANGUAGE_EXTENSIONS: Record<CurlToCodeOptions['language'], string> = {
  javascript: 'js',
  python: 'py',
  php: 'php',
  go: 'go',
  ruby: 'rb',
  java: 'java',
  csharp: 'cs',
}

const languages: { value: CurlToCodeOptions['language']; label: string; icon: string }[] = [
  { value: 'javascript', label: 'JavaScript (fetch)', icon: 'fa-brands fa-js' },
  { value: 'python', label: 'Python (requests)', icon: 'fa-brands fa-python' },
  { value: 'php', label: 'PHP (cURL)', icon: 'fa-brands fa-php' },
  { value: 'go', label: 'Go', icon: 'fa-brands fa-golang' },
  { value: 'ruby', label: 'Ruby', icon: 'fa-brands fa-ruby' },
  { value: 'java', label: 'Java', icon: 'fa-brands fa-java' },
  { value: 'csharp', label: 'C# (.NET)', icon: 'fa-solid fa-code' },
]

const focusClass = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus'

export default function CurlToCode() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [language, setLanguage] = useState<CurlToCodeOptions['language']>('javascript')
  const [parsedOptions, setParsedOptions] = useState<CurlToCodeOptions | null>(null)
  const [feedback, setFeedback] = useState<Feedback>(null)

  const invalidateOutput = () => {
    setOutput('')
    setParsedOptions(null)
  }

  const handleInputChange = (value: string) => {
    setInput(value)
    invalidateOutput()
    setFeedback(null)
  }

  const handleConvert = () => {
    invalidateOutput()
    setFeedback(null)
    if (!input.trim()) {
      setFeedback({ kind: 'error', message: 'Paste a cURL command before converting.' })
      return
    }
    const parsed = parseCurl(input)
    if (!parsed) {
      setFeedback({ kind: 'error', message: 'Invalid or unsupported cURL command. Check its syntax and supported options.' })
      return
    }
    try {
      const code = generateCode({ ...parsed, language })
      setParsedOptions(parsed)
      setOutput(code)
      setFeedback({ kind: 'status', message: `Converted to ${languages.find(item => item.value === language)?.label ?? language}.` })
    } catch (error) {
      setFeedback({ kind: 'error', message: error instanceof Error ? error.message : 'Could not generate code for this request.' })
    }
  }

  const handleLanguageChange = (nextLanguage: CurlToCodeOptions['language']) => {
    setLanguage(nextLanguage)
    if (!parsedOptions) return
    try {
      const code = generateCode({ ...parsedOptions, language: nextLanguage })
      setOutput(code)
      setFeedback({ kind: 'status', message: `Converted to ${languages.find(item => item.value === nextLanguage)?.label ?? nextLanguage}.` })
    } catch (error) {
      setOutput('')
      setFeedback({ kind: 'error', message: error instanceof Error ? error.message : 'Could not generate code for this request.' })
    }
  }

  const handleClear = () => {
    setInput('')
    invalidateOutput()
    setFeedback({ kind: 'status', message: 'Input and generated code cleared.' })
  }

  const loadSample = (index: number) => {
    const sample = sampleCurlCommands[index]
    if (!sample) return
    setInput(sample.command)
    invalidateOutput()
    setFeedback({ kind: 'status', message: `${sample.name} example loaded. Convert it to generate code.` })
  }

  const handleCopy = async () => {
    if (!output) {
      setFeedback({ kind: 'error', message: 'Convert a cURL command before copying code.' })
      return
    }
    try {
      await navigator.clipboard.writeText(output)
      setFeedback({ kind: 'status', message: 'Generated code copied to the clipboard.' })
    } catch {
      setFeedback({ kind: 'error', message: 'Could not copy to the clipboard. Check browser permissions.' })
    }
  }

  const handleDownload = () => {
    if (!output) return
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' })
    const objectUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = objectUrl
    link.download = `curl-request.${LANGUAGE_EXTENSIONS[language]}`
    link.click()
    URL.revokeObjectURL(objectUrl)
    setFeedback({ kind: 'status', message: `Downloaded curl-request.${LANGUAGE_EXTENSIONS[language]}.` })
  }

  const hasCredentials = Boolean(parsedOptions?.auth || parsedOptions?.bearerToken ||
    Object.keys(parsedOptions?.headers ?? {}).some(key => key.toLowerCase() === 'authorization'))

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ToolPanel>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="curl-command" className="flex items-center gap-2 font-medium">
              <i className="fas fa-terminal text-secondary" aria-hidden="true"></i>
              cURL command
              <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-white">cURL</span>
            </label>
            <span className="rounded-full border border-border bg-input px-3 py-1 text-sm text-secondary" aria-live="polite">
              {input.length.toLocaleString()} / {MAX_INPUT_LENGTH.toLocaleString()} characters
            </span>
          </div>
          <textarea
            id="curl-command"
            className={`min-h-50 w-full resize-y rounded-lg border border-border bg-input p-4 font-mono text-sm text-primary focus-visible:ring-2 focus-visible:ring-border-focus ${focusClass}`}
            value={input}
            maxLength={MAX_INPUT_LENGTH}
            onChange={event => handleInputChange(event.target.value)}
            onKeyDown={event => {
              if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                event.preventDefault()
                handleConvert()
              }
            }}
            spellCheck={false}
            aria-describedby="curl-limit privacy-note"
            aria-invalid={feedback?.kind === 'error' ? true : undefined}
            placeholder="curl https://api.example.com/data"
          />
          <p id="curl-limit" className="mt-2 text-xs text-secondary">
            Maximum 100,000 characters. Commands are parsed locally; they are never executed or sent to the URL.
          </p>

          <div className="mt-4">
            <p className="text-sm text-secondary">Examples</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {sampleCurlCommands.map((sample, index) => (
                <button
                  key={sample.name}
                  type="button"
                  onClick={() => loadSample(index)}
                  className={`rounded-lg border border-border px-3 py-1.5 text-xs transition hover:bg-hover ${focusClass}`}
                >
                  {sample.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleConvert}
              className={`flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white transition hover:opacity-90 ${focusClass}`}
            >
              <i className="fas fa-exchange-alt" aria-hidden="true"></i> Convert
            </button>
            <button
              type="button"
              onClick={handleClear}
              className={`flex items-center gap-2 rounded-lg border border-border px-4 py-2 transition hover:bg-hover ${focusClass}`}
            >
              <i className="fas fa-eraser" aria-hidden="true"></i> Clear
            </button>
          </div>
        </ToolPanel>

        <ToolPanel>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="generated-code" className="flex items-center gap-2 font-medium">
              <i className="fas fa-file-code text-green-500" aria-hidden="true"></i>
              Generated code
              <span className="rounded-full bg-green-600 px-2 py-0.5 text-xs text-white">{language.toUpperCase()}</span>
            </label>
            <span className="rounded-full border border-border bg-input px-3 py-1 text-sm text-secondary" aria-live="polite">
              {output.length.toLocaleString()} characters
            </span>
          </div>
          <textarea
            id="generated-code"
            className={`min-h-50 w-full resize-y rounded-lg border border-border bg-input-readonly p-4 font-mono text-sm text-primary focus-visible:ring-2 focus-visible:ring-border-focus ${focusClass}`}
            value={output}
            readOnly
            spellCheck={false}
            aria-describedby="generated-code-status"
            placeholder="Generated code will appear here…"
          />
          <p
            id="generated-code-status"
            className={`mt-3 min-h-6 text-sm ${feedback?.kind === 'error' ? 'text-red-600 dark:text-red-300' : 'text-secondary'}`}
            role={feedback?.kind === 'error' ? 'alert' : 'status'}
            aria-live={feedback?.kind === 'error' ? 'assertive' : 'polite'}
          >
            {feedback?.message ?? 'Generated code appears here after conversion.'}
          </p>

          <fieldset className="mt-3">
            <legend className="mb-2 text-sm font-medium text-secondary">Target language</legend>
            <div className="flex flex-wrap gap-2">
              {languages.map(lang => (
                <button
                  key={lang.value}
                  type="button"
                  aria-pressed={language === lang.value}
                  onClick={() => handleLanguageChange(lang.value)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition ${focusClass} ${language === lang.value ? 'bg-primary text-white' : 'border border-border bg-input text-primary hover:bg-hover'}`}
                >
                  <i className={lang.icon} aria-hidden="true"></i>
                  {lang.label}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleCopy}
              disabled={!output}
              className={`flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 ${focusClass}`}
            >
              <i className="fas fa-copy" aria-hidden="true"></i> Copy
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={!output}
              className={`flex items-center gap-2 rounded-lg border border-border px-4 py-2 transition hover:bg-hover disabled:cursor-not-allowed disabled:opacity-50 ${focusClass}`}
            >
              <i className="fas fa-download" aria-hidden="true"></i> Download .{LANGUAGE_EXTENSIONS[language]}
            </button>
          </div>

          {hasCredentials && (
            <p className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-primary" role="note">
              This request contains credentials. They are included in the generated code and downloaded file; review and remove secrets before sharing or committing it.
            </p>
          )}
        </ToolPanel>
      </div>

      {parsedOptions && (
        <section className="mt-6 rounded-lg border border-border bg-card p-4" aria-labelledby="parsed-info-title">
          <h2 id="parsed-info-title" className="mb-3 flex items-center gap-2 font-semibold text-primary">
            <i className="fas fa-info-circle text-blue-500" aria-hidden="true"></i>
            Parsed request
          </h2>
          <dl className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
            <div><dt className="text-secondary">Method</dt><dd className="font-semibold text-primary">{parsedOptions.method}</dd></div>
            <div><dt className="text-secondary">URL</dt><dd className="truncate font-mono text-xs text-primary" title={parsedOptions.url}>{parsedOptions.url}</dd></div>
            <div><dt className="text-secondary">Headers</dt><dd className="font-semibold text-primary">{Object.keys(parsedOptions.headers).length}</dd></div>
            <div><dt className="text-secondary">Authentication</dt><dd className="font-semibold text-primary">{hasCredentials ? 'Credentials present' : 'None'}</dd></div>
          </dl>
        </section>
      )}

      <section className="mt-6 rounded-lg border border-border bg-card p-4" aria-labelledby="quick-tips-title">
        <h2 id="quick-tips-title" className="mb-2 flex items-center gap-2 font-semibold text-primary">
          <i className="fas fa-lightbulb text-yellow-500" aria-hidden="true"></i>
          Quick tips and limitations
        </h2>
        <ul className="space-y-1 text-sm text-secondary">
          <li>Press <kbd className="rounded border border-border bg-input px-2 py-0.5 text-xs">Ctrl</kbd> + <kbd className="rounded border border-border bg-input px-2 py-0.5 text-xs">Enter</kbd> to convert (or <kbd className="rounded border border-border bg-input px-2 py-0.5 text-xs">⌘</kbd> + <kbd className="rounded border border-border bg-input px-2 py-0.5 text-xs">Enter</kbd> on Mac).</li>
          <li>Supports common URL, method, header, body, form, and authentication flags. Unsupported options are rejected instead of silently dropped.</li>
          <li>Generated snippets use the HTTP client for each target language; verify client-specific defaults and review them before running.</li>
          <li id="privacy-note">Conversion happens in this browser. The pasted command is not executed and no request is made. Credentials in the command appear in the generated code.</li>
        </ul>
      </section>
    </div>
  )
}
