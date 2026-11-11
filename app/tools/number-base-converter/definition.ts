import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'number-base-converter',
  name: 'Number Base Converter',
  description: 'Convert signed integers between bases 2 and 36 without losing precision.',
  icon: 'fa-solid fa-rotate-right',
  color: '#6366f1',
  badge: '',
  href: '/number-base-converter',
  categoryId: 'converter',
  status: 'implemented',
  exampleInput: '255',
  defaultOptions: { fromBase: '10', toBase: '16' },
  outputExtension: 'txt',
}
