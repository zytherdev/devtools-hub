'use client'

import { ReactNode } from 'react'
import clsx from 'clsx'

interface ToolPanelProps {
  children: ReactNode
  className?: string
}

export function ToolPanel({ children, className }: ToolPanelProps) {
  return (
    <div className={clsx(
      'bg-card border border-border rounded-xl p-5',
      className
    )}>
      {children}
    </div>
  )
}