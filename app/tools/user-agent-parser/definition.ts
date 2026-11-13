import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  "id": "user-agent-parser",
  "name": "User Agent Parser",
  "description": "Parse browser, engine, operating-system, and device details from common user-agent strings locally.",
  "icon": "fa-solid fa-user",
  "color": "#06b6d4",
  "badge": "",
  "href": "/user-agent-parser",
  "categoryId": "network",
  "status": "implemented",
  "exampleInput": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "defaultOptions": {},
  "outputExtension": "json"
}
