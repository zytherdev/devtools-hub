import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  "id": "curl-to-code",
  "name": "cURL to Code",
  "description": "Convert supported cURL commands to JavaScript, Python, PHP, Go, Ruby, Java, or C# code.",
  "icon": "fa-solid fa-terminal",
  "color": "#0f1724",
  "badge": "",
  "href": "/curl-to-code",
  "categoryId": "js",
  "status": "implemented",
  "exampleInput": "curl -X POST https://api.example.com/items -H \"Content-Type: application/json\" -d '{\"name\":\"Ada\"}'",
  "defaultOptions": {},
  "outputExtension": "js"
}
