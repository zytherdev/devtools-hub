const namedEntities: Record<string, string> = {
  amp: '&',
  apos: "'",
  gt: '>',
  lt: '<',
  quot: '"',
  nbsp: '\u00A0',
}

export function decodeHTMLEntities(
  value: string,
): string {
  return value
    .replace(
      /&([a-zA-Z][a-zA-Z0-9]+);/g,
      (full, name: string) =>
        namedEntities[name] ?? full,
    )
    .replace(
      /&#(\d+);/g,
      (full, code: string) => {
        const number = Number(code)

        return Number.isFinite(number)
          ? String.fromCodePoint(number)
          : full
      },
    )
    .replace(
      /&#x([0-9a-fA-F]+);/g,
      (full, code: string) => {
        const number = parseInt(code, 16)

        return Number.isFinite(number)
          ? String.fromCodePoint(number)
          : full
      },
    )
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