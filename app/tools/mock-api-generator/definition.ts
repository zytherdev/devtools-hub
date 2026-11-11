import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'mock-api-generator',
  name: 'Mock API Generator',
  description: 'Generate JSON fixtures from a template object, with incremental identifiers and a configurable wrapper.',
  icon: 'fa-solid fa-server',
  color: '#06b6d4',
  badge: '',
  href: '/mock-api-generator',
  categoryId: 'generator',
  status: 'implemented',
  exampleInput: '{\n  "name": "Ada",\n  "role": "engineer"\n}',
  defaultOptions: { count: '3', wrapper: 'data', idField: 'id' },
  outputExtension: 'json',
}
