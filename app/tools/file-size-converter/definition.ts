import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'file-size-converter',
  name: 'Conversor de tamanho de arquivo',
  description: 'Converta tamanhos entre bytes, unidades decimais (KB–PB) e binárias (KiB–EiB).',
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
