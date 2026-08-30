/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect } from 'react'
import { ToolPanel } from '@/app/components/ToolPanel'
import { htmlToJSX, isValidHTML, sampleHTML, type HTMLToJSXOptions } from '@/app/lib/tools/js/html-to-jsx'
import { useToast } from '@zyther/react-toastify'

export default function HTMLToJSX() {
  const toast = useToast() 
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [inputChars, setInputChars] = useState(0)
  const [outputChars, setOutputChars] = useState(0)
  const [isValid, setIsValid] = useState(true)
  const [options, setOptions] = useState<HTMLToJSXOptions>({
    preserveComments: false,
    preserveWhitespace: false,
    selfClosingTags: true,
    convertStyle: true,
    className: 'className',
    htmlFor: 'htmlFor',
    inlineStyle: true,
  })

  const handleConvert = () => {
    if (!input.trim()) {
      toast.error('Please paste some HTML code')
      return
    }

    if (!isValidHTML(input)) {
      setIsValid(false)
      toast.error('Invalid HTML format')
      return
    }

    setIsValid(true)

    try {
      const result = htmlToJSX(input, options)
      setOutput(result)
      toast.success('HTML converted to JSX!')
    } catch (error) {
      console.error('Conversion error:', error)
      toast.error('Error converting HTML to JSX')
    }
  }

  const handleClear = () => {
    setInput('')
    setOutput('')
    setInputChars(0)
    setOutputChars(0)
    setIsValid(true)
    toast.success('Cleared!')
  }

  const handleCopy = async () => {
    if (!output) {
      toast.error('Nothing to copy')
      return
    }
    try {
      await navigator.clipboard.writeText(output)
      toast.success('Copied to clipboard!')
    } catch (error) {
      console.log(error)
      toast.error('Failed to copy')
    }
  }

  const loadSample = () => {
    setInput(sampleHTML)
    setOutput('')
    setIsValid(true)
    toast.success('Sample loaded!')
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        handleConvert()
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
          <i className="fa-brands fa-react text-cyan-400"></i>
          HTML to JSX Converter
        </h1>
        <p className="text-secondary mt-2 max-w-2xl">
          Convert HTML to JSX for use in React applications. Supports complex nested structures and attributes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ToolPanel>
          <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
            <label className="font-medium flex items-center gap-2">
              <i className="fas fa-file-code text-secondary"></i>
              Input HTML
              <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">HTML</span>
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
            placeholder="<!-- Paste your HTML here -->"
          />
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={handleConvert}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition flex items-center gap-2"
            >
              <i className="fas fa-exchange-alt"></i> Convert
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
        </ToolPanel>

        <ToolPanel>
          <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
            <label className="font-medium flex items-center gap-2">
              <i className="fas fa-file-code text-green-500"></i>
              JSX Output
              <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">JSX</span>
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
            placeholder="JSX will appear here…"
          />
          <button
            onClick={handleCopy}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition flex items-center gap-2"
          >
            <i className="fas fa-copy"></i> Copy
          </button>
        </ToolPanel>
      </div>

      <div className="mt-6 p-4 bg-card border border-border rounded-lg">
        <h3 className="font-semibold mb-3 text-primary flex items-center gap-2">
          <i className="fas fa-sliders-h text-secondary"></i>
          Conversion Options
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="preserveComments"
              checked={options.preserveComments}
              onChange={(e) => setOptions({ ...options, preserveComments: e.target.checked })}
              className="w-4 h-4 accent-primary"
            />
            <label htmlFor="preserveComments" className="text-sm text-secondary">Preserve comments</label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="preserveWhitespace"
              checked={options.preserveWhitespace}
              onChange={(e) => setOptions({ ...options, preserveWhitespace: e.target.checked })}
              className="w-4 h-4 accent-primary"
            />
            <label htmlFor="preserveWhitespace" className="text-sm text-secondary">Preserve whitespace</label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="selfClosingTags"
              checked={options.selfClosingTags}
              onChange={(e) => setOptions({ ...options, selfClosingTags: e.target.checked })}
              className="w-4 h-4 accent-primary"
            />
            <label htmlFor="selfClosingTags" className="text-sm text-secondary">Self-closing tags</label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="convertStyle"
              checked={options.convertStyle}
              onChange={(e) => setOptions({ ...options, convertStyle: e.target.checked })}
              className="w-4 h-4 accent-primary"
            />
            <label htmlFor="convertStyle" className="text-sm text-secondary">Convert style to object</label>
          </div>

          <div>
            <label className="text-sm text-secondary block mb-1">className</label>
            <select
              value={options.className}
              onChange={(e) => setOptions({ ...options, className: e.target.value as 'class' | 'className' })}
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-primary text-sm focus:outline-none focus:ring-2 focus:ring-border-focus"
            >
              <option value="className">className</option>
              <option value="class">class</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-secondary block mb-1">htmlFor</label>
            <select
              value={options.htmlFor}
              onChange={(e) => setOptions({ ...options, htmlFor: e.target.value as 'for' | 'htmlFor' })}
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-primary text-sm focus:outline-none focus:ring-2 focus:ring-border-focus"
            >
              <option value="htmlFor">htmlFor</option>
              <option value="for">for</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-card border border-border rounded-lg">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <i className="fas fa-lightbulb text-yellow-500"></i>
          Quick Tips
        </h3>
        <ul className="text-sm text-secondary space-y-1">
          <li>• Press <kbd className="px-2 py-0.5 bg-input border border-border rounded text-xs">Ctrl</kbd> + <kbd className="px-2 py-0.5 bg-input border border-border rounded text-xs">Enter</kbd> to convert quickly</li>
          <li>• Supports standard HTML attributes mapping to JSX</li>
          <li>• Inline styles are converted to JavaScript objects</li>
          <li>• Boolean attributes are handled correctly</li>
          <li>• All processing happens in your browser</li>
        </ul>
      </div>
    </div>
  )
}