'use client'

import { useMemo, useState } from 'react'
import { ToolCard } from './components/ToolCard'
import { categories, allTools } from './lib/utils/tools'

export default function Home() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const tools = useMemo(() => {
    const source = category === 'all' ? allTools : categories.find(item => item.id === category)?.tools ?? []
    const term = query.trim().toLowerCase()
    return term ? source.filter(tool => `${tool.name} ${tool.description} ${tool.id}`.toLowerCase().includes(term)) : source
  }, [category, query])

  return <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-12 sm:px-6 sm:pt-16">
    <section className="mb-12 max-w-3xl">
      <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-secondary"><span className="h-1.5 w-1.5 rounded-full bg-[#347a58]" />A practical toolkit for developers</p>
      <h1 className="text-4xl font-semibold tracking-[-.045em] text-primary sm:text-5xl">Small tools.<br className="sm:hidden" /> <span className="text-[#347a58]">Fewer interruptions.</span></h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-secondary sm:text-lg">Format, inspect, convert, and generate common developer assets in one clean workspace. Most tools run entirely in your browser.</p>
      <div className="mt-6 flex flex-wrap gap-2 text-xs font-medium text-secondary"><span className="rounded-full border border-border bg-card px-3 py-1.5"><i className="fa-solid fa-shield-halved mr-1.5 text-[#347a58]" aria-hidden="true" />Privacy-minded</span><span className="rounded-full border border-border bg-card px-3 py-1.5"><i className="fa-solid fa-bolt mr-1.5 text-[#347a58]" aria-hidden="true" />Instant results</span><span className="rounded-full border border-border bg-card px-3 py-1.5"><i className="fa-solid fa-user-check mr-1.5 text-[#347a58]" aria-hidden="true" />No account</span></div>
    </section>

    <section aria-label="Browse tools">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full max-w-lg"><i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-sm text-secondary" aria-hidden="true" /><input value={query} onChange={event => setQuery(event.target.value)} type="search" placeholder="Search by name or what you need to do…" className="w-full rounded-xl border border-border bg-card py-3 pl-11 pr-4 text-sm text-primary shadow-sm placeholder:text-secondary focus:border-[#347a58] focus:outline-none" aria-label="Search developer tools" /></div>
        <div className="flex items-center justify-between gap-3"><p className="text-sm text-secondary"><span className="font-semibold text-primary">{tools.length}</span> catalog entries</p><div className="flex rounded-lg border border-border bg-card p-1"><button onClick={() => setView('grid')} aria-label="Grid view" aria-pressed={view === 'grid'} className={`grid h-8 w-8 place-items-center rounded-md text-sm ${view === 'grid' ? 'bg-hover text-primary' : 'text-secondary'}`}><i className="fa-solid fa-grip" /></button><button onClick={() => setView('list')} aria-label="List view" aria-pressed={view === 'list'} className={`grid h-8 w-8 place-items-center rounded-md text-sm ${view === 'list' ? 'bg-hover text-primary' : 'text-secondary'}`}><i className="fa-solid fa-list" /></button></div></div>
      </div>
      <div className="mb-7 flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Tool categories">
        <button onClick={() => setCategory('all')} role="tab" aria-selected={category === 'all'} className={`shrink-0 rounded-lg px-3.5 py-2 text-sm font-medium transition ${category === 'all' ? 'bg-[#347a58] text-white' : 'border border-border bg-card text-secondary hover:bg-hover hover:text-primary'}`}>All tools <span className="ml-1 opacity-75">{allTools.length}</span></button>
        {categories.map(item => <button key={item.id} onClick={() => setCategory(item.id)} role="tab" aria-selected={category === item.id} className={`shrink-0 rounded-lg px-3.5 py-2 text-sm font-medium transition ${category === item.id ? 'bg-[#347a58] text-white' : 'border border-border bg-card text-secondary hover:bg-hover hover:text-primary'}`}><i className={`${item.icon} mr-2`} aria-hidden="true" />{item.name} <span className="ml-1 opacity-75">{item.tools.length}</span></button>)}
      </div>
      {tools.length ? <div className={view === 'grid' ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid grid-cols-1 gap-3'}>{tools.map(tool => <ToolCard key={`${tool.href}-${tool.name}`} {...tool} viewMode={view} />)}</div> : <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center"><span className="text-2xl text-muted"><i className="fa-solid fa-magnifying-glass" aria-hidden="true" /></span><h2 className="mt-3 font-semibold text-primary">No tools found</h2><p className="mt-1 text-sm text-secondary">Try another search or choose a different category.</p><button onClick={() => { setQuery(''); setCategory('all') }} className="mt-4 text-sm font-semibold text-[#347a58]">Clear filters</button></div>}
    </section>
  </main>
}
