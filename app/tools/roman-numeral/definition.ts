import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'roman-numeral',
  name: 'Roman Numeral Converter',
  description: 'Convert integers from 1 to 3999 between Arabic numbers and canonical Roman numerals.',
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
