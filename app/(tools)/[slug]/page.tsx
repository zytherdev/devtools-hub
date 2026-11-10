import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PageIntro } from '@/app/components/PageIntro'
import { allTools } from '@/app/lib/utils/tools'
import { toolComponents } from '@/app/tools/componentRegistry'

const toolsBySlug = new Map(allTools.map(tool => [tool.id, tool]))

export function generateStaticParams() {
  return allTools.map(tool => ({ slug: tool.id }))
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const tool = toolsBySlug.get(slug)
  const ToolComponent = toolComponents[slug as keyof typeof toolComponents]
  if (!tool || !ToolComponent) notFound()

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-7 flex items-center gap-2 text-xs text-secondary">
        <Link href="/" className="hover:text-primary">Tools</Link>
        <i className="fa-solid fa-chevron-right text-[9px]" aria-hidden="true" />
        <span className="text-primary">{tool.name}</span>
      </div>
      <PageIntro title={tool.name} description={tool.description} icon={tool.icon} color={tool.color} />
      <ToolComponent />
    </main>
  )
}
