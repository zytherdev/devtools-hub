import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'remove-duplicate-lines',
  name: 'Remover linhas duplicadas',
  description: 'Remova linhas repetidas preservando a ordem e escolhendo regras de espaços e maiúsculas.',
  icon: 'fa-solid fa-eraser',
  color: '#ef4444',
  badge: '',
  href: '/remove-duplicate-lines',
  categoryId: 'text',
  status: 'implemented',
  exampleInput: 'maçã\nbanana\nmaçã\nlaranja',
  defaultOptions: { caseSensitive: 'true', trimWhitespace: 'false', keepEmpty: 'false' },
  outputExtension: 'txt',
}
