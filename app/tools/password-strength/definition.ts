import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  "id": "password-strength",
  "name": "Password Strength Checker",
  "description": "Test password strength. Get feedback on security and suggestions for improvement.",
  "icon": "fa-solid fa-lock",
  "color": "#ef4444",
  "badge": "Planned",
  "href": "/password-strength",
  "categoryId": "security",
  "status": "planned",
  "exampleInput": "",
  "defaultOptions": {},
  "outputExtension": "txt"
}
