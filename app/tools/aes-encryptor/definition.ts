import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  "id": "aes-encryptor",
  "name": "AES Encryptor/Decryptor",
  "description": "Encrypt and decrypt text using AES-256-GCM or other modes.",
  "icon": "fa-solid fa-lock",
  "color": "#8b5cf6",
  "badge": "Planned",
  "href": "/aes-encryptor",
  "categoryId": "security",
  "status": "planned",
  "exampleInput": "",
  "defaultOptions": {},
  "outputExtension": "txt"
}
