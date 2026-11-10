import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  "id": "ip-lookup",
  "name": "IP Lookup",
  "description": "Get information about any IP address. Location, ISP, and more details.",
  "icon": "fa-solid fa-map-pin",
  "color": "#8b5cf6",
  "badge": "Planned",
  "href": "/ip-lookup",
  "categoryId": "network",
  "status": "planned",
  "exampleInput": "",
  "defaultOptions": {},
  "outputExtension": "txt"
}
