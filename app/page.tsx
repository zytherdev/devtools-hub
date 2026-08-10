import { ToolCard } from './components/ToolCard'
import type { Metadata } from 'next'
import { tools } from './lib/utils/tools';

export const metadata: Metadata = {
  title: 'DevTools Hub · Developer Toolkit',
  description: 'Free online developer tools for minifying, formatting, and optimizing code.',
}

export default function Home() {
  return (
    <>
      <main className="grow container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-primary">
            Welcome to <span className="text-primary">DevTools Hub</span>
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

        {/* tools*/}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <ToolCard key={tool.id} {...tool} />
          ))}
        </div>
      </main>
    </>
  )
}