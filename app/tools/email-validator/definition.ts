import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  "id": "email-validator",
  "name": "Email Validator",
  "description": "Validate email addresses. Check format, domain, and deliverability.",
  "icon": "fa-solid fa-envelope",
  "color": "#3b82f6",
  "badge": "Planned",
  "href": "/email-validator",
  "categoryId": "security",
  "status": "planned",
  "exampleInput": "",
  "defaultOptions": {},
  "outputExtension": "txt"
}
