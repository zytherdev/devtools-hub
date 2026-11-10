import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  "id": "hash-generator",
  "name": "Hash Generator",
  "description": "Generate MD5, SHA-1, SHA-256, SHA-384, and SHA-512 hashes from your text.",
  "icon": "fa-solid fa-fingerprint",
  "color": "#ec4899",
  "badge": "Planned",
  "href": "/hash-generator",
  "categoryId": "security",
  "status": "planned",
  "exampleInput": "",
  "defaultOptions": {},
  "outputExtension": "txt"
}
