import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'eta-calculator',
  name: 'ETA Calculator',
  description: 'Estimate a completion time from progress and elapsed time or a known throughput rate.',
  icon: 'fa-solid fa-hourglass-half',
  color: '#3b82f6',
  badge: '',
  href: '/eta-calculator',
  categoryId: 'date',
  status: 'implemented',
  exampleInput: '{\n  "progress": 40,\n  "elapsedMinutes": 120,\n  "asOf": "2026-01-01T12:00:00Z"\n}',
  defaultOptions: {},
  outputExtension: 'json',
}
