import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'ssl-checker',
  name: 'SSL Checker',
  description: 'Check validity dates and an optional hostname match from a pasted PEM certificate locally. No live TLS connection or trust-chain verification.',
  icon: 'fa-solid fa-shield-alt',
  color: '#10b981',
  badge: '',
  href: '/ssl-checker',
  categoryId: 'security',
  status: 'implemented',
  exampleInput: '',
  defaultOptions: {},
  outputExtension: 'txt',
}
