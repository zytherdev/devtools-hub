import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'json-formatter',
  name: 'JSON Formatter',
  description: 'Format, validate, minify, sort, and convert JSON to CSV or YAML, with safe JSON escaping.',
  icon: 'fa-solid fa-file',
  color: '#8b5cf6',
  badge: '',
  href: '/json-formatter',
  categoryId: 'data',
  status: 'implemented',
  exampleInput: '{\n  "name": "DevTools Hub",\n  "active": true,\n  "count": 0,\n  "note": null\n}',
  defaultOptions: { mode: 'format', indentSize: '2', escapeFormulaInjection: 'true' },
  outputExtension: 'json',
}
