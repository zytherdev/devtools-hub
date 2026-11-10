import YAML from 'yaml'
import { DATA_TOOL_SLUGS, runDataTool } from './dataTools'
import { transformBase64 } from './base64'

export type ToolOptions = Record<string, string>

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!)
}

function beautifyMarkup(source: string) {
  const tokens = source.replace(/>\s*</g, '><').match(/<!--[\s\S]*?-->|<[^>]+>|[^<]+/g) ?? []
  const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'])
  let depth = 0
  const output: string[] = []
  for (const raw of tokens) {
    const token = raw.trim()
    if (!token) continue
    if (/^<\//.test(token)) depth = Math.max(0, depth - 1)
    const inlineText = !token.startsWith('<')
    output.push(`${'  '.repeat(depth)}${token}`)
    if (/^<([a-z][\w:-]*)\b/i.test(token) && !/^<\//.test(token) && !/\/>$/.test(token)) {
      const tag = token.match(/^<([a-z][\w:-]*)/i)?.[1]?.toLowerCase()
      if (tag && !voidTags.has(tag) && !token.includes('</')) depth++
    }
    if (inlineText && output.length > 1 && /^<\w/i.test(output[output.length - 2])) {
      // Text nodes stay at their natural indentation; no structural changes are made.
    }
  }
  return output.join('\n')
}

function markdownInline(line: string) {
  let html = escapeHtml(line)
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label: string, href: string) => {
      const safe = /^(https?:|mailto:|\/|#)/i.test(href) ? href : '#'
      return `<a href="${escapeHtml(safe)}">${label}</a>`
    })
  return html
}

function markdownToHtml(markdown: string) {
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n')
  const out: string[] = []
  let inList: 'ul' | 'ol' | null = null
  let inCode = false
  let codeLanguage = ''
  let codeLines: string[] = []
  const closeList = () => { if (inList) { out.push(`</${inList}>`); inList = null } }
  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      closeList()
      if (inCode) { out.push(`<pre><code${codeLanguage ? ` class="language-${escapeHtml(codeLanguage)}"` : ''}>${escapeHtml(codeLines.join('\n'))}</code></pre>`); inCode = false; codeLines = [] }
      else { inCode = true; codeLanguage = line.trim().slice(3).trim() }
      continue
    }
    if (inCode) { codeLines.push(line); continue }
    const heading = line.match(/^\s*(#{1,6})\s+(.+)$/)
    if (heading) { closeList(); const level = heading[1].length; out.push(`<h${level}>${markdownInline(heading[2])}</h${level}>`); continue }
    const item = line.match(/^\s*([-*+]\s+|\d+\.\s+)(.*)$/)
    if (item) { const kind = /^\d/.test(item[1]) ? 'ol' : 'ul'; if (inList !== kind) { closeList(); inList = kind; out.push(`<${kind}>`) } out.push(`<li>${markdownInline(item[2])}</li>`); continue }
    closeList()
    if (/^\s*>/.test(line)) { out.push(`<blockquote>${markdownInline(line.replace(/^\s*>\s?/, ''))}</blockquote>`); continue }
    if (/^\s*([-*_]\s*){3,}$/.test(line)) { out.push('<hr>'); continue }
    if (!line.trim()) continue
    out.push(`<p>${markdownInline(line)}</p>`)
  }
  closeList()
  if (inCode) out.push(`<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`)
  return out.join('\n')
}

function formatXml(source: string) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(source, 'application/xml')
  const issue = doc.querySelector('parsererror')
  if (issue) throw new Error(issue.textContent?.replace(/\s+/g, ' ').trim() || 'Invalid XML document')
  const serialized = new XMLSerializer().serializeToString(doc)
  return beautifyMarkup(serialized.replace(/></g, '>\n<'))
}

function sortObjectKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortObjectKeys)
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).sort(([left], [right]) => left.localeCompare(right)).map(([key, item]) => [key, sortObjectKeys(item)]))
  return value
}

type ToolHandler = (input: string, options: ToolOptions) => string | Promise<string>

const directToolHandlers: Record<string, ToolHandler> = {
  'base64-encoder': (input, options) => transformBase64(input, options),
  'html-beautifier': input => {
    if (!input.trim()) throw new Error('Paste HTML markup to format.')
    return beautifyMarkup(input)
  },
  'markdown-to-html': input => {
    if (!input.trim()) throw new Error('Paste Markdown to convert.')
    return markdownToHtml(input)
  },
  'favicon-generator': (input, options) => {
    const label = [...(input.trim() || 'D')].slice(0, 3).join('')
    const isHexColor = (value: string | undefined) => Boolean(value && /^#(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i.test(value))
    const foreground = isHexColor(options.foreground) ? options.foreground : '#ffffff'
    const background = isHexColor(options.background) ? options.background : '#347a58'
    const shape = options.shape === 'circle' ? `<circle cx="128" cy="128" r="120" fill="${background}"/>` : `<rect width="256" height="256" rx="48" fill="${background}"/>`
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><title>${escapeHtml(label)} favicon</title>${shape}<text x="128" y="145" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif" font-size="${label.length > 2 ? 88 : 118}" font-weight="700" fill="${foreground}">${escapeHtml(label)}</text></svg>`
  },
  'xml-formatter': input => {
    if (!input.trim()) throw new Error('Paste XML data to format.')
    return formatXml(input)
  },
  'yaml-formatter': (input, options) => {
    if (!input.trim()) throw new Error('Paste YAML data to format.')
    const document = YAML.parseDocument(input, { uniqueKeys: true })
    if (document.errors.length) throw new Error(document.errors.map(error => error.message).join('\n'))
    const value = document.toJS()
    return YAML.stringify(options.sortKeys === 'true' ? sortObjectKeys(value) : value, { indent: Number(options.indent) || 2, lineWidth: 0 })
  },
}

export const genericToolSlugs = [...Object.keys(directToolHandlers), ...DATA_TOOL_SLUGS]

export async function runTool(slug: string, input: string, options: ToolOptions = {}): Promise<string> {
  const directHandler = directToolHandlers[slug]
  if (directHandler) return directHandler(input, options)
  const dataResult = await runDataTool(slug, input, options)
  if (dataResult !== null) return dataResult
  throw new Error('This catalog entry is pending implementation. See docs/tool-coverage.md for current status.')
}
