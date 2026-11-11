import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'diff-checker',
  name: 'Diff Checker',
  description: 'Compare two texts line by line and review inserted, removed, and unchanged lines.',
  icon: 'fa-solid fa-code-branch',
  color: '#f59e0b',
  badge: '',
  href: '/diff-checker',
  categoryId: 'text',
  status: 'implemented',
  exampleInput: 'constante=1\n---8<---\nconstante=2',
  defaultOptions: {},
  outputExtension: 'txt',
}
