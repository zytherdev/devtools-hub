import type { Metadata } from 'next'
import Link from 'next/link'
import { ContentPage } from '@/app/components/ContentPage'

export const metadata: Metadata = {
  title: 'Contributing · DevTools Hub',
  description: 'Set up DevTools Hub, add a tool in its canonical folder, run checks, and open a pull request.',
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
        <pre className={codeClass}>{'npm run dev\nnpm run check'}</pre>
      </section>

      <section className={cardClass}>
        <h2 className="text-lg font-semibold text-primary">One folder per tool</h2>
        <p className="mt-3 text-sm leading-6 text-secondary">Every tool uses the same structure under <code className="rounded bg-input px-1.5 py-0.5">app/tools/&lt;slug&gt;</code>: <code className="rounded bg-input px-1.5 py-0.5">definition.ts</code> for metadata and defaults, <code className="rounded bg-input px-1.5 py-0.5">logic.ts</code> for processing, <code className="rounded bg-input px-1.5 py-0.5">Tool.tsx</code> for the UI entry, and <code className="rounded bg-input px-1.5 py-0.5">README.md</code> for usage and limitations. Tool-private helpers live under that folder&apos;s <code className="rounded bg-input px-1.5 py-0.5">lib/</code>; its focused test is <code className="rounded bg-input px-1.5 py-0.5">tests/tools/&lt;slug&gt;.test.cjs</code>.</p>
        <p className="mt-3 text-sm leading-6 text-secondary">The metadata registry is <code className="rounded bg-input px-1.5 py-0.5">app/tools/registry.ts</code>; <code className="rounded bg-input px-1.5 py-0.5">app/tools/componentRegistry.ts</code> connects every UI entry. All tools use <code className="rounded bg-input px-1.5 py-0.5">app/(tools)/[slug]/page.tsx</code>; do not create a page route per tool. Generic interfaces compose <code className="rounded bg-input px-1.5 py-0.5">UniversalTool</code>, which dispatches to the tool&apos;s <code className="rounded bg-input px-1.5 py-0.5">logic.ts</code>; richer controls stay in the same tool&apos;s <code className="rounded bg-input px-1.5 py-0.5">Tool.tsx</code>.</p>
      </section>

      <section className={cardClass}>
        <h2 className="text-lg font-semibold text-primary">Privacy and safety</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-secondary">
          <li>Process user input locally by default. If a feature needs a network lookup, disclose it in the UI and document what is sent and to whom.</li>
          <li>Never execute pasted code, use <code className="rounded bg-input px-1.5 py-0.5">eval</code>, or deserialize untrusted objects.</li>
          <li>Render user-controlled content as text; validate file sizes, parser depth, and expensive inputs.</li>
          <li>Mark a catalog entry implemented only after its logic, UI, and meaningful tests are connected.</li>
        </ul>
      </section>

      <section className={cardClass}>
        <h2 className="text-lg font-semibold text-primary">Pull request checklist</h2>
        <ul className="mt-3 space-y-2 text-sm text-secondary">
          <li>□ Definition slug, folder name, category, and route agree.</li>
          <li>□ The page uses the shared header, panels, responsive layout, and light/dark theme tokens.</li>
          <li>□ Success, invalid input, boundary cases, and privacy/network behavior are covered.</li>
          <li>□ Lint, typecheck, tests, and production build pass.</li>
          <li>□ The per-tool README and coverage status are accurate.</li>
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
