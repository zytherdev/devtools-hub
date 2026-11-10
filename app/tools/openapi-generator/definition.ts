import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'openapi-generator',
  name: 'OpenAPI Generator',
  description: 'Gere uma especificação OpenAPI 3.1 em JSON a partir de endpoints e schemas de resposta.',
  icon: 'fa-solid fa-file-code',
  color: '#10b981',
  badge: '',
  href: '/openapi-generator',
  categoryId: 'generator',
  status: 'implemented',
  exampleInput: '{\n  "title": "Example API",\n  "version": "1.0.0",\n  "description": "",\n  "servers": ["https://api.example.com"],\n  "endpoints": [{\n    "path": "/users",\n    "method": "get",\n    "summary": "List users",\n    "responseDescription": "Success",\n    "responseSchema": {\n      "type": "array",\n      "items": {\n        "type": "object",\n        "properties": {\n          "id": { "type": "integer" },\n          "name": { "type": "string" }\n        }\n      }\n    }\n  }]\n}',
  defaultOptions: {},
  outputExtension: 'json',
}
