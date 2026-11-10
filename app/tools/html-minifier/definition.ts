import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'html-minifier',
  name: 'HTML Minifier',
  description: 'Remove common HTML comments and compress safe whitespace while preserving raw-text content and important directives.',
  icon: 'fa-brands fa-html5',
  color: '#f97316',
  badge: 'Beta',
  href: '/html-minifier',
  categoryId: 'html',
  status: 'implemented',
  exampleInput: `<!doctype html>
<html lang="en">
  <head>
    <title>Example</title>
    <style>
      .card {
        color: #222;
      }
    </style>
  </head>
  <body>
    <!-- @license Example content -->
    <p>Hello,   world!</p>
    <script>
      const text = "<!-- this is a string -->";
    </script>
  </body>
</html>`,
  defaultOptions: {},
  outputExtension: 'html',
}
