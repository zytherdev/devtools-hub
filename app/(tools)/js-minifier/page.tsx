/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { minifyJS } from '@/app/lib/tools/js/minifyJs';
import { useState, useEffect } from 'react'

export default function JSMinifier() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [inputChars, setInputChars] = useState(0)
  const [outputChars, setOutputChars] = useState(0)
  const [stats, setStats] = useState('⚡ ready')

  const sampleCode = `/**
  * A simple calculator module
  */
  const Calculator = {
    add: function(a, b) {
      return a + b;
    },
    subtract: function(a, b) {
      return a - b;
    },
    multiply: function(a, b) {
      return a * b;
    },
    divide: function(a, b) {
      if (b === 0) {
        throw new Error('Division by zero');
      }
      return a / b;
    }
  };

  // Export for use
  export default Calculator;`

  const handleMinify = () => {
    try {
      const result = minifyJS(input)
      setOutput(result)
      
      const saved = input.length - result.length
      const percent = input.length > 0 ? Math.round((saved / input.length) * 100) : 0
      setStats(`⬇ saved ${saved} chars · ${percent}% smaller`)
    } catch (error) {
      alert('Error minifying code' + (error instanceof Error ? `: ${error.message}` : ''))
    }
  }

  const handleClear = () => {
    setInput('')
    setOutput('')
    setStats('⚡ ready')
    setInputChars(0)
    setOutputChars(0)
  }

  const handleCopy = () => {
    if (!output) {
      alert('Nothing to copy')
      return
    }
    navigator.clipboard.writeText(output)
    alert('Copied!')
  }

  const loadSample = () => {
    setInput(sampleCode)
    setOutput('')
    setStats('⚡ ready')
  }

  useEffect(() => {
    setInputChars(input.length)
  }, [input])

  useEffect(() => {
    setOutputChars(output.length)
  }, [output])

  // Ctrl + Enter
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'Enter') {
        handleMinify()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
          <i className="fa-brands fa-js text-yellow-500"></i>
          JavaScript Minifier
        </h1>
        <p className="text-secondary mt-2 max-w-2xl">
          Compress and optimize your JavaScript code. Remove comments, whitespace, and unnecessary characters.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="tool-panel bg-card border border-border rounded-xl p-5">
          <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
            <label className="font-medium flex items-center gap-2">
              <i className="fas fa-file-code text-secondary"></i>
              Input JavaScript
              <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">JS</span>
            </label>
            <div className="text-sm text-secondary bg-input px-3 py-1 rounded-full border border-border">
              <i className="fas fa-characters"></i> chars <span className="font-semibold text-primary">{inputChars}</span>
            </div>
          </div>
          <textarea
            className="w-full bg-input border border-border rounded-lg p-4 text-primary min-h-85 font-mono text-sm resize-y"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            placeholder="/* Paste your JavaScript here */"
          />
          <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
            <div className="flex gap-2">
              <button
                onClick={handleMinify}
                className="px-4 py-2 bg-primary hover:bg-primary/70 text-white rounded-lg hover:opacity-90 transition flex items-center gap-2"
              >
                <i className="fas fa-bolt"></i> Minify
              </button>
              <button
                onClick={handleClear}
                className="px-4 py-2 border border-border rounded-lg hover:bg-hover transition flex items-center gap-2"
              >
                <i className="fas fa-eraser"></i> Clear
              </button>
            </div>
            <div className="text-sm text-secondary bg-input px-3 py-1 rounded-full border border-border">
              <i className="fas fa-bolt"></i> {stats}
            </div>
          </div>
        </div>

        <div className="tool-panel bg-card border border-border rounded-xl p-5">
          <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
            <label className="font-medium flex items-center gap-2">
              <i className="fas fa-file-code text-green-500"></i>
              Minified Output
              <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">output</span>
            </label>
            <div className="text-sm text-secondary bg-input px-3 py-1 rounded-full border border-border">
              <i className="fas fa-characters"></i> chars <span className="font-semibold text-primary">{outputChars}</span>
            </div>
          </div>
          <textarea
            className="w-full bg-input-readonly border border-border rounded-lg p-4 text-primary min-h-85 font-mono text-sm resize-y"
            value={output}
            readOnly
            spellCheck={false}
            placeholder="Minified JavaScript will appear here…"
          />
          <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-primary hover:bg-primary/70 text-white rounded-lg hover:opacity-90 transition flex items-center gap-2"
              >
                <i className="fas fa-copy"></i> Copy
              </button>
              <button
                onClick={loadSample}
                className="px-4 py-2 border border-border rounded-lg hover:bg-hover transition flex items-center gap-2"
              >
                <i className="fas fa-rotate-right"></i> Sample
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-card border border-border rounded-lg">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <i className="fas fa-lightbulb text-yellow-500"></i>
          Quick Tips
        </h3>
        <ul className="text-sm text-secondary space-y-1">
          <li>• Press <kbd className="px-2 py-0.5 bg-input border border-border rounded text-xs">Ctrl</kbd> + <kbd className="px-2 py-0.5 bg-input border border-border rounded text-xs">Enter</kbd> to minify quickly</li>
          <li>• All processing happens in your browser — no data is sent to any server</li>
          <li>• Minified code is optimized for production use</li>
        </ul>
      </div>
    </div>
  )
}