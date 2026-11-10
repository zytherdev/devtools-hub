const namedEntities: Record<string, string> = {
  amp: '&',
  apos: "'",
  cent: '¢',
  copy: '©',
  deg: '°',
  divide: '÷',
  eacute: 'é',
  Eacute: 'É',
  euro: '€',
  gt: '>',
  hellip: '…',
  laquo: '«',
  ldquo: '“',
  lsquo: '‘',
  lt: '<',
  mdash: '—',
  middot: '·',
  nbsp: '\u00A0',
  ndash: '–',
  para: '¶',
  pound: '£',
  plusmn: '±',
  quot: '"',
  raquo: '»',
  rdquo: '”',
  reg: '®',
  rsquo: '’',
  sect: '§',
  times: '×',
  trade: '™',
  yen: '¥',
}

export function decodeHTMLEntities(value: string): string {
  return value.replace(/&(#(?:x[\da-f]+|\d+)|[a-z][a-z\d]+);/gi, (full, reference: string) => {
    if (reference[0] !== '#') return namedEntities[reference] ?? full
    const isHex = reference[1]?.toLowerCase() === 'x'
    const number = Number.parseInt(reference.slice(isHex ? 2 : 1), isHex ? 16 : 10)
    if (!Number.isInteger(number) || number < 0 || number > 0x10ffff || (number >= 0xd800 && number <= 0xdfff)) {
      return '\uFFFD'
    }
    return String.fromCodePoint(number || 0xfffd)
  })
}

export function escapeJSXText(
  value: string,
): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export function escapeAttribute(
  value: string,
): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
