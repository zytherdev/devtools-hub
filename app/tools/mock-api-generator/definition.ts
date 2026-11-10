import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'mock-api-generator',
  name: 'Gerador de API Mock',
  description: 'Gere fixtures JSON a partir de um objeto-template, com identificadores incrementais e wrapper configurável.',
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
