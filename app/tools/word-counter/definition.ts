import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'word-counter',
  name: 'Word Counter',
  description: 'Conte palavras, caracteres, linhas, parágrafos e frases do seu texto.',
  icon: 'fa-solid fa-calculator',
  color: '#8b5cf6',
  badge: 'Implemented',
  href: '/word-counter',
  categoryId: 'text',
  status: 'implemented',
  exampleInput: 'Olá, mundo!\n\nConte palavras e caracteres.',
  defaultOptions: {},
  outputExtension: 'json',
}
