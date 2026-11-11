import type { ToolStatus } from '@/app/tools/types'

type PageIntroProps = {
  title: string
  description: string
  icon: string
  color?: string
  eyebrow?: string
  status?: ToolStatus
}

export function PageIntro({ title, description, icon, color = '#347a58', eyebrow, status }: PageIntroProps) {
  const statusLabel = status === 'implemented' ? 'Implemented tool' : 'Planned tool'
  const statusColor = status === 'implemented' ? 'bg-emerald-500' : 'bg-orange-400'
  return (
    <header className="mb-8">
      <div className="mb-3 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl" style={{ color, backgroundColor: `${color}18` }}>
          <i className={`${icon} text-lg`} aria-hidden="true" />
        </span>
        {status ? <span role="img" aria-label={statusLabel} title={statusLabel} className={`h-2 w-2 rounded-full ${statusColor}`} /> : eyebrow && <span className="rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-secondary">{eyebrow}</span>}
      </div>
      <h1 className="text-3xl font-semibold tracking-tight text-primary sm:text-4xl">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-secondary sm:text-base">{description}</p>
    </header>
  )
}
