import YAML from 'yaml'

function sortObjectKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortObjectKeys)
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).sort(([left], [right]) => left.localeCompare(right)).map(([key, item]) => [key, sortObjectKeys(item)]))
  return value
}

export function run(input: string, options: Record<string, string>): string {
  if (!input.trim()) throw new Error('Paste YAML data to format.')
  const document = YAML.parseDocument(input, { uniqueKeys: true })
  if (document.errors.length) throw new Error(document.errors.map(error => error.message).join('\n'))
  const value = document.toJS()
  return YAML.stringify(options.sortKeys === 'true' ? sortObjectKeys(value) : value, { indent: Number(options.indent) || 2, lineWidth: 0 })
}
