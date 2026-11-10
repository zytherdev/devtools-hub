'use client'

import { useMemo, useState } from 'react'
import { ToolPanel } from '@/app/components/ToolPanel'
import * as Gradient from '@/app/tools/gradient-generator/logic'

const focusClass = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus'
const buttonClass = `rounded-lg px-3 py-2 transition ${focusClass}`

export default function GradientGenerator() {
  const [gradient, setGradient] = useState<Gradient.Gradient>(Gradient.presetGradients[0].gradient)
  const [selectedPreset, setSelectedPreset] = useState<number | null>(0)
  const [colorInput, setColorInput] = useState('#ff6b6b')
  const [positionInput, setPositionInput] = useState(50)
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; message: string } | null>(null)

  const { cssCode, validationError } = useMemo(() => {
    try {
      return { cssCode: Gradient.generateGradientCSS(gradient), validationError: '' }
    } catch (error) {
      return {
        cssCode: '',
        validationError: error instanceof Error ? error.message : 'The gradient is invalid.'
      }
    }
  }, [gradient])
  const gradientValue = cssCode ? cssCode.slice('background: '.length, -1) : 'none'
  const fullCss = cssCode ? `.gradient {\n  ${cssCode}\n}` : ''

  const commitGradient = (nextGradient: Gradient.Gradient) => {
    setGradient(nextGradient)
    setSelectedPreset(null)
    setFeedback(null)
  }

  const handlePresetSelect = (index: number) => {
    const preset = Gradient.presetGradients[index]
    if (!preset) return
    setGradient(preset.gradient)
    setSelectedPreset(index)
    setFeedback({ kind: 'success', message: `${preset.name} preset selected.` })
  }

  const handleAddStop = () => {
    try {
      commitGradient(Gradient.addStop(gradient, colorInput, positionInput))
      setFeedback({ kind: 'success', message: 'Color stop added.' })
    } catch (error) {
      setFeedback({
        kind: 'error',
        message: error instanceof Error ? error.message : 'Could not add the color stop.'
      })
    }
  }

  const handleRemoveStop = (index: number) => {
    try {
      commitGradient(Gradient.removeStop(gradient, index))
      setFeedback({ kind: 'success', message: 'Color stop removed.' })
    } catch (error) {
      setFeedback({
        kind: 'error',
        message: error instanceof Error ? error.message : 'Could not remove the color stop.'
      })
    }
  }

  const handleStopChange = (index: number, color: string, position: number) => {
    try {
      commitGradient(Gradient.updateStop(gradient, index, color, position))
    } catch (error) {
      setFeedback({
        kind: 'error',
        message: error instanceof Error ? error.message : 'Could not update the color stop.'
      })
    }
  }

  const handleTypeChange = (type: Gradient.GradientType) => {
    const nextGradient: Gradient.Gradient = { ...gradient, type }
    if (type === 'radial') {
      nextGradient.shape = gradient.shape ?? 'circle'
      nextGradient.position = gradient.position ?? 'center'
    }
    commitGradient(nextGradient)
  }

  const handleCopy = async (value: string, label: string) => {
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      setFeedback({ kind: 'success', message: `${label} copied to clipboard.` })
    } catch {
      setFeedback({ kind: 'error', message: 'Clipboard access failed. Select and copy the CSS output instead.' })
    }
  }

  const handleDownload = () => {
    if (!cssCode) return
    const objectUrl = URL.createObjectURL(new Blob([fullCss], { type: 'text/css;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = objectUrl
    link.download = 'gradient.css'
    link.click()
    URL.revokeObjectURL(objectUrl)
    setFeedback({ kind: 'success', message: 'gradient.css downloaded.' })
  }

  const resetGradient = () => {
    setGradient(Gradient.presetGradients[0].gradient)
    setSelectedPreset(0)
    setFeedback({ kind: 'success', message: 'Reset to the Sunset preset.' })
  }

  return (
    <div className="min-w-0">
      <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-2">
        <ToolPanel>
          <section aria-labelledby="gradient-preview-heading" className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 id="gradient-preview-heading" className="flex items-center gap-2 font-medium text-primary">
                <i className="fas fa-eye text-secondary" aria-hidden="true" /> Preview
              </h2>
              <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-white">Live preview</span>
            </div>

            <div
              className="h-56 w-full rounded-lg border border-border sm:h-64"
              style={{ background: gradientValue }}
              role="img"
              aria-label={validationError ? 'Gradient preview unavailable while the gradient is invalid' : 'Live gradient preview'}
            />

            <div className="mt-4 min-w-0">
              <label htmlFor="gradient-css-output" className="mb-2 flex items-center gap-2 font-medium text-primary">
                <i className="fas fa-code text-secondary" aria-hidden="true" /> CSS output
              </label>
              <textarea
                id="gradient-css-output"
                aria-label="Generated CSS declaration"
                aria-invalid={Boolean(validationError)}
                aria-describedby="gradient-validation"
                className="min-h-24 w-full resize-y rounded-lg border border-border bg-input-readonly p-3 font-mono text-sm text-primary focus-visible:ring-2 focus-visible:ring-border-focus"
                value={cssCode}
                readOnly
                spellCheck={false}
                placeholder="Valid CSS appears here."
              />
              <p
                id="gradient-validation"
                role={validationError ? 'alert' : 'status'}
                aria-live={validationError ? 'polite' : 'off'}
                className={`mt-2 min-h-6 text-sm ${validationError ? 'text-red-600 dark:text-red-300' : 'text-secondary'}`}
              >
                {validationError}
              </p>
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" onClick={() => void handleCopy(cssCode, 'CSS')} disabled={!cssCode} className={`${buttonClass} bg-primary text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50`}>
                <i className="fas fa-copy mr-2" aria-hidden="true" />Copy declaration
              </button>
              <button type="button" onClick={() => void handleCopy(fullCss, 'Full CSS')} disabled={!fullCss} className={`${buttonClass} border border-border hover:bg-hover disabled:cursor-not-allowed disabled:opacity-50`}>
                <i className="fas fa-copy mr-2" aria-hidden="true" />Copy full rule
              </button>
              <button type="button" onClick={handleDownload} disabled={!cssCode} className={`${buttonClass} border border-border hover:bg-hover disabled:cursor-not-allowed disabled:opacity-50`}>
                <i className="fas fa-download mr-2" aria-hidden="true" />Download .css
              </button>
              <button type="button" onClick={resetGradient} className={`${buttonClass} border border-border hover:bg-hover`}>
                <i className="fas fa-undo mr-2" aria-hidden="true" />Reset
              </button>
            </div>
          </section>
        </ToolPanel>

        <ToolPanel>
          <div className="space-y-5">
            <section aria-labelledby="gradient-presets-heading">
              <h2 id="gradient-presets-heading" className="mb-2 flex items-center gap-2 font-medium text-primary">
                <i className="fas fa-swatchbook text-secondary" aria-hidden="true" />Presets
              </h2>
              <div className="grid grid-cols-4 gap-2">
                {Gradient.presetGradients.map((preset, index) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handlePresetSelect(index)}
                    aria-label={`Use ${preset.name} preset`}
                    aria-pressed={selectedPreset === index}
                    className={`h-12 rounded-lg border-2 transition ${focusClass} ${selectedPreset === index ? 'border-primary' : 'border-border hover:border-primary/50'}`}
                    style={{ background: Gradient.generateGradientCSS(preset.gradient).slice('background: '.length, -1) }}
                  />
                ))}
              </div>
            </section>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <fieldset>
                <legend className="mb-1 text-sm text-secondary">Gradient type</legend>
                <div className="flex flex-wrap gap-1" role="group" aria-label="Gradient type">
                  {(['linear', 'radial', 'conic'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleTypeChange(type)}
                      aria-pressed={gradient.type === type}
                      className={`${buttonClass} px-2 text-sm capitalize ${gradient.type === type ? 'bg-primary text-white' : 'border border-border bg-input hover:bg-hover'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </fieldset>

              {gradient.type !== 'radial' && (
                <div>
                  <label htmlFor="gradient-angle" className="mb-1 block text-sm text-secondary">
                    {gradient.type === 'linear' ? 'Angle' : 'Start angle'}: {gradient.angle ?? 90}°
                  </label>
                  <input
                    id="gradient-angle"
                    type="range"
                    min="0"
                    max="360"
                    step="1"
                    value={gradient.angle ?? 90}
                    onChange={event => commitGradient({ ...gradient, angle: Number(event.target.value) })}
                    className={`w-full accent-primary ${focusClass}`}
                    aria-label={`${gradient.type === 'linear' ? 'Linear' : 'Conic'} gradient angle`}
                  />
                </div>
              )}

              {gradient.type === 'radial' && (
                <>
                  <div>
                    <label htmlFor="radial-shape" className="mb-1 block text-sm text-secondary">Radial shape</label>
                    <select
                      id="radial-shape"
                      value={gradient.shape ?? 'circle'}
                      onChange={event => commitGradient({ ...gradient, shape: event.target.value as Gradient.RadialShape })}
                      className={`w-full rounded-lg border border-border bg-input px-3 py-2 text-primary ${focusClass}`}
                    >
                      <option value="circle">Circle</option>
                      <option value="ellipse">Ellipse</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="radial-position" className="mb-1 block text-sm text-secondary">Radial position</label>
                    <select
                      id="radial-position"
                      value={gradient.position ?? 'center'}
                      onChange={event => commitGradient({ ...gradient, position: event.target.value as Gradient.RadialPosition })}
                      className={`w-full rounded-lg border border-border bg-input px-3 py-2 text-primary ${focusClass}`}
                    >
                      {Gradient.radialPositions.map(position => <option key={position} value={position}>{position}</option>)}
                    </select>
                  </div>
                </>
              )}
            </div>

            <section aria-labelledby="gradient-stops-heading">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h2 id="gradient-stops-heading" className="flex items-center gap-2 font-medium text-primary">
                  <i className="fas fa-palette text-secondary" aria-hidden="true" />Color stops
                </h2>
                <span className="text-xs text-secondary">{gradient.stops.length} of 6</span>
              </div>
              <div className="space-y-2">
                {gradient.stops.map((stop, index) => (
                  <div key={index} className="grid min-w-0 grid-cols-[2.25rem_minmax(0,1fr)_minmax(4rem,6rem)_2rem] items-center gap-2 rounded-lg border border-border bg-input p-2">
                    <div className="h-8 w-8 rounded border border-border" style={{ backgroundColor: stop.color }} aria-hidden="true" />
                    <label className="sr-only" htmlFor={`stop-color-${index}`}>Color for stop {index + 1}</label>
                    <input
                      id={`stop-color-${index}`}
                      type="text"
                      value={stop.color}
                      onChange={event => handleStopChange(index, event.target.value, stop.position)}
                      aria-invalid={!Gradient.isValidColor(stop.color)}
                      aria-label={`Color for stop ${index + 1}`}
                      className={`min-w-0 rounded border border-transparent bg-transparent px-2 py-1 font-mono text-sm text-primary focus-visible:border-border focus-visible:outline-none ${focusClass}`}
                    />
                    <div className="min-w-0">
                      <label className="sr-only" htmlFor={`stop-position-${index}`}>Position for stop {index + 1}</label>
                      <input
                        id={`stop-position-${index}`}
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={stop.position}
                        onChange={event => handleStopChange(index, stop.color, Number(event.target.value))}
                        aria-label={`Position for stop ${index + 1}`}
                        aria-valuetext={`${stop.position}%`}
                        className={`w-full accent-primary ${focusClass}`}
                      />
                      <span className="block text-right text-xs text-secondary">{stop.position}%</span>
                    </div>
                    {gradient.stops.length > 2 ? (
                      <button
                        type="button"
                        onClick={() => handleRemoveStop(index)}
                        aria-label={`Remove color stop ${index + 1}`}
                        className={`${buttonClass} px-1 text-red-600 hover:text-red-700 dark:text-red-300`}
                      >
                        <i className="fas fa-times" aria-hidden="true" />
                      </button>
                    ) : <span aria-hidden="true" />}
                  </div>
                ))}
              </div>
            </section>

            <section aria-labelledby="add-stop-heading">
              <h2 id="add-stop-heading" className="mb-2 font-medium text-primary">Add a color stop</h2>
              <div className="grid grid-cols-[minmax(0,1fr)_minmax(7rem,1fr)] items-center gap-3">
                <label htmlFor="new-stop-color" className="sr-only">New stop color</label>
                <input
                  id="new-stop-color"
                  type="text"
                  value={colorInput}
                  onChange={event => setColorInput(event.target.value)}
                  aria-label="New stop color"
                  aria-invalid={colorInput.length > 0 && !Gradient.isValidColor(colorInput)}
                  className={`min-w-0 rounded-lg border border-border bg-input px-3 py-2 text-sm text-primary ${focusClass}`}
                  placeholder="#ff6b6b"
                />
                <div className="flex min-w-0 items-center gap-2">
                  <label htmlFor="new-stop-position" className="sr-only">New stop position</label>
                  <input
                    id="new-stop-position"
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={positionInput}
                    onChange={event => setPositionInput(Number(event.target.value))}
                    aria-label="New stop position"
                    aria-valuetext={`${positionInput}%`}
                    className={`min-w-0 flex-1 accent-primary ${focusClass}`}
                  />
                  <span className="w-10 text-right text-sm text-secondary">{positionInput}%</span>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleAddStop}
                  disabled={gradient.stops.length >= 6 || Boolean(validationError)}
                  className={`${buttonClass} bg-primary text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <i className="fas fa-plus mr-2" aria-hidden="true" />Add stop
                </button>
                <button type="button" onClick={() => commitGradient(Gradient.generateRandomGradient())} className={`${buttonClass} border border-border hover:bg-hover`}>
                  <i className="fas fa-dice mr-2" aria-hidden="true" />Random gradient
                </button>
              </div>
            </section>
          </div>
        </ToolPanel>
      </div>

      <p
        role={feedback?.kind === 'error' ? 'alert' : 'status'}
        aria-live={feedback?.kind === 'error' ? 'assertive' : 'polite'}
        className={`mt-4 min-h-6 text-sm ${feedback?.kind === 'error' ? 'text-red-600 dark:text-red-300' : 'text-secondary'}`}
      >
        {feedback?.message ?? ''}
      </p>
    </div>
  )
}
