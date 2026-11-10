import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  "id": "yaml-formatter",
  "name": "YAML Formatter",
  "description": "Format and validate YAML data. Perfect for configuration files.",
  "icon": "fa-solid fa-code",
  "color": "#14b8a6",
  "badge": "",
  "href": "/yaml-formatter",
  "categoryId": "data",
  "status": "implemented",
  "exampleInput": "name: DevTools Hub\nversion: 1\ntools:\n  - formatter\n  - converter\nprivate: true",
  "defaultOptions": {
    "indent": "2",
    "sortKeys": "false"
  },
  "outputExtension": "yaml"
}
