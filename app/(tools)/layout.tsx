'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link';

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  const toolName = pathname.split('/').pop()?.replace(/-/g, ' ') || 'Tool'
  const capitalizedName = toolName.charAt(0).toUpperCase() + toolName.slice(1)

  return (
    <>
      <main className="grow container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6 text-sm">
          <Link href="/" className="text-secondary hover:text-primary transition-colors">
            <i className="fas fa-home"></i> Home
          </Link>
          <span className="text-muted">/</span>
          <span className="text-primary font-medium">{capitalizedName}</span>
        </div>
        {children}
      </main>
    </>
  )
}