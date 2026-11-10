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
      'tool-panel',
      className
    )}>
      {children}
    </div>
  )
}
