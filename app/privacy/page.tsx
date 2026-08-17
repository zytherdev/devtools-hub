import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy · DevTools Hub',
  description: 'Privacy policy for DevTools Hub. Learn how we handle your data with our privacy-first approach.',
}

export default function PrivacyPage() {
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
          <i className="fas fa-shield-alt text-green-500"></i>
          Privacy Policy
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
            At DevTools Hub, we believe in privacy by design. All processing happens directly in your browser. 
            We don&apos;t collect, store, or share any of your data.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
            <i className="fas fa-database text-purple-500"></i>
            What We Store
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-input rounded-lg border border-border">
              <i className="fas fa-heart text-red-500 mt-1"></i>
              <div>
                <h4 className="font-medium text-primary text-sm">Favorite Tools</h4>
                <p className="text-sm">Your favorite tools are stored locally in your browser using localStorage.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-input rounded-lg border border-border">
              <i className="fas fa-moon text-indigo-500 mt-1"></i>
              <div>
                <h4 className="font-medium text-primary text-sm">Theme Preference</h4>
                <p className="text-sm">Your dark/light theme preference is saved locally.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
            <i className="fas fa-ban text-red-500"></i>
            What We Don&apos;t Store
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-input rounded-lg border border-border">
              <i className="fas fa-code text-blue-500 text-lg mb-1"></i>
              <h4 className="font-medium text-primary text-sm">Your Code</h4>
              <p className="text-sm">Never sent to our servers. Processed only in your browser.</p>
            </div>
            <div className="p-3 bg-input rounded-lg border border-border">
              <i className="fas fa-user text-green-500 text-lg mb-1"></i>
              <h4 className="font-medium text-primary text-sm">Personal Data</h4>
              <p className="text-sm">No accounts, no sign-ups, no personal information collected.</p>
            </div>
            <div className="p-3 bg-input rounded-lg border border-border">
              <i className="fas fa-cookie text-yellow-500 text-lg mb-1"></i>
              <h4 className="font-medium text-primary text-sm">Tracking Cookies</h4>
              <p className="text-sm">No analytics, no tracking, no third-party cookies.</p>
            </div>
            <div className="p-3 bg-input rounded-lg border border-border">
              <i className="fas fa-credit-card text-purple-500 text-lg mb-1"></i>
              <h4 className="font-medium text-primary text-sm">Payment Info</h4>
              <p className="text-sm">We&apos;re completely free. No payments, no financial data.</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
            <i className="fas fa-share-alt text-cyan-500"></i>
            Third-Party Services
          </h2>
          <p className="text-sm mb-3">We use these services only for functionality, not for tracking:</p>
          <div className="flex flex-wrap gap-3">
            <span className="px-3 py-1.5 bg-input border border-border rounded-lg text-sm">
              <i className="fab fa-font-awesome text-blue-500 mr-1"></i> Font Awesome
            </span>
            <span className="px-3 py-1.5 bg-input border border-border rounded-lg text-sm">
              <i className="fab fa-google text-red-500 mr-1"></i> Google Fonts
            </span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
            <i className="fas fa-user-check text-blue-500"></i>
            Your Rights
          </h2>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <i className="fas fa-check text-green-500"></i>
              <span>You control your data - it&apos;s all in your browser</span>
            </li>
            <li className="flex items-center gap-2">
              <i className="fas fa-check text-green-500"></i>
              <span>Clear localStorage anytime to remove all preferences</span>
            </li>
            <li className="flex items-center gap-2">
              <i className="fas fa-check text-green-500"></i>
              <span>No data is shared with third parties</span>
            </li>
          </ul>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-primary mb-2 flex items-center gap-2">
            <i className="fas fa-envelope text-green-500"></i>
            Questions?
          </h2>
          <p className="text-sm">
            If you have any questions about this privacy policy, feel free to reach out at{' '}
            <a href="mailto:support@devtools.zyther.dev" className="text-primary hover:underline">
              support@devtools.zyther.dev
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}