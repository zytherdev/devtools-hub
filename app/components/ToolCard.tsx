import Link from 'next/link'

interface ToolCardProps {
  id: string
  name: string
  description: string
  icon: string
  color: string
  badge?: string
  href: string
}

export function ToolCard({ name, description, icon, color, badge, href }: ToolCardProps) {
  return (
    <Link href={href} className="tool-card group">
      <div className="icon" style={{ color }}>
        <i className={icon}></i>
      </div>
      <h3>{name}</h3>
      <p>{description}</p>
      {badge && <span className="badge">{badge}</span>}
      <div className="flex items-center gap-2 mt-3">
        <span className="text-xs text-secondary group-hover:text-primary transition-colors">
          <i className="fas fa-arrow-right"></i> Try it
        </span>
      </div>
    </Link>
  )
}