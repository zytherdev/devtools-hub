/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { categories, allTools, quickTools } from '../lib/utils/tools'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { GoogleTranslate } from '@zyther/ggl-translate'
import { getStoredTheme } from '../lib/utils/thm';

export function Footer() {
  const router = useRouter()
  const pathname = usePathname()
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    setTheme(getStoredTheme());
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubscribed(true)
      setEmail('')
      setTimeout(() => setSubscribed(false), 3000)
    }
  }

  const popularTools = quickTools

  const footerCategories = categories.slice(0, 6)

  return (
    <footer id="footer" className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div translate="no" className="text-2xl font-bold text-primary flex items-center gap-2">
                <Image 
                  src="/assets/icons/favicon.ico" 
                  alt="DevTools Hub" 
                  width={32} 
                  height={32}
                  className="transition-transform group-hover:scale-110"
                />
                DevTools Hub
              </div>
            </Link>
            <p className="text-secondary text-sm leading-relaxed">
              Free, open-source toolkit for developers. Minify, format, and optimize your code with {allTools.length}+ powerful tools.
            </p>
            <div className="flex gap-3">
              <a 
                href="#" 
                className="w-9 h-9 rounded-full bg-input border border-border flex items-center justify-center text-secondary hover:text-primary hover:border-primary transition-colors"
                aria-label="GitHub"
              >
                <i className="fab fa-github"></i>
              </a>
              <a 
                href="#" 
                className="w-9 h-9 rounded-full bg-input border border-border flex items-center justify-center text-secondary hover:text-primary hover:border-primary transition-colors"
                aria-label="Twitter"
              >
                <i className="fab fa-twitter"></i>
              </a>
              <a 
                href="#" 
                className="w-9 h-9 rounded-full bg-input border border-border flex items-center justify-center text-secondary hover:text-primary hover:border-primary transition-colors"
                aria-label="YouTube"
              >
                <i className="fab fa-youtube"></i>
              </a>
              <a 
                href="#" 
                className="w-9 h-9 rounded-full bg-input border border-border flex items-center justify-center text-secondary hover:text-primary hover:border-primary transition-colors"
                aria-label="Discord"
              >
                <i className="fab fa-discord"></i>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-primary mb-4 flex items-center gap-2">
              <i className="fas fa-fire text-orange-500 text-sm"></i>
              Popular Tools
            </h4>
            <ul className="space-y-2.5">
              {popularTools.map((tool) => (
                <li key={tool.href}>
                  <Link 
                    href={tool.href} 
                    className="footer-link text-sm flex items-center gap-2 group"
                  >
                    <i className="fas fa-chevron-right text-[10px] text-muted group-hover:text-primary transition-colors"></i>
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-primary mb-4 flex items-center gap-2">
              <i className="fas fa-folder-open text-blue-500 text-sm"></i>
              Categories
            </h4>
            <ul className="space-y-2.5">
              {footerCategories.map((category) => (
                <li key={category.id}>
                  <Link 
                    href={`/category/${category.id}`} 
                    className="footer-link text-sm flex items-center justify-between group"
                  >
                    <span className="flex items-center gap-2">
                      <i className={`${category.icon} text-xs`}></i>
                      {category.name}
                    </span>
                    <span className="text-xs text-muted group-hover:text-primary transition-colors">
                      {category.tools.length}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            {categories.length > 6 && (
              <button
                onClick={() => {
                  if (pathname === "/") {
                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    })
                    return
                  }

                  router.push("/")
                }}
                className="text-sm text-primary hover:underline mt-3 inline-block"
              >
                View all categories →
              </button>
            )}
          </div>

          {/* contact && nws */}
          <div>
            <h4 className="font-semibold text-primary mb-4 flex items-center gap-2">
              <i className="fas fa-envelope text-green-500 text-sm"></i>
              Stay Updated
            </h4>
            <p className="text-secondary text-sm mb-3">
              Get notified about new tools and updates.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-primary placeholder-secondary text-sm focus:outline-none focus:ring-2 focus:ring-border-focus transition"
                  required
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-primary text-white rounded-md text-xs hover:opacity-90 transition"
                >
                  Subscribe
                </button>
              </div>
              {subscribed && (
                <p className="text-xs text-green-500">
                  <i className="fas fa-check mr-1"></i> Subscribed successfully!
                </p>
              )}
            </form>
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-secondary text-sm flex items-center gap-2">
                <i className="fas fa-headset text-primary"></i>
                <a href="mailto:support@devtools-hub.dev" className="hover:text-accent transition-colors">
                  support@devtools.zyther.dev
                </a>
              </p>
              <p className="text-secondary text-sm flex items-center gap-2 mt-1">
                <i className="fas fa-clock text-primary"></i>
                Response within 24h
              </p>
            </div>
            {/* thm btn */}
            <div className="mt-4 pt-4 border-t border-border">
              <GoogleTranslate
              theme={ { mode: theme } }
                defaultLanguage="en"
                supportedLanguages="fr,en,es,pt,it"
                showNativeNames
                enableAutoDetection={false}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 py-6">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <p translate="no" className="text-secondary">
                &copy; {new Date().getFullYear()} DevTools Hub
              </p>
              <span className="text-muted hidden md:inline">|</span>
              <span className="hidden md:inline text-xs text-secondary">
                <i className="fas fa-code mr-1"></i>
                {allTools.length}+ tools
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <Link href="/privacy" className="footer-link">Privacy</Link>
              <span className="text-muted">·</span>
              <Link href="/terms" className="footer-link">Terms</Link>
              <span className="text-muted">·</span>
              <Link href="/contributing" className="footer-link">Contribute</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
