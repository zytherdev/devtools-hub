import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'mac-lookup',
  name: 'MAC Address Lookup',
  description: 'Look up a registered vendor from a MAC address or OUI prefix.',
  icon: 'fa-solid fa-ethernet',
  color: '#06b6d4',
  badge: '',
  href: '/mac-lookup',
  categoryId: 'network',
  status: 'implemented',
  exampleInput: '00:11:22:AA:BB:CC',
  defaultOptions: {},
  outputExtension: 'json',
}
