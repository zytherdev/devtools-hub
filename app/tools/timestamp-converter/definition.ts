import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'timestamp-converter',
  name: 'Conversor de timestamp',
  description: 'Converta datas ISO-8601 com fuso explícito e timestamps Unix em segundos ou milissegundos.',
  icon: 'fa-solid fa-clock',
  color: '#f59e0b',
  badge: '',
  href: '/timestamp-converter',
  categoryId: 'converter',
  status: 'implemented',
  exampleInput: '2026-01-01T00:00:00Z',
  defaultOptions: { mode: 'iso-to-epoch' },
  outputExtension: 'json',
}
