import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'text-case-converter',
  name: 'Conversor de caixa de texto',
  description: 'Converta texto entre camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, título, frase, minúsculas e maiúsculas.',
  icon: 'fa-solid fa-font',
  color: '#14b8a6',
  badge: 'Implementado',
  href: '/text-case-converter',
  categoryId: 'text',
  status: 'implemented',
  exampleInput: 'Olá, Mundo! revisão 2:Texto',
  defaultOptions: { mode: 'camel' },
  outputExtension: 'txt',
}
