/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prefer-const */
'use client'

import { useState, useEffect, useMemo } from 'react'
import { ToolPanel } from '@/app/components/ToolPanel'
import * as Regex from '@/app/lib/tools/text/testRegex'

export default function RegexTester() {
    const [pattern, setPattern] = useState('')
    const [flags, setFlags] = useState<string[]>(['g', 'i'])
    const [testText, setTestText] = useState('')
    const [replacement, setReplacement] = useState('')
    const [result, setResult] = useState<Regex.RegexResult | null>(null)
    const [mode, setMode] = useState<'test' | 'replace' | 'split'>('test')
    const [highlightedText, setHighlightedText] = useState('')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isValid, setIsValid] = useState(true)

    const sampleTexts = [
        'Hello world! This is a test string with email@example.com and https://example.com',
        'The quick brown fox jumps over the lazy dog. 123-456-7890',
        'Contact us: support@company.com or sales@company.com',
        'https://example.com/path?query=value#hash',
        'The price is $19.99. Another price: $29.99'
    ]

    const samplePatterns = [
        { name: 'Email', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}' },
        { name: 'URL', pattern: 'https?://[\\w\\-]+(\\.[\\w\\-]+)+[/#?]?.*' },
        { name: 'Phone', pattern: '\\d{3}[-.]?\\d{3}[-.]?\\d{4}' },
        { name: 'Word', pattern: '\\b\\w+\\b' },
        { name: 'Number', pattern: '\\d+' },
    ]

    const currentFlags = useMemo(() => Regex.getFlagString(flags), [flags])

    const handleTest = () => {
        if (!pattern.trim()) {
            alert('Please enter a regex pattern')
            return
        }

        if (!testText.trim()) {
            alert('Please enter some text to test')
            return
        }

        try {
            setIsValid(true)

            if (mode === 'replace') {
                try {
                    const replaced = Regex.replaceRegex(pattern, currentFlags, testText, replacement)
                    setHighlightedText(replaced)
                    setResult({
                        matches: [],
                        count: 0,
                        flags: currentFlags,
                        pattern,
                    })
                    alert('Replacement complete!')
                } catch (error) {
                    console.log(error)
                    alert('Error in replacement')
                }
                return
            }

            if (mode === 'split') {
                try {
                    const split = Regex.splitRegex(pattern, currentFlags, testText)
                    setHighlightedText(split.join(' | '))
                    setResult({
                        matches: [],
                        count: split.length,
                        flags: currentFlags,
                        pattern,
                    })
                    alert(`Split into ${split.length} parts!`)
                } catch (error) {
                    console.log(error)
                    alert('Error in split')
                }
                return
            }

            // tst mode
            const result = Regex.testRegex(pattern, currentFlags, testText)
            setResult(result)

            if (result.error) {
                setIsValid(false)
                alert(`Regex error: ${result.error}`)
                return
            }

            // destacar matches
            if (result.matches.length > 0) {
                const matches = result.matches
                
                // bld destacado txt frm end to start to prsrv indices
                let parts: { text: string; isMatch: boolean }[] = []
                let lastIndex = 0
                
                for (const match of matches) {
                    if (match.index > lastIndex) {
                        parts.push({
                            text: testText.substring(lastIndex, match.index),
                            isMatch: false
                        })
                    }
                    parts.push({
                        text: match.match,
                        isMatch: true
                    })
                    lastIndex = match.index + match.match.length
                }
                
                if (lastIndex < testText.length) {
                    parts.push({
                        text: testText.substring(lastIndex),
                        isMatch: false
                    })
                }
                
                const html = parts.map(part => 
                    part.isMatch 
                        ? `<span class="bg-yellow-600 text-primary px-0.5 rounded">${part.text}</span>`
                        : part.text
                ).join('')
                
                setHighlightedText(html)
            } else {
                setHighlightedText(testText)
            }

            alert(`Found ${result.count} matches!`)
        } catch (error) {
            setIsValid(false)
            alert(`Invalid regex: ${(error as Error).message}`)
        }
    }

    const handleClear = () => {
        setPattern('')
        setTestText('')
        setReplacement('')
        setResult(null)
        setHighlightedText('')
        setIsValid(true)
        alert('Cleared!')
    }

    const handleCopy = async () => {
        if (!result) {
            alert('No results to copy')
            return
        }

        const text = result.matches.map(m => m.match).join('\n')
        try {
            await navigator.clipboard.writeText(text)
            alert('Copied to clipboard!')
        } catch (error) {
            console.log(error)
            alert('Failed to copy')
        }
    }

    const loadSample = () => {
        const randomPattern = samplePatterns[Math.floor(Math.random() * samplePatterns.length)]
        const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)]
        setPattern(randomPattern.pattern)
        setTestText(randomText)
        setReplacement('')
        setTimeout(handleTest, 100)
        alert('Sample loaded!')
    }

    const loadPattern = (p: string) => {
        setPattern(p)
        setTimeout(handleTest, 100)
    }

    const toggleFlag = (flag: string) => {
        setFlags(prev => 
            prev.includes(flag) 
                ? prev.filter(f => f !== flag)
                : [...prev, flag]
        )
    }

    // auto-test on changes
    useEffect(() => {
        if (pattern && testText) {
            const timer = setTimeout(handleTest, 300)
            return () => clearTimeout(timer)
        }
    }, [pattern, testText, flags, mode, replacement])

    // Ctrl+Enter
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault()
                handleTest()
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [pattern, testText, flags, mode, replacement])

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                    <i className="fas fa-code text-cyan-500"></i>
                    Regex Tester
                </h1>
                <p className="text-secondary mt-2 max-w-2xl">
                    Test, debug, and visualize regular expressions with real-time matching and replacement.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ToolPanel>
                    <div className="space-y-4">
                        <div>
                            <label className="font-medium text-primary mb-2 flex items-center gap-2">
                                <i className="fas fa-sliders-h text-secondary"></i>
                                Mode
                            </label>
                            <div className="flex gap-2">
                                {(['test', 'replace', 'split'] as const).map((m) => (
                                    <button
                                        key={m}
                                        onClick={() => setMode(m)}
                                        className={`
                                            px-3 py-1.5 rounded-lg text-sm transition capitalize
                                            ${mode === m 
                                                ? 'bg-primary text-white' 
                                                : 'border border-border hover:bg-hover'
                                            }
                                        `}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="font-medium text-primary mb-2 flex items-center gap-2">
                                <i className="fas fa-code text-secondary"></i>
                                Pattern
                                <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">regex</span>
                            </label>
                            <input
                                type="text"
                                className="w-full bg-input border border-border rounded-lg p-3 text-primary font-mono text-sm focus:outline-none focus:ring-2 focus:ring-border-focus"
                                value={pattern}
                                onChange={(e) => setPattern(e.target.value)}
                                placeholder="[a-zA-Z]+"
                            />
                            <div className="flex flex-wrap gap-1 mt-2">
                                {samplePatterns.map((p) => (
                                    <button
                                        key={p.name}
                                        onClick={() => loadPattern(p.pattern)}
                                        className="px-2 py-1 text-xs border border-border rounded hover:bg-hover transition"
                                    >
                                        {p.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="font-medium text-primary mb-2 flex items-center gap-2">
                                <i className="fas fa-flag text-secondary"></i>
                                Flags
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {Regex.flagOptions.map((flag) => (
                                    <button
                                        key={flag.value}
                                        onClick={() => toggleFlag(flag.value)}
                                        className={`
                                            px-3 py-1.5 rounded-lg text-sm transition border
                                            ${flags.includes(flag.value)
                                                ? 'bg-primary text-white border-primary'
                                                : 'border-border hover:bg-hover'
                                            }
                                        `}
                                        title={flag.description}
                                    >
                                        {flag.label}
                                    </button>
                                ))}
                            </div>
                            <div className="text-xs text-secondary mt-1">
                                Current: /{pattern || 'pattern'}/{currentFlags || 'flags'}
                            </div>
                        </div>

                        <div>
                            <label className="font-medium text-primary mb-2 flex items-center gap-2">
                                <i className="fas fa-font text-secondary"></i>
                                Test Text
                            </label>
                            <textarea
                                className="w-full bg-input border border-border rounded-lg p-3 text-primary font-mono text-sm resize-y min-h-30 focus:outline-none focus:ring-2 focus:ring-border-focus"
                                value={testText}
                                onChange={(e) => setTestText(e.target.value)}
                                placeholder="Enter text to test against..."
                            />
                            <div className="flex flex-wrap gap-1 mt-2">
                                {sampleTexts.slice(0, 3).map((text, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setTestText(text)}
                                        className="px-2 py-1 text-xs border border-border rounded hover:bg-hover transition truncate max-w-37.5"
                                    >
                                        {text.substring(0, 20)}…
                                    </button>
                                ))}
                            </div>
                        </div>

                        {mode === 'replace' && (
                            <div>
                                <label className="font-medium text-primary mb-2 flex items-center gap-2">
                                    <i className="fas fa-exchange-alt text-secondary"></i>
                                    Replacement
                                </label>
                                <input
                                    type="text"
                                    className="w-full bg-input border border-border rounded-lg p-3 text-primary font-mono text-sm focus:outline-none focus:ring-2 focus:ring-border-focus"
                                    value={replacement}
                                    onChange={(e) => setReplacement(e.target.value)}
                                    placeholder="$1 - replaced"
                                />
                            </div>
                        )}

                        <div className="flex flex-wrap gap-2 mt-2">
                            <button
                                onClick={handleTest}
                                className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition flex items-center gap-2"
                            >
                                <i className="fas fa-play"></i> Test
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
                            Results
                            <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                                {mode}
                            </span>
                        </label>
                        {result && (
                            <div className="text-sm text-secondary bg-input px-3 py-1 rounded-full border border-border">
                                <i className="fas fa-hashtag"></i> {result.count} matches
                            </div>
                        )}
                    </div>

                    {/* txt destacado */}
                    <div 
                        className="bg-input border border-border rounded-lg p-4 text-primary font-mono text-sm min-h-50 max-h-75 overflow-y-auto whitespace-pre-wrap wrap-break-word"
                        dangerouslySetInnerHTML={{ __html: highlightedText || 'No results yet…' }}
                    />

                    {/* achados */}
                    {result && result.matches.length > 0 && (
                        <div className="mt-3">
                            <label className="font-medium text-primary mb-2 flex items-center gap-2">
                                <i className="fas fa-list text-secondary"></i>
                                Matches
                            </label>
                            <div className="bg-input border border-border rounded-lg p-3 max-h-50 overflow-y-auto">
                                {result.matches.map((match, i) => (
                                    <div key={i} className="text-sm py-1 border-b border-border last:border-0">
                                        <span className="text-secondary">#{i + 1}</span>
                                        <span className="text-primary font-mono ml-2">&quot;{match.match}&quot;</span>
                                        <span className="text-secondary text-xs ml-2">at index {match.index}</span>
                                        {match.groups && Object.keys(match.groups).length > 0 && (
                                            <div className="ml-6 mt-1">
                                                {Object.entries(match.groups).map(([key, value]) => (
                                                    <span key={key} className="text-xs text-secondary block">
                                                        <span className="text-muted">${key}:</span> &quot;{value}&quot;
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-wrap gap-2 mt-4">
                        <button
                            onClick={handleCopy}
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition flex items-center gap-2"
                            disabled={!result || result.matches.length === 0}
                        >
                            <i className="fas fa-copy"></i> Copy Matches
                        </button>
                    </div>
                </ToolPanel>
            </div>

            <div className="mt-6 p-4 bg-card border border-border rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <i className="fas fa-lightbulb text-yellow-500"></i>
                    Quick Tips
                </h3>
                <ul className="text-sm text-secondary space-y-1">
                    <li>• Press <kbd className="px-2 py-0.5 bg-input border border-border rounded text-xs">Ctrl</kbd> + <kbd className="px-2 py-0.5 bg-input border border-border rounded text-xs">Enter</kbd> to test quickly</li>
                    <li>• All processing happens in your browser — no data is sent to any server</li>
                    <li>• <strong>Test</strong> - Find all matches with groups</li>
                    <li>• <strong>Replace</strong> - Replace matches with custom text</li>
                    <li>• <strong>Split</strong> - Split text using regex</li>
                    <li>• Use <code className="px-1 py-0.5 bg-input border border-border rounded text-xs">$1, $2</code> for capture groups in replacement</li>
                    <li>• Matches are highlighted in yellow</li>
                </ul>
            </div>

            <div className="mt-6 p-4 bg-card border border-border rounded-lg">
                <h4 className="font-semibold mb-2 text-primary">Common Patterns</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                    {Regex.commonPatterns.slice(0, 9).map((p) => (
                        <button
                            key={p.name}
                            onClick={() => {
                                setPattern(p.pattern)
                                const flagArray = p.flags.split('')
                                setFlags(flagArray)
                                setTimeout(handleTest, 100)
                            }}
                            className="text-left px-3 py-2 border border-border rounded hover:bg-hover transition"
                        >
                            <div className="font-medium text-primary">{p.name}</div>
                            <div className="text-xs text-muted truncate">{p.pattern}</div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}