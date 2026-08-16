/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect } from 'react'
import { ToolPanel } from '@/app/components/ToolPanel'
import { 
    formatJSON, 
    minifyJSON, 
    validateJSON, 
    sortJSONKeys,
    jsonToCSV,
    jsonToYAML,
    escapeJSON,
    unescapeJSON
} from '@/app/lib/tools/formatters/formatJson'

type Mode = 'format' | 'minify' | 'validate' | 'sort' | 'csv' | 'yaml' | 'escape' | 'unescape'

export default function JSONFormatter() {
    const [input, setInput] = useState('')
    const [output, setOutput] = useState('')
    const [inputChars, setInputChars] = useState(0)
    const [outputChars, setOutputChars] = useState(0)
    const [mode, setMode] = useState<Mode>('format')
    const [indentSize, setIndentSize] = useState(2)
    const [error, setError] = useState<string | null>(null)
    const [isValid, setIsValid] = useState<boolean | null>(null)

    const sampleCode = `{
    "name": "DevTools Hub",
    "version": "2.0.0",
    "description": "A comprehensive developer toolkit",
    "features": [
        "CSS Minifier",
        "JavaScript Minifier",
        "HTML Minifier",
        "JSON Formatter"
    ],
    "author": {
        "name": "DevTools Team",
        "email": "team@devtools-hub.dev",
        "active": true
    },
    "stats": {
        "users": 10000,
        "stars": 500,
        "forks": 120
    },
    "isOpenSource": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "tags": ["developer", "tools", "free"]
    }`

    const handleProcess = () => {
        if (!input.trim()) {
            alert('Please paste some JSON to process')
            return
        }

        setError(null)
        setIsValid(null)

        try {
            let result = ''
            
            switch (mode) {
                case 'format':
                    result = formatJSON(input, indentSize)
                    break
                case 'minify':
                    result = minifyJSON(input)
                    break
                case 'validate':
                    const validation = validateJSON(input)
                    if (validation.valid) {
                        result = '✅ Valid JSON\n\n' + formatJSON(input, indentSize)
                        setIsValid(true)
                    } else {
                        setError(validation.error || 'Invalid JSON')
                        setIsValid(false)
                        result = `❌ Invalid JSON\n\nError: ${validation.error}`
                    }
                    break
                case 'sort':
                    result = sortJSONKeys(input)
                    break
                case 'csv':
                    result = jsonToCSV(input)
                    break
                case 'yaml':
                    result = jsonToYAML(input)
                    break
                case 'escape':
                    result = escapeJSON(input)
                    break
                case 'unescape':
                    result = unescapeJSON(input)
                    break
                default:
                    result = formatJSON(input, indentSize)
            }

            setOutput(result)
            
            if (mode === 'validate') {
                alert('JSON validation complete!')
            } else {
                alert(`${mode.charAt(0).toUpperCase() + mode.slice(1)} complete!`)
            }

        } catch (error) {
            const errorMsg = (error as Error).message
            setError(errorMsg)
            setIsValid(false)
            setOutput(`❌ Error: ${errorMsg}`)
            alert('Error processing JSON')
        }
    }

    const handleClear = () => {
        setInput('')
        setOutput('')
        setError(null)
        setIsValid(null)
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
            console.log('Error copying to clipboard:', error)
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
        setError(null)
        setIsValid(null)
        alert('Sample loaded!')
    }

    // Ctrl+Enter
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault()
                handleProcess()
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [input, mode, indentSize])

    useEffect(() => {
        setInputChars(input.length)
    }, [input])

    useEffect(() => {
        setOutputChars(output.length)
    }, [output])

    const modes: { value: Mode; label: string; icon: string }[] = [
        { value: 'format', label: 'Format', icon: 'fa-bars' },
        { value: 'minify', label: 'Minify', icon: 'fa-compress' },
        { value: 'validate', label: 'Validate', icon: 'fa-check-circle' },
        { value: 'sort', label: 'Sort Keys', icon: 'fa-sort' },
        { value: 'csv', label: 'To CSV', icon: 'fa-table' },
        { value: 'yaml', label: 'To YAML', icon: 'fa-code' },
        { value: 'escape', label: 'Escape', icon: 'fa-forward' },
        { value: 'unescape', label: 'Unescape', icon: 'fa-backward' },
    ]

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                    <i className="fas fa-brackets-curly text-purple-500"></i>
                    JSON Formatter
                </h1>
                <p className="text-secondary mt-2 max-w-2xl">
                    Format, validate, minify, and convert your JSON data. 
                    Process JSON with powerful tools and utilities.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ToolPanel>
                    <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
                        <label className="font-medium flex items-center gap-2">
                            <i className="fas fa-file-code text-secondary"></i>
                            Input JSON
                            <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">JSON</span>
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
                        placeholder='{ "key": "value" }'
                    />
                    <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={handleProcess}
                                className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition flex items-center gap-2"
                            >
                                <i className="fas fa-play"></i> Process
                            </button>
                            <button
                                onClick={handleClear}
                                className="px-4 py-2 border border-border rounded-lg hover:bg-hover transition flex items-center gap-2"
                            >
                                <i className="fas fa-eraser"></i> Clear
                            </button>
                        </div>
                        <div className="text-sm text-secondary bg-input px-3 py-1 rounded-full border border-border">
                            {isValid === true && <span className="text-green-500"><i className="fas fa-check"></i> Valid</span>}
                            {isValid === false && <span className="text-red-500"><i className="fas fa-times"></i> Invalid</span>}
                            {isValid === null && <span className="text-muted">Ready</span>}
                        </div>
                    </div>
                </ToolPanel>

                <ToolPanel>
                    <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
                        <label className="font-medium flex items-center gap-2">
                            <i className="fas fa-file-code text-green-500"></i>
                            Output
                            <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                                {mode.toUpperCase()}
                            </span>
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
                        placeholder="Output will appear here…"
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

            {/* ctrls */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* mode slt */}
                <div className="p-4 bg-card border border-border rounded-lg">
                    <label className="font-medium text-primary mb-2 block">Mode</label>
                    <div className="flex flex-wrap gap-2">
                        {modes.map((m) => (
                            <button
                                key={m.value}
                                onClick={() => setMode(m.value)}
                                className={`
                                    px-3 py-1.5 rounded-lg text-sm transition flex items-center gap-2
                                    ${mode === m.value 
                                        ? 'bg-primary text-white' 
                                        : 'border border-border hover:bg-hover'
                                    }
                                `}
                            >
                                <i className={`fas ${m.icon}`}></i>
                                {m.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* opts */}
                <div className="p-4 bg-card border border-border rounded-lg">
                    <label className="font-medium text-primary mb-2 block">Options</label>
                    <div className="flex flex-wrap gap-4">
                        {mode === 'format' || mode === 'sort' && (
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-secondary">Indent:</label>
                                <select
                                    value={indentSize}
                                    onChange={(e) => setIndentSize(Number(e.target.value))}
                                    className="px-2 py-1 border border-border rounded bg-input text-primary text-sm"
                                >
                                    <option value={2}>2 spaces</option>
                                    <option value={4}>4 spaces</option>
                                    <option value={1}>1 space</option>
                                    <option value={0}>No indent</option>
                                </select>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-6 p-4 bg-card border border-border rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <i className="fas fa-lightbulb text-yellow-500"></i>
                    Quick Tips
                </h3>
                <ul className="text-sm text-secondary space-y-1">
                    <li>• Press <kbd className="px-2 py-0.5 bg-input border border-border rounded text-xs">Ctrl</kbd> + <kbd className="px-2 py-0.5 bg-input border border-border rounded text-xs">Enter</kbd> to process quickly</li>
                    <li>• All processing happens in your browser — no data is sent to any server</li>
                    <li>• <strong>Format</strong> - Pretty print JSON with indentation</li>
                    <li>• <strong>Minify</strong> - Compress JSON to single line</li>
                    <li>• <strong>Validate</strong> - Check if JSON is valid</li>
                    <li>• <strong>Sort Keys</strong> - Sort object keys alphabetically</li>
                    <li>• <strong>To CSV</strong> - Convert JSON array to CSV</li>
                    <li>• <strong>To YAML</strong> - Convert JSON to YAML format</li>
                    <li>• <strong>Escape/Unescape</strong> - Escape or unescape JSON strings</li>
                </ul>
            </div>

            {/* err */}
            {error && (
                <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <h4 className="font-semibold text-red-700 dark:text-red-400 flex items-center gap-2">
                        <i className="fas fa-exclamation-circle"></i>
                        Error
                    </h4>
                    <p className="text-sm text-red-600 dark:text-red-300 mt-1">{error}</p>
                </div>
            )}

            {/* sts */}
            {output && !error && mode !== 'validate' && (
                <div className="mt-6 p-4 bg-card border border-border rounded-lg">
                    <h4 className="font-semibold mb-2 text-primary">Processing Results</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <span className="text-secondary">Original Size</span>
                            <p className="font-semibold text-primary">{inputChars} chars</p>
                        </div>
                        <div>
                            <span className="text-secondary">Output Size</span>
                            <p className="font-semibold text-primary">{outputChars} chars</p>
                        </div>
                        <div>
                            <span className="text-secondary">Saved</span>
                            <p className="font-semibold text-green-500">
                                {Math.max(0, inputChars - outputChars)} chars
                            </p>
                        </div>
                        <div>
                            <span className="text-secondary">Compression</span>
                            <p className="font-semibold text-blue-500">
                                {inputChars > 0 ? Math.round((Math.max(0, inputChars - outputChars) / inputChars) * 100) : 0}%
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}