import type { Metadata } from 'next'
import Link from 'next/link'
import { ContentPage } from '@/app/components/ContentPage'
import { allTools, categories } from '@/app/lib/utils/tools'

export const metadata: Metadata = {
  title: 'About · DevTools Hub',
  description: 'Learn about the DevTools Hub project, its tool catalog, and how to contribute.',
}

export default function AboutPage() {
  return (
    <ContentPage
      title="About DevTools Hub"
      description="A community-maintained collection of practical utilities for everyday development."
      icon="fa-solid fa-circle-info"
      color="#347a58"
    >
      <section className="tool-panel p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-primary">What is DevTools Hub?</h2>
        <p className="mt-3 text-sm leading-6 text-secondary">
          DevTools Hub brings common formatting, conversion, inspection, and generation tasks into one place. The catalog and tool implementations are maintained in this repository, with shared routes and reusable interfaces so contributors can add features without creating a separate page for every tool.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="tool-panel p-5">
          <p className="text-2xl font-semibold tracking-tight text-primary">{allTools.length}</p>
          <p className="mt-1 text-sm text-secondary">entries in the tool catalog</p>
        </div>
        <div className="tool-panel p-5">
          <p className="text-2xl font-semibold tracking-tight text-primary">{categories.length}</p>
          <p className="mt-1 text-sm text-secondary">catalog categories</p>
        </div>
      </section>

      <section className="tool-panel p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-primary">Privacy by design</h2>
        <p className="mt-3 text-sm leading-6 text-secondary">
          Many transformations run locally in your browser. A tool that needs an external lookup must make that network behavior clear; see the <Link href="/privacy" className="font-medium text-[#347a58] hover:underline">privacy policy</Link> before using tools with sensitive data.
        </p>
      </section>

      <section className="tool-panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h2 className="text-lg font-semibold text-primary">Built in the open</h2>
          <p className="mt-2 text-sm leading-6 text-secondary">Review the source, report issues, or help improve a tool or its documentation.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href="https://github.com/zytherdev/devtools-hub" target="_blank" rel="noopener noreferrer" className="btn btn-outline text-sm"><i className="fa-brands fa-github" aria-hidden="true" />GitHub</a>
          <Link href="/contributing" className="btn btn-primary text-sm">Contributing</Link>
        </div>
      </section>
    </ContentPage>
  )
}
