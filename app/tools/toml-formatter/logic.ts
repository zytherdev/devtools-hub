import * as TOML from '@iarna/toml'

export function run(input: string, _options: Record<string, string>): string {
  void _options
  if (!input.trim()) throw new Error('Paste data to process.')
  return TOML.stringify(TOML.parse(input) as TOML.JsonMap)
}
