import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'qr-generator',
  name: 'QR Code Generator',
  description: 'Generate a local, scalable QR Code as SVG from text or a URL.',
  icon: 'fa-solid fa-qrcode',
  color: '#347a58',
  badge: '',
  href: '/qr-generator',
  categoryId: 'generator',
  status: 'implemented',
  exampleInput: 'https://example.com',
  defaultOptions: {
    errorCorrection: 'M',
    margin: '4',
    scale: '4',
  },
  outputExtension: 'svg',
}
