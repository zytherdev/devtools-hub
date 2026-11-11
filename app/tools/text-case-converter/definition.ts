import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'text-case-converter',
  name: 'Text Case Converter',
  description: 'Convert text between camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, title case, sentence case, lowercase, and uppercase.',
  icon: 'fa-solid fa-font',
  color: '#14b8a6',
  badge: '',
  href: '/text-case-converter',
  categoryId: 'text',
  status: 'implemented',
  exampleInput: 'Hello, World! review 2:Text',
  defaultOptions: { mode: 'camel' },
  outputExtension: 'txt',
}
