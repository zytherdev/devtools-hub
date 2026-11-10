import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  "id": "html-beautifier",
  "name": "HTML Beautifier",
  "description": "Format and prettify your HTML code. Make it readable with proper indentation.",
  "icon": "fa-solid fa-brush",
  "color": "#fb923c",
  "badge": "",
  "href": "/html-beautifier",
  "categoryId": "html",
  "status": "implemented",
  "exampleInput": "<main><h1>Tools</h1><p>Format this markup.</p><ul><li>Fast</li><li>Private</li></ul></main>",
  "defaultOptions": {},
  "outputExtension": "txt"
}
