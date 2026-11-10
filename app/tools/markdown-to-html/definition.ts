import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  "id": "markdown-to-html",
  "name": "Markdown to HTML",
  "description": "Convert Markdown to HTML instantly. Preview the result in real-time.",
  "icon": "fa-solid fa-markdown",
  "color": "#6b7280",
  "badge": "",
  "href": "/markdown-to-html",
  "categoryId": "html",
  "status": "implemented",
  "exampleInput": "# Hello, developer\n\nTurn **Markdown** into HTML.\n\n- Fast\n- In your browser\n\n[Learn more](https://example.com)",
  "defaultOptions": {},
  "outputExtension": "html"
}
