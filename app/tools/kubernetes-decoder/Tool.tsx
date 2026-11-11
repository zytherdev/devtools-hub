import { UniversalTool } from '@/app/components/UniversalTool'
import { tool } from './definition'

export default function Tool() {
  return (
    <>
      <aside role="note" aria-label="Secret handling warning" className="mb-4 rounded-xl border border-amber-400/50 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:bg-amber-950/30 dark:text-amber-100">
        <strong>Warning:</strong> the output contains secrets in clear text. Processing occurs locally in your browser; do not paste the output in public places.
      </aside>
      <UniversalTool tool={tool} slug={tool.id} />
    </>
  )
}
