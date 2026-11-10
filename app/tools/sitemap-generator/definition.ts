import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'sitemap-generator',
  name: 'Sitemap Generator',
  description: 'Generate a validated XML sitemap from a list of absolute website URLs.',
  icon: 'fa-solid fa-sitemap',
  color: '#3b82f6',
  badge: '',
  href: '/sitemap-generator',
  categoryId: 'generator',
  status: 'implemented',
  exampleInput: 'https://example.com/\nhttps://example.com/about',
  defaultOptions: { changeFrequency: 'weekly', priority: '0.5', lastModified: '' },
  outputExtension: 'xml',
}
