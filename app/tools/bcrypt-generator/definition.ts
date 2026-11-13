import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'bcrypt-generator',
  name: 'Bcrypt Generator',
  description: 'Generate and verify bcrypt password hashes locally in your browser.',
  icon: 'fa-solid fa-shield-alt',
  color: '#10b981',
  badge: '',
  href: '/bcrypt-generator',
  categoryId: 'security',
  status: 'implemented',
  exampleInput: '',
  defaultOptions: { action: 'hash', cost: '10' },
  outputExtension: 'txt',
}
