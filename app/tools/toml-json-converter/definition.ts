import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  "id": "toml-json-converter",
  "name": "TOML to JSON Converter",
  "description": "Convert TOML configuration files to JSON and vice versa.",
  "icon": "fa-solid fa-cog",
  "color": "#6b7280",
  "badge": "",
  "href": "/toml-json-converter",
  "categoryId": "data",
  "status": "implemented",
  "exampleInput": "[server]\nhost = \"localhost\"\nport = 8080\n",
  "defaultOptions": {
    "direction": "toml-to-json",
    "indent": "2"
  },
  "outputExtension": "txt"
}
