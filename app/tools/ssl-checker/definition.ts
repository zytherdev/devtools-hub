import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  "id": "ssl-checker",
  "name": "SSL Checker",
  "description": "Check SSL/TLS certificate details. Verify expiration, issuer, and security protocols.",
  "icon": "fa-solid fa-shield-alt",
  "color": "#10b981",
  "badge": "Planned",
  "href": "/ssl-checker",
  "categoryId": "security",
  "status": "planned",
  "exampleInput": "",
  "defaultOptions": {},
  "outputExtension": "txt"
}
