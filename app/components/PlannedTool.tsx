import Link from 'next/link'
import type { ToolDefinition } from '@/app/tools/types'

export function PlannedTool({ tool }: { tool: ToolDefinition }) {
  return (
    <section className="tool-panel p-6 sm:p-8" aria-labelledby="planned-tool-title">
      <div className="flex items-start gap-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-hover text-secondary" aria-hidden="true">
          <i className="fa-solid fa-hammer" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-secondary">Planned tool</p>
          <h2 id="planned-tool-title" className="mt-1 text-lg font-semibold text-primary">This tool is not implemented yet</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-secondary">{tool.name} is listed in the catalog, but it does not process input yet. We show this state instead of a non-working editor. Contributions should follow the canonical <code className="rounded bg-input px-1.5 py-0.5">app/tools/{tool.id}/</code> folder structure.</p>
          <Link href="/contributing" className="btn btn-outline mt-5 text-sm">View contribution guide</Link>
        </div>
      </div>
    </section>
  )
}
