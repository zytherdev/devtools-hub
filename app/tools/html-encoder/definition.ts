import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  "id": "html-encoder",
  "name": "HTML Entity Encoder/Decoder",
  "description": "Encode and decode textual HTML character references; this does not parse or sanitize HTML documents.",
  "icon": "fa-solid fa-tags",
  "color": "#f97316",
  "badge": "",
  "href": "/html-encoder",
  "categoryId": "encoder",
  "status": "implemented",
  "exampleInput": "<div title=\"hello & welcome\">A &amp; B</div>",
  "defaultOptions": {
    "operation": "encode",
    "encodeNonAscii": "false"
  },
  "outputExtension": "txt"
}
