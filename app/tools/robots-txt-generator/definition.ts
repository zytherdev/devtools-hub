import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'robots-txt-generator',
  name: 'Robots.txt Generator',
  description: 'Generate a validated robots.txt file with user-agent, allow/disallow paths, sitemap URLs and crawl delay.',
  icon: 'fa-solid fa-robot',
  color: '#6b7280',
  badge: '',
  href: '/robots-txt-generator',
  categoryId: 'generator',
  status: 'implemented',
  exampleInput: '/admin/\n/private/',
  defaultOptions: { userAgent: '*', allow: '/', crawlDelay: '', sitemap: '' },
  outputExtension: 'txt',
}
