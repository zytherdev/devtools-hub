import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'uuid-generator',
  name: 'UUID Generator',
  description: 'Generate cryptographically secure UUID v4 identifiers locally.',
  icon: 'fa-solid fa-id-card',
  color: '#8b5cf6',
  badge: 'Implemented',
  href: '/uuid-generator',
  categoryId: 'generator',
  status: 'implemented',
  exampleInput: '',
  defaultOptions: { version: '4', count: '1' },
  outputExtension: 'txt',
}
