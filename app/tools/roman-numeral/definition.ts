import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'roman-numeral',
  name: 'Conversor de algarismos romanos',
  description: 'Converta números inteiros de 1 a 3999 entre algarismos arábicos e romanos canônicos.',
  icon: 'fa-solid fa-roman-numeral',
  color: '#8b5cf6',
  badge: '',
  href: '/roman-numeral',
  categoryId: 'converter',
  status: 'implemented',
  exampleInput: '2024',
  defaultOptions: { mode: 'arabic-to-roman' },
  outputExtension: 'txt',
}
