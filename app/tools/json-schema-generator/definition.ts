import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  "id": "json-schema-generator",
  "name": "JSON Schema Generator",
  "description": "Generate JSON Schema from your JSON data. Validate and document your API responses.",
  "icon": "fa-solid fa-diagram-project",
  "color": "#8b5cf6",
  "badge": "",
  "href": "/json-schema-generator",
  "categoryId": "data",
  "status": "implemented",
  "exampleInput": "{\n  \"name\": \"Ada\",\n  \"active\": true,\n  \"roles\": [\"editor\", \"admin\"]\n}",
  "defaultOptions": {
    "draft": "2020-12",
    "required": "observed",
    "additionalProperties": "true",
    "indent": "2",
    "title": "Example"
  },
  "outputExtension": "json"
}
