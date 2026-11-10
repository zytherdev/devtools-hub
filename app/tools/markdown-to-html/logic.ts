function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!)
}

function markdownInline(line: string): string {
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

function markdownToHtml(markdown: string): string {
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

export function run(input: string, _options: Record<string, string>): string {
  void _options
  if (!input.trim()) throw new Error('Paste Markdown to convert.')
  return markdownToHtml(input)
}
