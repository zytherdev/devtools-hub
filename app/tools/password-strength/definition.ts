import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'password-strength',
  name: 'Password Strength Checker',
  description: 'Estimate password strength locally and get practical improvement feedback. This heuristic is not a guarantee.',
  icon: 'fa-solid fa-shield-halved',
  color: '#10b981',
  badge: '',
  href: '/password-strength',
  categoryId: 'security',
  status: 'implemented',
  exampleInput: '',
  defaultOptions: {},
  outputExtension: 'txt',
}
