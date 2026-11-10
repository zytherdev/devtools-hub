import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  "id": "xml-to-json",
  "name": "XML to JSON Converter",
  "description": "Convert XML data to JSON format. Transform structured data easily.",
  "icon": "fa-solid fa-arrows-h",
  "color": "#8b5cf6",
  "badge": "",
  "href": "/xml-to-json",
  "categoryId": "data",
  "status": "implemented",
  "exampleInput": "<catalog><item id=\"1\"><name>DevTools</name></item><item id=\"2\"><name>Hub</name></item></catalog>",
  "defaultOptions": {},
  "outputExtension": "json"
}
