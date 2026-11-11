import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'file-size-converter',
  name: 'File Size Converter',
  description: 'Convert sizes between bytes, decimal units (KB–PB), and binary units (KiB–EiB).',
  icon: 'fa-solid fa-hdd',
  color: '#6b7280',
  badge: '',
  href: '/file-size-converter',
  categoryId: 'converter',
  status: 'implemented',
  exampleInput: '1536',
  defaultOptions: { from: 'B', to: 'KiB', precision: '3' },
  outputExtension: 'json',
}
