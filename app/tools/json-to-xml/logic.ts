function escapeXml(value: string) {
  return value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char]!)
}

function jsonValueToXml(value: unknown, name: string): string {
  const safeName = /^[A-Za-z_][\w.:-]*$/.test(name) ? name : 'item'
  if (Array.isArray(value)) return value.map(item => jsonValueToXml(item, safeName)).join('')
  if (value !== null && typeof value === 'object') {
    const children = Object.entries(value as Record<string, unknown>).map(([key, child]) => jsonValueToXml(child, key)).join('')
    return `<${safeName}>${children}</${safeName}>`
  }
  return `<${safeName}>${escapeXml(value === null ? '' : String(value))}</${safeName}>`
}

export function run(input: string, options: Record<string, string>): string {
  if (!input.trim()) throw new Error('Paste data to process.')
  const value: unknown = JSON.parse(input)
  const root = options.rootName || 'root'
  if (!/^[A-Za-z_][\w.:-]*$/.test(root)) throw new Error('Root element must be a valid XML name.')
  const wrapped = value !== null && typeof value === 'object' && !Array.isArray(value)
    ? Object.entries(value as Record<string, unknown>).map(([key, item]) => jsonValueToXml(item, key)).join('')
    : jsonValueToXml(value, 'item')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<${root}>${wrapped}</${root}>`
}
