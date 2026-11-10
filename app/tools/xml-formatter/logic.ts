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

function formatXml(source: string) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(source, 'application/xml')
  const issue = doc.querySelector('parsererror')
  if (issue) throw new Error(issue.textContent?.replace(/\s+/g, ' ').trim() || 'Invalid XML document')
  const serialized = new XMLSerializer().serializeToString(doc)
  return beautifyMarkup(serialized.replace(/></g, '>\n<'))
}

export function run(input: string, options: Record<string, string>): string | Promise<string> {
  void options
  if (!input.trim()) throw new Error('Paste XML data to format.')
  return formatXml(input)
}
