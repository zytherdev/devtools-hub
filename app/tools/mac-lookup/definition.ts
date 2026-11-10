import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  "id": "mac-lookup",
  "name": "MAC Address Lookup",
  "description": "Look up manufacturer information from MAC addresses (OUI lookup).",
  "icon": "fa-solid fa-ethernet",
  "color": "#06b6d4",
  "badge": "Planned",
  "href": "/mac-lookup",
  "categoryId": "network",
  "status": "planned",
  "exampleInput": "",
  "defaultOptions": {},
  "outputExtension": "txt"
}
