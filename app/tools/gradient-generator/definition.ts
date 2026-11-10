import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'gradient-generator',
  name: 'Gradient Generator',
  description: 'Create and preview linear, radial, and conic CSS gradients. Edit color stops, copy CSS, or download a .css file.',
  icon: 'fa-solid fa-fill-drip',
  color: '#8b5cf6',
  badge: '',
  href: '/gradient-generator',
  categoryId: 'css',
  status: 'implemented',
  exampleInput: '',
  defaultOptions: {},
  outputExtension: 'css'
}
