import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  "id": "color-converter",
  "name": "Color Converter",
  "description": "Convert HEX, RGB, HSL, HSV, CMYK, and supported named colors. Preview WCAG contrast and hue harmonies.",
  "icon": "fa-solid fa-palette",
  "color": "#ec4899",
  "badge": "",
  "href": "/color-converter",
  "categoryId": "converter",
  "status": "implemented",
  "exampleInput": "#3b82f6",
  "defaultOptions": { "format": "hex" },
  "outputExtension": "txt"
}
