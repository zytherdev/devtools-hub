import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'mime-type-validator',
  name: 'MIME Type Validator',
  description: 'Validate MIME syntax and look up common MIME types from filenames using a curated local map.',
  icon: 'fa-solid fa-file-circle-check',
  color: '#14b8a6',
  badge: '',
  href: '/mime-type-validator',
  categoryId: 'encoder',
  status: 'implemented',
  exampleInput: 'Application/JSON; Charset=utf-8',
  defaultOptions: { mode: 'lookup', target: 'auto' },
  outputExtension: 'json',
}
