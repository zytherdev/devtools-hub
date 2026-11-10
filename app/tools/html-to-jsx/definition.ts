import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  "id": "html-to-jsx",
  "name": "HTML to JSX Converter",
  "description": "Convert HTML to JSX for use in React applications. Supports complex nested structures.",
  "icon": "fa-brands fa-react",
  "color": "#61dafb",
  "badge": "",
  "href": "/html-to-jsx",
  "categoryId": "js",
  "status": "implemented",
  "exampleInput": "<div class=\"container\">\n  <h1>Hello, World!</h1>\n  <p style=\"color: blue; font-size: 16px;\">This is a sample HTML to JSX conversion.</p>\n  <ul>\n    <li>Item 1</li>\n    <li>Item 2</li>\n    <li>Item 3</li>\n  </ul>\n  <input type=\"text\" placeholder=\"Enter text\" disabled />\n</div>",
  "defaultOptions": {},
  "outputExtension": "jsx"
}
