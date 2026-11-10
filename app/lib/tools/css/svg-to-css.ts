
export interface SVGConversionOptions {
  format: 'background-image' | 'mask-image' | 'content' | 'url'
  addPrefix: boolean
  prefix: string
  optimize: boolean
  minify: boolean
}

export const defaultSVGOptions: SVGConversionOptions = {
  format: 'background-image',
  addPrefix: true,
  prefix: 'icon',
  optimize: true,
  minify: false,
}

export function compressSVG(svg: string): string {
  if (typeof svg !== 'string') return ''
  // Keep XML namespaces, quoting and text-node whitespace intact. Strip only optional prolog material.
  return svg
    .replace(/^\s*<\?xml[^>]*\?>\s*/i, '')
    .replace(/^\s*<!DOCTYPE[^>]*>\s*/i, '')
    .trim()
}

export function svgToCSS(svg: string, options: Partial<SVGConversionOptions> = {}): string {
  if (!svg || typeof svg !== 'string') return ''
    
  const opts = { ...defaultSVGOptions, ...options }
  if (!isValidSVG(svg)) throw new Error('Input must be a valid SVG root with viewBox or width and height.')
  if (opts.addPrefix && !/^-?[_a-zA-Z][-_a-zA-Z0-9]*$/.test(opts.prefix)) throw new Error('CSS class must be a valid identifier.')
  let processed = svg
    
  if (opts.optimize) {
    processed = compressSVG(processed)
  }
    
  const encoded = encodeSVG(processed, opts.minify)
    
  // gen CSS
  let css = ''
  const className = opts.addPrefix ? `.${opts.prefix}` : ''
    
  switch (opts.format) {
    case 'background-image':
      css = `${className} {\n  background-image: url("data:image/svg+xml,${encoded}");\n  background-repeat: no-repeat;\n  background-size: contain;\n}`
      break
    case 'mask-image':
      css = `${className} {\n  mask-image: url("data:image/svg+xml,${encoded}");\n  mask-size: contain;\n  mask-repeat: no-repeat;\n  -webkit-mask-image: url("data:image/svg+xml,${encoded}");\n  -webkit-mask-size: contain;\n  -webkit-mask-repeat: no-repeat;\n}`
      break
    case 'content':
      css = `${className}::before {\n  content: url("data:image/svg+xml,${encoded}");\n}`
      break
    case 'url':
      css = `url("data:image/svg+xml,${encoded}")`
      break
  }
    
  return css
}

export function encodeSVG(svg: string, minify: boolean): string {
  const source = minify ? svg.trim() : svg
  return encodeURIComponent(source).replace(/[!'()*]/g, character => `%${character.charCodeAt(0).toString(16).toUpperCase()}`)
}

export function isValidSVG(svg: string): boolean {
  if (!svg || typeof svg !== 'string' || svg.length > 1_000_000) return false
  const trimmed = svg.trim()
  const rootStart = trimmed.search(/<svg(?:\s|>)/i)
  if (rootStart < 0 || /<\/?(?:script|foreignObject)(?:\s|>)/i.test(trimmed)) return false
  const openTagEnd = trimmed.indexOf('>', rootStart)
  if (openTagEnd < 0) return false
  const rootOpen = trimmed.slice(rootStart, openTagEnd + 1)
  if (!/<\/svg\s*>\s*$/i.test(trimmed)) return false
  const hasViewBox = /\bviewBox\s*=\s*["'][^"']+["']/i.test(rootOpen)
  const hasWidth = /\bwidth\s*=\s*["'][^"']+["']/i.test(rootOpen)
  const hasHeight = /\bheight\s*=\s*["'][^"']+["']/i.test(rootOpen)
  return hasViewBox || (hasWidth && hasHeight)
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