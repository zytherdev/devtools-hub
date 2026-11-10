import type { ToolOptions } from '@/app/tools/types'

const MAX_INPUT_CHARACTERS = 5_000_000
const MAX_URLS = 50_000
const FREQUENCIES = new Set(['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'])

function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}

function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value
}

export function run(input: string, options: ToolOptions = {}): string {
  if (typeof input !== 'string' || input.trim() === '') throw new Error('Enter at least one absolute website URL.')
  if (input.length > MAX_INPUT_CHARACTERS) throw new Error('Input exceeds the 5,000,000-character limit.')
  if (!options || typeof options !== 'object' || Array.isArray(options)) throw new Error('Options must be an object.')
  const allowed = new Set(['changeFrequency', 'priority', 'lastModified'])
  const unknown = Object.keys(options).find(key => !allowed.has(key))
  if (unknown) throw new Error(`Unknown option: ${unknown}.`)
  for (const [key, value] of Object.entries(options)) if (typeof value !== 'string') throw new Error(`${key} must be a string.`)

  const changeFrequency = options.changeFrequency ?? ''
  if (changeFrequency && !FREQUENCIES.has(changeFrequency)) throw new Error('changeFrequency must be a standard sitemap frequency or empty.')
  const priority = options.priority ?? ''
  if (priority && (!/^(?:0(?:\.\d{1,2})?|1(?:\.0{1,2})?)$/.test(priority) || Number(priority) > 1)) {
    throw new Error('priority must be a decimal from 0.0 to 1.0 or empty.')
  }
  const lastModified = options.lastModified ?? ''
  if (lastModified && !validDate(lastModified)) throw new Error('lastModified must be a real date in YYYY-MM-DD format or empty.')

  const entries = input.split(/\r?\n/).map(line => line.trim()).filter(Boolean)
  if (!entries.length) throw new Error('Enter at least one absolute website URL.')
  if (entries.length > MAX_URLS) throw new Error(`A sitemap may contain at most ${MAX_URLS.toLocaleString('en-US')} URLs.`)
  const locations = [...new Set(entries.map(entry => {
    let url: URL
    try { url = new URL(entry) } catch { throw new Error(`Invalid absolute URL: ${entry}`) }
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.hash) {
      throw new Error('Sitemap URLs must use HTTP(S) and must not contain credentials or fragments.')
    }
    return url.href
  }))]

  const records = locations.map(location => {
    const fields = [`    <loc>${escapeXml(location)}</loc>`]
    if (lastModified) fields.push(`    <lastmod>${lastModified}</lastmod>`)
    if (changeFrequency) fields.push(`    <changefreq>${changeFrequency}</changefreq>`)
    if (priority) fields.push(`    <priority>${priority}</priority>`)
    return `  <url>\n${fields.join('\n')}\n  </url>`
  })
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${records.join('\n')}\n</urlset>\n`
  if (xml.length > 10_000_000) throw new Error('Generated sitemap exceeds the 10,000,000-character output limit.')
  return xml
}
