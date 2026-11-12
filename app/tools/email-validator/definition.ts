import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'email-validator',
  name: 'Email Validator',
  description: 'Validate one email address using local syntax and domain-label checks only; no DNS or deliverability checks are performed.',
  icon: 'fa-solid fa-envelope',
  color: '#3b82f6',
  badge: '',
  href: '/email-validator',
  categoryId: 'security',
  status: 'implemented',
  exampleInput: 'alex.lee+updates@example.co.uk',
  defaultOptions: {},
  outputExtension: 'json',
}
