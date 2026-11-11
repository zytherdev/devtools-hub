import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'timestamp-converter',
  name: 'Timestamp Converter',
  description: 'Convert ISO-8601 dates with explicit time zones and Unix timestamps in seconds or milliseconds.',
  icon: 'fa-solid fa-clock',
  color: '#f59e0b',
  badge: '',
  href: '/timestamp-converter',
  categoryId: 'converter',
  status: 'implemented',
  exampleInput: '2026-01-01T00:00:00Z',
  defaultOptions: { mode: 'iso-to-epoch' },
  outputExtension: 'json',
}
