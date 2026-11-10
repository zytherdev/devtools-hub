'use client'

import { useMemo, useState } from 'react'
import { ToolCard } from './ToolCard'
import type { ToolDefinition } from '../lib/utils/tools'

type CategoryToolsProps = { tools: ToolDefinition[] }

export function CategoryTools({ tools }: CategoryToolsProps) {
  const [query, setQuery] = useState('')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const filteredTools = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return tools
    return tools.filter(tool => `${tool.name} ${tool.description} ${tool.id}`.toLowerCase().includes(term))
  }, [query, tools])

  return (
    <section aria-label="Browse category tools">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block w-full max-w-lg">
          <span className="sr-only">Search this category</span>
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-sm text-secondary" aria-hidden="true" />
          <input value={query} onChange={event => setQuery(event.target.value)} type="search" placeholder="Search this category…" className="w-full rounded-xl border border-border bg-card py-3 pl-11 pr-4 text-sm text-primary shadow-sm placeholder:text-secondary focus:border-[#347a58] focus:outline-none" />
        </label>
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <p className="text-sm text-secondary"><span className="font-semibold text-primary">{filteredTools.length}</span> catalog entries</p>
          <div className="flex rounded-lg border border-border bg-card p-1" aria-label="Tool list view">
            <button type="button" onClick={() => setView('grid')} aria-label="Grid view" aria-pressed={view === 'grid'} className={`grid h-8 w-8 place-items-center rounded-md text-sm ${view === 'grid' ? 'bg-hover text-primary' : 'text-secondary'}`}><i className="fa-solid fa-grip" aria-hidden="true" /></button>
            <button type="button" onClick={() => setView('list')} aria-label="List view" aria-pressed={view === 'list'} className={`grid h-8 w-8 place-items-center rounded-md text-sm ${view === 'list' ? 'bg-hover text-primary' : 'text-secondary'}`}><i className="fa-solid fa-list" aria-hidden="true" /></button>
          </div>
        </div>
      </div>
      {filteredTools.length ? (
        <div className={view === 'grid' ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid grid-cols-1 gap-3'}>
          {filteredTools.map(tool => <ToolCard key={tool.id} {...tool} viewMode={view} />)}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center">
          <span className="text-2xl text-muted"><i className="fa-solid fa-magnifying-glass" aria-hidden="true" /></span>
          <h2 className="mt-3 font-semibold text-primary">No tools found</h2>
          <p className="mt-1 text-sm text-secondary">Try another search or clear the filter.</p>
          <button type="button" onClick={() => setQuery('')} className="mt-4 text-sm font-semibold text-[#347a58]">Clear search</button>
        </div>
      )}
    </section>
  )
}
