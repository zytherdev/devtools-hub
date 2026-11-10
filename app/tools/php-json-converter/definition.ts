import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  "id": "php-json-converter",
  "name": "PHP Array to JSON",
  "description": "Convert PHP arrays/serialized data to JSON format and vice versa.",
  "icon": "fa-brands fa-php",
  "color": "#777bb4",
  "badge": "",
  "href": "/php-json-converter",
  "categoryId": "data",
  "status": "implemented",
  "exampleInput": "array(\"name\" => \"Ada\", \"active\" => true, \"roles\" => array(\"editor\", \"admin\"))",
  "defaultOptions": {
    "format": "array",
    "indent": "2"
  },
  "outputExtension": "json"
}
