import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'hash-verifier',
  name: 'Hash Verifier',
  description: 'Compare text with an expected SHA-256, SHA-384, or SHA-512 digest locally using browser Web Crypto.',
  icon: 'fa-solid fa-fingerprint',
  color: '#ec4899',
  badge: '',
  href: '/hash-verifier',
  categoryId: 'security',
  status: 'implemented',
  exampleInput: 'The quick brown fox jumps over the lazy dog',
  defaultOptions: { algorithm: 'SHA-256' },
  outputExtension: 'txt',
}
