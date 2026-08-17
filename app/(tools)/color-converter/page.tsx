/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useState, useEffect } from 'react'
import { ToolPanel } from '@/app/components/ToolPanel'
import * as Color from '@/app/lib/tools/converter/convertColor'

type ColorFormat = 'hex' | 'rgb' | 'hsl' | 'hsv' | 'cmyk' | 'name'

export default function ColorConverter() {
    const [input, setInput] = useState('#3b82f6')
    const [output, setOutput] = useState('')
    const [format, setFormat] = useState<ColorFormat>('hex')
    const [rgb, setRgb] = useState<Color.RGBColor>({ r: 59, g: 130, b: 246 })
    const [colorName, setColorName] = useState('')
    const [isValid, setIsValid] = useState(true)

    const updateColor = (newRgb: Color.RGBColor) => {
        setRgb(newRgb)
        setColorName(Color.getColorName(newRgb))
        
        let result = ''
        switch (format) {
            case 'hex':
                result = Color.rgbToHex(newRgb)
                break
            case 'rgb':
                result = `rgb(${newRgb.r}, ${newRgb.g}, ${newRgb.b})`
                break
            case 'hsl': {
                const hsl = Color.rgbToHSL(newRgb)
                result = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
                break
            }
            case 'hsv': {
                const hsv = Color.rgbToHSV(newRgb)
                result = `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`
                break
            }
            case 'cmyk': {
                const cmyk = Color.rgbToCMYK(newRgb)
                result = `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`
                break
            }
            case 'name':
                result = Color.getColorName(newRgb)
                break
        }
        setOutput(result)
        setIsValid(true)
    }

    const handleProcess = () => {
        if (!input.trim()) {
            alert('Please enter a color')
            return
        }

        try {
            const parsed = Color.parseColorString(input.trim())
            if (parsed) {
                updateColor(parsed)
                alert('Color converted successfully!')
            } else {
                setIsValid(false)
                alert('Invalid color format')
            }
        } catch (error) {
            console.log(error)
            setIsValid(false)
            alert('Error processing color')
        }
    }

    const handleClear = () => {
        setInput('')
        setOutput('')
        setRgb({ r: 0, g: 0, b: 0 })
        setColorName('')
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
            console.log(error)
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
        const samples = ['#3b82f6', '#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff']
        const random = samples[Math.floor(Math.random() * samples.length)]
        setInput(random)
        setTimeout(handleProcess, 100)
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
    }, [input])

    // pcess fmt change
    useEffect(() => {
        if (rgb.r !== 0 || rgb.g !== 0 || rgb.b !== 0) {
            updateColor(rgb)
        }
    }, [format])

    const formats: { value: ColorFormat; label: string }[] = [
        { value: 'hex', label: 'HEX' },
        { value: 'rgb', label: 'RGB' },
        { value: 'hsl', label: 'HSL' },
        { value: 'hsv', label: 'HSV' },
        { value: 'cmyk', label: 'CMYK' },
        { value: 'name', label: 'Color Name' },
    ]

    const complementary = Color.getComplementaryColor(rgb)
    const analogous = Color.getAnalogousColors(rgb)
    const triadic = Color.getTriadicColors(rgb)
    const isLight = Color.isLightColor(rgb)

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                    <i className="fas fa-palette text-pink-500"></i>
                    Color Converter
                </h1>
                <p className="text-secondary mt-2 max-w-2xl">
                    Convert between color formats, preview colors, and explore color harmonies.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ToolPanel>
                    <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
                        <label className="font-medium flex items-center gap-2">
                            <i className="fas fa-pen text-secondary"></i>
                            Input Color
                            <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">Color</span>
                        </label>
                        {!isValid && (
                            <span className="text-xs text-red-500">
                                <i className="fas fa-exclamation-circle"></i> Invalid color
                            </span>
                        )}
                    </div>
                    <div className="space-y-3">
                        <input
                            type="text"
                            className="w-full bg-input border border-border rounded-lg p-3 text-primary font-mono text-sm focus:outline-none focus:ring-2 focus:ring-border-focus"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="#3b82f6, rgb(59, 130, 246), blue"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleProcess()
                            }}
                        />
                        <div className="flex gap-2">
                            <input
                                type="color"
                                value={Color.rgbToHex(rgb)}
                                onChange={(e) => {
                                    const hex = e.target.value
                                    setInput(hex)
                                    try {
                                        const parsed = Color.parseColorString(hex)
                                        if (parsed) updateColor(parsed)
                                    } catch (error) {
                                        console.log(error)
                                    }
                                }}
                                className="w-12 h-12 rounded-lg border border-border cursor-pointer p-1 bg-input"
                            />
                            <div 
                                className="flex-1 rounded-lg border border-border"
                                style={{ 
                                    backgroundColor: Color.rgbToHex(rgb),
                                    minHeight: '3rem'
                                }}
                            />
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={handleProcess}
                                className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition flex items-center gap-2"
                            >
                                <i className="fas fa-play"></i> Convert
                            </button>
                            <button
                                onClick={handleClear}
                                className="px-4 py-2 border border-border rounded-lg hover:bg-hover transition flex items-center gap-2"
                            >
                                <i className="fas fa-eraser"></i> Clear
                            </button>
                        </div>
                        <div className="text-sm text-secondary bg-input px-3 py-1 rounded-full border border-border">
                            <i className="fas fa-info-circle"></i> {colorName || 'Unknown'}
                        </div>
                    </div>
                </ToolPanel>

                <ToolPanel>
                    <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
                        <label className="font-medium flex items-center gap-2">
                            <i className="fas fa-file-code text-green-500"></i>
                            Converted Color
                            <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">result</span>
                        </label>
                        <div className="flex gap-2">
                            <select
                                value={format}
                                onChange={(e) => setFormat(e.target.value as ColorFormat)}
                                className="px-2 py-1 border border-border rounded bg-input text-primary text-sm"
                            >
                                {formats.map((f) => (
                                    <option key={f.value} value={f.value}>{f.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <textarea
                        className="w-full bg-input-readonly border border-border rounded-lg p-4 text-primary min-h-35 font-mono text-sm resize-y focus:outline-none"
                        value={output}
                        readOnly
                        spellCheck={false}
                        placeholder="Converted color will appear here…"
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
                                <i className="fas fa-rotate-right"></i> Random
                            </button>
                        </div>
                    </div>
                </ToolPanel>
            </div>

            {/* prev && hmnies */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* current */}
                <div className="p-4 bg-card border border-border rounded-lg">
                    <h3 className="font-semibold text-primary mb-3">Color Preview</h3>
                    <div 
                        className="w-full h-20 rounded-lg border border-border"
                        style={{ backgroundColor: Color.rgbToHex(rgb) }}
                    />
                    <div className="grid grid-cols-3 gap-2 mt-3 text-sm">
                        <div>
                            <span className="text-secondary">Light</span>
                            <p className="font-semibold text-primary">{isLight ? '✅ Yes' : '❌ No'}</p>
                        </div>
                        <div>
                            <span className="text-secondary">Brightness</span>
                            <p className="font-semibold text-primary">
                                {Math.round(Color.getColorBrightness(rgb) * 100)}%
                            </p>
                        </div>
                        <div>
                            <span className="text-secondary">Contrast</span>
                            <p className="font-semibold text-primary">
                                {Color.isLightColor(rgb) ? 'Black' : 'White'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* hmnies */}
                <div className="p-4 bg-card border border-border rounded-lg">
                    <h3 className="font-semibold text-primary mb-3">Color Harmonies</h3>
                    <div className="space-y-3">
                        <div>
                            <span className="text-sm text-secondary">Complementary</span>
                            <div className="flex gap-2 mt-1">
                                <div 
                                    className="w-12 h-12 rounded border border-border"
                                    style={{ backgroundColor: Color.rgbToHex(rgb) }}
                                />
                                <div 
                                    className="w-12 h-12 rounded border border-border"
                                    style={{ backgroundColor: Color.rgbToHex(complementary) }}
                                />
                            </div>
                        </div>
                        <div>
                            <span className="text-sm text-secondary">Analogous</span>
                            <div className="flex gap-2 mt-1">
                                {analogous.map((c, i) => (
                                    <div 
                                        key={i}
                                        className="w-12 h-12 rounded border border-border"
                                        style={{ backgroundColor: Color.rgbToHex(c) }}
                                    />
                                ))}
                            </div>
                        </div>
                        <div>
                            <span className="text-sm text-secondary">Triadic</span>
                            <div className="flex gap-2 mt-1">
                                {triadic.map((c, i) => (
                                    <div 
                                        key={i}
                                        className="w-12 h-12 rounded border border-border"
                                        style={{ backgroundColor: Color.rgbToHex(c) }}
                                    />
                                ))}
                            </div>
                        </div>
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
                    <li>• Supports HEX, RGB, HSL, HSV, CMYK, and named colors</li>
                    <li>• All processing happens in your browser — no data is sent to any server</li>
                    <li>• Color harmonies automatically generated from your input</li>
                    <li>• Use the color picker to select colors visually</li>
                </ul>
            </div>

            {/* all fmts */}
            {rgb.r !== 0 && (
                <div className="mt-6 p-4 bg-card border border-border rounded-lg">
                    <h4 className="font-semibold mb-3 text-primary">All Color Formats</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        <div>
                            <span className="text-secondary">HEX</span>
                            <p className="font-mono text-primary">{Color.rgbToHex(rgb)}</p>
                        </div>
                        <div>
                            <span className="text-secondary">RGB</span>
                            <p className="font-mono text-primary">rgb({rgb.r}, {rgb.g}, {rgb.b})</p>
                        </div>
                        <div>
                            <span className="text-secondary">HSL</span>
                            <p className="font-mono text-primary">
                                hsl({Color.rgbToHSL(rgb).h}, {Color.rgbToHSL(rgb).s}%, {Color.rgbToHSL(rgb).l}%)
                            </p>
                        </div>
                        <div>
                            <span className="text-secondary">HSV</span>
                            <p className="font-mono text-primary">
                                hsv({Color.rgbToHSV(rgb).h}, {Color.rgbToHSV(rgb).s}%, {Color.rgbToHSV(rgb).v}%)
                            </p>
                        </div>
                        <div>
                            <span className="text-secondary">CMYK</span>
                            <p className="font-mono text-primary">
                                cmyk({Color.rgbToCMYK(rgb).c}%, {Color.rgbToCMYK(rgb).m}%, {Color.rgbToCMYK(rgb).y}%, {Color.rgbToCMYK(rgb).k}%)
                            </p>
                        </div>
                        <div>
                            <span className="text-secondary">Name</span>
                            <p className="font-mono text-primary">{Color.getColorName(rgb)}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}