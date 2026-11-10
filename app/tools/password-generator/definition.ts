import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'password-generator',
  name: 'Password Generator',
  description: 'Generate cryptographically secure passwords locally. Generated secrets are not saved or sent.',
  icon: 'fa-solid fa-key',
  color: '#ef4444',
  badge: '',
  href: '/password-generator',
  categoryId: 'generator',
  status: 'implemented',
  exampleInput: '',
  defaultOptions: {
    length: '20',
    count: '1',
    uppercase: 'true',
    lowercase: 'true',
    numbers: 'true',
    symbols: 'true',
    excludeAmbiguous: 'false',
  },
  outputExtension: 'txt',
}
