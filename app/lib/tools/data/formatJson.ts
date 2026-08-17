/* eslint-disable @typescript-eslint/no-explicit-any */
export function formatJSON(code: string, indent: number = 2): string {
    if (!code || typeof code !== 'string') return ''

    try {
        // parse p/ validar
        const parsed = JSON.parse(code)
        // formata c/ indentação
        return JSON.stringify(parsed, null, indent)
    } catch (error) {
        throw new Error(`Invalid JSON: ${(error as Error).message}`)
    }
}

export function minifyJSON(code: string): string {
    if (!code || typeof code !== 'string') return ''

    try {
        const parsed = JSON.parse(code)
        return JSON.stringify(parsed)
    } catch (error) {
        throw new Error(`Invalid JSON: ${(error as Error).message}`)
    }
}

export function validateJSON(code: string): { valid: boolean; error?: string } {
    if (!code || typeof code !== 'string') {
        return { valid: false, error: 'Empty or invalid input' }
    }

    try {
        JSON.parse(code)
        return { valid: true }
    } catch (error) {
        return { valid: false, error: (error as Error).message }
    }
}

export function escapeJSON(code: string): string {
    if (typeof code !== 'string' || code.length === 0) {
        return ''
    }

    return code.replace(/[\\"\u0008\f\n\r\t]/g, char => {
        switch (char) {
            case '\\':
                return '\\\\'
            case '"':
                return '\\"'
            case '\b':
                return '\\b'
            case '\f':
                return '\\f'
            case '\n':
                return '\\n'
            case '\r':
                return '\\r'
            case '\t':
                return '\\t'
            default:
                return char
        }
    })
}

export function unescapeJSON(code: string): string {
    if (typeof code !== 'string' || code.length === 0) {
        return ''
    }

    return code.replace(/\\(?:["\\/bfnrt]|u[0-9a-fA-F]{4})/g, match => {
        switch (match) {
            case '\\"':
                return '"'
            case '\\\\':
                return '\\'
            case '\\/':
                return '/'
            case '\\b':
                return '\b'
            case '\\f':
                return '\f'
            case '\\n':
                return '\n'
            case '\\r':
                return '\r'
            case '\\t':
                return '\t'
            default:
                return String.fromCharCode(
                    parseInt(match.slice(2), 16)
                )
        }
    })
}

export function sortJSONKeys(code: string): string {
    if (!code || typeof code !== 'string') return ''

    try {
        const parsed = JSON.parse(code)
        const sorted = sortObject(parsed)
        return JSON.stringify(sorted, null, 2)
    } catch (error) {
        throw new Error(`Invalid JSON: ${(error as Error).message}`)
    }
}

function sortObject(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map(item => sortObject(item))
    } else if (obj !== null && typeof obj === 'object') {
        const sorted: any = {}
        const keys = Object.keys(obj).sort()
        for (const key of keys) {
            sorted[key] = sortObject(obj[key])
        }
        return sorted
    }
    return obj
}

export function jsonToCSV(code: string): string {
    if (!code || typeof code !== 'string') return ''

    try {
        const data = JSON.parse(code)
        
        if (!Array.isArray(data) || data.length === 0) {
            throw new Error('JSON must be a non-empty array')
        }

        const headers = Object.keys(data[0])
        const rows = data.map(obj => headers.map(h => JSON.stringify(obj[h] || '').replace(/^"|"$/g, '')))
        
        return [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n')
    } catch (error) {
        throw new Error(`Conversion error: ${(error as Error).message}`)
    }
}

export function jsonToYAML(code: string): string {
    if (!code || typeof code !== 'string') return ''

    try {
        const data = JSON.parse(code)
        return objectToYAML(data)
    } catch (error) {
        throw new Error(`Conversion error: ${(error as Error).message}`)
    }
}

function objectToYAML(obj: any, indent: number = 0): string {
    const spaces = ' '.repeat(indent)
    
    if (Array.isArray(obj)) {
        return obj.map(item => `${spaces}- ${objectToYAML(item, indent + 2)}`).join('\n')
    } else if (obj !== null && typeof obj === 'object') {
        const entries = Object.entries(obj)
        return entries.map(([key, value]) => {
            if (typeof value === 'object' && value !== null) {
                return `${spaces}${key}:\n${objectToYAML(value, indent + 2)}`
            }
            return `${spaces}${key}: ${value}`
        }).join('\n')
    }
    return String(obj)
}