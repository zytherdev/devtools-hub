'use client'
import { useState, type FormEvent } from 'react'
import { ToolPanel } from '@/app/components/ToolPanel'
import { validateCronExpression } from './logic'
import { tool } from './definition'

const exampleExpression = tool.exampleInput
const focusClass = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus'

export default function CronValidator() {
  const [expression, setExpression] = useState(exampleExpression)
  const [result, setResult] = useState<{ valid: boolean; message: string } | null>(null)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setResult(validateCronExpression(expression))
  }

  const handleExample = () => {
    setExpression(exampleExpression)
    setResult(validateCronExpression(exampleExpression))
  }

  return (
    <div className="min-w-0">
      <ToolPanel>
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label htmlFor="cron-expression" className="mb-2 block font-medium text-primary">
              Five-field cron expression
            </label>
            <input
              id="cron-expression"
              name="expression"
              type="text"
              value={expression}
              onChange={event => {
                setExpression(event.target.value)
                setResult(null)
              }}
              maxLength={256}
              autoComplete="off"
              spellCheck={false}
              aria-invalid={result?.valid === false}
              aria-describedby="cron-help cron-result"
              className={`w-full rounded-lg border border-border bg-input p-3 font-mono text-sm text-primary ${focusClass}`}
              placeholder="*/15 9-17 * * 1-5"
            />
            <p id="cron-help" className="mt-2 text-sm text-secondary">
              Enter five numeric fields in this order: minute, hour, day of month, month, and day of week.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="submit" className={`rounded-lg bg-primary px-4 py-2 text-white transition hover:opacity-90 ${focusClass}`}>
              Validate expression
            </button>
            <button
              type="button"
              onClick={handleExample}
              className={`rounded-lg border border-border px-4 py-2 text-primary transition hover:bg-hover ${focusClass}`}
            >
              Load example
            </button>
          </div>
          <div
            id="cron-result"
            role={result?.valid === false ? 'alert' : 'status'}
            aria-live={result?.valid === false ? 'assertive' : 'polite'}
            className={`min-h-6 text-sm ${result?.valid === false ? 'text-red-600 dark:text-red-300' : 'text-secondary'}`}
          >
            {result?.message ?? 'Validation runs locally in your browser. No timezone-specific next run is calculated.'}
          </div>
        </form>
      </ToolPanel>

      <ToolPanel className="mt-6">
        <section aria-labelledby="cron-grammar-heading" className="space-y-3">
          <h2 id="cron-grammar-heading" className="font-medium text-primary">Supported grammar</h2>
          <p className="text-sm text-secondary">
            Each field accepts a comma-separated list of numbers, ranges, or <code className="font-mono">*</code>, optionally followed by <code className="font-mono">/step</code>. Names and macros are not supported.
          </p>
          <p className="font-mono text-sm text-primary">minute&nbsp;&nbsp; hour&nbsp;&nbsp; day-of-month&nbsp;&nbsp; month&nbsp;&nbsp; day-of-week</p>
          <ul className="list-inside list-disc space-y-1 text-sm text-secondary">
            <li>Bounds: minute 0–59, hour 0–23, day of month 1–31, month 1–12, day of week 0–7 (0 and 7 both denote Sunday).</li>
            <li>Examples: <code className="font-mono">1,5,10</code>, <code className="font-mono">9-17</code>, <code className="font-mono">*/15</code>, and <code className="font-mono">5/10</code>.</li>
            <li>A step must be a positive integer no greater than that field’s number of allowed values. For a single-number base such as <code className="font-mono">5/10</code>, stepping starts at that value and continues through the field maximum.</li>
          </ul>
          <p className="text-sm text-secondary">
            This tool checks only the five-field syntax and numeric bounds. It does not determine a timezone-specific next run or whether a calendar date matches.
          </p>
        </section>
      </ToolPanel>
    </div>
  )
}
