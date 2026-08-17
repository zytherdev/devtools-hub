'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

interface ToolCardProps {
  id: string
  name: string
  description: string
  icon: string
  color: string
  badge?: string
  href: string
  viewMode?: 'grid' | 'list'
}

export function ToolCard({ 
  name, 
  description, 
  icon, 
  color, 
  badge, 
  href,
  viewMode = 'grid' 
}: ToolCardProps) {
  if (viewMode === 'list') {
    return (
      <Link href={href} className="tool-card-list group">
        <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:border-primary transition-all hover:shadow-md">
          <div className="icon text-2xl shrink-0" style={{ color }}>
            <i className={icon}></i>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-primary truncate">{name}</h3>
              {badge && (
                <span className="badge text-xs px-2 py-0.5 rounded-full bg-badge text-badge-text shrink-0">
                  {badge}
                </span>
              )}
            </div>
            <p className="text-secondary text-sm truncate">{description}</p>
          </div>
          <div className="text-secondary group-hover:text-primary transition-colors shrink-0">
            <i className="fas fa-chevron-right"></i>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={href} className="tool-card group">
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <div className="icon" style={{ color }}>
          <i className={icon}></i>
        </div>
        <h3>{name}</h3>
        <p>{description}</p>
        {badge && <span className="badge">{badge}</span>}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs text-secondary group-hover:text-primary transition-colors">
            <i className="fas fa-arrow-right"></i> Try it
          </span>
        </div>
      </motion.div>
    </Link>
  )
}