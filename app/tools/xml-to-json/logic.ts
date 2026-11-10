function xmlNodeToValue(element: Element): unknown {
  const result: Record<string, unknown> = {}
  for (const attribute of Array.from(element.attributes)) result[`@${attribute.name}`] = attribute.value
  const children = Array.from(element.children)
  const rawText = Array.from(element.childNodes)
    .filter(node => node.nodeType === Node.TEXT_NODE || node.nodeType === Node.CDATA_SECTION_NODE)
    .map(node => node.textContent ?? '')
    .join('')
  const text = children.length && !rawText.trim() ? '' : rawText
  for (const child of children) {
    const value = xmlNodeToValue(child)
    if (Object.prototype.hasOwnProperty.call(result, child.tagName)) {
      const previous = result[child.tagName]
      result[child.tagName] = Array.isArray(previous) ? [...previous, value] : [previous, value]
    } else result[child.tagName] = value
  }
  if (!children.length && Object.keys(result).length === 0) return text
  if (text) result['#text'] = text
  return result
}

function xmlToJson(source: string): string {
  const document = new DOMParser().parseFromString(source, 'application/xml')
  const issue = document.querySelector('parsererror')
  if (issue) throw new Error(issue.textContent?.replace(/\s+/g, ' ').trim() || 'Invalid XML document')
  const root = document.documentElement
  return JSON.stringify({ [root.tagName]: xmlNodeToValue(root) }, null, 2)
}

export function run(input: string, options: Record<string, string>): string {
  void options
  if (!input.trim()) throw new Error('Paste data to process.')
  return xmlToJson(input)
}
