import type { Metadata } from 'next'
import Link from 'next/link'
import { allTools, categories } from '../lib/utils/tools';

export const metadata: Metadata = {
  title: 'About · DevTools Hub',
  description: 'Learn about DevTools Hub - a free, open-source toolkit for developers with 90+ tools for minifying, formatting, and optimizing code.',
}

export default function AboutPage() {
  const totalTools = allTools.length
  const totalCategories = categories.length

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="mb-8">
        <Link 
          href="/" 
          className="text-secondary hover:text-primary transition-colors text-sm flex items-center gap-2 mb-4"
        >
          <i className="fas fa-arrow-left"></i> Back to Home
        </Link>
        <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
          <i className="fas fa-info-circle text-blue-500"></i>
          About DevTools Hub
        </h1>
        <div className="h-1 w-20 bg-primary/20 rounded-full mt-4"></div>
      </div>

      {/* ctt */}
      <div className="space-y-6 text-secondary">
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
            <i className="fas fa-rocket text-blue-500"></i>
            What is DevTools Hub?
          </h2>
          <p className="text-sm leading-relaxed">
            DevTools Hub is a free, open-source collection of developer tools designed to make your workflow faster and easier. 
            Everything runs directly in your browser — no servers, no uploads, no tracking. Just pure, client-side utilities 
            for developers.
          </p>
        </div>

        {/* sts */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
            <i className="fas fa-chart-simple text-green-500"></i>
            At a Glance
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center p-3 bg-input rounded-lg border border-border">
              <div className="text-2xl font-bold text-primary">{totalTools}</div>
              <div className="text-xs text-secondary">Tools</div>
            </div>
            <div className="text-center p-3 bg-input rounded-lg border border-border">
              <div className="text-2xl font-bold text-primary">{totalCategories}</div>
              <div className="text-xs text-secondary">Categories</div>
            </div>
            <div className="text-center p-3 bg-input rounded-lg border border-border">
              <div className="text-2xl font-bold text-primary">100%</div>
              <div className="text-xs text-secondary">Free</div>
            </div>
            <div className="text-center p-3 bg-input rounded-lg border border-border">
              <div className="text-2xl font-bold text-primary">Client</div>
              <div className="text-xs text-secondary">Side Only</div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
            <i className="fas fa-lightbulb text-yellow-500"></i>
            Why We Built This
          </h2>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-3 p-2 bg-input rounded-lg border border-border">
              <i className="fas fa-check text-green-500 mt-1"></i>
              <span><strong className="text-primary">Privacy First</strong> — Your code never leaves your browser</span>
            </li>
            <li className="flex items-start gap-3 p-2 bg-input rounded-lg border border-border">
              <i className="fas fa-check text-green-500 mt-1"></i>
              <span><strong className="text-primary">No Sign-ups</strong> — Use everything instantly, no accounts needed</span>
            </li>
            <li className="flex items-start gap-3 p-2 bg-input rounded-lg border border-border">
              <i className="fas fa-check text-green-500 mt-1"></i>
              <span><strong className="text-primary">Open Source</strong> — Transparent, community-driven, and free forever</span>
            </li>
            <li className="flex items-start gap-3 p-2 bg-input rounded-lg border border-border">
              <i className="fas fa-check text-green-500 mt-1"></i>
              <span><strong className="text-primary">Developer Focused</strong> — Tools built by developers, for developers</span>
            </li>
          </ul>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
            <i className="fas fa-cubes text-purple-500"></i>
            Built With
          </h2>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1.5 bg-input border border-border rounded-lg text-sm">
              <i className="fab fa-react text-blue-500 mr-1"></i> Next.js 14
            </span>
            <span className="px-3 py-1.5 bg-input border border-border rounded-lg text-sm">
              <i className="fab fa-react text-blue-400 mr-1"></i> React 18
            </span>
            <span className="px-3 py-1.5 bg-input border border-border rounded-lg text-sm">
              <i className="fas fa-file-code text-cyan-500 mr-1"></i> TypeScript
            </span>
            <span className="px-3 py-1.5 bg-input border border-border rounded-lg text-sm">
              <i className="fas fa-wind text-cyan-400 mr-1"></i> TailwindCSS
            </span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
            <i className="fab fa-github text-gray-500"></i>
            Open Source
          </h2>
          <p className="text-sm mb-3">
            DevTools Hub is completely open source. You can view the source code, report issues, or contribute on GitHub.
          </p>
          <a 
            href="https://github.com/zytherdev/devtools-hub" 
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition text-sm"
          >
            <i className="fab fa-github"></i>
            View on GitHub
          </a>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-primary mb-2 flex items-center gap-2">
            <i className="fas fa-envelope text-green-500"></i>
            Get in Touch
          </h2>
          <p className="text-sm">
            Questions, suggestions, or feedback? We&apos;d love to hear from you at{' '}
            <a href="mailto:support@devtools.zyther.dev" className="text-primary hover:underline">
              support@devtools.zyther.dev
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}