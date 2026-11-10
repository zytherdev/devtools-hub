import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  "id": "csv-formatter",
  "name": "CSV Formatter",
  "description": "Format and validate CSV data. Preview tables and handle delimiters.",
  "icon": "fa-solid fa-table",
  "color": "#6366f1",
  "badge": "",
  "href": "/csv-formatter",
  "categoryId": "data",
  "status": "implemented",
  "exampleInput": "name,category,free\nJSON Formatter,data,true\nUUID Generator,generator,true",
  "defaultOptions": {
    "delimiter": ","
  },
  "outputExtension": "csv"
}
