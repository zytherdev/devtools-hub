'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'
import { categories, allTools, type ToolDefinition } from '../lib/utils/tools'
import { useTheme } from '../providers/ThemeProvider'

type SearchResultsProps = {
  query: string
  results: ToolDefinition[]
  onSelect: () => void
}

function SearchResults({ query, results, onSelect }: SearchResultsProps) {
  if (!query) return null
  return (
    <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-border bg-card shadow-xl" aria-label="Tool search results">
      {results.length ? results.map(tool => (
        <Link key={tool.href} href={tool.href} onClick={onSelect} className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-0 hover:bg-hover">
          <i className={`${tool.icon} w-5 text-center`} style={{ color: tool.color }} aria-hidden="true" />
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-primary">{tool.name}</span>
            <span className="block truncate text-xs text-secondary">{tool.description}</span>
          </span>
          <i className="fa-solid fa-arrow-up-right-from-square ml-auto text-xs text-muted" aria-hidden="true" />
        </Link>
      )) : <p className="px-4 py-5 text-center text-sm text-secondary">No tools match “{query}”.</p>}
    </div>
  )
}

export function Header() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const desktopSearch = useRef<HTMLInputElement>(null)
  const mobileSearch = useRef<HTMLInputElement>(null)
  const results = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return []
    return allTools.filter(tool => `${tool.name} ${tool.description} ${tool.id}`.toLowerCase().includes(term)).slice(0, 6)
  }, [query])

  useEffect(() => {
    function onShortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        const input = window.matchMedia('(min-width: 768px)').matches ? desktopSearch.current : mobileSearch.current
        input?.focus()
        setMenuOpen(false)
      }
      if (event.key === 'Escape') setQuery('')
    }
    window.addEventListener('keydown', onShortcut)
    return () => window.removeEventListener('keydown', onShortcut)
  }, [])

  const clearSearch = () => setQuery('')

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="DevTools Hub home">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#347a58] text-white"><i className="fa-solid fa-code" aria-hidden="true" /></span>
          <span className="hidden font-semibold tracking-tight text-primary sm:inline">DevTools Hub</span>
        </Link>

        <div className="relative mx-auto hidden w-full max-w-md md:block">
          <label className="sr-only" htmlFor="global-tool-search">Search tools</label>
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-secondary" aria-hidden="true" />
          <input ref={desktopSearch} id="global-tool-search" value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => { if (event.key === 'Escape') clearSearch() }} placeholder="Search tools…" className="w-full rounded-xl border border-border bg-input py-2.5 pl-10 pr-24 text-sm text-primary placeholder:text-secondary focus:border-[#347a58] focus:outline-none" />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-border px-1.5 py-0.5 text-[10px] text-secondary">Ctrl / ⌘ K</kbd>
          <SearchResults query={query} results={results} onSelect={clearSearch} />
        </div>

        <nav className="ml-auto hidden items-center gap-1 md:flex" aria-label="Main navigation">
          <Link href="/" aria-current={pathname === '/' ? 'page' : undefined} className={clsx('nav-link rounded-lg px-3 py-2 text-sm', pathname === '/' && 'bg-hover text-primary')}>All tools</Link>
          <div className="relative">
            <button type="button" onClick={() => setCategoriesOpen(value => !value)} className="nav-link flex items-center gap-2 rounded-lg px-3 py-2 text-sm" aria-expanded={categoriesOpen} aria-haspopup="true">Categories <i className="fa-solid fa-chevron-down text-[10px]" aria-hidden="true" /></button>
            {categoriesOpen && <div className="absolute right-0 top-full mt-2 max-h-[70vh] w-64 overflow-auto rounded-xl border border-border bg-card p-2 shadow-xl">{categories.map(category => <Link key={category.id} href={`/category/${category.id}`} onClick={() => setCategoriesOpen(false)} className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-secondary hover:bg-hover hover:text-primary"><span className="flex items-center gap-2"><i className={category.icon} style={{ color: category.color }} aria-hidden="true" />{category.name}</span><span className="text-xs">{category.tools.length}</span></Link>)}</div>}
          </div>
          <Link href="/about" className="nav-link rounded-lg px-3 py-2 text-sm">About</Link>
        </nav>

        <button type="button" onClick={toggleTheme} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border text-secondary hover:bg-hover hover:text-primary" aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}><i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`} aria-hidden="true" /></button>
        <button type="button" onClick={() => setMenuOpen(value => !value)} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border text-secondary md:hidden" aria-label="Toggle navigation" aria-expanded={menuOpen}><i className={`fa-solid ${menuOpen ? 'fa-xmark' : 'fa-bars'}`} aria-hidden="true" /></button>
      </div>

      <div className="border-t border-border px-4 py-3 md:hidden">
        <div className="relative mx-auto max-w-7xl">
          <label className="sr-only" htmlFor="global-tool-search-mobile">Search tools</label>
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-sm text-secondary" aria-hidden="true" />
          <input ref={mobileSearch} id="global-tool-search-mobile" value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => { if (event.key === 'Escape') clearSearch() }} placeholder="Search tools…" className="w-full rounded-xl border border-border bg-input py-2.5 pl-9 pr-3 text-sm text-primary placeholder:text-secondary focus:border-[#347a58] focus:outline-none" />
          <SearchResults query={query} results={results} onSelect={clearSearch} />
        </div>
      </div>

      {menuOpen && <nav className="grid max-h-[70vh] gap-1 overflow-auto border-t border-border px-4 py-3 md:hidden" aria-label="Mobile navigation"><Link href="/" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm text-primary hover:bg-hover">All tools</Link>{categories.map(category => <Link key={category.id} href={`/category/${category.id}`} onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm text-secondary hover:bg-hover">{category.name}</Link>)}<Link href="/about" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm text-secondary hover:bg-hover">About</Link><Link href="/contributing" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm text-secondary hover:bg-hover">Contribute</Link></nav>}
    </header>
  )
}
