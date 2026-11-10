import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  "id": "docker-compose-converter",
  "name": "Docker Run to Compose",
  "description": "Convert Docker run commands to docker-compose.yml format.",
  "icon": "fa-brands fa-docker",
  "color": "#2496ed",
  "badge": "Planned",
  "href": "/docker-compose-converter",
  "categoryId": "database",
  "status": "planned",
  "exampleInput": "",
  "defaultOptions": {},
  "outputExtension": "txt"
}
