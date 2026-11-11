import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'line-sorter',
  name: 'Ordenador de linhas',
  description: 'Sort lines alphabetically, numerically, or in reverse order, with an option to remove duplicates.',
  icon: 'fa-solid fa-sort',
  color: '#10b981',
  badge: '',
  href: '/line-sorter',
  categoryId: 'text',
  status: 'implemented',
  exampleInput: '10\n2\nApple\nbanana',
  defaultOptions: { order: 'alphabetical-asc', unique: 'false', trimWhitespace: 'false', ignoreEmpty: 'false' },
  outputExtension: 'txt',
}
