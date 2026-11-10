import type { ToolOptions } from '@/app/tools/types'

const MAX_INPUT_CHARACTERS = 100_000
const MAX_DIRECTIVES = 1_000

function ensureOptions(options: ToolOptions): void {
  if (!options || typeof options !== 'object' || Array.isArray(options)) throw new Error('Options must be an object.')
  const allowed = new Set(['userAgent', 'allow', 'crawlDelay', 'sitemap'])
  const unknown = Object.keys(options).find(key => !allowed.has(key))
  if (unknown) throw new Error(`Unknown option: ${unknown}.`)
  for (const [key, value] of Object.entries(options)) {
    if (typeof value !== 'string') throw new Error(`${key} must be a string.`)
  }
}

function parsePaths(value: string, name: string): string[] {
  const paths = value.split(/\r?\n/).map(path => path.trim()).filter(Boolean)
  if (paths.length > MAX_DIRECTIVES) throw new Error(`${name} may contain at most ${MAX_DIRECTIVES} paths.`)
  for (const path of paths) {
    if (path.length > 2_048 || !path.startsWith('/') || /[\s\u0000-\u001f\u007f#]/.test(path)) {
      throw new Error(`${name} entries must be paths beginning with /, with no spaces, control characters, or fragments.`)
    }
  }
  return [...new Set(paths)]
}

function parseSitemaps(value: string): string[] {
  const urls = value.split(/\r?\n/).map(item => item.trim()).filter(Boolean)
  if (urls.length > 50) throw new Error('sitemap may contain at most 50 URLs.')
  return [...new Set(urls.map(item => {
    let url: URL
    try { url = new URL(item) } catch { throw new Error(`Invalid sitemap URL: ${item}`) }
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.hash) {
      throw new Error('Sitemap entries must be absolute HTTP(S) URLs without credentials or fragments.')
    }
    return url.href
  }))]
}

export function run(input: string, options: ToolOptions = {}): string {
  if (typeof input !== 'string') throw new Error('Input must be text.')
  if (input.length > MAX_INPUT_CHARACTERS) throw new Error(`Input must be no more than ${MAX_INPUT_CHARACTERS.toLocaleString('en-US')} characters.`)
  ensureOptions(options)

  const userAgent = options.userAgent ?? '*'
  if (!/^(?:\*|[A-Za-z0-9._-]{1,80})$/.test(userAgent)) throw new Error('userAgent must be * or a product token of 1 to 80 letters, digits, dots, underscores, or hyphens.')
  const allow = parsePaths(options.allow ?? '', 'allow')
  const disallow = parsePaths(input, 'Disallow input')
  const sitemaps = parseSitemaps(options.sitemap ?? '')
  const crawlDelay = options.crawlDelay ?? ''
  if (crawlDelay && (!/^\d+$/.test(crawlDelay) || Number(crawlDelay) > 86_400)) {
    throw new Error('crawlDelay must be a whole number from 0 to 86400 seconds.')
  }

  const lines = [`User-agent: ${userAgent}`]
  for (const path of allow) lines.push(`Allow: ${path}`)
  for (const path of disallow) lines.push(`Disallow: ${path}`)
  if (crawlDelay) lines.push(`Crawl-delay: ${crawlDelay}`)
  for (const sitemap of sitemaps) lines.push(`Sitemap: ${sitemap}`)
  return `${lines.join('\n')}\n`
}
