import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  "id": "hash-generator",
  "name": "Hash Generator",
  "description": "Generate SHA-256, SHA-384, or SHA-512 hashes from text locally with browser Web Crypto.",
  "icon": "fa-solid fa-fingerprint",
  "color": "#ec4899",
  "badge": "",
  "href": "/hash-generator",
  "categoryId": "security",
  "status": "implemented",
  "exampleInput": "The quick brown fox jumps over the lazy dog",
  "defaultOptions": {
    "algorithm": "SHA-256"
  },
  "outputExtension": "txt"
}
