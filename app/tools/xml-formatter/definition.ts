import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  "id": "xml-formatter",
  "name": "XML Formatter",
  "description": "Format, validate, and minify XML data. Make your XML readable and debug with ease.",
  "icon": "fa-solid fa-code",
  "color": "#f97316",
  "badge": "",
  "href": "/xml-formatter",
  "categoryId": "data",
  "status": "implemented",
  "exampleInput": "<?xml version=\"1.0\"?><catalog><item id=\"1\"><name>DevTools</name><active>true</active></item></catalog>",
  "defaultOptions": {},
  "outputExtension": "xml"
}
