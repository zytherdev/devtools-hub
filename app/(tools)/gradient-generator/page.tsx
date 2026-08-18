/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect } from 'react'
import { ToolPanel } from '@/app/components/ToolPanel'
import * as Gradient from '@/app/lib/tools/css/gradient-gen'

export default function GradientGenerator() {
  const [gradient, setGradient] = useState<Gradient.Gradient>(Gradient.presetGradients[0].gradient)
  const [cssCode, setCssCode] = useState('')
  const [selectedPreset, setSelectedPreset] = useState(0)
  const [colorInput, setColorInput] = useState('#ff6b6b')
  const [positionInput, setPositionInput] = useState(50)

  useEffect(() => {
    setCssCode(Gradient.generateGradientCSS(gradient))
  }, [gradient])

  const handlePresetSelect = (index: number) => {
    setSelectedPreset(index)
    setGradient(Gradient.presetGradients[index].gradient)
  }

  const handleAddStop = () => {
    if (gradient.stops.length >= 6) {
      alert('Maximum 6 stops allowed')
      return
    }
    if (!Gradient.isValidColor(colorInput)) {
      alert('Invalid color format')
      return
    }
    const newGradient = Gradient.addStop(gradient, colorInput, positionInput)
    setGradient(newGradient)
    alert('Stop added!')
  }

  const handleRemoveStop = (index: number) => {
    if (gradient.stops.length <= 2) {
      alert('Minimum 2 stops required')
      return
    }
    const newGradient = Gradient.removeStop(gradient, index)
    setGradient(newGradient)
    alert('Stop removed')
  }

  const handleStopChange = (index: number, field: 'color' | 'position', value: string | number) => {
    const newStops = gradient.stops.map((stop, i) => {
      if (i === index) {
        return { ...stop, [field]: value }
      }
      return stop
    })
    setGradient({ ...gradient, stops: newStops })
  }

  const handleTypeChange = (type: 'linear' | 'radial' | 'conic') => {
    setGradient({ ...gradient, type })
  }

  const handleAngleChange = (angle: number) => {
    setGradient({ ...gradient, angle })
  }

  const handleRandom = () => {
    const random = Gradient.generateRandomGradient()
    setGradient(random)
    alert('Random gradient generated!')
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
      console.error(error)
      alert('Failed to copy')
    }
  }

  const handleCopyAll = async () => {
    const fullCss = `.gradient {\n  ${cssCode}\n}`
    try {
      await navigator.clipboard.writeText(fullCss)
      alert('Full CSS copied!')
    } catch (error) {
      console.log(error)
      alert('Failed to copy')
    }
  }

  const resetGradient = () => {
    setGradient(Gradient.presetGradients[0].gradient)
    setSelectedPreset(0)
    alert('Reset to default')
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
          <i className="fa-solid fa-fill-drip text-purple-500"></i>
          Gradient Generator
        </h1>
        <p className="text-secondary mt-2 max-w-2xl">
          Create beautiful CSS gradients with multiple stops. Preview and copy the code instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* preview */}
        <ToolPanel>
          <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
            <label className="font-medium flex items-center gap-2">
              <i className="fas fa-eye text-secondary"></i>
              Preview
            </label>
            <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">live</span>
          </div>
          
          {/* grdt vw */}
          <div 
            className="w-full h-64 rounded-lg border border-border"
            style={{ background: cssCode.replace('background: ', '') }}
          />
          
          {/* CSS output */}
          <div className="mt-4">
            <label className="font-medium text-primary mb-2 flex items-center gap-2">
              <i className="fas fa-code text-secondary"></i>
              CSS Code
            </label>
            <div className="bg-input border border-border rounded-lg p-4 font-mono text-sm text-primary overflow-x-auto">
              <code>
                <span className="text-secondary">background: </span>
                <span className="text-green-500">{cssCode.replace('background: ', '')}</span>
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
              onClick={handleCopyAll}
              className="px-4 py-2 border border-border rounded-lg hover:bg-hover transition flex items-center gap-2"
            >
              <i className="fas fa-copy"></i> Copy Full
            </button>
            <button
              onClick={resetGradient}
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
                {Gradient.presetGradients.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => handlePresetSelect(index)}
                    className={`
                      h-12 rounded-lg border-2 transition
                      ${selectedPreset === index 
                        ? 'border-primary' 
                        : 'border-border hover:border-primary/50'
                      }
                    `}
                    style={{ 
                      background: Gradient.generateGradientCSS(preset.gradient).replace('background: ', '')
                    }}
                    title={preset.name}
                  />
                ))}
              </div>
            </div>

            {/* tipo & angle */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-secondary block mb-1">Type</label>
                <div className="flex gap-1">
                  {(['linear', 'radial', 'conic'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => handleTypeChange(type)}
                      className={`
                        px-3 py-1.5 rounded-lg text-sm transition capitalize
                        ${gradient.type === type
                          ? 'bg-primary text-white'
                          : 'bg-input border border-border hover:bg-hover'
                        }
                      `}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm text-secondary block mb-1">Angle {gradient.angle}°</label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={gradient.angle || 90}
                  onChange={(e) => handleAngleChange(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            </div>

            <div>
              <label className="font-medium text-primary mb-2 flex items-center gap-2">
                <i className="fas fa-palette text-secondary"></i>
                Color Stops
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {gradient.stops.map((stop, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-input rounded-lg border border-border">
                    <div 
                      className="w-8 h-8 rounded border border-border shrink-0"
                      style={{ backgroundColor: stop.color }}
                    />
                    <input
                      type="text"
                      value={stop.color}
                      onChange={(e) => handleStopChange(index, 'color', e.target.value)}
                      className="flex-1 bg-transparent text-primary font-mono text-sm border border-transparent focus:border-border rounded px-2 py-1"
                    />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={stop.position}
                      onChange={(e) => handleStopChange(index, 'position', Number(e.target.value))}
                      className="w-24 accent-primary"
                    />
                    <span className="text-sm text-secondary w-10">{stop.position}%</span>
                    {gradient.stops.length > 2 && (
                      <button
                        onClick={() => handleRemoveStop(index)}
                        className="text-red-500 hover:text-red-700 transition"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* + stop */}
            <div className="flex gap-2">
              <input
                type="text"
                value={colorInput}
                onChange={(e) => setColorInput(e.target.value)}
                className="flex-1 bg-input border border-border rounded-lg px-3 py-2 text-primary text-sm focus:outline-none focus:ring-2 focus:ring-border-focus"
                placeholder="#ff6b6b"
              />
              <input
                type="number"
                value={positionInput}
                onChange={(e) => setPositionInput(Number(e.target.value))}
                min="0"
                max="100"
                className="w-20 bg-input border border-border rounded-lg px-2 py-2 text-primary text-sm focus:outline-none focus:ring-2 focus:ring-border-focus"
              />
              <button
                onClick={handleAddStop}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition"
              >
                <i className="fas fa-plus"></i>
              </button>
              <button
                onClick={handleRandom}
                className="px-4 py-2 border border-border rounded-lg hover:bg-hover transition"
                title="Random gradient"
              >
                <i className="fas fa-dice"></i>
              </button>
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
          <li>• Click on color swatches to change colors</li>
          <li>• Drag the position slider to adjust stop placement</li>
          <li>• Use the Random button for inspiration</li>
          <li>• Supports HEX, RGB, HSL, and named colors</li>
          <li>• All processing happens in your browser</li>
        </ul>
      </div>
    </div>
  )
}