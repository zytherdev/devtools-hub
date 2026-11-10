import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'number-base-converter',
  name: 'Conversor de bases numéricas',
  description: 'Converta inteiros com sinal entre bases numéricas de 2 a 36 sem perda de precisão.',
  icon: 'fa-solid fa-rotate-right',
  color: '#6366f1',
  badge: '',
  href: '/number-base-converter',
  categoryId: 'converter',
  status: 'implemented',
  exampleInput: '255',
  defaultOptions: { fromBase: '10', toBase: '16' },
  outputExtension: 'txt',
}
