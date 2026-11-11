import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'remove-duplicate-lines',
  name: 'Remover linhas duplicadas',
  description: 'Remove duplicate lines while preserving order and choosing whitespace and case-comparison rules.',
  icon: 'fa-solid fa-eraser',
  color: '#ef4444',
  badge: '',
  href: '/remove-duplicate-lines',
  categoryId: 'text',
  status: 'implemented',
  exampleInput: 'apple\nbanana\napple\norange',
  defaultOptions: { caseSensitive: 'true', trimWhitespace: 'false', keepEmpty: 'false' },
  outputExtension: 'txt',
}
