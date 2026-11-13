'use client'

import { useMemo, useState } from 'react'
import { ToolPanel } from '@/app/components/ToolPanel'
import { MAX_QUERY_LENGTH, searchStatusCodes, STATUS_CODES, type StatusCategory } from './logic'

const categoryOptions: { value: 'all' | StatusCategory; label: string }[] = [
  { value: 'all', label: 'All categories' },
  { value: '1xx', label: '1xx — Informational' },
  { value: '2xx', label: '2xx — Successful' },
  { value: '3xx', label: '3xx — Redirection' },
  { value: '4xx', label: '4xx — Client Error' },
  { value: '5xx', label: '5xx — Server Error' },
]

export default function Tool() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<'all' | StatusCategory>('all')
  const [error, setError] = useState('')

  const results = useMemo(() => {
    if (!query.trim()) return STATUS_CODES.filter(item => category === 'all' || item.category === category)
    try {
      return searchStatusCodes(query, { category })
    } catch {
      return []
    }
  }, [query, category])

  function handleQueryChange(value: string) {
    setQuery(value)
    setError('')
    if (!value.trim()) return
    try {
      searchStatusCodes(value, { category })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Search query is invalid.')
    }
  }

  return (
    <div className="space-y-4">
      <ToolPanel>
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_15rem]">
          <div>
            <label htmlFor="http-status-search" className="mb-2 block text-sm font-semibold text-primary">Search status codes</label>
            <input
              id="http-status-search"
              type="search"
              value={query}
              onChange={event => handleQueryChange(event.target.value)}
              maxLength={MAX_QUERY_LENGTH}
              placeholder="Try 404, redirect, or authentication"
              autoComplete="off"
              className="w-full rounded-xl border border-border bg-input p-3 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-[#347a58]"
              aria-describedby="http-status-search-help"
              aria-invalid={Boolean(error)}
            />
            <p id="http-status-search-help" className="mt-2 text-xs text-secondary">Search by exact three-digit code, name, description, or category.</p>
          </div>
          <div>
            <label htmlFor="http-status-category" className="mb-2 block text-sm font-semibold text-primary">Category</label>
            <select
              id="http-status-category"
              value={category}
              onChange={event => setCategory(event.target.value as 'all' | StatusCategory)}
              className="w-full rounded-xl border border-border bg-input p-3 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-[#347a58]"
            >
              {categoryOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
        </div>
        <p role={error ? 'alert' : 'status'} aria-live={error ? 'assertive' : 'polite'} className={`mt-3 min-h-5 text-sm ${error ? 'text-red-600 dark:text-red-300' : 'text-secondary'}`}>
          {error || `${results.length} ${results.length === 1 ? 'status code' : 'status codes'} shown.`}
        </p>
      </ToolPanel>

      {results.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2">
          {results.map(item => (
            <ToolPanel key={item.code}>
              <article aria-labelledby={`status-${item.code}`}>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h2 id={`status-${item.code}`} className="font-semibold text-primary">
                    <span className="mr-2 font-mono text-lg">{item.code}</span>{item.title}
                  </h2>
                  <span className="rounded-full border border-border px-2 py-0.5 text-xs text-secondary">{item.category} {item.categoryLabel}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-secondary">{item.description}</p>
              </article>
            </ToolPanel>
          ))}
        </div>
      ) : (
        <ToolPanel>
          <p className="text-sm text-secondary">{error ? 'Correct the search to see matching status codes.' : 'No matching status codes in this curated reference.'}</p>
        </ToolPanel>
      )}
      <p className="text-xs leading-5 text-secondary">Local, offline reference with {STATUS_CODES.length} curated standardized codes. Unregistered, vendor-specific, and extension-only codes are not included.</p>
    </div>
  )
}
