/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect } from 'react'
import { ToolPanel } from '@/app/components/ToolPanel'
import { minifyHTML, minifyHTML2 } from '@/app/lib/tools/minifyHtml'

export default function HTMLMinifier() {
    const [input, setInput] = useState('')
    const [output, setOutput] = useState('')
    const [inputChars, setInputChars] = useState(0)
    const [outputChars, setOutputChars] = useState(0)
    const [stats, setStats] = useState('⚡ ready')
    const [advancedMode, setAdvancedMode] = useState(false)

    const sampleCode = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>My Awesome Page</title>
        <style>
            /* Main styles */
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                background: #f5f5f5;
            }
            
            .container {
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            h1 {
                color: #333;
                margin-bottom: 20px;
            }
            
            .btn {
                display: inline-block;
                padding: 10px 20px;
                background: #007bff;
                color: white;
                text-decoration: none;
                border-radius: 4px;
                transition: background 0.3s;
            }
            
            .btn:hover {
                background: #0056b3;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <!-- Main header -->
            <h1>Welcome to My Page</h1>
            
            <!-- Content section -->
            <p>This is a sample page with some content.</p>
            <p>It includes various HTML elements and styles.</p>
            
            <!-- Button -->
            <a href="#" class="btn">Click Me</a>
            
            <!-- List -->
            <ul>
                <li>Item 1</li>
                <li>Item 2</li>
                <li>Item 3</li>
            </ul>
            
            <!-- Script -->
            <script>
                // Console log example
                console.log('Hello, World!');
                
                // Function example
                function greet(name) {
                    alert('Hello, ' + name + '!');
                }
                
                // Call the function
                greet('User');
            </script>
        </div>
    </body>
    </html>`

    const handleMinify = () => {
        if (!input.trim()) {
            alert('Please paste some HTML code to minify')
            return
        }

        try {
            const result = advancedMode ? minifyHTML2(input) : minifyHTML(input)
            setOutput(result)

            const saved = input.length - result.length
            const percent = input.length > 0 ? Math.round((saved / input.length) * 100) : 0
            setStats(`⬇ saved ${saved} chars · ${percent}% smaller`)

            if (result.length === 0) {
                alert('Minification produced empty output')
            } else {
                alert('HTML minified successfully!')
            }
        } catch (error) {
            console.error('Minification error:', error)
            alert('Error minifying HTML. Please check your code.')
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
                    <i className="fa-brands fa-html5 text-orange-500"></i>
                    HTML Minifier
                </h1>
                <p className="text-secondary mt-2 max-w-2xl">
                    Clean and compress your HTML markup. Remove comments, whitespace, and unnecessary characters
                    to reduce file size and improve loading performance.
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
                        placeholder="Minified HTML will appear here…"
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
                    <li>• <strong>Advanced mode</strong> removes more attributes and optimizes scripts/styles</li>
                    <li>• Preserves conditional comments for IE compatibility</li>
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