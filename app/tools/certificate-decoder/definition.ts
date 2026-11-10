import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  "id": "certificate-decoder",
  "name": "Certificate Decoder",
  "description": "Decode and inspect SSL/TLS certificates. View expiration, issuer, and details.",
  "icon": "fa-solid fa-certificate",
  "color": "#f59e0b",
  "badge": "Planned",
  "href": "/certificate-decoder",
  "categoryId": "security",
  "status": "planned",
  "exampleInput": "",
  "defaultOptions": {},
  "outputExtension": "txt"
}
