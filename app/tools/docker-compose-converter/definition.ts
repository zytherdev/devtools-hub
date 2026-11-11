import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'docker-compose-converter',
  name: 'Docker Run to Compose',
  description: 'Convert a docker run command into a Compose v3 service without executing the command.',
  icon: 'fa-brands fa-docker',
  color: '#2496ed',
  badge: '',
  href: '/docker-compose-converter',
  categoryId: 'database',
  status: 'implemented',
  exampleInput: 'docker run --name api -p 8080:80 -e MODE="safe mode" -v ./data:/var/lib/app:ro nginx:alpine nginx -g "daemon off;"',
  defaultOptions: {},
  outputExtension: 'yaml',
}
