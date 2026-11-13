import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'rsa-key-generator',
  name: 'RSA Key Pair Generator',
  description: 'Generate RSA key pairs locally in your browser with the Web Crypto API.',
  icon: 'fa-solid fa-lock',
  color: '#ef4444',
  badge: '',
  href: '/rsa-key-generator',
  categoryId: 'security',
  status: 'implemented',
  exampleInput: '',
  defaultOptions: {
    modulusLength: '2048',
    algorithm: 'RSA-OAEP',
    format: 'pem',
  },
  outputExtension: 'txt',
}
