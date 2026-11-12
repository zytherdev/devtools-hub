export const MAX_PASSWORD_LENGTH = 256

export type StrengthLevel = 'Very weak' | 'Weak' | 'Fair' | 'Strong' | 'Very strong'

export interface PasswordStrengthEstimate {
  score: number
  level: StrengthLevel
  characterCount: number
  feedback: string[]
}

const COMMON_PASSWORDS = new Set([
  '123456', '123456789', '12345678', 'password', 'password1', 'qwerty', 'qwerty123',
  '111111', '123123', 'abc123', 'letmein', 'admin', 'welcome', 'iloveyou', 'monkey',
  'dragon', 'sunshine', 'princess', 'football', 'login', 'passw0rd', '000000',
])

const PREDICTABLE_SEQUENCES = ['abcd', 'qwer', 'asdf', 'zxcv', '1234', '4321', '9876']
const LEVELS: readonly StrengthLevel[] = ['Very weak', 'Weak', 'Fair', 'Strong', 'Very strong']

function validatePassword(password: unknown): string[] {
  if (typeof password !== 'string') throw new TypeError('Password must be a string.')
  const characters = Array.from(password)
  if (characters.length > MAX_PASSWORD_LENGTH) {
    throw new RangeError(`Password must be ${MAX_PASSWORD_LENGTH} characters or fewer.`)
  }
  return characters
}

function validateOptions(options: unknown): void {
  if (options === null || typeof options !== 'object' || Array.isArray(options)) {
    throw new TypeError('Options must be an object with no properties.')
  }
  const prototype = Object.getPrototypeOf(options)
  if (prototype !== Object.prototype && prototype !== null) {
    throw new TypeError('Options must be a plain object with no properties.')
  }
  const keys = Object.keys(options)
  if (keys.length > 0) throw new Error(`Unsupported option: ${keys[0]}`)
}

function countCharacterGroups(password: string): number {
  let groups = 0
  if (/\p{Ll}/u.test(password)) groups++
  if (/\p{Lu}/u.test(password)) groups++
  if (/\p{N}/u.test(password)) groups++
  if (/[\p{P}\p{S}]/u.test(password)) groups++
  return groups
}

function hasRepeatedCharacters(characters: string[]): boolean {
  if (characters.length < 4) return false
  const counts = new Map<string, number>()
  for (const character of characters) {
    const count = (counts.get(character) ?? 0) + 1
    counts.set(character, count)
    if (count > characters.length / 2) return true
  }
  return false
}

function isCommonPassword(password: string): boolean {
  if (COMMON_PASSWORDS.has(password)) return true
  return [...COMMON_PASSWORDS].some(base => {
    if (!password.startsWith(base)) return false
    const suffix = password.slice(base.length)
    return suffix.length > 0 && suffix.length <= 6 && /^[\p{N}\p{P}\p{S}]+$/u.test(suffix)
  })
}

/** Estimate strength using bounded, transparent rules; this is not a password audit. */
export function estimatePasswordStrength(password: string): PasswordStrengthEstimate {
  const characters = validatePassword(password)
  const normalized = password.toLowerCase()
  const characterCount = characters.length
  const commonPassword = isCommonPassword(normalized)
  const predictableSequence = PREDICTABLE_SEQUENCES.some(sequence => normalized.includes(sequence))
  const repeatedCharacters = hasRepeatedCharacters(characters)

  let score = characterCount >= 20 ? 4 : characterCount >= 16 ? 3 : characterCount >= 12 ? 2 : characterCount >= 8 ? 1 : 0
  const groups = countCharacterGroups(password)
  if (groups >= 2) score++
  if (groups >= 3) score++
  if (groups === 4) score++
  score = Math.min(4, score)

  if (repeatedCharacters) score--
  if (predictableSequence) score--
  if (commonPassword || (characterCount > 0 && new Set(characters).size === 1)) score = 0
  score = Math.max(0, score)

  const feedback: string[] = []
  if (characterCount === 0) {
    feedback.push('Enter a password to receive a local estimate.')
  } else {
    if (commonPassword) feedback.push('Avoid common passwords and predictable variations.')
    if (predictableSequence) feedback.push('Avoid keyboard patterns and consecutive letters or numbers.')
    if (repeatedCharacters || new Set(characters).size === 1) feedback.push('Avoid repeating the same character or relying on repeated patterns.')
    if (characterCount < 12) feedback.push('Use a longer password or a memorable passphrase; aim for at least 12 characters.')
    if (groups < 3) feedback.push('Use a broader mix of character types, or choose a longer set of unrelated words.')
    if (feedback.length === 0) feedback.push('Use a unique password for every account and enable multi-factor authentication where available.')
  }

  return {
    score,
    level: LEVELS[score],
    characterCount,
    feedback,
  }
}

/** JSON output is structured but deliberately never includes the password itself. */
export function run(password: string, options: Record<string, unknown> = {}): string {
  validateOptions(options)
  return JSON.stringify(estimatePasswordStrength(password), null, 2)
}
