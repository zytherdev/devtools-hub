import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  "id": "kubernetes-decoder",
  "name": "K8s Secret Decoder",
  "description": "Decode and inspect Kubernetes secrets. View base64 encoded data.",
  "icon": "fa-solid fa-cubes",
  "color": "#326ce5",
  "badge": "Planned",
  "href": "/kubernetes-decoder",
  "categoryId": "database",
  "status": "planned",
  "exampleInput": "",
  "defaultOptions": {},
  "outputExtension": "txt"
}
