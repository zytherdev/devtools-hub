import { minifyCSS2 } from "./minifyCss";
import { minifyJS } from "./minifyJs";

export function minifyHTML(code: string): string {
    if (!code || typeof code !== 'string') return ''

    let minified = code

    // rm HTML cmts (<!-- ... -->)
    // guarda conditional cmts for IE
    minified = minified.replace(/<!--(?!\s*\[if\s).*?-->/g, '')

    // rm whitespace between tags
    minified = minified.replace(/>\s+</g, '><')

    // rm whitespace at start and end of lines
    minified = minified.replace(/^\s+|\s+$/gm, '')

    // rm multiple spaces inside tags
    minified = minified.replace(/\s{2,}/g, ' ')

    // rm spaces around attrs
    minified = minified.replace(/\s*=\s*/g, '=')

    // rm quotes from attrs whn safe
    // solo rm quotes from simple attr
    minified = minified.replace(/(\w+)=(["'])([^"'\s>]+)\2/g, '$1=$3')

    // rm boolean attr val
    minified = minified.replace(/\s(disabled|checked|selected|readonly|multiple|required|autofocus|novalidate|formnovalidate|ismap|declare|defer|async|autoplay|controls|loop|muted|playsinline|default|hidden|inert|open|reversed|scoped|seamless|typemustmatch)=["']\1["']/g, ' $1')

    // rm mt attrs
    minified = minified.replace(/\s(\w+)=["']\1["']/g, '')

    // rm spaces inside scripts and styles
    minified = minified.replace(/(<script[^>]*>)([\s\S]*?)(<\/script>)/g, (match, open, content, close) => {
        // Minify script content slightly (rm leading/trailing whitespace)
        const minContent = content.trim()
        return `${open}${minContent}${close}`
    })

    minified = minified.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/g, (match, open, content, close) => {
        // rm leading/trailing whitespace
        const minContent = content.trim()
        return `${open}${minContent}${close}`
    })

    // rm whitespace bf closing tags
    minified = minified.replace(/\s+>/g, '>')

    // rm whitespace aft opening tags
    minified = minified.replace(/<\s+/g, '<')

    // rm spaces in doctype
    minified = minified.replace(/<!DOCTYPE\s+html/g, '<!DOCTYPE html')

    // rm XML declaration whitespace
    minified = minified.replace(/<\?xml\s+/g, '<?xml ')

    // rm multiple newlines
    minified = minified.replace(/\n{3,}/g, '\n\n')

    // trim
    minified = minified.trim()

    return minified
}

export function minifyHTML2(code: string): string {
    if (!code || typeof code !== 'string') return ''

    let minified = code

    // rm HTML cmts 
    minified = minified.replace(/<!--(?!\s*\[if\s).*?-->/g, '')

    // rm whitespace between tags
    minified = minified.replace(/>\s+</g, '><')

    // rm whitespace at start and end of lines
    minified = minified.replace(/^\s+|\s+$/gm, '')

    // rm multiple spaces
    minified = minified.replace(/\s{2,}/g, ' ')

    // rm spaces around attrs
    minified = minified.replace(/\s*=\s*/g, '=')

    // 6. rm quotes from attrs when safe
    minified = minified.replace(/(\w+)=(["'])([^"'\s>]+)\2/g, '$1=$3')

    // rm boolean attr vals
    minified = minified.replace(/\s(disabled|checked|selected|readonly|multiple|required|autofocus|novalidate|formnovalidate|ismap|declare|defer|async|autoplay|controls|loop|muted|playsinline|default|hidden|inert|open|reversed|scoped|seamless|typemustmatch)=["']\1["']/g, ' $1')

    // rm empty attrs
    minified = minified.replace(/\s(\w+)=["']\1["']/g, '')

    // minify script content
    minified = minified.replace(/(<script[^>]*>)([\s\S]*?)(<\/script>)/g, (match, open, content, close) => {
        const minContent = minifyJS(content)
        return `${open}${minContent}${close}`
    })

    // minify style content
    minified = minified.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/g, (match, open, content, close) => {
        const minContent = minifyCSS2(content)
        return `${open}${minContent}${close}`
    })

    // rm spaces bf closing tags
    minified = minified.replace(/\s+>/g, '>')

    // rm spaces aft opening tags
    minified = minified.replace(/<\s+/g, '<')

    // rm spaces in doctype
    minified = minified.replace(/<!DOCTYPE\s+html/g, '<!DOCTYPE html')

    // rm spaces in XML declaration
    minified = minified.replace(/<\?xml\s+/g, '<?xml ')

    // rm type attrs from script/style when default
    minified = minified.replace(/<script\s+type=["']text\/javascript["']/g, '<script')
    minified = minified.replace(/<style\s+type=["']text\/css["']/g, '<style')

    // rm language attrs from script
    minified = minified.replace(/<script\s+language=["']javascript["']/g, '<script')

    // rm charset attrs when default
    minified = minified.replace(/<meta\s+charset=["']utf-8["']/gi, '<meta charset="utf-8">')
    minified = minified.replace(/<meta\s+http-equiv=["']Content-Type["']\s+content=["']text\/html;\s*charset=utf-8["']/gi, '<meta charset="utf-8">')

    // rm spaces in href and src
    minified = minified.replace(/href=["']\s+/g, 'href="')
    minified = minified.replace(/src=["']\s+/g, 'src="')
    minified = minified.replace(/\s+["']/g, '"')

    // end cleanup
    minified = minified.replace(/\n{3,}/g, '\n\n')
    minified = minified.trim()

    return minified
}
