import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  "id": "jwt-generator",
  "name": "JWT Generator",
  "description": "Generate and sign JWT tokens with custom payload and expiration.",
  "icon": "fa-solid fa-key",
  "color": "#ec4899",
  "badge": "",
  "href": "/jwt-generator",
  "categoryId": "encoder",
  "status": "implemented",
  "exampleInput": "{\"sub\":\"demo\",\"role\":\"developer\"}",
  "defaultOptions": {
    "secret": ""
  },
  "outputExtension": "txt"
}
