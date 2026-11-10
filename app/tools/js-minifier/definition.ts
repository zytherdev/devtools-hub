import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'js-minifier',
  name: 'JavaScript Minifier',
  description: 'Minify supported JavaScript locally and inspect the actual output size.',
  icon: 'fa-brands fa-js',
  color: '#fbbf24',
  badge: 'New',
  href: '/js-minifier',
  categoryId: 'js',
  status: 'implemented',
  exampleInput: `/*! Example license */
const square = (value) => value * value;
export default square;`,
  defaultOptions: {},
  outputExtension: 'js',
}
