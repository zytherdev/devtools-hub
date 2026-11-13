import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'http-status-codes',
  name: 'HTTP Status Codes',
  description: 'Search a curated local reference of standard HTTP status codes, descriptions, and response categories.',
  icon: 'fa-solid fa-code',
  color: '#3b82f6',
  badge: '',
  href: '/http-status-codes',
  categoryId: 'misc',
  status: 'implemented',
  exampleInput: '404',
  defaultOptions: { category: 'all' },
  outputExtension: 'json',
}
