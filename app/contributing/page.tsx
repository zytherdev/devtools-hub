import type { Metadata } from 'next'
import Link from 'next/link'
import { ContentPage } from '@/app/components/ContentPage'

export const metadata: Metadata = {
  title: 'Contributing · DevTools Hub',
  description: 'Set up DevTools Hub, add a tool through the shared registry, run checks, and open a pull request.',
}

const cardClass = 'tool-panel p-5 sm:p-6'
const codeClass = 'mt-3 block overflow-x-auto rounded-lg border border-border bg-input p-3 font-mono text-xs leading-6 text-primary'

export default function ContributingPage() {
  return (
    <ContentPage
      title="Contributing"
      description="Help improve the tool catalog, shared interface, documentation, and implementation quality."
      icon="fa-solid fa-handshake"
      color="#347a58"
    >
      <section className={cardClass}>
        <h2 className="text-lg font-semibold text-primary">Quick start</h2>
        <ol className="mt-4 space-y-3 text-sm text-secondary">
          <li><span className="font-semibold text-primary">1. Fork</span> the repository on GitHub, then clone your fork:</li>
        </ol>
        <pre className={codeClass}>{'git clone https://github.com/<your-user>/devtools-hub.git\ncd devtools-hub\nnpm ci'}</pre>
        <p className="mt-4 text-sm text-secondary">Start the app locally, then run the project checks before opening a pull request:</p>
        <pre className={codeClass}>{'npm run dev\nnpm run lint\nnpm run typecheck\nnpm test\nnpm run build'}</pre>
      </section>

      <section className={cardClass}>
        <h2 className="text-lg font-semibold text-primary">How tools are organized</h2>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-secondary">
          <li><code className="rounded bg-input px-1.5 py-0.5">app/lib/utils/tools.ts</code> holds the catalog metadata and category membership.</li>
          <li><code className="rounded bg-input px-1.5 py-0.5">app/(tools)/[slug]/page.tsx</code> serves the existing tool URL pattern; do not create a route page for each tool.</li>
          <li>Simple tools use the shared <code className="rounded bg-input px-1.5 py-0.5">UniversalTool</code> interface and a local executor in <code className="rounded bg-input px-1.5 py-0.5">app/lib/tools</code>.</li>
          <li>Tools needing specialized controls put their UI in <code className="rounded bg-input px-1.5 py-0.5">app/components/tools</code> and register it in the route’s specialized component map.</li>
        </ul>
        <p className="mt-3 text-sm leading-6 text-secondary">Keep the catalog slug, route slug, and executor key identical. Prefer pure, typed utility functions; validate options and inputs; display errors in the page instead of using blocking dialogs.</p>
      </section>

      <section className={cardClass}>
        <h2 className="text-lg font-semibold text-primary">Privacy and safety</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-secondary">
          <li>Process user input locally by default. If a feature needs a network lookup, disclose it in the UI and document what is sent and to whom.</li>
          <li>Never execute pasted code, use <code className="rounded bg-input px-1.5 py-0.5">eval</code>, or deserialize untrusted objects.</li>
          <li>Render user-controlled content as text; validate file sizes, parser depth, and expensive inputs.</li>
          <li>Do not claim that every catalog entry is implemented until it has a working executor or specialized tool component and tests.</li>
        </ul>
      </section>

      <section className={cardClass}>
        <h2 className="text-lg font-semibold text-primary">Pull request checklist</h2>
        <ul className="mt-3 space-y-2 text-sm text-secondary">
          <li>□ Catalog metadata and implementation use one unique slug.</li>
          <li>□ The page uses the shared header, panels, responsive layout, and light/dark theme tokens.</li>
          <li>□ Success, invalid input, boundary cases, and privacy/network behavior are covered.</li>
          <li>□ Lint, typecheck, tests, and production build pass.</li>
          <li>□ README or a relevant guide is updated; UI changes include a screenshot in the PR when practical.</li>
        </ul>
        <div className="mt-5 flex flex-wrap gap-2">
          <a href="https://github.com/zytherdev/devtools-hub/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer" className="btn btn-outline text-sm">Contributor guide</a>
          <a href="https://github.com/zytherdev/devtools-hub/blob/main/docs/architecture.md" target="_blank" rel="noopener noreferrer" className="btn btn-outline text-sm">Architecture</a>
          <a href="https://github.com/zytherdev/devtools-hub/blob/main/docs/adding-a-tool.md" target="_blank" rel="noopener noreferrer" className="btn btn-outline text-sm">Add a tool</a>
          <a href="https://github.com/zytherdev/devtools-hub/blob/main/docs/tool-coverage.md" target="_blank" rel="noopener noreferrer" className="btn btn-outline text-sm">Implementation coverage</a>
          <a href="https://github.com/zytherdev/devtools-hub/issues" target="_blank" rel="noopener noreferrer" className="btn btn-primary text-sm">Open an issue</a>
        </div>
        <p className="mt-4 text-xs text-secondary">The <Link href="/" className="font-medium text-[#347a58] hover:underline">tool catalog</Link> includes planned entries too; consult the coverage guide before choosing work.</p>
      </section>
    </ContentPage>
  )
}
