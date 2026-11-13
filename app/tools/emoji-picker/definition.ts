import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'emoji-picker',
  name: 'Emoji Picker',
  description: 'Search a curated local emoji catalog by category or keyword, then copy an emoji.',
  icon: 'fa-regular fa-face-smile',
  color: '#fbbf24',
  badge: '',
  href: '/emoji-picker',
  categoryId: 'misc',
  status: 'implemented',
  exampleInput: 'smile',
  defaultOptions: {},
  outputExtension: 'json',
}
