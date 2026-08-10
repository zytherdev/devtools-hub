/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect } from 'react'
import { ToolPanel } from '@/app/components/ToolPanel'
import { minifyCSS, minifyCSS2 } from '@/app/lib/tools/minifyCss'

export default function CSSMinifier() {
    const [input, setInput] = useState('')
    const [output, setOutput] = useState('')
    const [inputChars, setInputChars] = useState(0)
    const [outputChars, setOutputChars] = useState(0)
    const [stats, setStats] = useState('⚡ ready')
    const [advancedMode, setAdvancedMode] = useState(false)

    const sampleCode = `/* ===== MAIN STYLES ===== */
    .container {
        display: flex;
        flex-direction: column;
        padding: 2rem;
        background: #f1f5f9;
        border-radius: 0.75rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    /* Button styles */
    .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.75rem 1.5rem;
        background: #0f1724;
        color: #ffffff;
        border: none;
        border-radius: 0.5rem;
        font-weight: 600;
        transition: all 0.2s ease;
        cursor: pointer;
    }

    .btn:hover {
        background: #1e293b;
        transform: translateY(-2px);
        box-shadow: 0 8px 16px -4px rgba(0, 0, 0, 0.15);
    }

    .btn:active {
        transform: scale(0.98);
    }

    /* Responsive */
    @media (max-width: 768px) {
        .container {
            padding: 1rem;
        }
        
        .btn {
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
        }
    }`

    const handleMinify = () => {
        if (!input.trim()) {
            alert('Please paste some CSS code to minify')
            return
        }

        try {
            const result = advancedMode ? minifyCSS2(input) : minifyCSS(input)
            setOutput(result)

            const saved = input.length - result.length
            const percent = input.length > 0 ? Math.round((saved / input.length) * 100) : 0
            setStats(`⬇ saved ${saved} chars · ${percent}% smaller`)

            if (result.length === 0) {
                alert('Minification produced empty output')
            } else {
                alert('CSS minified successfully!')
            }
        } catch (error) {
            console.error('Minification error:', error)
            alert('Error minifying CSS. Please check your code.')
        }
    }

    const handleClear = () => {
        setInput('')
        setOutput('')
        setStats('⚡ ready')
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
        setStats('⚡ ready')
        alert('Sample loaded!')
    }

    // Ctrl+Enter
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault()
                handleMinify()
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [input, advancedMode])

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
                    <i className="fa-brands fa-css3-alt text-blue-500"></i>
                    CSS Minifier
                </h1>
                <p className="text-secondary mt-2 max-w-2xl">
                    Compress and optimize your CSS code. Remove comments, whitespace, and unnecessary characters
                    to reduce file size and improve loading performance.
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
                                onClick={handleMinify}
                                className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition flex items-center gap-2"
                            >
                                <i className="fas fa-bolt"></i> Minify
                            </button>
                            <button
                                onClick={handleClear}
                                className="px-4 py-2 border border-border rounded-lg hover:bg-hover transition flex items-center gap-2"
                            >
                                <i className="fas fa-eraser"></i> Clear
                            </button>
                            <button
                                onClick={() => setAdvancedMode(!advancedMode)}
                                className={`
                                    px-4 py-2 border rounded-lg transition flex items-center gap-2
                                    ${advancedMode 
                                        ? 'bg-primary text-white border-primary' 
                                        : 'border-border hover:bg-hover'
                                    }
                                `}
                            >
                                <i className="fas fa-star"></i> 
                                {advancedMode ? 'Advanced ON' : 'Advanced'}
                            </button>
                        </div>
                        <div className="text-sm text-secondary bg-input px-3 py-1 rounded-full border border-border">
                            <i className="fas fa-bolt"></i> {stats}
                        </div>
                    </div>
                </ToolPanel>

                <ToolPanel>
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
                        className="w-full bg-input-readonly border border-border rounded-lg p-4 text-primary min-h-85 font-mono text-sm resize-y focus:outline-none"
                        value={output}
                        readOnly
                        spellCheck={false}
                        placeholder="Minified CSS will appear here…"
                    />
                    <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={handleCopy}
                                className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition flex items-center gap-2"
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
                </ToolPanel>
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
                    <li>• <strong>Advanced mode</strong> includes color optimization, unit removal, and more</li>
                </ul>
            </div>

            {output && (
                <div className="mt-6 p-4 bg-card border border-border rounded-lg">
                    <h4 className="font-semibold mb-2 text-primary">Minification Results</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <span className="text-secondary">Original Size</span>
                            <p className="font-semibold text-primary">{inputChars} chars</p>
                        </div>
                        <div>
                            <span className="text-secondary">Minified Size</span>
                            <p className="font-semibold text-primary">{outputChars} chars</p>
                        </div>
                        <div>
                            <span className="text-secondary">Saved</span>
                            <p className="font-semibold text-green-500">{inputChars - outputChars} chars</p>
                        </div>
                        <div>
                            <span className="text-secondary">Compression</span>
                            <p className="font-semibold text-blue-500">
                                {inputChars > 0 ? Math.round(((inputChars - outputChars) / inputChars) * 100) : 0}%
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}