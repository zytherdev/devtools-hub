import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'subnet-calculator',
  name: 'Subnet Calculator',
  description: 'Calculate network ranges and address details from IPv4 or IPv6 CIDR notation.',
  icon: 'fa-solid fa-network-wired',
  color: '#3b82f6',
  badge: '',
  href: '/subnet-calculator',
  categoryId: 'network',
  status: 'implemented',
  exampleInput: '192.168.1.10/24',
  defaultOptions: {},
  outputExtension: 'json',
}
