import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'sql-formatter',
  name: 'SQL Formatter',
  description: 'Format SQL statements locally with a lightweight lexical formatter.',
  icon: 'fa-solid fa-database',
  color: '#06b6d4',
  badge: '',
  href: '/sql-formatter',
  categoryId: 'database',
  status: 'implemented',
  exampleInput: 'select id,name from users where active=true order by name;',
  defaultOptions: {
    keywordCase: 'upper',
    indent: '2',
  },
  outputExtension: 'sql',
}
