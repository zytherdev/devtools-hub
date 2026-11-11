import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'chmod-calculator',
  name: 'Chmod Calculator',
  description: 'Convert Unix/Linux octal modes to symbolic permissions and owner/group/others values.',
  icon: 'fa-solid fa-terminal',
  color: '#0f1724',
  badge: '',
  href: '/chmod-calculator',
  categoryId: 'database',
  status: 'implemented',
  exampleInput: '755',
  defaultOptions: {},
  outputExtension: 'json',
}
