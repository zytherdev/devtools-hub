import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  "id": "qr-generator",
  "name": "QR Code Generator",
  "description": "Generate QR codes from text, URLs, or any data. Download in multiple formats.",
  "icon": "fa-solid fa-qrcode",
  "color": "#059669",
  "badge": "Planned",
  "href": "/qr-generator",
  "categoryId": "generator",
  "status": "planned",
  "exampleInput": "",
  "defaultOptions": {},
  "outputExtension": "txt"
}
