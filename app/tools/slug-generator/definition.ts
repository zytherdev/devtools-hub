import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'slug-generator',
  name: 'Slug Generator',
  description: 'Convert text to URL-safe slugs, preserving Unicode letters and removing combining diacritical marks.',
  icon: 'fa-solid fa-link',
  color: '#14b8a6',
  badge: '',
  href: '/slug-generator',
  categoryId: 'text',
  status: 'implemented',
  exampleInput: 'Hello, World! Page number 2',
  defaultOptions: { separator: '-', maxLength: '80', lowercase: 'true' },
  outputExtension: 'txt',
}
