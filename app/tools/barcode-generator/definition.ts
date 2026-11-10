import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'barcode-generator',
  name: 'Barcode Generator',
  description: 'Generate local SVG barcodes in common retail and general-purpose formats.',
  icon: 'fa-solid fa-barcode',
  color: '#3b82f6',
  badge: '',
  href: '/barcode-generator',
  categoryId: 'generator',
  status: 'implemented',
  exampleInput: 'DEMO-12345',
  defaultOptions: { format: 'code128', scale: '3', height: '12', includeText: 'true' },
  outputExtension: 'svg',
}
