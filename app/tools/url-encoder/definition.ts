import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  "id": "url-encoder",
  "name": "URL Encoder/Decoder",
  "description": "Encode and decode URL components with UTF-8 percent-encoding; does not parse or normalize full URLs.",
  "icon": "fa-solid fa-link",
  "color": "#06b6d4",
  "badge": "",
  "href": "/url-encoder",
  "categoryId": "encoder",
  "status": "implemented",
  "exampleInput": "Hello, world! & 100%",
  "defaultOptions": {
    "operation": "encode"
  },
  "outputExtension": "txt"
}
