import YAML from 'yaml'

export function run(input: string, options: Record<string, string>): string {
  if (!input.trim()) throw new Error('Paste data to process.')
  const indent = Math.max(1, Math.min(8, Number(options.indent) || 2))
  return JSON.stringify(YAML.parse(input), null, indent)
}
