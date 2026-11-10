import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'js-beautifier',
  name: 'JavaScript Beautifier',
  description: 'Format JavaScript, JSX, TypeScript, or TSX locally with the matching syntax parser.',
  icon: 'fa-solid fa-brush',
  color: '#fcd34d',
  badge: '',
  href: '/js-beautifier',
  categoryId: 'js',
  status: 'implemented',
  exampleInput: `type ApiResponse<T> = { data: T; ok: boolean };\nconst Greeting = <T,>({ name, value }: { name: string; value: T }) => (\n  <div className="greeting">Hello, {name}: {String(value)}</div>\n);`,
  defaultOptions: { syntax: 'javascript', indentSize: '2', indentChar: ' ', wrapLineLength: '100' },
  outputExtension: 'js',
}
