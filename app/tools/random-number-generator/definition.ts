import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'random-number-generator',
  name: 'Random Number Generator',
  description: 'Generate cryptographically secure, unbiased integers in a configurable range, with optional uniqueness.',
  icon: 'fa-solid fa-dice',
  color: '#f59e0b',
  badge: '',
  href: '/random-number-generator',
  categoryId: 'generator',
  status: 'implemented',
  exampleInput: '',
  defaultOptions: { min: '1', max: '100', count: '10', unique: 'false' },
  outputExtension: 'txt',
}
