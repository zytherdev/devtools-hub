import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  "id": "html-minifier",
  "name": "HTML Minifier",
  "description": "Clean and compress HTML markup. Reduce file size while maintaining functionality.",
  "icon": "fa-brands fa-html5",
  "color": "#f97316",
  "badge": "Beta",
  "href": "/html-minifier",
  "categoryId": "html",
  "status": "implemented",
  "exampleInput": "",
  "defaultOptions": {},
  "outputExtension": "txt"
}
