import type { ReactNode } from 'react'
import Link from 'next/link'
import { PageIntro } from './PageIntro'

type ContentPageProps = {
  title: string
  description: string
  icon: string
  color?: string
  children: ReactNode
}

export function ContentPage({ title, description, icon, color, children }: ContentPageProps) {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <nav aria-label="Breadcrumb" className="mb-7 flex items-center gap-2 text-xs text-secondary">
        <Link href="/" className="hover:text-primary">All tools</Link>
        <i className="fa-solid fa-chevron-right text-[9px]" aria-hidden="true" />
        <span className="text-primary">{title}</span>
      </nav>
      <PageIntro title={title} description={description} icon={icon} color={color} eyebrow="Project information" />
      <div className="space-y-4">{children}</div>
    </main>
  )
}
