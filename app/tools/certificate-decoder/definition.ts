import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  "id": "certificate-decoder",
  "name": "Certificate Decoder",
  "description": "Decode bounded PEM or DER X.509 certificates locally and inspect identity, validity, SAN, and public-key metadata.",
  "icon": "fa-solid fa-certificate",
  "color": "#f59e0b",
  "badge": "",
  "href": "/certificate-decoder",
  "categoryId": "security",
  "status": "implemented",
  "exampleInput": "",
  "defaultOptions": {},
  "outputExtension": "txt"
}
