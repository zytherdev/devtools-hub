import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'css-minifier',
  name: 'CSS Minifier',
  description: 'Minify CSS whitespace and comments while preserving selectors, strings, and custom property values.',
  icon: 'fa-brands fa-css3-alt',
  color: '#3b82f6',
  badge: '',
  href: '/css-minifier',
  categoryId: 'css',
  status: 'implemented',
  exampleInput: '.card { color: #222; padding: 1rem; }',
  defaultOptions: {},
  outputExtension: 'css',
}
