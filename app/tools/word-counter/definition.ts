import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'word-counter',
  name: 'Word Counter',
  description: 'Count words, characters, lines, paragraphs, and sentences in your text.',
  icon: 'fa-solid fa-calculator',
  color: '#8b5cf6',
  badge: '',
  href: '/word-counter',
  categoryId: 'text',
  status: 'implemented',
  exampleInput: 'Hello, world!\n\nCount words and characters.',
  defaultOptions: {},
  outputExtension: 'json',
}
