'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import type { ToolDefinition } from '../lib/utils/tools'

type ToolCardProps = ToolDefinition & { viewMode?: 'grid' | 'list' }

export function ToolCard({ name, description, icon, color, badge, href, viewMode = 'grid' }: ToolCardProps) {
  if (viewMode === 'list') return <Link href={href} className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition hover:border-[#347a58]/50 hover:shadow-md">
    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ color, backgroundColor: `${color}14` }}><i className={`${icon} text-lg`} aria-hidden="true" /></span>
    <span className="min-w-0 flex-1"><span className="flex items-center gap-2"><span className="truncate font-semibold text-primary">{name}</span>{badge && <span className="rounded-full bg-badge px-2 py-0.5 text-[10px] font-semibold text-badge-text">{badge}</span>}</span><span className="mt-1 block truncate text-sm text-secondary">{description}</span></span>
    <i className="fa-solid fa-arrow-right text-sm text-muted transition group-hover:translate-x-1 group-hover:text-primary" aria-hidden="true" />
  </Link>
  return <Link href={href} className="block h-full"><motion.article whileHover={{ y: -2 }} transition={{ duration: .16 }} className="tool-card group" style={{ '--tool-color': color } as React.CSSProperties}>
    <span className="icon" style={{ color }}><i className={icon} aria-hidden="true" /></span>
    <div className="flex items-start justify-between gap-2"><h3>{name}</h3>{badge && <span className="badge mt-0!">{badge}</span>}</div><p className="line-clamp-2">{description}</p>
    <div className="mt-5 flex items-center justify-between text-xs font-medium text-secondary"><span>Open tool</span><i className="fa-solid fa-arrow-up-right-from-square transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" aria-hidden="true" /></div>
  </motion.article></Link>
}
