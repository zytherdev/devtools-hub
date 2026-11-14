import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'bip39-generator',
  name: 'BIP39 Mnemonic Generator',
  description: 'Generate standard English BIP39 mnemonics locally from cryptographically secure browser entropy.',
  icon: 'fa-solid fa-coins',
  color: '#f59e0b',
  badge: '',
  href: '/bip39-generator',
  categoryId: 'misc',
  status: 'implemented',
  exampleInput: '',
  defaultOptions: { strength: '128' },
  outputExtension: 'txt',
}
