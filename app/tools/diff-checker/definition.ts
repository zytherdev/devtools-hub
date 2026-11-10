import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'diff-checker',
  name: 'Verificador de diferenças',
  description: 'Compare dois textos linha a linha e veja inserções, remoções e linhas comuns.',
  icon: 'fa-solid fa-code-branch',
  color: '#f59e0b',
  badge: 'Implemented',
  href: '/diff-checker',
  categoryId: 'text',
  status: 'implemented',
  exampleInput: 'constante=1\n---8<---\nconstante=2',
  defaultOptions: {},
  outputExtension: 'txt',
}
