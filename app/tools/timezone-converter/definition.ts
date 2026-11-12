import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'timezone-converter',
  name: 'Timezone Converter',
  description: 'Convert an explicit ISO-8601 instant between IANA time zones, with local offsets and daylight-saving status.',
  icon: 'fa-solid fa-globe',
  color: '#10b981',
  badge: '',
  href: '/timezone-converter',
  categoryId: 'date',
  status: 'implemented',
  exampleInput: JSON.stringify({
    instant: '2024-06-15T12:00:00Z',
    fromTimeZone: 'UTC',
    toTimeZone: 'America/New_York',
  }, null, 2),
  defaultOptions: {},
  outputExtension: 'json',
}
