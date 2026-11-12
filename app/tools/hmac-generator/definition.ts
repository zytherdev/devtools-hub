import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'hmac-generator',
  name: 'HMAC Generator',
  description: 'Generate SHA-256, SHA-384, or SHA-512 HMACs locally with a secret key and browser Web Crypto.',
  icon: 'fa-solid fa-key',
  color: '#ec4899',
  badge: '',
  href: '/hmac-generator',
  categoryId: 'security',
  status: 'implemented',
  exampleInput: 'The quick brown fox jumps over the lazy dog',
  defaultOptions: {
    secretKey: '',
    algorithm: 'SHA-256',
    encoding: 'hex',
  },
  outputExtension: 'txt',
}
