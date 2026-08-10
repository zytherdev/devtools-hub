export function minifyCSS(code: string): string {
    if (!code || typeof code !== 'string') return ''

    let minified = code

    // rm block cmts (/* ... */)
    minified = minified.replace(/\/\*[\s\S]*?\*\//g, '')

    // rm whitespace and newlines
    minified = minified.replace(/[\n\r\t]/g, ' ')
    minified = minified.replace(/ {2,}/g, ' ')
    
    // rm spaces around special chars
    minified = minified.replace(/\s*{\s*/g, '{')
    minified = minified.replace(/\s*}\s*/g, '}')
    minified = minified.replace(/\s*:\s*/g, ':')
    minified = minified.replace(/\s*;\s*/g, ';')
    minified = minified.replace(/\s*,\s*/g, ',')
    minified = minified.replace(/\s*([>+~])\s*/g, '$1')
    minified = minified.replace(/\s*\(\s*/g, '(')
    minified = minified.replace(/\s*\)\s*/g, ')')
    minified = minified.replace(/\s*\[\s*/g, '[')
    minified = minified.replace(/\s*\]\s*/g, ']')
    
    // rm spaces bf/aft !important
    minified = minified.replace(/!\s*important/g, '!important')
    
    // rm unnecessary ;
    minified = minified.replace(/;+/g, ';')
    minified = minified.replace(/;}/g, '}')
    
    // rm empty blocks
    minified = minified.replace(/{\s*}/g, '')
    
    // rm trailing ;
    minified = minified.replace(/;+$/, '')
    
    // optimize values
    minified = minified.replace(/#([0-9a-fA-F])\1([0-9a-fA-F])\2([0-9a-fA-F])\3/g, '#$1$2$3')
    
    // rm units aft 0
    minified = minified.replace(/\b0(px|em|rem|%|vh|vw|vmin|vmax|pt|pc|in|cm|mm)\b/g, '0')
    
    // rm spaces around operators in values
    minified = minified.replace(/\s*([-+])\s*/g, '$1')
    
    // final cleanup
    minified = minified.trim()
    minified = minified.replace(/ {2,}/g, ' ')

    return minified
}

export function minifyCSS2(code: string): string {
    if (!code || typeof code !== 'string') return ''

    let minified = code

    // rm cmts
    minified = minified.replace(/\/\*[\s\S]*?\*\//g, '')

    // rm all whitespace
    minified = minified.replace(/[\n\r\t]/g, ' ')
    minified = minified.replace(/ {2,}/g, ' ')

    // rm spaces around:
    minified = minified.replace(/\s*{\s*/g, '{')
    minified = minified.replace(/\s*}\s*/g, '}')
    minified = minified.replace(/\s*:\s*/g, ':')
    minified = minified.replace(/\s*;\s*/g, ';')
    minified = minified.replace(/\s*,\s*/g, ',')
    minified = minified.replace(/\s*([>+~])\s*/g, '$1')
    minified = minified.replace(/\s*\(\s*/g, '(')
    minified = minified.replace(/\s*\)\s*/g, ')')
    minified = minified.replace(/\s*\[\s*/g, '[')
    minified = minified.replace(/\s*\]\s*/g, ']')
    
    // spaces in values
    // ex: 1px solid red -> 1px solid red (guarde space)
    // pero rm space aft :
    minified = minified.replace(/:\s+/g, ':')
    
    // rm units aft 0
    minified = minified.replace(/\b0(px|em|rem|%|vh|vw|vmin|vmax|pt|pc|in|cm|mm)\b/g, '0')
    
    // rm leading zeros
    minified = minified.replace(/\b0\.(\d+)/g, '.$1')
    
    // optimize colors
    minified = minified.replace(/#([0-9a-fA-F])\1([0-9a-fA-F])\2([0-9a-fA-F])\3/g, '#$1$2$3')
    
    // rm !important space
    minified = minified.replace(/!\s*important/g, '!important')
    
    // rm last semicolon bf }
    minified = minified.replace(/;}/g, '}')
    
    // rm empty blocks
    minified = minified.replace(/{\s*}/g, '')
    
    // Fix multiple ;
    minified = minified.replace(/;+/g, ';')
    
    // rm trailing ;
    minified = minified.replace(/;+$/, '')
    
    // rm spaces around operators
    minified = minified.replace(/\s*([-+])\s*/g, '$1')
    
    // rm spaces bf/aft calc()
    minified = minified.replace(/calc\s*\(/g, 'calc(')
    minified = minified.replace(/calc\(/g, 'calc(')
    
    // rm spaces bf/aft url()
    minified = minified.replace(/url\s*\(/g, 'url(')
    minified = minified.replace(/url\(/g, 'url(')
    
    // rm quotes from url()
    minified = minified.replace(/url\(['"]?(.*?)['"]?\)/g, 'url($1)')
    
    // end cleanup
    minified = minified.trim()
    minified = minified.replace(/ {2,}/g, ' ')

    return minified
}