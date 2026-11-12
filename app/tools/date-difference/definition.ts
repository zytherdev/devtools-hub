import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'date-difference',
  name: 'Date Difference Calculator',
  description: 'Compare two dates or explicit-offset date-times with calendar and elapsed-time differences.',
  icon: 'fa-solid fa-calendar-alt',
  color: '#8b5cf6',
  badge: '',
  href: '/date-difference',
  categoryId: 'date',
  status: 'implemented',
  exampleInput: '{\n  "start": "2024-02-29",\n  "end": "2025-03-01"\n}',
  defaultOptions: {},
  outputExtension: 'json'
}
