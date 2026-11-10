export type SVGOutputFormat = 'background-image' | 'mask-image' | 'content' | 'url'

export interface SVGConversionOptions {
  format: SVGOutputFormat
  addPrefix: boolean
  prefix: string
  optimize: boolean
  minify: boolean
}

export const MAX_SVG_INPUT_LENGTH = 200_000

export const defaultSVGOptions: SVGConversionOptions = {
  format: 'background-image',
  addPrefix: true,
  prefix: 'icon',
  optimize: true,
  minify: false,
}

const validFormats = new Set<SVGOutputFormat>(['background-image', 'mask-image', 'content', 'url'])
const validEntities = new Set(['amp', 'lt', 'gt', 'apos', 'quot'])

function isXMLSpace(character: string): boolean {
  return character === ' ' || character === '\t' || character === '\n' || character === '\r'
}

function isXMLCharacter(codePoint: number): boolean {
  return codePoint === 0x9 || codePoint === 0xa || codePoint === 0xd
    || (codePoint >= 0x20 && codePoint <= 0xd7ff)
    || (codePoint >= 0xe000 && codePoint <= 0xfffd)
    || (codePoint >= 0x10000 && codePoint <= 0x10ffff)
}

function isNameStart(character: string): boolean {
  return /^[_:\p{L}\p{Nl}]$/u.test(character)
}

function isNameCharacter(character: string): boolean {
  return /^[_:\p{L}\p{Nl}\p{N}\p{M}\p{Pc}.\-]$/u.test(character)
}

function validateXMLCharacters(value: string): void {
  for (const character of value) {
    if (!isXMLCharacter(character.codePointAt(0)!)) {
      throw new Error('Input contains a character that is not allowed in XML 1.0.')
    }
  }
}

function validateReferences(value: string): void {
  for (let index = 0; index < value.length; index += 1) {
    if (value[index] !== '&') continue
    const semicolon = value.indexOf(';', index + 1)
    if (semicolon < 0) throw new Error('Input contains an unterminated XML entity reference.')
    const reference = value.slice(index + 1, semicolon)
    if (validEntities.has(reference)) {
      index = semicolon
      continue
    }
    const numeric = /^#(?:([0-9]+)|x([0-9a-fA-F]+))$/.exec(reference)
    if (numeric) {
      const codePoint = numeric[1] ? Number(numeric[1]) : Number.parseInt(numeric[2], 16)
      if (!Number.isSafeInteger(codePoint) || !isXMLCharacter(codePoint)) {
        throw new Error('Input contains an invalid numeric XML entity reference.')
      }
      index = semicolon
      continue
    }
    throw new Error('Input contains an unknown XML entity. Only the five predefined and numeric entities are supported.')
  }
}

function readName(source: string, start: number): { name: string; end: number } {
  let index = start
  const first = String.fromCodePoint(source.codePointAt(index) ?? 0)
  if (!isNameStart(first)) throw new Error('Malformed XML: expected an element or attribute name.')
  index += first.length
  while (index < source.length) {
    const character = String.fromCodePoint(source.codePointAt(index) ?? 0)
    if (!isNameCharacter(character)) break
    index += character.length
  }
  return { name: source.slice(start, index), end: index }
}

/**
 * A bounded XML well-formedness scanner for this converter, not a full XML or SVG parser.
 * It checks tag nesting, quoted attributes, references, a single SVG root and root dimensions.
 * DTDs/external entities and namespace binding/conformance are intentionally unsupported.
 */
function inspectSVG(source: string): { rootAttributes: Map<string, string> } {
  validateXMLCharacters(source)
  const stack: string[] = []
  let index = 0
  let rootSeen = false
  let rootClosed = false
  let rootAttributes = new Map<string, string>()

  const skipSpace = (from: number): number => {
    let next = from
    while (next < source.length && isXMLSpace(source[next])) next += 1
    return next
  }

  const validateText = (text: string) => {
    validateReferences(text)
    if (!stack.length && [...text].some(character => !isXMLSpace(character))) throw new Error('Malformed XML: text is not allowed outside the root element.')
    if (text.includes(']]>')) throw new Error('Malformed XML: ]]> is not allowed in ordinary text.')
  }

  while (index < source.length) {
    if (source[index] !== '<') {
      const nextTag = source.indexOf('<', index)
      const end = nextTag < 0 ? source.length : nextTag
      validateText(source.slice(index, end))
      index = end
      continue
    }

    if (source.startsWith('<!--', index)) {
      const end = source.indexOf('-->', index + 4)
      if (end < 0 || source.slice(index + 4, end).includes('--') || source.slice(index + 4, end).endsWith('-')) {
        throw new Error('Malformed XML: comment is not properly terminated or contains "--".')
      }
      index = end + 3
      continue
    }

    if (source.startsWith('<![CDATA[', index)) {
      if (!stack.length) throw new Error('Malformed XML: CDATA sections must be inside the root element.')
      const end = source.indexOf(']]>', index + 9)
      if (end < 0) throw new Error('Malformed XML: CDATA section is not terminated.')
      index = end + 3
      continue
    }

    if (source.startsWith('<?', index)) {
      const end = source.indexOf('?>', index + 2)
      if (end < 0) throw new Error('Malformed XML: processing instruction is not terminated.')
      const target = readName(source, index + 2)
      const separator = source[target.end]
      if (separator !== '?' && !isXMLSpace(separator ?? '')) {
        throw new Error('Malformed XML: processing instruction target must be separated from its data.')
      }
      if (target.name.toLowerCase() === 'xml') {
        const declaration = source.slice(index, end + 2)
        if (rootSeen || index !== 0 || !/^<\?xml\s+version\s*=\s*(["'])1\.[01]\1(?:\s+encoding\s*=\s*(["'])[A-Za-z][A-Za-z0-9._-]*\2)?(?:\s+standalone\s*=\s*(["'])(?:yes|no)\3)?\s*\?>$/.test(declaration)) {
          throw new Error('Malformed XML: XML declaration must be first and include a supported version.')
        }
      }
      index = end + 2
      continue
    }

    if (source.startsWith('<!', index)) {
      if (/^<!DOCTYPE\b/i.test(source.slice(index))) {
        throw new Error('DOCTYPE and custom entity declarations are not supported.')
      }
      throw new Error('Malformed XML: unsupported declaration.')
    }

    if (source.startsWith('</', index)) {
      const parsed = readName(source, index + 2)
      const end = skipSpace(parsed.end)
      if (source[end] !== '>') throw new Error('Malformed XML: closing tag contains unexpected content.')
      const openName = stack.pop()
      if (!openName || openName !== parsed.name) throw new Error(`Malformed XML: closing tag </${parsed.name}> does not match its opening tag.`)
      index = end + 1
      if (!stack.length) rootClosed = true
      continue
    }

    const parsedRoot = readName(source, index + 1)
    const tagName = parsedRoot.name
    let cursor = parsedRoot.end
    const attributes = new Map<string, string>()
    let selfClosing = false

    while (cursor < source.length) {
      const beforeSpace = cursor
      cursor = skipSpace(cursor)
      const hadSpace = cursor > beforeSpace
      if (source[cursor] === '>') {
        cursor += 1
        break
      }
      if (source[cursor] === '/' && source[cursor + 1] === '>') {
        selfClosing = true
        cursor += 2
        break
      }
      if (!hadSpace) throw new Error('Malformed XML: attributes must be separated by whitespace.')
      const parsedAttribute = readName(source, cursor)
      cursor = skipSpace(parsedAttribute.end)
      if (source[cursor] !== '=') throw new Error(`Malformed XML: attribute "${parsedAttribute.name}" must have a value.`)
      cursor = skipSpace(cursor + 1)
      const quote = source[cursor]
      if (quote !== '"' && quote !== "'") throw new Error(`Malformed XML: attribute "${parsedAttribute.name}" must use quotes.`)
      const valueStart = cursor + 1
      const valueEnd = source.indexOf(quote, valueStart)
      if (valueEnd < 0) throw new Error(`Malformed XML: attribute "${parsedAttribute.name}" is not terminated.`)
      const value = source.slice(valueStart, valueEnd)
      if (value.includes('<')) throw new Error('Malformed XML: an attribute value cannot contain "<".')
      validateReferences(value)
      if (attributes.has(parsedAttribute.name)) throw new Error(`Malformed XML: duplicate attribute "${parsedAttribute.name}".`)
      attributes.set(parsedAttribute.name, value)
      cursor = valueEnd + 1
    }

    if (cursor > source.length || source[cursor - 1] !== '>' || (selfClosing && source[cursor - 2] !== '/')) {
      throw new Error('Malformed XML: start tag is not terminated.')
    }
    if (!rootSeen) {
      if (stack.length || tagName !== 'svg') throw new Error('Input must have one <svg> document root.')
      rootSeen = true
      rootAttributes = attributes
    } else if (!stack.length || rootClosed) {
      throw new Error('Malformed XML: only one document root element is allowed.')
    }
    if (!selfClosing) stack.push(tagName)
    else if (!stack.length) rootClosed = true
    index = cursor
  }

  if (!rootSeen || !rootClosed || stack.length) throw new Error('Malformed XML: the <svg> root or one of its elements is not closed.')
  const hasViewBox = Boolean(rootAttributes.get('viewBox')?.trim())
  const hasWidth = Boolean(rootAttributes.get('width')?.trim())
  const hasHeight = Boolean(rootAttributes.get('height')?.trim())
  if (!hasViewBox && !(hasWidth && hasHeight)) {
    throw new Error('The <svg> root needs a viewBox or both width and height attributes.')
  }
  return { rootAttributes }
}

export function compressSVG(svg: string): string {
  if (typeof svg !== 'string') return ''
  return svg
    .replace(/^\s*<\?xml\s[^?]*\?>\s*/i, '')
    .replace(/<!--(?:[^-]|-(?!->))*-->/g, '')
    .trim()
}

function normalizeOptions(options: Partial<SVGConversionOptions>): SVGConversionOptions {
  if (!options || typeof options !== 'object' || Array.isArray(options)) throw new Error('Options must be an object.')
  const opts = { ...defaultSVGOptions, ...options }
  if (!validFormats.has(opts.format)) throw new Error('Format must be background-image, mask-image, content, or url.')
  if (typeof opts.addPrefix !== 'boolean' || typeof opts.optimize !== 'boolean' || typeof opts.minify !== 'boolean') {
    throw new Error('addPrefix, optimize, and minify options must be boolean.')
  }
  if (typeof opts.prefix !== 'string') throw new Error('CSS class must be text.')
  if (opts.addPrefix && !/^-?[_a-zA-Z][-_a-zA-Z0-9]*$/.test(opts.prefix)) {
    throw new Error('CSS class must be a valid identifier (without a leading period).')
  }
  return opts
}

export function svgToCSS(svg: string, options: Partial<SVGConversionOptions> = {}): string {
  if (typeof svg !== 'string' || !svg.trim()) throw new Error('Paste SVG markup before converting.')
  if (svg.length > MAX_SVG_INPUT_LENGTH) {
    throw new Error(`SVG input exceeds the ${MAX_SVG_INPUT_LENGTH.toLocaleString()} character limit.`)
  }
  const opts = normalizeOptions(options)
  inspectSVG(svg)
  const processed = opts.optimize ? compressSVG(svg) : svg.trim()
  const encoded = encodeSVG(processed)
  const className = opts.addPrefix ? `.${opts.prefix}` : ''
  const selector = className || ':root'
  let css: string

  switch (opts.format) {
    case 'background-image':
      css = `${selector} {\n  background-image: url("data:image/svg+xml,${encoded}");\n  background-repeat: no-repeat;\n  background-size: contain;\n}`
      break
    case 'mask-image':
      css = `${selector} {\n  mask-image: url("data:image/svg+xml,${encoded}");\n  mask-size: contain;\n  mask-repeat: no-repeat;\n  -webkit-mask-image: url("data:image/svg+xml,${encoded}");\n  -webkit-mask-size: contain;\n  -webkit-mask-repeat: no-repeat;\n}`
      break
    case 'content':
      css = `${className ? `${className}::before` : ':root::before'} {\n  content: url("data:image/svg+xml,${encoded}");\n}`
      break
    case 'url':
      css = `url("data:image/svg+xml,${encoded}")`
      break
  }

  return opts.minify ? minifyCSS(css) : css
}

function minifyCSS(css: string): string {
  return css.replace(/\s+/g, ' ').replace(/\s*([{}:;])\s*/g, '$1').trim()
}

export function encodeSVG(svg: string): string {
  return encodeURIComponent(svg).replace(/[!'()*]/g, character => `%${character.charCodeAt(0).toString(16).toUpperCase()}`)
}

export function isValidSVG(svg: string): boolean {
  if (typeof svg !== 'string' || !svg.trim() || svg.length > MAX_SVG_INPUT_LENGTH) return false
  try {
    inspectSVG(svg)
    return true
  } catch {
    return false
  }
}

export function run(input: string, options: Partial<SVGConversionOptions> = {}): string {
  return svgToCSS(input, options)
}

export const sampleSVGs = [
  {
    name: 'Star',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
<path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
</svg>`
  },
  {
    name: 'Heart',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
<path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z" fill="currentColor"/>
</svg>`
  },
  {
    name: 'Check',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
<path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="currentColor"/>
</svg>`
  },
  {
    name: 'Arrow Right',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
<path d="M12 4L10.59 5.41L16.17 11H4V13H16.17L10.59 18.59L12 20L20 12L12 4Z" fill="currentColor"/>
</svg>`
  }
]
