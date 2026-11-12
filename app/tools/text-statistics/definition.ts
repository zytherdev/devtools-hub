import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  "id": "text-statistics",
  "name": "Text Statistics",
  "description": "Count Unicode-aware words, characters, lines, paragraphs, and optional reading time locally.",
  "icon": "fa-solid fa-calculator",
  "color": "#6366f1",
  "badge": "",
  "href": "/text-statistics",
  "categoryId": "date",
  "status": "implemented",
  "exampleInput": "Text statistics are calculated locally.\n\nUnicode-aware counts include words, grapheme clusters, lines, and paragraphs.",
  "defaultOptions": { "includeReadingTime": "true", "wordsPerMinute": "200" },
  "outputExtension": "txt"
}
