'use client'

import { useState } from 'react'
import { CodeFormatter } from '@/app/components/CodeFormatter'
import { defaultCSSOptions, formatCSSWithPreferences } from '@/app/tools/css-beautifier/logic'
import { tool } from '@/app/tools/css-beautifier/definition'

export default function CSSBeautifier() {
  const [endWithNewline, setEndWithNewline] = useState(defaultCSSOptions.endWithNewline)

  return <>
    <section className="tool-panel mb-4 flex flex-wrap items-center gap-3 p-4">
      <label htmlFor="css-end-with-newline" className="flex items-center gap-2 text-sm font-medium text-primary">
        <input
          id="css-end-with-newline"
          type="checkbox"
          checked={endWithNewline}
          onChange={event => setEndWithNewline(event.target.checked)}
          className="h-4 w-4 rounded border-border accent-[#347a58]"
        />
        End output with a newline
      </label>
      <p className="text-xs text-secondary">Applied to the formatted CSS output.</p>
    </section>
    <CodeFormatter
      title={tool.name}
      description={tool.description}
      language="CSS"
      sample={tool.exampleInput}
      format={(source, preferences) => formatCSSWithPreferences(source, preferences, endWithNewline)}
    />
  </>
}
