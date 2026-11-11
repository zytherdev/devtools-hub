import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'lorem-ipsum',
  name: 'Lorem Ipsum Generator',
  description: 'Generate placeholder text with configurable paragraph, sentence, and word counts.',
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
