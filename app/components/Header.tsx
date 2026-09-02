/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from '../providers/ThemeProvider'
import { useState, useEffect, useRef, useMemo } from 'react'
import clsx from 'clsx'
import Image from 'next/image'
import { categories, quickTools } from '../lib/utils/tools'

const menuItems = [
  { 
    name: 'Home', 
    href: '/', 
    icon: 'fa-solid fa-house',
    isActive: (path: string) => path === '/' 
  },
  {
    name: 'Tools',
    icon: 'fa-solid fa-tools',
    isActive: (path: string) => path.startsWith('/') && path !== '/',
    children: categories.map(cat => ({
      name: cat.name,
      href: `/category/${cat.id}`,
      icon: cat.icon,
      count: cat.tools.length,
      isActive: (path: string) => path === `/category/${cat.id}`
    }))
  },
  {
    name: 'Favorites',
    href: '/favorites',
    icon: 'fa-solid fa-star',
    isActive: (path: string) => path === '/favorites'
  },
  {
    name: 'About',
    href: '/about',
    icon: 'fa-solid fa-info-circle',
    isActive: (path: string) => path === '/about'
  }
]

export function Header() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null)
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100)
    }
  }, [showSearch])

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name)
  }

  const isActive = (item: any) => {
    if (item.isActive) return item.isActive(pathname)
    return false
  }

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const query = searchQuery.toLowerCase()
    const allTools = categories.flatMap(cat => 
      cat.tools.map(tool => ({ ...tool, category: cat.name }))
    )
    return allTools.filter(tool => 
      tool.name.toLowerCase().includes(query) ||
      tool.description.toLowerCase().includes(query) ||
      tool.category.toLowerCase().includes(query)
    ).slice(0, 8)
  }, [searchQuery])

  return (
    <nav className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="container mx-auto py-0.5 px-2">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-8 h-8">
              <Image 
                src="/assets/icons/favicon.ico" 
                alt="DevTools Hub" 
                width={32} 
                height={32}
                className="transition-transform group-hover:scale-110"
              />
            </div>
            <div translate="no" className="flex items-center gap-2">
              <span className="hidden md:flex text-xl font-bold text-primary">DevTools Hub</span>
              <span className="text-[10px] font-mono bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                zyther.dev
              </span>
            </div>
          </Link>

          {/* pc nav */}
          <div className="hidden lg:flex items-center gap-1">
            {menuItems.map((item) => {
              if (item.children) {
                // dropdown mnu
                return (
                  <div key={item.name} ref={dropdownRef} className="relative">
                    <button
                      onClick={() => toggleDropdown(item.name)}
                      className={clsx(
                        'nav-link px-3 py-2 rounded-lg transition-colors flex items-center gap-2',
                        openDropdown === item.name
                          ? 'bg-primary text-white'
                          : pathname !== '/' && pathname.startsWith('/') 
                            ? 'bg-primary/10 text-primary' 
                            : 'text-secondary hover:bg-hover hover:text-primary'
                      )}
                    >
                      <i className={item.icon}></i>
                      {item.name}
                      <i className={`fas fa-chevron-down text-xs transition-transform ${openDropdown === item.name ? 'rotate-180' : ''}`}></i>
                    </button>

                    {openDropdown === item.name && (
                      <div className="absolute top-full left-0 mt-2 w-72 bg-card border border-border rounded-xl shadow-lg py-2 max-h-[70vh] overflow-y-auto">
                        <div className="px-3 py-2 border-b border-border">
                          <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
                            All Categories
                          </span>
                          <span className="text-xs text-muted ml-2">
                            ({categories.length})
                          </span>
                        </div>
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setOpenDropdown(null)}
                            className={clsx(
                              'flex items-center justify-between px-4 py-2.5 hover:bg-hover transition-colors',
                              child.isActive?.(pathname) && 'bg-primary/10'
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <i className={clsx('w-5', child.icon)}></i>
                              <span className="text-sm text-primary">{child.name}</span>
                            </div>
                            <span className="text-xs text-secondary bg-input px-2 py-0.5 rounded-full">
                              {child.count}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              }

              // active pg
              return (
                <Link
                  key={item.name}
                  href={item.href!}
                  className={clsx(
                    'nav-link px-3 py-2 rounded-lg transition-colors flex items-center gap-2',
                    isActive(item)
                      ? 'bg-primary text-white'
                      : 'text-secondary hover:bg-hover hover:text-primary'
                  )}
                >
                  <i className={item.icon}></i>
                  {item.name}
                </Link>
              )
            })}
          </div>

          <div className="flex items-center gap-2">
            {/* busca btn */}
            <div ref={searchRef} className="relative">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 rounded-lg hover:bg-hover transition-colors text-secondary hover:text-primary"
                aria-label="Search tools"
              >
                <i className="fas fa-search text-lg"></i>
              </button>

              {showSearch && (
                <div className="absolute right-0 top-full mt-2 w-96 bg-card border border-border rounded-xl shadow-lg p-3">
                  <div className="relative">
                    <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-sm"></i>
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search 90+ tools..."
                      className="w-full bg-input border border-border rounded-lg pl-10 pr-4 py-2.5 text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-border-focus transition"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary transition"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    )}
                  </div>

                  {searchQuery && (
                    <div className="mt-3 max-h-64 overflow-y-auto">
                      {searchResults.length > 0 ? (
                        <div className="space-y-1">
                          {searchResults.map((result) => (
                            <Link
                              key={result.id}
                              href={result.href}
                              onClick={() => {
                                setShowSearch(false)
                                setSearchQuery('')
                              }}
                              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-hover transition-colors"
                            >
                              <i className={result.icon} style={{ color: result.color }}></i>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm text-primary truncate">{result.name}</div>
                                <div className="text-xs text-secondary truncate">{result.category}</div>
                              </div>
                              <i className="fas fa-arrow-right text-secondary text-xs"></i>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-secondary text-sm">
                          <i className="fas fa-search text-2xl block mb-2 text-muted"></i>
                          No tools found for &quot;{searchQuery}&quot;
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* thm btn */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-hover transition-colors text-secondary hover:text-primary"
              aria-label="Toggle theme"
            >
              <i className={clsx(
                'text-lg',
                theme === 'dark' ? 'fas fa-sun text-yellow-500' : 'fas fa-moon'
              )}></i>
            </button>

            {/* mbile mnu btn */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-hover transition-colors text-secondary hover:text-primary"
              aria-label="Toggle menu"
            >
              <i className={clsx(
                'text-xl',
                mobileMenuOpen ? 'fas fa-times' : 'fas fa-bars'
              )}></i>
            </button>
          </div>
        </div>

        {/* mbile mnu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 mt-2 border-t border-border">
            <div className="flex flex-col gap-1">
              <div className="px-3 py-2">
                <div className="text-xs font-semibold text-secondary uppercase tracking-wider mb-2">
                  Quick Tools
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {quickTools.map((tool) => (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-hover transition-colors text-sm"
                    >
                      <i className={tool.icon} style={{ color: tool.color }}></i>
                      <span className="text-primary">{tool.name}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="border-t border-border my-2"></div>

              {/* main nav */}
              {menuItems.map((item) => {
                if (item.children) {
                  return (
                    <div key={item.name}>
                      <div className="px-3 py-2 text-xs font-semibold text-secondary uppercase tracking-wider">
                        {item.name}
                      </div>
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={clsx(
                            'flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors',
                            child.isActive?.(pathname) && 'bg-primary/10'
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <i className={child.icon}></i>
                            <span className="text-sm text-primary">{child.name}</span>
                          </div>
                          <span className="text-xs text-secondary">{child.count}</span>
                        </Link>
                      ))}
                    </div>
                  )
                }

                return (
                  <Link
                    key={item.name}
                    href={item.href!}
                    onClick={() => setMobileMenuOpen(false)}
                    className={clsx(
                      'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors',
                      isActive(item)
                        ? 'bg-primary text-white'
                        : 'text-secondary hover:bg-hover hover:text-primary'
                    )}
                  >
                    <i className={item.icon}></i>
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}