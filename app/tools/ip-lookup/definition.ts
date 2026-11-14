import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'ip-lookup',
  name: 'IP Lookup',
  description: 'Look up approximate location and network details for a public IPv4 or IPv6 address.',
  icon: 'fa-solid fa-map-pin',
  color: '#8b5cf6',
  badge: '',
  href: '/ip-lookup',
  categoryId: 'network',
  status: 'implemented',
  exampleInput: '8.8.8.8',
  defaultOptions: {},
  outputExtension: 'json',
}
