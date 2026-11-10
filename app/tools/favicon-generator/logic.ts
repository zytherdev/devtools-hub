export type ToolOptions = Record<string, string>

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!)
}

function isHexColor(value: string | undefined) {
  return Boolean(value && /^#(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i.test(value))
}

export function run(input: string, options: Record<string, string>): string {
  const label = [...(input.trim() || 'D')].slice(0, 3).join('')
  const foreground = isHexColor(options.foreground) ? options.foreground : '#ffffff'
  const background = isHexColor(options.background) ? options.background : '#347a58'
  const shape = options.shape === 'circle'
    ? `<circle cx="128" cy="128" r="120" fill="${background}"/>`
    : `<rect width="256" height="256" rx="48" fill="${background}"/>`

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><title>${escapeHtml(label)} favicon</title>${shape}<text x="128" y="145" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif" font-size="${label.length > 2 ? 88 : 118}" font-weight="700" fill="${foreground}">${escapeHtml(label)}</text></svg>`
}
