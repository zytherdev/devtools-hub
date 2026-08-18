/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect } from 'react'
import { ToolPanel } from '@/app/components/ToolPanel'
import * as BoxShadow from '@/app/lib/tools/css/box-shadow-gen'

export default function BoxShadowGenerator() {
  const [shadows, setShadows] = useState<BoxShadow.BoxShadow[]>(
    BoxShadow.presetShadows[0].shadows
  )
  const [cssCode, setCssCode] = useState('')
  const [selectedPreset, setSelectedPreset] = useState(0)
  const [selectedShadowIndex, setSelectedShadowIndex] = useState(0)

  useEffect(() => {
    setCssCode(BoxShadow.generateBoxShadowCSS(shadows))
  }, [shadows])

  const handlePresetSelect = (index: number) => {
    setSelectedPreset(index)
    setShadows(BoxShadow.presetShadows[index].shadows)
    setSelectedShadowIndex(0)
  }

  const handleShadowChange = (field: keyof BoxShadow.BoxShadow, value: unknown) => {
    const newShadows = BoxShadow.updateShadow(shadows, selectedShadowIndex, field, value)
    setShadows(newShadows)
  }

  const handleAddShadow = () => {
    if (shadows.length >= 5) {
      alert('Maximum 5 shadows allowed')
      return
    }
    const newShadows = BoxShadow.addShadow(shadows)
    setShadows(newShadows)
    setSelectedShadowIndex(newShadows.length - 1)
    alert('Shadow added!')
  }

  const handleRemoveShadow = () => {
    if (shadows.length <= 1) {
      alert('Minimum 1 shadow required')
      return
    }
    const newShadows = BoxShadow.removeShadow(shadows, selectedShadowIndex)
    setShadows(newShadows)
    if (selectedShadowIndex >= newShadows.length) {
      setSelectedShadowIndex(newShadows.length - 1)
    }
    alert('Shadow removed')
  }

  const handleCopy = async () => {
    if (!cssCode) {
      alert('Nothing to copy')
      return
    }
    try {
      await navigator.clipboard.writeText(cssCode)
      alert('CSS copied!')
    } catch (error) {
      alert('Failed to copy: ' + error)
      alert('Failed to copy')
    }
  }

  const handleCopyFull = async () => {
    const fullCss = `.element {\n  box-shadow: ${cssCode};\n}`
    try {
      await navigator.clipboard.writeText(fullCss)
      alert('Full CSS copied!')
    } catch (error) {
      alert('Failed to copy: ' + error)
      alert('Failed to copy')
    }
  }

  const resetShadows = () => {
    setShadows(BoxShadow.presetShadows[0].shadows)
    setSelectedPreset(0)
    setSelectedShadowIndex(0)
    alert('Reset to default')
  }

  const currentShadow = shadows[selectedShadowIndex] || shadows[0]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
          <i className="fa-solid fa-cube text-yellow-500"></i>
          Box Shadow Generator
        </h1>
        <p className="text-secondary mt-2 max-w-2xl">
          Design and preview CSS box shadows with real-time controls for offset, blur, and color.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ToolPanel>
          <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
            <label className="font-medium flex items-center gap-2">
              <i className="fas fa-eye text-secondary"></i>
              Preview
            </label>
            <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">live</span>
          </div>
          
          {/* box prvw */}
          <div 
            className="w-full h-64 rounded-lg border border-border flex items-center justify-center transition-all duration-300"
            style={{ 
              boxShadow: cssCode,
              background: 'var(--bg-card)'
            }}
          >
            <div className="text-center flex items-center gap-2 text-secondary">
              <i className="fas fa-cube text-4xl mb-2 block"></i>
              <span className="text-sm">Box Shadow Preview</span>
            </div>
          </div>
          
          {/* CSS output */}
          <div className="mt-4">
            <label className="font-medium text-primary mb-2 flex items-center gap-2">
              <i className="fas fa-code text-secondary"></i>
              CSS Code
            </label>
            <div className="bg-input border border-border rounded-lg p-4 font-mono text-sm text-primary overflow-x-auto">
              <code>
                <span className="text-secondary">box-shadow: </span>
                <span className="text-green-500">{cssCode}</span>
              </code>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition flex items-center gap-2"
            >
              <i className="fas fa-copy"></i> Copy CSS
            </button>
            <button
              onClick={handleCopyFull}
              className="px-4 py-2 border border-border rounded-lg hover:bg-hover transition flex items-center gap-2"
            >
              <i className="fas fa-copy"></i> Copy Full
            </button>
            <button
              onClick={resetShadows}
              className="px-4 py-2 border border-border rounded-lg hover:bg-hover transition flex items-center gap-2"
            >
              <i className="fas fa-undo"></i> Reset
            </button>
          </div>
        </ToolPanel>

        {/* ctrls */}
        <ToolPanel>
          <div className="space-y-4">
            <div>
              <label className="font-medium text-primary mb-2 flex items-center gap-2">
                <i className="fas fa-preset text-secondary"></i>
                Presets
              </label>
              <div className="grid grid-cols-4 gap-2">
                {BoxShadow.presetShadows.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => handlePresetSelect(index)}
                    className={`
                      px-3 py-2 rounded-lg text-xs transition
                      ${selectedPreset === index 
                        ? 'bg-primary text-white' 
                        : 'bg-input border border-border hover:bg-hover'
                      }
                    `}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* shdw slt */}
            {shadows.length > 1 && (
              <div>
                <label className="text-sm text-secondary block mb-1">Select Shadow</label>
                <div className="flex gap-2">
                  {shadows.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedShadowIndex(index)}
                      className={`
                        px-3 py-1 rounded-lg text-xs transition
                        ${selectedShadowIndex === index
                          ? 'bg-primary text-white'
                          : 'bg-input border border-border hover:bg-hover'
                        }
                      `}
                    >
                      Shadow {index + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ctrls */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-secondary block mb-1">Offset X: {currentShadow?.offsetX || 0}px</label>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={currentShadow?.offsetX || 0}
                  onChange={(e) => handleShadowChange('offsetX', Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
              <div>
                <label className="text-sm text-secondary block mb-1">Offset Y: {currentShadow?.offsetY || 0}px</label>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={currentShadow?.offsetY || 0}
                  onChange={(e) => handleShadowChange('offsetY', Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
              <div>
                <label className="text-sm text-secondary block mb-1">Blur: {currentShadow?.blur || 0}px</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={currentShadow?.blur || 0}
                  onChange={(e) => handleShadowChange('blur', Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
              <div>
                <label className="text-sm text-secondary block mb-1">Spread: {currentShadow?.spread || 0}px</label>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={currentShadow?.spread || 0}
                  onChange={(e) => handleShadowChange('spread', Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            </div>

            {/* color & inset */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-secondary block mb-1">Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={currentShadow?.color || '#000000'}
                    onChange={(e) => handleShadowChange('color', e.target.value)}
                    className="w-12 h-12 rounded-lg border border-border cursor-pointer p-1 bg-input"
                  />
                  <input
                    type="text"
                    value={currentShadow?.color || '#000000'}
                    onChange={(e) => handleShadowChange('color', e.target.value)}
                    className="flex-1 bg-input border border-border rounded-lg px-3 py-2 text-primary text-sm focus:outline-none focus:ring-2 focus:ring-border-focus"
                    placeholder="#000000"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-secondary block mb-1">Inset</label>
                <div className="flex items-center gap-2 h-12">
                  <input
                    type="checkbox"
                    checked={currentShadow?.inset || false}
                    onChange={(e) => handleShadowChange('inset', e.target.checked)}
                    className="w-5 h-5 accent-primary"
                  />
                  <span className="text-sm text-secondary">Inside shadow</span>
                </div>
              </div>
            </div>

            {/* +/- */}
            <div className="flex gap-2">
              <button
                onClick={handleAddShadow}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2"
              >
                <i className="fas fa-plus"></i> Add Shadow
              </button>
              <button
                onClick={handleRemoveShadow}
                className="flex-1 px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition flex items-center justify-center gap-2"
              >
                <i className="fas fa-trash"></i> Remove
              </button>
            </div>

            {/* shdw info */}
            <div className="p-3 bg-input rounded-lg border border-border text-sm">
              <span className="text-secondary">Current: </span>
              <span className="font-mono text-primary">
                {currentShadow ? `inset: ${currentShadow.inset}, offset: ${currentShadow.offsetX}px ${currentShadow.offsetY}px, blur: ${currentShadow.blur}px, spread: ${currentShadow.spread}px` : 'No shadow selected'}
              </span>
            </div>
          </div>
        </ToolPanel>
      </div>

      <div className="mt-6 p-4 bg-card border border-border rounded-lg">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <i className="fas fa-lightbulb text-yellow-500"></i>
          Quick Tips
        </h3>
        <ul className="text-sm text-secondary space-y-1">
          <li>• Use <strong>X</strong> and <strong>Y</strong> to position the shadow</li>
          <li>• <strong>Blur</strong> controls the softness of the shadow</li>
          <li>• <strong>Spread</strong> expands or contracts the shadow size</li>
          <li>• Toggle <strong>Inset</strong> for inner shadows</li>
          <li>• Add multiple shadows for complex effects</li>
          <li>• All processing happens in your browser</li>
        </ul>
      </div>
    </div>
  )
}