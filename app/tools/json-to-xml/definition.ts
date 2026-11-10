import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  "id": "json-to-xml",
  "name": "JSON to XML Converter",
  "description": "Convert JSON data to XML format. Maintains structure and attributes.",
  "icon": "fa-solid fa-code",
  "color": "#3b82f6",
  "badge": "",
  "href": "/json-to-xml",
  "categoryId": "data",
  "status": "implemented",
  "exampleInput": "{\n  \"catalog\": { \"item\": [{ \"id\": 1 }, { \"id\": 2 }] }\n}",
  "defaultOptions": {
    "rootName": "root"
  },
  "outputExtension": "xml"
}
