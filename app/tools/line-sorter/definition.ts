import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'line-sorter',
  name: 'Ordenador de linhas',
  description: 'Ordene linhas em ordem alfabética, numérica ou reversa, com opção para remover duplicatas.',
  icon: 'fa-solid fa-sort',
  color: '#10b981',
  badge: '',
  href: '/line-sorter',
  categoryId: 'text',
  status: 'implemented',
  exampleInput: '10\n2\nMaçã\nbanana',
  defaultOptions: { order: 'alphabetical-asc', unique: 'false', trimWhitespace: 'false', ignoreEmpty: 'false' },
  outputExtension: 'txt',
}
