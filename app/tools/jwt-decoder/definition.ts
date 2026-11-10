import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  "id": "jwt-decoder",
  "name": "JWT Decoder",
  "description": "Decode and inspect JWT tokens. View header, payload, and signature details.",
  "icon": "fa-solid fa-key",
  "color": "#8b5cf6",
  "badge": "",
  "href": "/jwt-decoder",
  "categoryId": "encoder",
  "status": "implemented",
  "exampleInput": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZW1vIiwiaWF0IjoxNzAwMDAwMDAwfQ.AA",
  "defaultOptions": {},
  "outputExtension": "json"
}
