import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'css-beautifier',
  name: 'CSS Beautifier',
  description: 'Format modern CSS locally with configurable indentation, line width, and final newline.',
  icon: 'fa-solid fa-brush',
  color: '#60a5fa',
  badge: '',
  href: '/css-beautifier',
  categoryId: 'css',
  status: 'implemented',
  exampleInput: '.layout{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));--space:1rem;gap:var(--space);content:"keep   these spaces"}@layer components{@container card (width>20rem){.layout{padding:2rem;& .title{color:oklch(45% .16 260)}}}}@starting-style{.layout{opacity:0}}',
  defaultOptions: {
    indentSize: '2',
    indentChar: ' ',
    printWidth: '100',
    endWithNewline: 'false',
  },
  outputExtension: 'css',
}
