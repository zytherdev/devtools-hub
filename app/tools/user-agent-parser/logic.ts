import type { ToolOptions } from '@/app/tools/types'

export const MAX_USER_AGENT_LENGTH = 2048

export type ParsedUserAgent = {
  userAgent: string
  browser: { name: string | null; version: string | null; major: string | null }
  engine: { name: string | null; version: string | null }
  os: { name: string | null; version: string | null }
  device: { type: 'desktop' | 'mobile' | 'tablet' | 'bot' | 'unknown'; vendor: string | null; model: string | null }
}

type MatchResult = { name: string; version: string | null }

function firstMatch(value: string, patterns: Array<[RegExp, string, number?]>): MatchResult | null {
  for (const [pattern, name, versionGroup = 1] of patterns) {
    const match = pattern.exec(value)
    if (match) return { name, version: match[versionGroup] ?? null }
  }
  return null
}

function parseBrowser(ua: string): MatchResult | null {
  return firstMatch(ua, [
    [/(?:EdgA|EdgiOS|Edg)\/([\d.]+)/i, 'Microsoft Edge'],
    [/Edge\/([\d.]+)/i, 'Microsoft Edge'],
    [/(?:OPR|Opera)\/([\d.]+)/i, 'Opera'],
    [/SamsungBrowser\/([\d.]+)/i, 'Samsung Internet'],
    [/(?:UCBrowser|UC Browser)\/([\d.]+)/i, 'UC Browser'],
    [/(?:FxiOS|Firefox)\/([\d.]+)/i, 'Firefox'],
    [/(?:CriOS|Chrome)\/([\d.]+)/i, 'Chrome'],
    [/Chromium\/([\d.]+)/i, 'Chromium'],
    [/Version\/([\d.]+).*Safari/i, 'Safari'],
    [/MSIE\s([\d.]+)/i, 'Internet Explorer'],
    [/Trident\/.*rv:([\d.]+)/i, 'Internet Explorer']
  ])
}

function parseEngine(ua: string, browser: MatchResult | null): MatchResult | null {
  const trident = /Trident\/([\d.]+)/i.exec(ua)
  if (trident) return { name: 'Trident', version: trident[1] }
  const edgeHtml = /Edge\/([\d.]+)/i.exec(ua)
  if (edgeHtml) return { name: 'EdgeHTML', version: edgeHtml[1] }
  const presto = /Presto\/([\d.]+)/i.exec(ua)
  if (presto) return { name: 'Presto', version: presto[1] }
  const gecko = /Gecko\/([\d.]+)/i.exec(ua)
  if (gecko && /\brv:[\d.]+/i.test(ua)) {
    const version = /\brv:([\d.]+)/i.exec(ua)
    return { name: 'Gecko', version: version?.[1] ?? gecko[1] }
  }
  const webkit = /AppleWebKit\/([\d.]+)/i.exec(ua)
  if (webkit) {
    const isBlinkBrowser = browser?.name === 'Chrome' || browser?.name === 'Chromium' || browser?.name === 'Microsoft Edge' || browser?.name === 'Opera' || browser?.name === 'Samsung Internet'
    return { name: isBlinkBrowser ? 'Blink' : 'WebKit', version: isBlinkBrowser ? browser.version : webkit[1] }
  }
  return null
}

function parseOs(ua: string): MatchResult | null {
  const ios = /(?:CPU (?:iPhone )?OS|iPhone OS) ([\d_]+)/i.exec(ua)
  if (ios) return { name: 'iOS', version: ios[1].replace(/_/g, '.') }
  const android = /Android[\s/-]?([\d.]+)?/i.exec(ua)
  if (android) return { name: 'Android', version: android[1] ?? null }
  const windowsPhone = /Windows Phone(?: OS)? ([\d.]+)/i.exec(ua)
  if (windowsPhone) return { name: 'Windows Phone', version: windowsPhone[1] }
  const windows = /Windows NT ([\d.]+)/i.exec(ua)
  if (windows) {
    const names: Record<string, string> = {
      '10.0': '10', '6.4': '10', '6.3': '8.1', '6.2': '8', '6.1': '7', '6.0': 'Vista', '5.2': 'XP', '5.1': 'XP', '5.0': '2000'
    }
    return { name: 'Windows', version: names[windows[1]] ?? windows[1] }
  }
  const mac = /Mac OS X ([\d_]+)/i.exec(ua)
  if (mac) return { name: 'macOS', version: mac[1].replace(/_/g, '.') }
  if (/CrOS\s/i.test(ua)) {
    const chromeOs = /CrOS [^\s]+ ([\d.]+)/i.exec(ua)
    return { name: 'Chrome OS', version: chromeOs?.[1] ?? null }
  }
  if (/FreeBSD/i.test(ua)) return { name: 'FreeBSD', version: null }
  if (/OpenBSD/i.test(ua)) return { name: 'OpenBSD', version: null }
  if (/Linux/i.test(ua)) return { name: 'Linux', version: null }
  return null
}

function parseDevice(ua: string, os: MatchResult | null): ParsedUserAgent['device'] {
  if (/(?:bot|crawler|spider|slurp|facebookexternalhit|preview)/i.test(ua)) {
    return { type: 'bot', vendor: null, model: null }
  }
  if (/iPad/i.test(ua) || (/Macintosh/i.test(ua) && /\bMobile\//i.test(ua))) {
    return { type: 'tablet', vendor: 'Apple', model: 'iPad' }
  }
  if (/iPod/i.test(ua)) return { type: 'mobile', vendor: 'Apple', model: 'iPod' }
  if (/iPhone/i.test(ua)) return { type: 'mobile', vendor: 'Apple', model: 'iPhone' }

  const pixel = /\b(Pixel(?:\s[\w-]+)?)\b/i.exec(ua)
  if (pixel) return { type: /\bPixel C\b/i.test(pixel[1]) ? 'tablet' : 'mobile', vendor: 'Google', model: pixel[1] }
  const samsung = /\b(SM-[A-Z0-9-]+|GT-[A-Z0-9-]+)\b/i.exec(ua)
  if (samsung) return { type: /\b(?:Tab|GT-P|SM-T)/i.test(samsung[1]) ? 'tablet' : 'mobile', vendor: 'Samsung', model: samsung[1] }

  if (/\bKindle\b|\bSilk\//i.test(ua)) {
    const kindle = /\b(Kindle(?:\sFire)?|KF[A-Z0-9]+)\b/i.exec(ua)
    return { type: 'tablet', vendor: 'Amazon', model: kindle?.[1] ?? null }
  }
  if (os?.name === 'Android') {
    const androidModel = /Android[^;)]*;\s*(?:[^;)]*;\s*)?([^;)]+?)(?:\s+Build\/[^;)]+)?\s*(?:[);]|$)/i.exec(ua)
    const model = androidModel?.[1]?.trim()
    const looksTablet = /\b(?:tablet|SM-T|GT-P|Pixel C)\b/i.test(ua)
    return { type: looksTablet ? 'tablet' : 'mobile', vendor: model ? (/^SM-/i.test(model) ? 'Samsung' : /^Pixel/i.test(model) ? 'Google' : null) : null, model: model || null }
  }
  if (os?.name === 'Windows' || os?.name === 'macOS' || os?.name === 'Linux' || os?.name === 'Chrome OS' || os?.name === 'FreeBSD' || os?.name === 'OpenBSD') {
    return { type: 'desktop', vendor: null, model: null }
  }
  return { type: 'unknown', vendor: null, model: null }
}

function validateUserAgent(input: unknown): string {
  if (typeof input !== 'string') throw new Error('User-agent input must be text.')
  if (input.length > MAX_USER_AGENT_LENGTH) throw new Error(`User-agent input must be ${MAX_USER_AGENT_LENGTH} characters or fewer.`)
  const userAgent = input.trim()
  if (!userAgent) throw new Error('Enter a user-agent string to parse.')
  if (/[\u0000-\u001f\u007f]/.test(userAgent)) throw new Error('User-agent input must not contain control characters.')
  return userAgent
}

function isPlainOptionsObject(options: unknown): options is ToolOptions {
  if (typeof options !== 'object' || options === null || Array.isArray(options)) return false
  const prototype = Object.getPrototypeOf(options)
  return (prototype === Object.prototype || prototype === null) && Reflect.ownKeys(options).length === 0
}

export function parseUserAgent(input: unknown): ParsedUserAgent {
  const userAgent = validateUserAgent(input)
  const browser = parseBrowser(userAgent)
  const engine = parseEngine(userAgent, browser)
  const os = parseOs(userAgent)
  return {
    userAgent,
    browser: {
      name: browser?.name ?? null,
      version: browser?.version ?? null,
      major: browser?.version?.split('.')[0] ?? null
    },
    engine: { name: engine?.name ?? null, version: engine?.version ?? null },
    os: { name: os?.name ?? null, version: os?.version ?? null },
    device: parseDevice(userAgent, os)
  }
}

export function run(input: string, options: ToolOptions = {}): string {
  if (!isPlainOptionsObject(options)) {
    if (typeof options === 'object' && options !== null && !Array.isArray(options) && Reflect.ownKeys(options).length > 0) {
      throw new Error(`Unsupported option: ${String(Reflect.ownKeys(options)[0])}. This tool does not accept options.`)
    }
    throw new Error('Options must be an empty plain object.')
  }
  return JSON.stringify(parseUserAgent(input), null, 2)
}
