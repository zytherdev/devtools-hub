import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  "id": "unicode-converter",
  "name": "Unicode Converter",
  "description": "Convert between Unicode, UTF-8, UTF-16, and other encodings.",
  "icon": "fa-solid fa-language",
  "color": "#8b5cf6",
  "badge": "",
  "href": "/unicode-converter",
  "categoryId": "encoder",
  "status": "implemented",
  "exampleInput": "DevTools Hub — 🌱",
  "defaultOptions": {
    "operation": "encode",
    "format": "codepoint"
  },
  "outputExtension": "txt"
}
