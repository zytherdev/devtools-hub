import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'ascii-converter',
  name: 'ASCII Converter',
  description: 'Convert ASCII characters to decimal, hexadecimal, or binary codes and decode codes back to ASCII.',
  icon: 'fa-solid fa-code',
  color: '#f97316',
  badge: '',
  href: '/ascii-converter',
  categoryId: 'encoder',
  status: 'implemented',
  exampleInput: 'ASCII',
  defaultOptions: {
    mode: 'text-to-codes',
    base: 'decimal',
  },
  outputExtension: 'txt',
}
