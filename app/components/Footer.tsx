import Link from 'next/link'
import { allTools, categories, quickTools } from '../lib/utils/tools'

export function Footer() {
  return <footer className="mt-20 border-t border-border bg-card">
    <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
      <div><Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-primary"><span className="grid h-8 w-8 place-items-center rounded-lg bg-[#347a58] text-white"><i className="fa-solid fa-code" aria-hidden="true" /></span>DevTools Hub</Link><p className="mt-3 max-w-sm text-sm leading-6 text-secondary">A focused collection of browser-based utilities for everyday development. Your input stays on your device unless a tool clearly requires an external lookup.</p><a href="https://github.com/zytherdev/devtools-hub" target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm text-secondary hover:text-primary"><i className="fa-brands fa-github" aria-hidden="true" /> Open source on GitHub</a></div>
      <div><h2 className="text-xs font-semibold uppercase tracking-[.14em] text-secondary">Popular tools</h2><ul className="mt-4 space-y-2.5">{quickTools.slice(0, 5).map(tool => <li key={tool.href}><Link href={tool.href} className="text-sm text-secondary hover:text-primary">{tool.name}</Link></li>)}</ul></div>
      <div><h2 className="text-xs font-semibold uppercase tracking-[.14em] text-secondary">Explore</h2><ul className="mt-4 space-y-2.5">{categories.slice(0, 5).map(category => <li key={category.id}><Link href={`/category/${category.id}`} className="text-sm text-secondary hover:text-primary">{category.name}</Link></li>)}</ul></div>
    </div>
    <div className="border-t border-border"><div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-xs text-secondary sm:flex-row sm:items-center sm:justify-between sm:px-6"><span>© {new Date().getFullYear()} DevTools Hub · {allTools.length} tools</span><div className="flex gap-4"><Link href="/privacy" className="hover:text-primary">Privacy</Link><Link href="/terms" className="hover:text-primary">Terms</Link><Link href="/contributing" className="hover:text-primary">Contribute</Link></div></div></div>
  </footer>
}
