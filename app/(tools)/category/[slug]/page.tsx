import type { Metadata } from 'next'
import Link from 'next/link'
import { categories } from '@/app/lib/utils/tools'
import { notFound } from 'next/navigation'
import { CategoryTools } from '@/app/components/CategoryTools'
import { PageIntro } from '@/app/components/PageIntro'

type CategoryPageProps = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return categories.map(category => ({ slug: category.id }))
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const category = categories.find(item => item.id === slug)
  if (!category) return { title: 'Category not found · DevTools Hub' }
  return {
    title: `${category.name} tools · DevTools Hub`,
    description: `Browse ${category.tools.length} ${category.name.toLowerCase()} catalog entries in DevTools Hub.`,
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params
  const category = categories.find(item => item.id === slug)
  if (!category) notFound()

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <nav aria-label="Breadcrumb" className="mb-7 flex items-center gap-2 text-xs text-secondary">
        <Link href="/" className="hover:text-primary">All tools</Link>
        <i className="fa-solid fa-chevron-right text-[9px]" aria-hidden="true" />
        <span className="text-primary">{category.name}</span>
      </nav>
      <PageIntro title={category.name} description={`${category.tools.length} catalog entries in this category. Search the collection or switch between grid and list view.`} icon={category.icon} color={category.color} eyebrow="Category" />
      <CategoryTools tools={category.tools} />
    </main>
  )
}
