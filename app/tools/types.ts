export type ToolStatus = 'implemented' | 'planned'

export type ToolOptions = Record<string, string>

export type ToolDefinition = {
  id: string
  name: string
  description: string
  icon: string
  color: string
  badge: string
  href: string
  categoryId: string
  status: ToolStatus
  exampleInput: string
  defaultOptions: ToolOptions
  outputExtension: string
}

export type ToolCategory = {
  id: string
  name: string
  icon: string
  color: string
  tools: ToolDefinition[]
}

export type ToolRunner = (input: string, options: ToolOptions) => string | Promise<string>
