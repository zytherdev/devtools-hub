import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  "id": "barcode-generator",
  "name": "Barcode Generator",
  "description": "Generate various barcode formats (EAN-13, CODE128, etc.). Perfect for inventory and labels.",
  "icon": "fa-solid fa-barcode",
  "color": "#3b82f6",
  "badge": "Planned",
  "href": "/barcode-generator",
  "categoryId": "generator",
  "status": "planned",
  "exampleInput": "",
  "defaultOptions": {},
  "outputExtension": "txt"
}
