import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'currency-converter',
  name: 'Currency Converter',
  description: 'Convert currencies using only the rate you provide; no external exchange rates are fetched.',
  icon: 'fa-solid fa-dollar-sign',
  color: '#10b981',
  badge: '',
  href: '/currency-converter',
  categoryId: 'converter',
  status: 'implemented',
  exampleInput: '100',
  defaultOptions: { from: 'USD', to: 'EUR', rate: '1', precision: '2' },
  outputExtension: 'json',
}
