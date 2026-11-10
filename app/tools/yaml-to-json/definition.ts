import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  "id": "yaml-to-json",
  "name": "YAML to JSON Converter",
  "description": "Convert YAML data to JSON format. Great for configuration migration.",
  "icon": "fa-solid fa-arrows-h",
  "color": "#10b981",
  "badge": "",
  "href": "/yaml-to-json",
  "categoryId": "data",
  "status": "implemented",
  "exampleInput": "app:\n  name: DevTools Hub\n  version: 1\nfeatures:\n  - private\n  - fast",
  "defaultOptions": {},
  "outputExtension": "json"
}
