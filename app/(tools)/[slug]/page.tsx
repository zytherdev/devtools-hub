import { notFound } from 'next/navigation'
import Link from 'next/link'
import { allTools } from '@/app/lib/utils/tools'
import { UniversalTool } from '@/app/components/UniversalTool'

const existingRoutes = new Set([
  'box-shadow-generator', 'color-converter', 'css-beautifier', 'css-minifier',
  'curl-to-code', 'gradient-generator', 'html-minifier', 'html-to-jsx',
  'js-beautifier', 'js-minifier', 'json-formatter', 'regex-tester', 'svg-to-css',
])
const toolsBySlug = new Map(allTools.map(tool => [tool.href.replace(/^\//, ''), tool]))

export function generateStaticParams() {
  return [...new Set(allTools.map(tool => tool.href.replace(/^\//, '')))]
    .filter(slug => !existingRoutes.has(slug))
    .map(slug => ({ slug }))
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const tool = toolsBySlug.get(slug)
  if (!tool || existingRoutes.has(slug)) notFound()
  return <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10"><div className="mb-7 flex items-center gap-2 text-xs text-secondary"><Link href="/" className="hover:text-primary">All tools</Link><i className="fa-solid fa-chevron-right text-[9px]" aria-hidden="true" /><span className="text-primary">{tool.name}</span></div><UniversalTool tool={tool} slug={slug} /></div>
}
