'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from '../providers/ThemeProvider'
import { useState } from 'react'
import clsx from 'clsx'
import Image from 'next/image';

const navItems = [
  { name: 'Home', href: '/' },
  { name: 'CSS Minifier', href: '/css-minifier' },
  { name: 'JS Minifier', href: '/js-minifier' },
  { name: 'HTML Minifier', href: '/html-minifier' },
  { name: 'JSON Formatter', href: '/json-formatter' },
]

export function Header() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-card border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* logo */}
          <Link href="/" className="text-xl font-bold text-primary flex items-center gap-2">
            <Image src="/assets/icons/favicon.ico" alt="DevTools Hub Logo" width={32} height={32} />
            <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">zyther.dev</span>
          </Link>

          {/* desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'nav-link px-3 py-2 rounded-lg transition-colors',
                  pathname === item.href
                    ? 'bg-primary text-white'
                    : 'text-secondary hover:bg-hover hover:text-primary'
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-hover transition-colors"
              aria-label="Toggle theme"
            >
              <i className={clsx(
                'text-xl',
                theme === 'dark' ? 'fas fa-sun text-yellow-500' : 'fas fa-moon text-secondary'
              )}></i>
            </button>

            {/* mbile mnu btn */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-hover transition-colors"
              aria-label="Toggle menu"
            >
              <i className="fas fa-bars text-xl text-primary"></i>
            </button>
          </div>
        </div>

        {/* mbile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    'px-3 py-2 rounded-lg transition-colors',
                    pathname === item.href
                      ? 'bg-primary text-white'
                      : 'text-secondary hover:bg-hover hover:text-primary'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}