import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'cron-generator',
  name: 'Cron Expression Generator',
  description: 'Build a validated five-field cron expression and explain each schedule field.',
  icon: 'fa-solid fa-calendar-alt',
  color: '#14b8a6',
  badge: '',
  href: '/cron-generator',
  categoryId: 'generator',
  status: 'implemented',
  exampleInput: '',
  defaultOptions: { minute: '0', hour: '9', dayOfMonth: '*', month: '*', dayOfWeek: '1-5' },
  outputExtension: 'txt',
}
