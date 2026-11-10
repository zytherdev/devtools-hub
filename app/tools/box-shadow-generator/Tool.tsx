'use client'

import { useMemo, useState } from 'react'
import { ToolPanel } from '@/app/components/ToolPanel'
import * as BoxShadow from '@/app/tools/box-shadow-generator/logic'

const focusClass = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus'
const buttonClass = `rounded-lg px-3 py-2 transition ${focusClass}`

type Feedback = { kind: 'success' | 'error'; message: string }

function copyErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Could not copy CSS to the clipboard.'
}

export default function BoxShadowGenerator() {
  const [shadows, setShadows] = useState<BoxShadow.BoxShadow[]>(() =>
    BoxShadow.presetShadows[0].shadows.map(shadow => ({ ...shadow }))
  )
  const [selectedPreset, setSelectedPreset] = useState<number | null>(0)
  const [selectedShadowIndex, setSelectedShadowIndex] = useState(0)
  const [colorDraft, setColorDraft] = useState<{ shadowIndex: number; value: string } | null>(null)
  const [feedback, setFeedback] = useState<Feedback | null>(null)

  const { cssCode, validationError } = useMemo(() => {
    try {
      return { cssCode: BoxShadow.generateBoxShadowCSS(shadows), validationError: '' }
    } catch (error) {
      return {
        cssCode: '',
        validationError: error instanceof Error ? error.message : 'The shadow configuration is invalid.'
      }
    }
  }, [shadows])

  const currentShadow = shadows[selectedShadowIndex] ?? null
  const displayedColor = currentShadow
    ? colorDraft?.shadowIndex === selectedShadowIndex ? colorDraft.value : currentShadow.color
    : ''
  const colorError = currentShadow && colorDraft?.shadowIndex === selectedShadowIndex &&
    !BoxShadow.isValidColor(colorDraft.value)
    ? 'Enter a supported CSS color. The last valid color remains applied until this value is corrected.'
    : ''

  const handlePresetSelect = (index: number) => {
    const preset = BoxShadow.presetShadows[index]
    if (!preset) return
    setShadows(preset.shadows.map(shadow => ({ ...shadow })))
    setSelectedPreset(index)
    setSelectedShadowIndex(0)
    setColorDraft(null)
    setFeedback({ kind: 'success', message: `${preset.name} preset selected.` })
  }

  const handleShadowChange = (field: keyof BoxShadow.BoxShadow, value: unknown) => {
    try {
      setShadows(BoxShadow.updateShadow(shadows, selectedShadowIndex, field, value))
      setSelectedPreset(null)
      setColorDraft(null)
      setFeedback(null)
    } catch (error) {
      setFeedback({ kind: 'error', message: copyErrorMessage(error) })
    }
  }

  const handleColorTextChange = (value: string) => {
    if (!currentShadow) return
    if (!BoxShadow.isValidColor(value)) {
      setColorDraft({ shadowIndex: selectedShadowIndex, value })
      setFeedback(null)
      return
    }

    try {
      setShadows(BoxShadow.updateShadow(shadows, selectedShadowIndex, 'color', value))
      setSelectedPreset(null)
      setColorDraft(null)
      setFeedback(null)
    } catch (error) {
      setColorDraft({ shadowIndex: selectedShadowIndex, value })
      setFeedback({ kind: 'error', message: copyErrorMessage(error) })
    }
  }

  const handleAddShadow = () => {
    try {
      const nextShadows = BoxShadow.addShadow(shadows)
      setShadows(nextShadows)
      setSelectedShadowIndex(nextShadows.length - 1)
      setSelectedPreset(null)
      setColorDraft(null)
      setFeedback({ kind: 'success', message: 'Shadow added.' })
    } catch (error) {
      setFeedback({ kind: 'error', message: copyErrorMessage(error) })
    }
  }

  const handleRemoveShadow = () => {
    if (!currentShadow) return
    try {
      const nextShadows = BoxShadow.removeShadow(shadows, selectedShadowIndex)
      setShadows(nextShadows)
      setSelectedShadowIndex(Math.min(selectedShadowIndex, Math.max(0, nextShadows.length - 1)))
      setSelectedPreset(null)
      setColorDraft(null)
      setFeedback({ kind: 'success', message: nextShadows.length ? 'Shadow removed.' : 'All shadows removed. CSS is now none.' })
    } catch (error) {
      setFeedback({ kind: 'error', message: copyErrorMessage(error) })
    }
  }

  const handleClear = () => {
    setShadows([])
    setSelectedShadowIndex(0)
    setSelectedPreset(null)
    setColorDraft(null)
    setFeedback({ kind: 'success', message: 'Shadows cleared. CSS is now none.' })
  }

  const resetShadows = () => {
    setShadows(BoxShadow.presetShadows[0].shadows.map(shadow => ({ ...shadow })))
    setSelectedPreset(0)
    setSelectedShadowIndex(0)
    setColorDraft(null)
    setFeedback({ kind: 'success', message: 'Reset to the Subtle preset.' })
  }

  const handleCopy = async (full = false) => {
    const css = full ? `.element {\n  box-shadow: ${cssCode};\n}` : `box-shadow: ${cssCode};`
    try {
      await navigator.clipboard.writeText(css)
      setFeedback({ kind: 'success', message: full ? 'Full CSS copied.' : 'CSS declaration copied.' })
    } catch (error) {
      setFeedback({ kind: 'error', message: `Could not copy CSS: ${copyErrorMessage(error)}` })
    }
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ToolPanel>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 font-medium text-primary">
              <i className="fas fa-eye text-secondary" aria-hidden="true" />
              Preview
            </h2>
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-white">live</span>
          </div>

          <div
            role="img"
            aria-label={shadows.length ? `Live box shadow preview: ${cssCode}` : 'Box shadow preview with no shadow'}
            className="flex h-64 w-full items-center justify-center rounded-lg border border-border transition-all duration-300"
            style={{ boxShadow: cssCode === 'none' ? 'none' : cssCode, background: 'var(--bg-card)' }}
          >
            <div className="flex items-center gap-2 text-center text-secondary" aria-hidden="true">
              <i className="fas fa-cube mb-2 block text-4xl" />
              <span className="text-sm">{shadows.length ? 'Box Shadow Preview' : 'No shadow (none)'}</span>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="mb-2 flex items-center gap-2 font-medium text-primary">
              <i className="fas fa-code text-secondary" aria-hidden="true" />
              CSS Code
            </h3>
            <div className="overflow-x-auto rounded-lg border border-border bg-input p-4 font-mono text-sm text-primary">
              <code>
                <span className="text-secondary">box-shadow: </span>
                <span className="text-green-700 dark:text-green-400">{validationError ? 'Invalid shadow' : cssCode}</span>
                <span className="text-secondary">;</span>
              </code>
            </div>
            {validationError && <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-300">{validationError}</p>}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => void handleCopy()} className={`${buttonClass} flex items-center gap-2 bg-primary text-white hover:opacity-90`}>
              <i className="fas fa-copy" aria-hidden="true" /> Copy CSS
            </button>
            <button type="button" onClick={() => void handleCopy(true)} className={`${buttonClass} flex items-center gap-2 border border-border hover:bg-hover`}>
              <i className="fas fa-copy" aria-hidden="true" /> Copy Full
            </button>
            <button type="button" onClick={resetShadows} className={`${buttonClass} flex items-center gap-2 border border-border hover:bg-hover`}>
              <i className="fas fa-undo" aria-hidden="true" /> Reset
            </button>
            <button type="button" onClick={handleClear} className={`${buttonClass} flex items-center gap-2 border border-border hover:bg-hover`}>
              <i className="fas fa-eraser" aria-hidden="true" /> Clear (none)
            </button>
          </div>
        </ToolPanel>

        <ToolPanel>
          <div className="space-y-4">
            <section aria-labelledby="shadow-presets-heading">
              <h2 id="shadow-presets-heading" className="mb-2 flex items-center gap-2 font-medium text-primary">
                <i className="fas fa-sliders-h text-secondary" aria-hidden="true" /> Presets
              </h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {BoxShadow.presetShadows.map((preset, index) => (
                  <button
                    type="button"
                    key={preset.name}
                    onClick={() => handlePresetSelect(index)}
                    aria-pressed={selectedPreset === index}
                    className={`${buttonClass} text-xs ${selectedPreset === index ? 'bg-primary text-white' : 'border border-border bg-input hover:bg-hover'}`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </section>

            {shadows.length > 1 && (
              <section aria-labelledby="shadow-layer-heading">
                <h3 id="shadow-layer-heading" className="mb-1 block text-sm text-secondary">Select shadow layer</h3>
                <div className="flex flex-wrap gap-2">
                  {shadows.map((_, index) => (
                    <button
                      type="button"
                      key={index}
                      onClick={() => { setSelectedShadowIndex(index); setColorDraft(null); setFeedback(null) }}
                      aria-pressed={selectedShadowIndex === index}
                      className={`${buttonClass} text-xs ${selectedShadowIndex === index ? 'bg-primary text-white' : 'border border-border bg-input hover:bg-hover'}`}
                    >
                      Shadow {index + 1}
                    </button>
                  ))}
                </div>
              </section>
            )}

            <fieldset disabled={!currentShadow} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <legend className="sr-only">Shadow properties</legend>
              <div>
                <label htmlFor="shadow-offset-x" className="mb-1 block text-sm text-secondary">Offset X: {currentShadow?.offsetX ?? 0}px</label>
                <input id="shadow-offset-x" type="range" min="-50" max="50" value={currentShadow?.offsetX ?? 0} onChange={event => handleShadowChange('offsetX', Number(event.target.value))} className="w-full accent-primary" />
              </div>
              <div>
                <label htmlFor="shadow-offset-y" className="mb-1 block text-sm text-secondary">Offset Y: {currentShadow?.offsetY ?? 0}px</label>
                <input id="shadow-offset-y" type="range" min="-50" max="50" value={currentShadow?.offsetY ?? 0} onChange={event => handleShadowChange('offsetY', Number(event.target.value))} className="w-full accent-primary" />
              </div>
              <div>
                <label htmlFor="shadow-blur" className="mb-1 block text-sm text-secondary">Blur: {currentShadow?.blur ?? 0}px</label>
                <input id="shadow-blur" type="range" min="0" max="100" value={currentShadow?.blur ?? 0} onChange={event => handleShadowChange('blur', Number(event.target.value))} className="w-full accent-primary" />
              </div>
              <div>
                <label htmlFor="shadow-spread" className="mb-1 block text-sm text-secondary">Spread: {currentShadow?.spread ?? 0}px</label>
                <input id="shadow-spread" type="range" min="-50" max="50" value={currentShadow?.spread ?? 0} onChange={event => handleShadowChange('spread', Number(event.target.value))} className="w-full accent-primary" />
              </div>
            </fieldset>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <span className="mb-1 block text-sm text-secondary">Color</span>
                <div className="flex gap-2">
                  <label className="sr-only" htmlFor="shadow-color-picker">Choose shadow RGB color</label>
                  <input
                    id="shadow-color-picker"
                    type="color"
                    value={currentShadow ? BoxShadow.colorToPickerHex(currentShadow.color) : '#000000'}
                    onChange={event => handleShadowChange('color', event.target.value)}
                    disabled={!currentShadow}
                    className="h-12 w-12 cursor-pointer rounded-lg border border-border bg-input p-1 disabled:cursor-not-allowed"
                  />
                  <label className="sr-only" htmlFor="shadow-color-text">CSS color value</label>
                  <input
                    id="shadow-color-text"
                    type="text"
                    value={displayedColor}
                    onChange={event => handleColorTextChange(event.target.value)}
                    disabled={!currentShadow}
                    aria-invalid={Boolean(colorError)}
                    aria-describedby={colorError ? 'shadow-color-error' : 'shadow-color-help'}
                    className="min-w-0 flex-1 rounded-lg border border-border bg-input px-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-border-focus disabled:cursor-not-allowed"
                    placeholder="#000000 or rgba(0,0,0,.5)"
                  />
                </div>
                {colorError
                  ? <p id="shadow-color-error" role="alert" className="mt-2 text-sm text-red-600 dark:text-red-300">{colorError}</p>
                  : <p id="shadow-color-help" className="mt-2 text-xs text-secondary">The picker shows RGB only; use the text field for alpha transparency.</p>}
              </div>
              <div>
                <span className="mb-1 block text-sm text-secondary">Inset</span>
                <div className="flex h-12 items-center gap-2">
                  <input id="shadow-inset" type="checkbox" checked={currentShadow?.inset ?? false} onChange={event => handleShadowChange('inset', event.target.checked)} disabled={!currentShadow} className="h-5 w-5 accent-primary" />
                  <label htmlFor="shadow-inset" className="text-sm text-secondary">Inside shadow</label>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button type="button" onClick={handleAddShadow} disabled={shadows.length >= BoxShadow.MAX_SHADOWS} className="flex-1 rounded-lg bg-primary px-4 py-2 text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
                <i className="fas fa-plus mr-2" aria-hidden="true" /> Add Shadow
              </button>
              <button type="button" onClick={handleRemoveShadow} disabled={!currentShadow} className="flex-1 rounded-lg border border-red-500 px-4 py-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-300 dark:hover:bg-red-950/30">
                <i className="fas fa-trash mr-2" aria-hidden="true" /> Remove selected
              </button>
            </div>

            <div className="rounded-lg border border-border bg-input p-3 text-sm" aria-live="polite">
              <span className="text-secondary">Current: </span>
              <span className="font-mono text-primary">
                {currentShadow ? `inset: ${currentShadow.inset}, offset: ${currentShadow.offsetX}px ${currentShadow.offsetY}px, blur: ${currentShadow.blur}px, spread: ${currentShadow.spread}px, color: ${currentShadow.color}` : 'No shadow selected'}
              </span>
            </div>
          </div>
        </ToolPanel>
      </div>

      <p
        role={feedback?.kind === 'error' ? 'alert' : 'status'}
        aria-live={feedback?.kind === 'error' ? 'assertive' : 'polite'}
        aria-atomic="true"
        className={`mt-4 min-h-6 text-sm ${feedback?.kind === 'error' ? 'text-red-600 dark:text-red-300' : 'text-secondary'}`}
      >
        {feedback?.message ?? ''}
      </p>

      <aside className="mt-2 rounded-lg border border-border bg-card p-4">
        <h2 className="mb-2 flex items-center gap-2 font-semibold text-primary">
          <i className="fas fa-lightbulb text-yellow-500" aria-hidden="true" /> Quick Tips
        </h2>
        <ul className="space-y-1 text-sm text-secondary">
          <li>Use <strong>X</strong> and <strong>Y</strong> to position the shadow.</li>
          <li><strong>Blur</strong> controls softness; <strong>Spread</strong> expands or contracts the shadow.</li>
          <li>Toggle <strong>Inset</strong> for an inner shadow; add up to {BoxShadow.MAX_SHADOWS} layers.</li>
          <li>Clear the layers to generate <code>box-shadow: none;</code>.</li>
          <li>All processing happens in your browser.</li>
        </ul>
      </aside>
    </div>
  )
}
