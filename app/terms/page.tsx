import type { Metadata } from 'next'
import Link from 'next/link'
import { ContentPage } from '@/app/components/ContentPage'

export const metadata: Metadata = {
  title: 'Terms of Service · DevTools Hub',
  description: 'Terms for using the DevTools Hub website and its developer tools.',
}

export default function TermsPage() {
  return (
    <ContentPage
      title="Terms of Service"
      description="Guidelines for using this open-source developer-tools website."
      icon="fa-solid fa-file-contract"
      color="#347a58"
    >
      <p className="text-xs text-secondary">Last updated: <time dateTime="2026-11-10">November 10, 2026</time></p>

      <section className="tool-panel p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-primary">Use of the tools</h2>
        <p className="mt-3 text-sm leading-6 text-secondary">You may use the site for lawful development, testing, and learning. Respect applicable laws, third-party rights, and any limits or terms stated by an external service used by a particular tool. You are responsible for reviewing generated output before relying on it.</p>
      </section>

      <section className="tool-panel p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-primary">No warranty</h2>
        <p className="mt-3 text-sm leading-6 text-secondary">The site and tools are provided “as is” and “as available.” Results may contain errors or limitations and are not a substitute for security review, professional advice, or independent testing. Keep backups and do not treat output as authoritative without verification.</p>
      </section>

      <section className="tool-panel p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-primary">Data and external services</h2>
        <p className="mt-3 text-sm leading-6 text-secondary">Local transformations are performed in your browser where the tool indicates. A feature that needs an external lookup may send the query to its provider; review the tool’s notice and the <Link href="/privacy" className="font-medium text-[#347a58] hover:underline">Privacy Policy</Link>. You are responsible for deciding whether your input is appropriate for that service.</p>
      </section>

      <section className="tool-panel p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-primary">Changes and contact</h2>
        <p className="mt-3 text-sm leading-6 text-secondary">These terms may change as the project evolves. The date above is updated when the text changes. Questions or reports can be submitted through the <a href="https://github.com/zytherdev/devtools-hub/issues" target="_blank" rel="noopener noreferrer" className="font-medium text-[#347a58] hover:underline">GitHub issue tracker</a>.</p>
      </section>
    </ContentPage>
  )
}
