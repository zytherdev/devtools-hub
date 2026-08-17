'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useMemo, useEffect } from 'react'
import { ToolCard } from '@/app/components/ToolCard'
import { motion, AnimatePresence } from 'framer-motion'
import { categories } from '@/app/lib/utils/tools';

export default function CategoryPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')

  const category = useMemo(() => {
    return categories.find(c => c.id === slug)
  }, [slug])

  const categoryTools = useMemo(() => {
    if (!category) return []
    return category.tools
  }, [category])

  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) return categoryTools
    
    const query = searchQuery.toLowerCase().trim()
    return categoryTools.filter(tool =>
      tool.name.toLowerCase().includes(query) ||
      tool.description.toLowerCase().includes(query) ||
      tool.id.toLowerCase().includes(query)
    )
  }, [categoryTools, searchQuery])

  useEffect(() => {
    if (slug && !category) {
      router.push('/')
    }
  }, [slug, category, router])

  if (!category) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-6xl mb-4 text-muted">
            <i className="fas fa-folder-open"></i>
          </div>
          <h2 className="text-2xl font-semibold text-primary mb-2">Category Not Found</h2>
          <p className="text-secondary">The category you&apos;re looking for doesn&apos;t exist.</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={() => router.push('/')}
            className="text-secondary hover:text-primary transition-colors"
          >
            <i className="fas fa-arrow-left"></i>
          </button>
          <div className="flex items-center gap-3">
            <div className="text-3xl" style={{ color: category.color || '#3b82f6' }}>
              <i className={category.icon}></i>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-primary">
                {category.name}
              </h1>
              <p className="text-secondary text-sm mt-1">
                {categoryTools.length} tools available in this category
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ctrls */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* busca */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="fas fa-search text-secondary text-sm"></i>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${category.name}...`}
              className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-primary placeholder-secondary text-sm focus:outline-none focus:ring-2 focus:ring-border-focus transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary hover:text-primary transition"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>

          {/* vw ctrls */}
          <div className="flex items-center gap-2">
            <div className="flex bg-card border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`
                  px-3 py-2 text-sm transition
                  ${viewMode === 'grid'
                    ? 'bg-primary text-white'
                    : 'text-secondary hover:bg-hover'
                  }
                `}
                aria-label="Grid view"
              >
                <i className="fas fa-th"></i>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`
                  px-3 py-2 text-sm transition
                  ${viewMode === 'list'
                    ? 'bg-primary text-white'
                    : 'text-secondary hover:bg-hover'
                  }
                `}
                aria-label="List view"
              >
                <i className="fas fa-list"></i>
              </button>
            </div>
          </div>
        </div>

        {/* res count */}
        <div className="text-sm text-secondary">
          {filteredTools.length === 0 ? (
            <span>No tools found. Try adjusting your search.</span>
          ) : (
            <span>
              Showing <strong className="text-primary">{filteredTools.length}</strong> tools
              {searchQuery && <> matching &quot;<strong className="text-primary">{searchQuery}</strong>&quot;</>}
            </span>
          )}
        </div>
      </div>

      {/* tools */}
      {filteredTools.length > 0 ? (
        <div className={`
          grid gap-6
          ${viewMode === 'grid'
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'grid-cols-1'
          }
        `}>
          <AnimatePresence mode="popLayout">
            {filteredTools.map((tool, index) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <ToolCard {...tool} viewMode={viewMode} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-6xl mb-4 text-muted">
            <i className="fas fa-search"></i>
          </div>
          <h3 className="text-xl font-semibold text-primary mb-2">No tools found</h3>
          <p className="text-secondary">
            Try adjusting your search or browse all tools
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* nav bck */}
      <div className="mt-12 pt-6 border-t border-border">
        <button
          onClick={() => router.push('/')}
          className="text-secondary hover:text-primary transition-colors text-sm flex items-center gap-2"
        >
          <i className="fas fa-arrow-left"></i>
          Back to all tools
        </button>
      </div>
    </div>
  )
}