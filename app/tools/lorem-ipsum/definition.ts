import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'lorem-ipsum',
  name: 'Gerador Lorem Ipsum',
  description: 'Gere texto de preenchimento com quantidade configurável de parágrafos, frases e palavras.',
  icon: 'fa-solid fa-paragraph',
  color: '#6366f1',
  badge: '',
  href: '/lorem-ipsum',
  categoryId: 'text',
  status: 'implemented',
  exampleInput: '',
  defaultOptions: { paragraphs: '3', sentencesPerParagraph: '3', wordsPerSentence: '12', format: 'paragraphs' },
  outputExtension: 'txt',
}
