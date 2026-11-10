'use client'

import { useState } from 'react'
import { ToolPanel } from '@/app/components/ToolPanel'
import * as Color from '@/app/tools/color-converter/logic'

type Feedback = { kind: 'status' | 'error'; message: string }

const initialRgb: Color.RGBColor = { r: 59, g: 130, b: 246 }
const formats: { value: Color.ColorFormat; label: string }[] = [
    { value: 'hex', label: 'HEX' },
    { value: 'rgb', label: 'RGB' },
    { value: 'hsl', label: 'HSL' },
    { value: 'hsv', label: 'HSV' },
    { value: 'cmyk', label: 'CMYK' },
    { value: 'name', label: 'Color name' },
]

export default function ColorConverter() {
    const [input, setInput] = useState(Color.rgbToHex(initialRgb))
    const [output, setOutput] = useState(Color.formatColor(initialRgb, 'hex'))
    const [format, setFormat] = useState<Color.ColorFormat>('hex')
    const [rgb, setRgb] = useState<Color.RGBColor | null>(initialRgb)
    const [feedback, setFeedback] = useState<Feedback | null>(null)

    const commitColor = (nextRgb: Color.RGBColor, nextFormat = format) => {
        setRgb(nextRgb)
        setOutput(Color.formatColor(nextRgb, nextFormat))
        setFeedback({ kind: 'status', message: `Converted: ${Color.getColorName(nextRgb)}.` })
    }

    const handleProcess = () => {
        const parsed = Color.parseColorString(input)
        if (!parsed) {
            setRgb(null)
            setOutput('')
            setFeedback({ kind: 'error', message: 'Invalid color. Use one of the supported formats shown below.' })
            return
        }
        commitColor(parsed)
    }

    const handleInputChange = (value: string) => {
        setInput(value)
        setRgb(null)
        setOutput('')
        setFeedback(null)
    }

    const handleFormatChange = (nextFormat: Color.ColorFormat) => {
        setFormat(nextFormat)
        // Reformat only a color that is still committed; never parse the editable input here.
        if (rgb) {
            setOutput(Color.formatColor(rgb, nextFormat))
            setFeedback({ kind: 'status', message: `Output format: ${formats.find(({ value }) => value === nextFormat)?.label}.` })
        } else {
            setOutput('')
        }
    }

    const handleClear = () => {
        setInput('')
        setOutput('')
        setRgb(null)
        setFeedback({ kind: 'status', message: 'Color and results cleared.' })
    }

    const handleCopy = async () => {
        if (!output) {
            setFeedback({ kind: 'error', message: 'There is no converted color to copy.' })
            return
        }
        try {
            if (!navigator.clipboard?.writeText) throw new Error('Clipboard access is unavailable.')
            await navigator.clipboard.writeText(output)
            setFeedback({ kind: 'status', message: 'Converted color copied to clipboard.' })
        } catch {
            setFeedback({ kind: 'error', message: 'Could not access the clipboard. Copy the result from the text field.' })
        }
    }

    const loadSample = () => {
        const samples = ['#3b82f6', '#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff']
        const sample = samples[Math.floor(Math.random() * samples.length)]
        const parsed = Color.parseColorString(sample)
        setInput(sample)
        if (parsed) commitColor(parsed)
    }

    const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            event.preventDefault()
            handleProcess()
        }
    }

    const complementary = rgb ? Color.getHueComplementaryColor(rgb) : null
    const analogous = rgb ? Color.getAnalogousColors(rgb) : []
    const triadic = rgb ? Color.getTriadicColors(rgb) : []
    const recommendedText = rgb ? Color.getContrastColor(rgb) : null
    const contrastRatio = rgb && recommendedText ? Color.getContrastRatio(rgb, recommendedText) : null
    const hsl = rgb ? Color.rgbToHSL(rgb) : null
    const hsv = rgb ? Color.rgbToHSV(rgb) : null
    const cmyk = rgb ? Color.rgbToCMYK(rgb) : null

    return (
        <div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <ToolPanel>
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <label htmlFor="color-converter-input" className="flex items-center gap-2 font-medium">
                            <i className="fas fa-pen text-secondary" aria-hidden="true" />
                            Input color
                        </label>
                        <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-white">Color</span>
                    </div>
                    <div className="space-y-3">
                        <input
                            id="color-converter-input"
                            type="text"
                            className="w-full rounded-lg border border-border bg-input p-3 font-mono text-sm text-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
                            value={input}
                            onChange={(event) => handleInputChange(event.target.value)}
                            onKeyDown={handleInputKeyDown}
                            placeholder="#3b82f6, rgb(59, 130, 246), blue"
                            aria-invalid={feedback?.kind === 'error' || undefined}
                            aria-describedby="color-converter-hint color-converter-feedback"
                            autoComplete="off"
                            spellCheck={false}
                        />
                        <p id="color-converter-hint" className="text-xs text-secondary">
                            Enter HEX, RGB, HSL, HSV, CMYK, or one of the listed color names.
                        </p>
                        <div className="flex items-center gap-3">
                            <label className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border bg-input p-1">
                                <span className="sr-only">Choose a color visually</span>
                                <input
                                    type="color"
                                    value={rgb ? Color.rgbToHex(rgb) : '#000000'}
                                    aria-label="Choose a color visually"
                                    onChange={(event) => {
                                        const hex = event.target.value
                                        const parsed = Color.parseColorString(hex)
                                        setInput(hex)
                                        if (parsed) commitColor(parsed)
                                    }}
                                    className="h-full w-full cursor-pointer border-0 bg-transparent"
                                />
                            </label>
                            <div
                                className="min-h-12 flex-1 rounded-lg border border-border"
                                style={{ backgroundColor: rgb ? Color.rgbToHex(rgb) : 'transparent' }}
                                role="img"
                                aria-label={rgb ? `Color preview ${Color.rgbToHex(rgb)}` : 'No color preview'}
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={handleProcess}
                                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white transition hover:opacity-90"
                            >
                                <i className="fas fa-play" aria-hidden="true" /> Convert
                            </button>
                            <button
                                type="button"
                                onClick={handleClear}
                                className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 transition hover:bg-hover"
                            >
                                <i className="fas fa-eraser" aria-hidden="true" /> Clear
                            </button>
                        </div>
                        <span className="rounded-full border border-border bg-input px-3 py-1 text-sm text-secondary" aria-live="polite">
                            {rgb ? Color.getColorName(rgb) : 'No valid color'}
                        </span>
                    </div>
                    <p
                        id="color-converter-feedback"
                        role={feedback?.kind === 'error' ? 'alert' : 'status'}
                        aria-live={feedback?.kind === 'error' ? 'assertive' : 'polite'}
                        className={`mt-3 min-h-6 text-sm ${feedback?.kind === 'error' ? 'text-red-600 dark:text-red-300' : 'text-secondary'}`}
                    >
                        {feedback?.message ?? ''}
                    </p>
                </ToolPanel>

                <ToolPanel>
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                        <h2 className="flex items-center gap-2 font-medium text-primary">
                            <i className="fas fa-file-code text-green-500" aria-hidden="true" /> Converted color
                        </h2>
                        <label className="flex items-center gap-2 text-sm text-secondary" htmlFor="color-converter-format">
                            Output format
                            <select
                                id="color-converter-format"
                                value={format}
                                onChange={(event) => handleFormatChange(event.target.value as Color.ColorFormat)}
                                className="rounded border border-border bg-input px-2 py-1 text-sm text-primary"
                            >
                                {formats.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                            </select>
                        </label>
                    </div>
                    <textarea
                        aria-label="Converted color result"
                        aria-live="polite"
                        className="min-h-35 w-full resize-y rounded-lg border border-border bg-input-readonly p-4 font-mono text-sm text-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
                        value={output}
                        readOnly
                        spellCheck={false}
                        placeholder="Converted color appears here after a valid input."
                    />
                    <div className="mt-4 flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={handleCopy}
                            disabled={!output}
                            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <i className="fas fa-copy" aria-hidden="true" /> Copy
                        </button>
                        <button
                            type="button"
                            onClick={loadSample}
                            className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 transition hover:bg-hover"
                        >
                            <i className="fas fa-rotate-right" aria-hidden="true" /> Random color
                        </button>
                    </div>
                </ToolPanel>
            </div>

            {rgb && (
                <>
                    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <section className="rounded-lg border border-border bg-card p-4" aria-labelledby="color-preview-title">
                            <h2 id="color-preview-title" className="mb-3 font-semibold text-primary">Color preview</h2>
                            <div
                                className="h-20 w-full rounded-lg border border-border"
                                style={{ backgroundColor: Color.rgbToHex(rgb) }}
                                role="img"
                                aria-label={`Current color ${Color.rgbToHex(rgb)}`}
                            />
                            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <dt className="text-secondary">Relative luminance</dt>
                                    <dd className="font-semibold text-primary">{(Color.getRelativeLuminance(rgb) * 100).toFixed(1)}%</dd>
                                </div>
                                <div>
                                    <dt className="text-secondary">Best black/white text contrast</dt>
                                    <dd className="font-semibold text-primary">
                                        {recommendedText && contrastRatio !== null && `${Color.rgbToHex(recommendedText)} · ${contrastRatio.toFixed(2)}:1`}
                                    </dd>
                                </div>
                            </dl>
                        </section>

                        <section className="rounded-lg border border-border bg-card p-4" aria-labelledby="color-harmonies-title">
                            <h2 id="color-harmonies-title" className="mb-3 font-semibold text-primary">Color harmonies</h2>
                            <div className="space-y-3">
                                <div>
                                    <h3 className="text-sm text-secondary">Hue complementary</h3>
                                    <div className="mt-1 flex gap-2" aria-label="Hue-complementary color pair">
                                        {[rgb, complementary].map((color, index) => color && (
                                            <span
                                                key={index}
                                                className="h-12 w-12 rounded border border-border"
                                                style={{ backgroundColor: Color.rgbToHex(color) }}
                                                role="img"
                                                aria-label={Color.rgbToHex(color)}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-sm text-secondary">Analogous</h3>
                                    <div className="mt-1 flex gap-2" aria-label="Analogous colors">
                                        {analogous.map((color) => <span key={Color.rgbToHex(color)} className="h-12 w-12 rounded border border-border" style={{ backgroundColor: Color.rgbToHex(color) }} role="img" aria-label={Color.rgbToHex(color)} />)}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-sm text-secondary">Triadic</h3>
                                    <div className="mt-1 flex gap-2" aria-label="Triadic colors">
                                        {triadic.map((color) => <span key={Color.rgbToHex(color)} className="h-12 w-12 rounded border border-border" style={{ backgroundColor: Color.rgbToHex(color) }} role="img" aria-label={Color.rgbToHex(color)} />)}
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    <section className="mt-6 rounded-lg border border-border bg-card p-4" aria-labelledby="all-color-formats-title">
                        <h2 id="all-color-formats-title" className="mb-3 font-semibold text-primary">All color formats</h2>
                        <dl className="grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
                            <div><dt className="text-secondary">HEX</dt><dd className="font-mono text-primary">{Color.rgbToHex(rgb)}</dd></div>
                            <div><dt className="text-secondary">RGB</dt><dd className="font-mono text-primary">rgb({rgb.r}, {rgb.g}, {rgb.b})</dd></div>
                            <div><dt className="text-secondary">HSL</dt><dd className="font-mono text-primary">hsl({hsl?.h}, {hsl?.s}%, {hsl?.l}%)</dd></div>
                            <div><dt className="text-secondary">HSV</dt><dd className="font-mono text-primary">hsv({hsv?.h}, {hsv?.s}%, {hsv?.v}%)</dd></div>
                            <div><dt className="text-secondary">CMYK</dt><dd className="font-mono text-primary">cmyk({cmyk?.c}%, {cmyk?.m}%, {cmyk?.y}%, {cmyk?.k}%)</dd></div>
                            <div><dt className="text-secondary">Name</dt><dd className="font-mono text-primary">{Color.getColorName(rgb)}</dd></div>
                        </dl>
                    </section>
                </>
            )}

            <section className="mt-6 rounded-lg border border-border bg-card p-4" aria-labelledby="color-converter-tips-title">
                <h2 id="color-converter-tips-title" className="mb-2 flex items-center gap-2 font-semibold text-primary">
                    <i className="fas fa-lightbulb text-yellow-500" aria-hidden="true" /> Quick tips
                </h2>
                <ul className="space-y-1 text-sm text-secondary">
                    <li>Press <kbd className="rounded border border-border bg-input px-2 py-0.5 text-xs">Ctrl</kbd> or <kbd className="rounded border border-border bg-input px-2 py-0.5 text-xs">⌘</kbd> + <kbd className="rounded border border-border bg-input px-2 py-0.5 text-xs">Enter</kbd> while focused in the color input to convert.</li>
                    <li>Accepts 3- or 6-digit HEX, integer RGB/HSL/HSV, integer-percentage CMYK, and 23 supported names.</li>
                    <li>Conversion runs in your browser; no color input is sent to a server.</li>
                    <li>Complementary colors rotate HSL hue by 180°. Contrast uses WCAG relative luminance and the better of black or white.</li>
                </ul>
            </section>
        </div>
    )
}
