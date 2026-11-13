import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  "id": "aes-encryptor",
  "name": "AES Encryptor/Decryptor",
  "description": "Encrypt and decrypt text locally with password-derived AES-256-GCM.",
  "icon": "fa-solid fa-lock",
  "color": "#8b5cf6",
  "badge": "",
  "href": "/aes-encryptor",
  "categoryId": "security",
  "status": "implemented",
  "exampleInput": "",
  "defaultOptions": {},
  "outputExtension": "txt"
}
