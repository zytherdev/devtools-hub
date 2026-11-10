import dynamic from 'next/dynamic'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { allTools } from '@/app/lib/utils/tools'
import { UniversalTool } from '@/app/components/UniversalTool'

const specializedTools = {
  'box-shadow-generator': dynamic(() => import('@/app/components/tools/box-shadow-generator')),
  'color-converter': dynamic(() => import('@/app/components/tools/color-converter')),
  'css-beautifier': dynamic(() => import('@/app/components/tools/css-beautifier')),
  'css-minifier': dynamic(() => import('@/app/components/tools/css-minifier')),
  'curl-to-code': dynamic(() => import('@/app/components/tools/curl-to-code')),
  'gradient-generator': dynamic(() => import('@/app/components/tools/gradient-generator')),
  'html-minifier': dynamic(() => import('@/app/components/tools/html-minifier')),
  'html-to-jsx': dynamic(() => import('@/app/components/tools/html-to-jsx')),
  'js-beautifier': dynamic(() => import('@/app/components/tools/js-beautifier')),
  'js-minifier': dynamic(() => import('@/app/components/tools/js-minifier')),
  'json-formatter': dynamic(() => import('@/app/components/tools/json-formatter')),
  'regex-tester': dynamic(() => import('@/app/components/tools/regex-tester')),
  'svg-to-css': dynamic(() => import('@/app/components/tools/svg-to-css')),
}

const toolsBySlug = new Map(allTools.map(tool => [tool.href.replace(/^\//, ''), tool]))

export function generateStaticParams() {
  return [...new Set(allTools.map(tool => tool.href.replace(/^\//, '')))]
    .map(slug => ({ slug }))
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const tool = toolsBySlug.get(slug)
  if (!tool) notFound()

  const SpecializedTool = specializedTools[slug as keyof typeof specializedTools]

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-7 flex items-center gap-2 text-xs text-secondary">
        <Link href="/" className="hover:text-primary">All tools</Link>
        <i className="fa-solid fa-chevron-right text-[9px]" aria-hidden="true" />
        <span className="text-primary">{tool.name}</span>
      </div>
      <header className="mb-8">
        <div className="mb-3 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl" style={{ color: tool.color, backgroundColor: `${tool.color}18` }}>
            <i className={`${tool.icon} text-lg`} aria-hidden="true" />
          </span>
          <span className="rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-secondary">Developer tool</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-primary sm:text-4xl">{tool.name}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-secondary sm:text-base">{tool.description}</p>
      </header>
      {SpecializedTool
        ? <SpecializedTool />
        : <UniversalTool tool={tool} slug={slug} />}
    </div>
  )
}
