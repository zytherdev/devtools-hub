import { UniversalTool } from '@/app/components/UniversalTool'
import { tool } from './definition'

export default function Tool() {
  return (
    <div>
      <p role="note" className="mb-4 rounded-xl border border-amber-400/50 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-950 dark:bg-amber-950/30 dark:text-amber-100">
        Privacy: generated passwords are not saved or sent anywhere. Copy or download them only when you are ready to store them securely.
      </p>
      <UniversalTool tool={tool} slug={tool.id} />
    </div>
  )
}
