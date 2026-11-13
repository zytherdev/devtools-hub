import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'benchmark-tool',
  name: 'Benchmark Tool',
  description: 'Measure fixed JavaScript workloads locally and compare bounded timing samples.',
  icon: 'fa-solid fa-chart-line',
  color: '#3b82f6',
  badge: '',
  href: '/benchmark-tool',
  categoryId: 'misc',
  status: 'implemented',
  exampleInput: 'array-map',
  defaultOptions: { iterations: '2000', samples: '5' },
  outputExtension: 'json',
}
