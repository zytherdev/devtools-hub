function minifyCSSSafely(code: string): string {
  if (typeof code !== 'string' || !code) return ''
  // Whitespace is part of custom-property token streams; don't rewrite them with this lightweight minifier.
  if (/(?:^|[;{])\s*--[\w-]+\s*:/.test(code)) return code.trim()
  let output = ''
  let quote: '"' | "'" | null = null
  let escaped = false
  let pendingSpace = false
  let i = 0
  const trimPunctuation = /[{}:;,()[\]<>~]/
  while (i < code.length) {
    const char = code[i]
    if (quote) {
      output += char
      if (escaped) escaped = false
      else if (char === '\\') escaped = true
      else if (char === quote) quote = null
      i++; continue
    }
    if (char === '"' || char === "'") {
      if (pendingSpace && output && !trimPunctuation.test(output.at(-1) ?? '') && !trimPunctuation.test(char)) output += ' '
      pendingSpace = false; quote = char; output += char; i++; continue
    }
    if (char === '/' && code[i + 1] === '*') {
      const end = code.indexOf('*/', i + 2)
      const commentEnd = end < 0 ? code.length : end + 2
      const comment = code.slice(i, commentEnd)
      if (comment.startsWith('/*!')) {
        if (pendingSpace && output && !trimPunctuation.test(output.at(-1) ?? '')) output += ' '
        output += comment
      } else if (/[\w#.%_-]/.test(output.at(-1) ?? '') && /[\w#.%_-]/.test(code[commentEnd] ?? '')) pendingSpace = true
      i = commentEnd; continue
    }
    if (/\s/.test(char)) { pendingSpace = true; i++; continue }
    const previous = output.at(-1) ?? ''
    const punctuation = trimPunctuation.test(char) || trimPunctuation.test(previous)
    if (pendingSpace && output && !punctuation) output += ' '
    pendingSpace = false
    output += char; i++
  }
  return output.trim()
}

export function minifyCSS(code: string): string { return minifyCSSSafely(code) }
export function minifyCSS2(code: string): string { return minifyCSSSafely(code) }
