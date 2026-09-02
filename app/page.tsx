/* eslint-disable @typescript-eslint/no-unused-vars */

'use client'

import { useState, useMemo } from 'react'
import { ToolCard } from './components/ToolCard'
import { categories, allTools } from './lib/utils/tools'
import { motion, AnimatePresence } from 'framer-motion'
import { LoadingSpinner } from './components/spinner'
import { useToast } from '@zyther/react-toastify'

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  const filteredTools = useMemo(() => {
    let filtered = allTools

    if (selectedCategory !== 'all') {
      const categoryTools = categories.find(c => c.id === selectedCategory)?.tools || []
      filtered = categoryTools
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(tool =>
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.id.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [searchQuery, selectedCategory])

  const getCategoryCount = (categoryId: string) => {
    if (categoryId === 'all') return allTools.length
    const category = categories.find(c => c.id === categoryId)
    return category?.tools.length || 0
  }

  const resetFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
  }

  if(loading) return <LoadingSpinner />

  return (
    <>
      <main className="grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 onClick={() => {
            toast.info('YEAHH', {
              title: "Toast Lib Test",
              action: {
                label: "Começar",
                onClick: () => {
                  alert("É isso aeee!")
                }
              },
              duration: 10000,
              onClose: () => {
                alert("Fechou!!!")
              }
            })
          }} className="text-4xl md:text-5xl font-bold mb-4 text-primary">
            Welcome to <span translate="no" className="text-primary px-2 whitespace-nowrap">DevTools Hub</span>
          </h1>
          <p className="text-lg text-secondary max-w-2xl mx-auto">
            Your comprehensive toolkit for developers. Minify, format, and optimize your code with ease.
          </p>
          <div className="mt-4 flex justify-center gap-4 flex-wrap">
            <span className="inline-flex items-center gap-2 text-sm text-secondary bg-card px-4 py-2 rounded-full border border-border">
              <i className="fas fa-bolt text-yellow-500"></i> 100% Free
            </span>
            <span className="inline-flex items-center gap-2 text-sm text-secondary bg-card px-4 py-2 rounded-full border border-border">
              <i className="fas fa-lock text-green-500"></i> Privacy First
            </span>
            <span className="inline-flex items-center gap-2 text-sm text-secondary bg-card px-4 py-2 rounded-full border border-border">
              <i className="fas fa-rocket text-blue-500"></i> No Signup
            </span>
          </div>
        </div>

        {/* fltrs*/}
        <div className="mb-8 space-y-4">
          {/* busca */}
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="fas fa-search text-secondary"></i>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools by name, description, or category..."
              className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-3 text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-border-focus transition"
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

          {/* ctrls */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {/* all btn */}
              <button
                onClick={() => setSelectedCategory('all')}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition
                  ${selectedCategory === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-card border border-border hover:bg-hover text-secondary'
                  }
                `}
              >
                All ({allTools.length})
              </button>

              {/* ctg btns */}
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2
                    ${selectedCategory === category.id
                      ? 'bg-primary text-white'
                      : 'bg-card border border-border hover:bg-hover text-secondary'
                    }
                  `}
                >
                  <i className={category.icon}></i>
                  {category.name}
                  <span className="text-xs opacity-60">
                    ({getCategoryCount(category.id)})
                  </span>
                </button>
              ))}
            </div>

            {/* vw mode ctrl */}
            <div className="flex items-center gap-2">
              {/* vw mode tggle */}
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

              {(searchQuery || selectedCategory !== 'all') && (
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 text-sm text-secondary hover:text-primary transition flex items-center gap-2"
                >
                  <i className="fas fa-undo"></i> Reset
                </button>
              )}
            </div>
          </div>

          {/* res count */}
          <div className="text-sm text-secondary">
            {filteredTools.length === 0 ? (
              <span>No tools found. Try adjusting your search.</span>
            ) : (
              <span>
                Showing <strong className="text-primary">{filteredTools.length}</strong> tools
                {selectedCategory !== 'all' && (
                  <> in <strong className="text-primary">
                    {categories.find(c => c.id === selectedCategory)?.name}
                  </strong> category</>
                )}
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
            <AnimatePresence mode="popLayout" >
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
              Try adjusting your search or filter criteria
            </p>
            <button
              onClick={resetFilters}
              className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* stats */}
        <div className="mt-12 pt-6 border-t border-border flex flex-wrap justify-between items-center gap-4 text-sm text-secondary">
          <div>
            <i className="fas fa-cubes mr-2"></i>
            {allTools.length} tools available
          </div>
          <div className="flex gap-4">
            <span>
              <i className="fas fa-folder-open mr-1"></i>
              {categories.length} categories
            </span>
            <span>
              <i className="fas fa-tag mr-1"></i>
              {filteredTools.length} shown
            </span>
          </div>
        </div>
      </main>
    </>
  )
}