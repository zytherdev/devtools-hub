import type { ToolOptions } from '@/app/tools/types'

const MAX_INPUT_LENGTH = 320
const MAX_ADDRESS_LENGTH = 254
const MAX_LOCAL_PART_LENGTH = 64
const MAX_DOMAIN_LENGTH = 253
const MAX_LABEL_LENGTH = 63
const MAX_OUTPUT_LENGTH = 8192
const ATEXT = /^[A-Za-z0-9!#$%&'*+\-/=?^_`{|}~]+$/
const DOMAIN_LABEL = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/
const DOMAIN_SUFFIX = /^(?:[A-Za-z]{2,63}|xn--[A-Za-z0-9](?:[A-Za-z0-9-]{0,57}[A-Za-z0-9])?)$/i

type ValidationResult = {
  input: string
  valid: boolean
  localPart: string | null
  domain: string | null
  normalized: string | null
  reason: string | null
  message: string
}

function validateOptions(options: ToolOptions): void {
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    throw new Error('Options must be a JSON object.')
  }
  const unknown = Object.keys(options)
  if (unknown.length > 0) {
    throw new Error(`Unknown option "${unknown[0]}". This tool does not accept options.`)
  }
}

function getInvalidReason(input: string): { reason: string; localPart: string | null; domain: string | null } | null {
  if (input.length > MAX_ADDRESS_LENGTH) {
    return { reason: `An email address must be ${MAX_ADDRESS_LENGTH} characters or fewer.`, localPart: null, domain: null }
  }
  if (/[\x00-\x20\x7f]/.test(input)) {
    return { reason: 'Whitespace and control characters are not allowed.', localPart: null, domain: null }
  }
  if (/[^\x21-\x7e]/.test(input)) {
    return { reason: 'Use ASCII characters only; convert internationalized domain names to punycode.', localPart: null, domain: null }
  }

  const at = input.indexOf('@')
  if (at < 0 || at !== input.lastIndexOf('@')) {
    return { reason: 'Enter exactly one email address with one @ separator.', localPart: null, domain: null }
  }
  const localPart = input.slice(0, at)
  const domain = input.slice(at + 1)

  if (!localPart) return { reason: 'The local part before @ must not be empty.', localPart, domain }
  if (!domain) return { reason: 'The domain after @ must not be empty.', localPart, domain }
  if (localPart.length > MAX_LOCAL_PART_LENGTH) {
    return { reason: `The local part must be ${MAX_LOCAL_PART_LENGTH} characters or fewer.`, localPart, domain }
  }

  const atoms = localPart.split('.')
  if (atoms.some(atom => atom.length === 0 || !ATEXT.test(atom))) {
    return {
      reason: 'The local part must use dot-atom syntax; dots cannot be first, last, or consecutive.',
      localPart,
      domain,
    }
  }

  if (domain.length > MAX_DOMAIN_LENGTH) {
    return { reason: `The domain must be ${MAX_DOMAIN_LENGTH} characters or fewer.`, localPart, domain }
  }
  const labels = domain.split('.')
  if (labels.length < 2) {
    return { reason: 'The domain must contain at least two labels, including a top-level domain.', localPart, domain }
  }
  if (labels.some(label => label.length === 0)) {
    return { reason: 'Domain labels must not be empty.', localPart, domain }
  }
  if (labels.some(label => label.length > MAX_LABEL_LENGTH)) {
    return { reason: `Each domain label must be ${MAX_LABEL_LENGTH} characters or fewer.`, localPart, domain }
  }
  if (labels.some(label => !DOMAIN_LABEL.test(label))) {
    return { reason: 'Domain labels must contain only letters, digits, or internal hyphens.', localPart, domain }
  }
  if (!DOMAIN_SUFFIX.test(labels[labels.length - 1])) {
    return { reason: 'The final domain label must be a 2- to 63-letter suffix or a punycode label.', localPart, domain }
  }

  return null
}

export function run(input: string, options: ToolOptions = {}): string {
  if (typeof input !== 'string') throw new Error('Input must be text.')
  if (input.length > MAX_INPUT_LENGTH) throw new Error(`Input must be ${MAX_INPUT_LENGTH} characters or fewer.`)
  if (!input) throw new Error('Enter one email address.')
  validateOptions(options)

  const invalid = getInvalidReason(input)
  const valid = invalid === null
  const localPart = valid ? input.slice(0, input.indexOf('@')) : invalid.localPart
  const domain = valid ? input.slice(input.indexOf('@') + 1) : invalid.domain
  const result: ValidationResult = {
    input,
    valid,
    localPart,
    domain,
    normalized: valid ? `${localPart}@${domain?.toLowerCase()}` : null,
    reason: invalid?.reason ?? null,
    message: valid
      ? 'Syntax is valid. DNS, mailbox existence, and deliverability were not checked.'
      : invalid.reason,
  }
  const output = JSON.stringify(result, null, 2)
  if (output.length > MAX_OUTPUT_LENGTH) throw new Error('The result exceeded the output limit.')
  return output
}
