import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  "id": "favicon-generator",
  "name": "Favicon Generator",
  "description": "Create favicons from any image. Generate all sizes and formats for your website.",
  "icon": "fa-solid fa-star",
  "color": "#f59e0b",
  "badge": "",
  "href": "/favicon-generator",
  "categoryId": "html",
  "status": "implemented",
  "exampleInput": "DH",
  "defaultOptions": {
    "foreground": "#ffffff",
    "background": "#347a58",
    "shape": "rounded"
  },
  "outputExtension": "svg"
}
