import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service · DevTools Hub',
  description: 'Terms of service for DevTools Hub. Learn about the terms and conditions for using our free developer tools.',
}

export default function TermsPage() {
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
          <i className="fas fa-file-contract text-blue-500"></i>
          Terms of Service
        </h1>
        <p className="text-secondary text-sm mt-1">
          Last updated: {new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* ctt */}
      <div className="space-y-6 text-secondary">
        {/* intro */}
        <div className="bg-card border border-border rounded-xl p-6">
          <p className="text-sm leading-relaxed">
            By using DevTools Hub, you agree to these terms. We keep things straightforward because 
            we believe tools should be free and easy to use.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
            <i className="fas fa-check-circle text-green-500"></i>
            What You Can Do
          </h2>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-3 p-2 bg-input rounded-lg border border-border">
              <i className="fas fa-check text-green-500 mt-1"></i>
              <span>Use all tools completely free, without any limitations</span>
            </li>
            <li className="flex items-start gap-3 p-2 bg-input rounded-lg border border-border">
              <i className="fas fa-check text-green-500 mt-1"></i>
              <span>Process your code locally in your browser — no uploads to servers</span>
            </li>
            <li className="flex items-start gap-3 p-2 bg-input rounded-lg border border-border">
              <i className="fas fa-check text-green-500 mt-1"></i>
              <span>Save your favorite tools locally for quick access</span>
            </li>
            <li className="flex items-start gap-3 p-2 bg-input rounded-lg border border-border">
              <i className="fas fa-check text-green-500 mt-1"></i>
              <span>Share and recommend our tools to others</span>
            </li>
          </ul>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
            <i className="fas fa-ban text-red-500"></i>
            What You Can&apos;t Do
          </h2>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-3 p-2 bg-input rounded-lg border border-border">
              <i className="fas fa-times text-red-500 mt-1"></i>
              <span>Use our tools for illegal or harmful activities</span>
            </li>
            <li className="flex items-start gap-3 p-2 bg-input rounded-lg border border-border">
              <i className="fas fa-times text-red-500 mt-1"></i>
              <span>Attempt to reverse engineer or exploit the platform</span>
            </li>
            <li className="flex items-start gap-3 p-2 bg-input rounded-lg border border-border">
              <i className="fas fa-times text-red-500 mt-1"></i>
              <span>Use automated systems to access or scrape our tools</span>
            </li>
          </ul>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
            <i className="fas fa-exclamation-triangle text-yellow-500"></i>
            Disclaimer
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3 p-3 bg-input rounded-lg border border-border">
              <i className="fas fa-info-circle text-blue-500 mt-1"></i>
              <div>
                <h4 className="font-medium text-primary">As-Is Service</h4>
                <p className="text-sm">Our tools are provided &quot;as is&quot; without any warranties. Use them at your own discretion.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-input rounded-lg border border-border">
              <i className="fas fa-code text-purple-500 mt-1"></i>
              <div>
                <h4 className="font-medium text-primary">No Liability</h4>
                <p className="text-sm">We are not responsible for any damages or losses resulting from using our tools.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-input rounded-lg border border-border">
              <i className="fas fa-shield-alt text-green-500 mt-1"></i>
              <div>
                <h4 className="font-medium text-primary">Client-Side Only</h4>
                <p className="text-sm">All processing happens in your browser. We don&apos;t store or access your code.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-primary mb-2 flex items-center gap-2">
            <i className="fas fa-clock text-orange-500"></i>
            Changes to Terms
          </h2>
          <p className="text-sm">
            We may update these terms occasionally. Continued use of the site means you accept any changes.
            Check back periodically for updates.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-primary mb-2 flex items-center gap-2">
            <i className="fas fa-envelope text-green-500"></i>
            Questions?
          </h2>
          <p className="text-sm">
            If you have any questions about these terms, feel free to reach out at{' '}
            <a href="mailto:support@devtools.zyther.dev" className="text-primary hover:underline">
              support@devtools.zyther.dev
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}