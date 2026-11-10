import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'slug-generator',
  name: 'Gerador de slug',
  description: 'Converta texto em slugs seguros para URLs, preservando letras Unicode e removendo acentos combinantes.',
  icon: 'fa-solid fa-link',
  color: '#14b8a6',
  badge: '',
  href: '/slug-generator',
  categoryId: 'text',
  status: 'implemented',
  exampleInput: 'Olá, Mundo! Página número 2',
  defaultOptions: { separator: '-', maxLength: '80', lowercase: 'true' },
  outputExtension: 'txt',
}
