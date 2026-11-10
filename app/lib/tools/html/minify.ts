function normalizeTag(raw: string): string {
  let result = ''
  let quote: '"' | "'" | null = null
  let escaped = false
  let pendingSpace = false
  for (const char of raw.trim()) {
    if (quote) { result += char; if (escaped) escaped = false; else if (char === '\\') escaped = true; else if (char === quote) quote = null; continue }
    if (char === '"' || char === "'") { if (pendingSpace && result && !/[<\/]/.test(result.at(-1) ?? '')) result += ' '; pendingSpace = false; quote = char; result += char; continue }
    if (/\s/.test(char)) { pendingSpace = true; continue }
    if (char === '=' || char === '>' || char === '/') { result = result.replace(/\s+$/, ''); pendingSpace = false; result += char; continue }
    if (pendingSpace && result && !/[<\/]/.test(result.at(-1) ?? '')) result += ' '
    pendingSpace = false; result += char
  }
  return result
}

export function minifyHTML(code: string): string { return safelyMinifyHTML(code) }
export function minifyHTML2(code: string): string { return safelyMinifyHTML(code) }

function safelyMinifyHTML(code: string): string {
  if (typeof code !== 'string' || !code) return ''
  let output = ''
  let i = 0
  let rawElement: string | null = null
  while (i < code.length) {
    if (rawElement) {
      const close = code.toLowerCase().indexOf(`</${rawElement}`, i)
      if (close < 0) { output += code.slice(i); break }
      output += code.slice(i, close)
      i = close
      rawElement = null
      continue
    }
    if (code.startsWith('<!--', i)) {
      const end = code.indexOf('-->', i + 4)
      const endIndex = end < 0 ? code.length : end + 3
      const comment = code.slice(i, endIndex)
      if (/^<!--\s*\[if\s/i.test(comment) || comment.startsWith('<!--!')) output += comment
      i = endIndex; continue
    }
    if (code[i] === '<' && /[A-Za-z!?/]/.test(code[i + 1] ?? '')) {
      let end = i + 1
      let quote: '"' | "'" | null = null
      let escaped = false
      while (end < code.length) {
        const char = code[end]
        if (quote) { if (escaped) escaped = false; else if (char === '\\') escaped = true; else if (char === quote) quote = null }
        else if (char === '"' || char === "'") quote = char
        else if (char === '>') break
        end++
      }
      if (end < code.length) {
        const tag = normalizeTag(code.slice(i, end + 1))
        output += tag
        const rawMatch = tag.match(/^<\s*(script|style|textarea|pre)(?:\s|>)/i)
        if (rawMatch && !/\/>$/.test(tag)) rawElement = rawMatch[1].toLowerCase()
        i = end + 1
        continue
      }
    }
    output += code[i]; i++
  }
  return output
}
