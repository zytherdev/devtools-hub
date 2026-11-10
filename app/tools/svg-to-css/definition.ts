import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'svg-to-css',
  name: 'SVG to CSS Converter',
  description: 'Convert SVG markup into CSS background, mask, content, or data URL output.',
  icon: 'fa-solid fa-image',
  color: '#f59e0b',
  badge: '',
  href: '/svg-to-css',
  categoryId: 'css',
  status: 'implemented',
  exampleInput: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>',
  defaultOptions: {},
  outputExtension: 'css'
}
