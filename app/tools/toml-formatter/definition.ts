import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  "id": "toml-formatter",
  "name": "TOML Formatter",
  "description": "Format and validate TOML configuration files.",
  "icon": "fa-solid fa-cog",
  "color": "#6b7280",
  "badge": "",
  "href": "/toml-formatter",
  "categoryId": "data",
  "status": "implemented",
  "exampleInput": "name=\"DevTools Hub\"\nversion=1\n\n[tools]\ncount=5\nprivate=true",
  "defaultOptions": {},
  "outputExtension": "toml"
}
