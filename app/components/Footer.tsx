import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h4 className="font-semibold text-primary mb-3">About DevTools Hub</h4>
            <p className="text-secondary text-sm">
              Free, open-source toolkit for developers. Minify, format, and optimize your code.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-primary mb-3">Tools</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/css-minifier" className="footer-link">CSS Minifier</Link></li>
              <li><Link href="/js-minifier" className="footer-link">JS Minifier</Link></li>
              <li><Link href="/html-minifier" className="footer-link">HTML Minifier</Link></li>
              <li><Link href="/json-formatter" className="footer-link">JSON Formatter</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-primary mb-3">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="footer-link">Documentation</a></li>
              <li><a href="#" className="footer-link">API Reference</a></li>
              <li><a href="#" className="footer-link">Changelog</a></li>
              <li><a href="#" className="footer-link">FAQ</a></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold text-primary mb-3">Connect</h4>
            <div className="flex gap-3">
              <a href="#" className="footer-link text-xl"><i className="fab fa-github"></i></a>
              <a href="#" className="footer-link text-xl"><i className="fab fa-twitter"></i></a>
              <a href="#" className="footer-link text-xl"><i className="fab fa-linkedin"></i></a>
              <a href="#" className="footer-link text-xl"><i className="fab fa-discord"></i></a>
            </div>
            <p className="text-secondary text-sm mt-3">
              <i className="fas fa-envelope mr-1"></i> support@devtools-hub.dev
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-secondary text-sm">
            &copy; 2026 DevTools Hub. Made with <i className="fas fa-heart text-red-500"></i> for developers
          </p>
          <div className="flex gap-4 text-sm">
            <a href="#" className="footer-link">Privacy Policy</a>
            <a href="#" className="footer-link">Terms of Service</a>
            <a href="#" className="footer-link">Contribute</a>
          </div>
        </div>
      </div>
    </footer>
  )
}