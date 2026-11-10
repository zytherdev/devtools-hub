import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'unit-converter',
  name: 'Conversor de unidades',
  description: 'Converta medidas de comprimento, massa, temperatura, área, volume e tempo.',
  icon: 'fa-solid fa-arrows-alt-h',
  color: '#10b981',
  badge: '',
  href: '/unit-converter',
  categoryId: 'converter',
  status: 'implemented',
  exampleInput: '1500',
  defaultOptions: { from: 'm', to: 'km', precision: '4' },
  outputExtension: 'json',
}
