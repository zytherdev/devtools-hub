import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  "id": "base64-encoder",
  "name": "Base64 Encoder/Decoder",
  "description": "Encode or decode Unicode text as UTF-8 Base64, with URL-safe alphabet and padding controls.",
  "icon": "fa-solid fa-lock",
  "color": "#3b82f6",
  "badge": "",
  "href": "/base64-encoder",
  "categoryId": "encoder",
  "status": "implemented",
  "exampleInput": "DevTools Hub — text is encoded as UTF-8.",
  "defaultOptions": {
    "operation": "encode",
    "urlSafe": "false",
    "padding": "true",
    "allowWhitespace": "false",
    "allowUnpadded": "false"
  },
  "outputExtension": "txt"
}
