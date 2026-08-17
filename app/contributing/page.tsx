import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Contributing · DevTools Hub',
  description: 'Learn how to contribute to DevTools Hub. Help us build the best free developer toolkit.',
}

export default function ContributingPage() {
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
          <i className="fas fa-handshake text-green-500"></i>
          Contributing
        </h1>
        <p className="text-secondary text-sm mt-1">
          Help us build the best free developer toolkit. Every contribution matters!    
        </p>
      </div>

      {/* ctt */}
      <div className="space-y-6 text-secondary">
        {/* intro */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
            <i className="fas fa-heart text-red-500"></i>
            Welcome Contributors!
          </h2>
          <p className="text-sm leading-relaxed">
            DevTools Hub is an open-source project built by developers, for developers. 
            Whether you&apos;re fixing bugs, adding new tools, improving documentation, or suggesting features — 
            your contributions are valuable and appreciated.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
            <i className="fas fa-rocket text-blue-500"></i>
            Quick Start
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3 p-3 bg-input rounded-lg border border-border">
              <span className="font-mono text-primary font-bold bg-primary/10 px-2 py-0.5 rounded text-xs">1</span>
              <div>
                <h4 className="font-medium text-primary">Fork the Repository</h4>
                <p className="text-sm">Click the Fork button on GitHub to create your own copy.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-input rounded-lg border border-border">
              <span className="font-mono text-primary font-bold bg-primary/10 px-2 py-0.5 rounded text-xs">2</span>
              <div>
                <h4 className="font-medium text-primary">Clone Your Fork</h4>
                <p className="text-sm">
                  <code className="bg-input border border-border rounded px-2 py-0.5 text-xs">git clone https://github.com/zytherdev/devtools-hub.git</code>
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-input rounded-lg border border-border">
              <span className="font-mono text-primary font-bold bg-primary/10 px-2 py-0.5 rounded text-xs">3</span>
              <div>
                <h4 className="font-medium text-primary">Create a Branch</h4>
                <p className="text-sm">
                  <code className="bg-input border border-border rounded px-2 py-0.5 text-xs">git checkout -b feature/amazing-tool</code>
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-input rounded-lg border border-border">
              <span className="font-mono text-primary font-bold bg-primary/10 px-2 py-0.5 rounded text-xs">4</span>
              <div>
                <h4 className="font-medium text-primary">Make Your Changes</h4>
                <p className="text-sm">Add your tool, fix a bug, or improve the docs.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-input rounded-lg border border-border">
              <span className="font-mono text-primary font-bold bg-primary/10 px-2 py-0.5 rounded text-xs">5</span>
              <div>
                <h4 className="font-medium text-primary">Open a Pull Request</h4>
                <p className="text-sm">Submit your PR with a clear description of your changes.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
            <i className="fas fa-tasks text-purple-500"></i>
            What You Can Contribute
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-input rounded-lg border border-border">
              <i className="fas fa-wrench text-blue-500 text-lg mb-1"></i>
              <h4 className="font-medium text-primary text-sm">New Tools</h4>
              <p className="text-sm">Add a new developer tool to our collection</p>
            </div>
            <div className="p-3 bg-input rounded-lg border border-border">
              <i className="fas fa-bug text-red-500 text-lg mb-1"></i>
              <h4 className="font-medium text-primary text-sm">Bug Fixes</h4>
              <p className="text-sm">Find and fix issues in existing tools</p>
            </div>
            <div className="p-3 bg-input rounded-lg border border-border">
              <i className="fas fa-file-alt text-green-500 text-lg mb-1"></i>
              <h4 className="font-medium text-primary text-sm">Documentation</h4>
              <p className="text-sm">Improve README, guides, and code comments</p>
            </div>
            <div className="p-3 bg-input rounded-lg border border-border">
              <i className="fas fa-paint-brush text-pink-500 text-lg mb-1"></i>
              <h4 className="font-medium text-primary text-sm">UI/UX Improvements</h4>
              <p className="text-sm">Enhance the user experience and design</p>
            </div>
            <div className="p-3 bg-input rounded-lg border border-border">
              <i className="fas fa-tachometer-alt text-yellow-500 text-lg mb-1"></i>
              <h4 className="font-medium text-primary text-sm">Performance</h4>
              <p className="text-sm">Optimize speed and efficiency</p>
            </div>
            <div className="p-3 bg-input rounded-lg border border-border">
              <i className="fas fa-lightbulb text-orange-500 text-lg mb-1"></i>
              <h4 className="font-medium text-primary text-sm">Feature Ideas</h4>
              <p className="text-sm">Suggest new features or improvements</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
            <i className="fas fa-plus-circle text-green-500"></i>
            Adding a New Tool
          </h2>
          <p className="text-sm mb-3">Here&apos;s how to add a new tool to DevTools Hub:</p>
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-input rounded-lg border border-border">
              <h4 className="font-medium text-primary">1. Add to tools.ts</h4>
              <pre className="bg-card border border-border rounded-lg p-3 mt-2 text-xs overflow-x-auto">
                {`
{
    id: 'your-tool',
    name: 'Your Tool Name',
    description: 'Brief description of what your tool does.',
    icon: 'fa-solid fa-icon',
    color: '#your-color',
    badge: 'New',
    href: '/your-tool'
}`
                }
              </pre>
            </div>
            <div className="p-3 bg-input rounded-lg border border-border">
              <h4 className="font-medium text-primary">2. Create the Tool Page</h4>
              <pre className="bg-card border border-border rounded-lg p-3 mt-2 text-xs overflow-x-auto">
                {
`'use client'
import { useState } from 'react'
import { ToolPanel } from '@/app/components/ToolPanel'

export default function YourTool() {
    // Your tool implementation
}`
                }
              </pre>
            </div>
            <div className="p-3 bg-input rounded-lg border border-border">
              <h4 className="font-medium text-primary">3. Add Utility Functions</h4>
              <p className="text-sm">Create a file in <code className="bg-input border border-border rounded px-1.5 py-0.5 text-xs">app/lib/tools/your-tool-category/your-tool.ts</code></p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
            <i className="fas fa-code text-blue-500"></i>
            Code Guidelines
          </h2>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-3 p-2 bg-input rounded-lg border border-border">
              <i className="fas fa-check text-green-500 mt-1"></i>
              <span><strong className="text-primary">TypeScript:</strong> Use TypeScript for all new code</span>
            </li>
            <li className="flex items-start gap-3 p-2 bg-input rounded-lg border border-border">
              <i className="fas fa-check text-green-500 mt-1"></i>
              <span><strong className="text-primary">TailwindCSS:</strong> Use Tailwind for styling</span>
            </li>
            <li className="flex items-start gap-3 p-2 bg-input rounded-lg border border-border">
              <i className="fas fa-check text-green-500 mt-1"></i>
              <span><strong className="text-primary">Responsive:</strong> Ensure mobile-friendly design</span>
            </li>
            <li className="flex items-start gap-3 p-2 bg-input rounded-lg border border-border">
              <i className="fas fa-check text-green-500 mt-1"></i>
              <span><strong className="text-primary">Components:</strong> Reuse existing components</span>
            </li>
            <li className="flex items-start gap-3 p-2 bg-input rounded-lg border border-border">
              <i className="fas fa-check text-green-500 mt-1"></i>
              <span><strong className="text-primary">Comments:</strong> Add clear comments for complex logic</span>
            </li>
          </ul>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
            <i className="fas fa-code-pull-request text-purple-500"></i>
            Pull Request Checklist
          </h2>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-3 p-2 bg-input rounded-lg border border-border">
              <i className="fas fa-check text-green-500 mt-1"></i>
              <span>☐ Clear description of changes</span>
            </li>
            <li className="flex items-start gap-3 p-2 bg-input rounded-lg border border-border">
              <i className="fas fa-check text-green-500 mt-1"></i>
              <span>☐ Tested in multiple browsers</span>
            </li>
            <li className="flex items-start gap-3 p-2 bg-input rounded-lg border border-border">
              <i className="fas fa-check text-green-500 mt-1"></i>
              <span>☐ Mobile responsive</span>
            </li>
            <li className="flex items-start gap-3 p-2 bg-input rounded-lg border border-border">
              <i className="fas fa-check text-green-500 mt-1"></i>
              <span>☐ Dark/light theme compatible</span>
            </li>
            <li className="flex items-start gap-3 p-2 bg-input rounded-lg border border-border">
              <i className="fas fa-check text-green-500 mt-1"></i>
              <span>☐ No console errors or warnings</span>
            </li>
            <li className="flex items-start gap-3 p-2 bg-input rounded-lg border border-border">
              <i className="fas fa-check text-green-500 mt-1"></i>
              <span>☐ Updated documentation if needed</span>
            </li>
          </ul>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-primary mb-2 flex items-center gap-2">
            <i className="fas fa-question-circle text-blue-500"></i>
            Questions?
          </h2>
          <p className="text-sm">
            Have questions or need help getting started? Reach out to us at{' '}
            <a href="mailto:contributing@devtools.zyther.dev" className="text-primary hover:underline">
              contributing@devtools.zyther.dev
            </a>{' '}
            or open an issue on GitHub.
          </p>
        </div>
      </div>
    </div>
  )
}