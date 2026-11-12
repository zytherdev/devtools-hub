import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'cron-validator',
  name: 'Cron Validator',
  description: 'Check a five-field numeric cron expression for valid syntax and field bounds.',
  icon: 'fa-solid fa-clock',
  color: '#f59e0b',
  badge: '',
  href: '/cron-validator',
  categoryId: 'date',
  status: 'implemented',
  exampleInput: '*/15 9-17 * * 1-5',
  defaultOptions: {},
  outputExtension: 'txt'
}
