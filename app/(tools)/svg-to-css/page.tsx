/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect } from 'react'
import { ToolPanel } from '@/app/components/ToolPanel'
import * as SVGConverter from '@/app/lib/tools/css/svg-to-css'

export default function SVGToCSS() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [format, setFormat] = useState<SVGConverter.SVGConversionOptions['format']>('background-image')
  const [addPrefix, setAddPrefix] = useState(true)
  const [prefix, setPrefix] = useState('icon')
  const [optimize, setOptimize] = useState(true)
  const [minify, setMinify] = useState(false)
  const [isValid, setIsValid] = useState(true)
  const [preview, setPreview] = useState('')

  useEffect(() => {
    if (input && isValid) {
      // prvw as bg img
      const encoded = SVGConverter.encodeSVG(input, minify)
      setPreview(`data:image/svg+xml,${encoded}`)
    } else {
      setPreview('')
    }
  }, [input, isValid, minify])

  const handleConvert = () => {
    if (!input.trim()) {
      alert('Please paste some SVG code')
      return
    }

    if (!SVGConverter.isValidSVG(input)) {
      setIsValid(false)
      alert('Invalid SVG format')
      return
    }

    setIsValid(true)

    try {
      const result = SVGConverter.svgToCSS(input, {
        format,
        addPrefix,
        prefix,
        optimize,
        minify
      })
      setOutput(result)
      alert('SVG converted to CSS!')
    } catch (error) {
      console.error('Conversion error:', error)
      alert('Error converting SVG')
    }
  }

  const handleClear = () => {
    setInput('')
    setOutput('')
    setPreview('')
    setIsValid(true)
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
      alert('Failed to copy')
    }
  }

  const loadSample = (index: number) => {
    setInput(SVGConverter.sampleSVGs[index].svg)
    setOutput('')
    setPreview('')
    setIsValid(true)
    alert('Sample loaded!')
  }

  // Ctrl+Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        handleConvert()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [input, format, addPrefix, prefix, optimize, minify])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
          <i className="fa-solid fa-image text-orange-500"></i>
          SVG to CSS Converter
        </h1>
        <p className="text-secondary mt-2 max-w-2xl">
          Convert SVG to CSS background-image, mask-image, or content. Perfect for icons and illustrations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* input */}
        <ToolPanel>
          <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
            <label className="font-medium flex items-center gap-2">
              <i className="fas fa-file-code text-secondary"></i>
              SVG Code
              <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">SVG</span>
            </label>
            {!isValid && (
              <span className="text-xs text-red-500">
                <i className="fas fa-exclamation-circle"></i> Invalid SVG
              </span>
            )}
          </div>
          <textarea
            className="w-full bg-input border border-border rounded-lg p-4 text-primary min-h-50 font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-border-focus"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            placeholder='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">...</svg>'
          />
          
          {/* samples */}
          <div className="mt-3">
            <span className="text-sm text-secondary">Samples:</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {SVGConverter.sampleSVGs.map((sample, index) => (
                <button
                  key={index}
                  onClick={() => loadSample(index)}
                  className="px-3 py-1 text-xs border border-border rounded hover:bg-hover transition"
                >
                  {sample.name}
                </button>
              ))}
            </div>
          </div>

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
          </div>
        </ToolPanel>

        {/* output */}
        <ToolPanel>
          <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
            <label className="font-medium flex items-center gap-2">
              <i className="fas fa-file-code text-green-500"></i>
              CSS Output
              <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">CSS</span>
            </label>
          </div>
          <textarea
            className="w-full bg-input-readonly border border-border rounded-lg p-4 text-primary min-h-50 font-mono text-sm resize-y focus:outline-none"
            value={output}
            readOnly
            spellCheck={false}
            placeholder="CSS will appear here…"
          />

          {preview && (
            <div className="mt-3">
              <label className="font-medium text-primary mb-2 flex items-center gap-2">
                <i className="fas fa-eye text-secondary"></i>
                Preview
              </label>
              <div 
                className="w-20 h-20 rounded-lg border border-border bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url('${preview}')` }}
              />
            </div>
          )}

          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition flex items-center gap-2"
            >
              <i className="fas fa-copy"></i> Copy
            </button>
          </div>
        </ToolPanel>
      </div>

      <div className="mt-6 p-4 bg-card border border-border rounded-lg">
        <h3 className="font-semibold mb-3 text-primary flex items-center gap-2">
          <i className="fas fa-sliders-h text-secondary"></i>
          Conversion Options
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-sm text-secondary block mb-1">Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as SVGConverter.SVGConversionOptions['format'])}
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-primary text-sm focus:outline-none focus:ring-2 focus:ring-border-focus"
            >
              <option value="background-image">Background Image</option>
              <option value="mask-image">Mask Image</option>
              <option value="content">Content</option>
              <option value="url">URL Only</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="addPrefix"
              checked={addPrefix}
              onChange={(e) => setAddPrefix(e.target.checked)}
              className="w-4 h-4 accent-primary"
            />
            <label htmlFor="addPrefix" className="text-sm text-secondary">Add CSS class</label>
          </div>

          <div>
            <label className="text-sm text-secondary block mb-1">CSS Class</label>
            <input
              type="text"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              disabled={!addPrefix}
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-primary text-sm focus:outline-none focus:ring-2 focus:ring-border-focus disabled:opacity-50"
              placeholder="icon"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="optimize"
              checked={optimize}
              onChange={(e) => setOptimize(e.target.checked)}
              className="w-4 h-4 accent-primary"
            />
            <label htmlFor="optimize" className="text-sm text-secondary">Optimize SVG</label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="minify"
              checked={minify}
              onChange={(e) => setMinify(e.target.checked)}
              className="w-4 h-4 accent-primary"
            />
            <label htmlFor="minify" className="text-sm text-secondary">Minify output</label>
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
          <li>• Use <strong>Background Image</strong> for most use cases</li>
          <li>• <strong>Mask Image</strong> is great for colorable icons</li>
          <li>• Enable <strong>Optimize</strong> to reduce file size</li>
          <li>• All processing happens in your browser</li>
          <li>• <strong>Note:</strong> SVG must have viewBox or width/height</li>
        </ul>
      </div>
    </div>
  )
}