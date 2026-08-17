/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect } from 'react'
import { ToolPanel } from '@/app/components/ToolPanel'
import { CSSBeautifyOptions, beautifyCSS, defaultCSSOptions } from '@/app/lib/tools/css/beautifier';

export default function CSSBeautifier() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [inputChars, setInputChars] = useState(0)
  const [outputChars, setOutputChars] = useState(0)
  const [options, setOptions] = useState<CSSBeautifyOptions>({ ...defaultCSSOptions })

  const sampleCode = `.container{display:flex;flex-direction:column;padding:2rem;background:#f1f5f9;border-radius:0.75rem;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);}.btn{display:inline-flex;align-items:center;justify-content:center;padding:0.75rem 1.5rem;background:#0f1724;color:#ffffff;border:none;border-radius:0.5rem;font-weight:600;transition:all 0.2s ease;cursor:pointer;}.btn:hover{background:#1e293b;transform:translateY(-2px);box-shadow:0 8px 16px -4px rgba(0,0,0,0.15);}.btn:active{transform:scale(0.98);}@media(max-width:768px){.container{padding:1rem;}.btn{padding:0.5rem 1rem;font-size:0.875rem;}}`

  const handleBeautify = () => {
    if (!input.trim()) {
      alert('Please paste some CSS code to beautify')
      return
    }

    try {
      const result = beautifyCSS(input, options)
      setOutput(result)

      alert('CSS beautified successfully!')

    } catch (error) {
      console.error('Beautification error:', error)
      alert('Error beautifying CSS. Please check your code.')
    }
  }

  const handleClear = () => {
    setInput('')
    setOutput('')
    setInputChars(0)
    setOutputChars(0)
    alert('Cleared!')
  }

  const handleCopy = async () => {
    if (!output) {
      alert('Nothing to copy')
      return
    }

    try {
      await navigator.clipboard.writeText(output)
      alert('Copied to clipboard!')
    } catch (error) {
      console.error('Copy error:', error)
      const textarea = document.createElement('textarea')
      textarea.value = output
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      alert('Copied!')
    }
  }

  const loadSample = () => {
    setInput(sampleCode)
    setOutput('')
    alert('Sample loaded!')
  }

  // Ctrl+Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        handleBeautify()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [input, options])

  useEffect(() => {
    setInputChars(input.length)
  }, [input])

  useEffect(() => {
    setOutputChars(output.length)
  }, [output])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
          <i className="fa-solid fa-brush text-blue-400"></i>
          CSS Beautifier
        </h1>
        <p className="text-secondary mt-2 max-w-2xl">
          Format and prettify your CSS code. Make it readable with proper indentation and structure.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ToolPanel>
          <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
            <label className="font-medium flex items-center gap-2">
              <i className="fas fa-file-code text-secondary"></i>
              Input CSS
              <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">CSS</span>
            </label>
            <div className="text-sm text-secondary bg-input px-3 py-1 rounded-full border border-border">
              <i className="fas fa-characters"></i> chars <span className="font-semibold text-primary">{inputChars}</span>
            </div>
          </div>
          <textarea
            className="w-full bg-input border border-border rounded-lg p-4 text-primary min-h-85 font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-border-focus"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            placeholder="/* Paste your CSS here */"
          />
          <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleBeautify}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition flex items-center gap-2"
              >
                <i className="fas fa-wand-magic-sparkles"></i> Beautify
              </button>
              <button
                onClick={handleClear}
                className="px-4 py-2 border border-border rounded-lg hover:bg-hover transition flex items-center gap-2"
              >
                <i className="fas fa-eraser"></i> Clear
              </button>
              <button
                onClick={loadSample}
                className="px-4 py-2 border border-border rounded-lg hover:bg-hover transition flex items-center gap-2"
              >
                <i className="fas fa-rotate-right"></i> Sample
              </button>
            </div>
          </div>
        </ToolPanel>

        <ToolPanel>
          <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
            <label className="font-medium flex items-center gap-2">
              <i className="fas fa-file-code text-green-500"></i>
              Beautified Output
              <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">output</span>
            </label>
            <div className="text-sm text-secondary bg-input px-3 py-1 rounded-full border border-border">
              <i className="fas fa-characters"></i> chars <span className="font-semibold text-primary">{outputChars}</span>
            </div>
          </div>
          <textarea
            className="w-full bg-input-readonly border border-border rounded-lg p-4 text-primary min-h-85 font-mono text-sm resize-y focus:outline-none"
            value={output}
            readOnly
            spellCheck={false}
            placeholder="Beautified CSS will appear here…"
          />
          <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition flex items-center gap-2"
              >
                <i className="fas fa-copy"></i> Copy
              </button>
            </div>
          </div>
        </ToolPanel>
      </div>

      <div className="mt-6 p-4 bg-card border border-border rounded-lg">
        <h3 className="font-semibold mb-3 text-primary flex items-center gap-2">
          <i className="fas fa-sliders-h text-secondary"></i>
          Beautify Options
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-sm text-secondary block mb-1">Indent Size</label>
            <select
              value={options.indentSize}
              onChange={(e) => setOptions({ ...options, indentSize: Number(e.target.value) })}
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-primary text-sm focus:outline-none focus:ring-2 focus:ring-border-focus"
            >
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces</option>
              <option value={6}>6 spaces</option>
              <option value={8}>8 spaces</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-secondary block mb-1">Indent Char</label>
            <select
              value={options.indentChar}
              onChange={(e) => setOptions({ ...options, indentChar: e.target.value as ' ' | '\t' })}
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-primary text-sm focus:outline-none focus:ring-2 focus:ring-border-focus"
            >
              <option value=" ">Space</option>
              <option value="\t">Tab</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="spaceBeforeBrace"
              checked={options.spaceBeforeBrace}
              onChange={(e) => setOptions({ ...options, spaceBeforeBrace: e.target.checked })}
              className="w-4 h-4 accent-primary"
            />
            <label htmlFor="spaceBeforeBrace" className="text-sm text-secondary">Space before {'{'}</label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="spaceAfterColon"
              checked={options.spaceAfterColon}
              onChange={(e) => setOptions({ ...options, spaceAfterColon: e.target.checked })}
              className="w-4 h-4 accent-primary"
            />
            <label htmlFor="spaceAfterColon" className="text-sm text-secondary">Space after :</label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="newlineAfterRules"
              checked={options.newlineAfterRules}
              onChange={(e) => setOptions({ ...options, newlineAfterRules: e.target.checked })}
              className="w-4 h-4 accent-primary"
            />
            <label htmlFor="newlineAfterRules" className="text-sm text-secondary">Newline after rules</label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="preserveNewlines"
              checked={options.preserveNewlines}
              onChange={(e) => setOptions({ ...options, preserveNewlines: e.target.checked })}
              className="w-4 h-4 accent-primary"
            />
            <label htmlFor="preserveNewlines" className="text-sm text-secondary">Preserve newlines</label>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-card border border-border rounded-lg">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <i className="fas fa-lightbulb text-yellow-500"></i>
          Quick Tips
        </h3>
        <ul className="text-sm text-secondary space-y-1">
          <li>• Press <kbd className="px-2 py-0.5 bg-input border border-border rounded text-xs">Ctrl</kbd> + <kbd className="px-2 py-0.5 bg-input border border-border rounded text-xs">Enter</kbd> to beautify quickly</li>
          <li>• All processing happens in your browser — no data is sent to any server</li>
          <li>• Adjust indent size and other options to match your preferred style</li>
        </ul>
      </div>
    </div>
  )
}