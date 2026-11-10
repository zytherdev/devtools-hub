import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  "id": "csv-to-json",
  "name": "CSV to JSON Converter",
  "description": "Convert CSV data to JSON format with configurable delimiters and structure.",
  "icon": "fa-solid fa-table",
  "color": "#10b981",
  "badge": "",
  "href": "/csv-to-json",
  "categoryId": "data",
  "status": "implemented",
  "exampleInput": "name,score,active\nAda,42,true\nGrace,36,false",
  "defaultOptions": {
    "delimiter": ",",
    "headers": "true",
    "structure": "objects",
    "infer": "true",
    "trimHeaders": "true",
    "rowWidth": "pad",
    "blankRows": "skip",
    "indent": "2"
  },
  "outputExtension": "json"
}
