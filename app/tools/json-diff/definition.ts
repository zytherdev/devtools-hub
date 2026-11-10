import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'json-diff',
  name: 'Comparador de JSON',
  description: 'Compare dois valores JSON e identifique campos adicionados, removidos ou alterados.',
  icon: 'fa-solid fa-code',
  color: '#8b5cf6',
  badge: '',
  href: '/json-diff',
  categoryId: 'text',
  status: 'implemented',
  exampleInput: '{\n  "before": { "name": "Ada", "role": "engineer" },\n  "after": { "name": "Ada Lovelace", "active": true }\n}',
  defaultOptions: {},
  outputExtension: 'json',
}
