
export interface RegexMatch {
    match: string
    index: number
    groups?: { [key: string]: string }
}

export interface RegexResult {
    matches: RegexMatch[]
    count: number
    error?: string
    flags: string
    pattern: string
}

// ===== valiiiiddar loooooo =====
export function isValidRegex(pattern: string): boolean {
    try {
        new RegExp(pattern)
        return true
    } catch {
        return false
    }
}

// ===== teste =====
export function testRegex(pattern: string, flags: string, text: string): RegexResult {
    try {
        const regex = new RegExp(pattern, flags)
        const matches: RegexMatch[] = []
        let match: RegExpExecArray | null

        // rset lastIndex for global flag
        if (flags.includes('g')) {
            regex.lastIndex = 0
        }

        while ((match = regex.exec(text)) !== null) {
            const groups: { [key: string]: string } = {}
            
            // hndle named groups
            if (match.groups) {
                Object.assign(groups, match.groups)
            }
            
            // hndle numbered groups
            for (let i = 1; i < match.length; i++) {
                if (match[i] !== undefined && !groups[i]) {
                    groups[i.toString()] = match[i]
                }
            }

            matches.push({
                match: match[0],
                index: match.index,
                groups: Object.keys(groups).length > 0 ? groups : undefined
            })

            // brk if not global t/ avd infinite loop
            if (!flags.includes('g')) break
        }

        return {
            matches,
            count: matches.length,
            flags,
            pattern
        }
    } catch (error) {
        return {
            matches: [],
            count: 0,
            flags,
            pattern,
            error: (error as Error).message
        }
    }
}

// ===== rplace =====
export function replaceRegex(pattern: string, flags: string, text: string, replacement: string): string {
    try {
        const regex = new RegExp(pattern, flags)
        return text.replace(regex, replacement)
    } catch (error) {
        throw new Error(`Invalid regex: ${(error as Error).message}`)
    }
}

// ===== splt =====
export function splitRegex(pattern: string, flags: string, text: string): string[] {
    try {
        const regex = new RegExp(pattern, flags)
        return text.split(regex)
    } catch (error) {
        throw new Error(`Invalid regex: ${(error as Error).message}`)
    }
}

// ===== comms ptterns =====
export const commonPatterns: { name: string; pattern: string; flags: string; description: string }[] = [
    {
        name: 'Email',
        pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
        flags: 'i',
        description: 'Validates email addresses'
    },
    {
        name: 'URL',
        pattern: '^https?://[\\w\\-]+(\\.[\\w\\-]+)+[/#?]?.*$',
        flags: 'i',
        description: 'Matches URLs (http/https)'
    },
    {
        name: 'Phone (US)',
        pattern: '^\\(?([0-9]{3})\\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$',
        flags: '',
        description: 'US phone number format'
    },
    {
        name: 'IP Address',
        pattern: '^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$',
        flags: '',
        description: 'IPv4 address'
    },
    {
        name: 'Date (YYYY-MM-DD)',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        flags: '',
        description: 'Date in YYYY-MM-DD format'
    },
    {
        name: 'Hex Color',
        pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$',
        flags: '',
        description: 'Hex color codes (#fff, #ffffff)'
    },
    {
        name: 'Username',
        pattern: '^[a-zA-Z0-9_]{3,16}$',
        flags: '',
        description: 'Username (3-16 chars, letters, numbers, underscore)'
    },
    {
        name: 'Password',
        pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
        flags: '',
        description: 'Strong password (8+ chars, upper, lower, number, special)'
    },
    {
        name: 'HTML Tag',
        pattern: '<[^>]+>',
        flags: 'g',
        description: 'Matches HTML tags'
    },
    {
        name: 'JSON',
        pattern: '^\\s*(\\{.*\\}|\\[.*\\])\\s*$',
        flags: 's',
        description: 'Validates JSON structure'
    },
    {
        name: 'Slug',
        pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$',
        flags: '',
        description: 'URL slug (lowercase, hyphens)'
    },
    {
        name: 'Credit Card',
        pattern: '^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9][0-9])[0-9]{12})$',
        flags: '',
        description: 'Credit card number (Visa, Mastercard, Amex, Discover)'
    }
]

// ===== escspe =====
export function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// ===== flgs hlpers =====
export const flagOptions = [
    { value: 'g', label: 'Global (g)', description: 'Find all matches' },
    { value: 'i', label: 'Case Insensitive (i)', description: 'Ignore case' },
    { value: 'm', label: 'Multiline (m)', description: '^ and $ match start/end of lines' },
    { value: 's', label: 'Dot All (s)', description: '. matches newlines' },
    { value: 'u', label: 'Unicode (u)', description: 'Unicode support' },
    { value: 'y', label: 'Sticky (y)', description: 'Matches only from lastIndex' }
]

export function getFlagString(selectedFlags: string[]): string {
    return selectedFlags.sort().join('')
}