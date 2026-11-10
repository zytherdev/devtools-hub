import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  "id": "hash-verifier",
  "name": "Hash Verifier",
  "description": "Verify file or text integrity by comparing hash values. Support MD5, SHA-1, SHA-256.",
  "icon": "fa-solid fa-check-double",
  "color": "#8b5cf6",
  "badge": "Planned",
  "href": "/hash-verifier",
  "categoryId": "security",
  "status": "planned",
  "exampleInput": "",
  "defaultOptions": {},
  "outputExtension": "txt"
}
