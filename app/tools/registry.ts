import type { ToolCategory, ToolDefinition } from './types'
import { tool as cssMinifier } from './css-minifier/definition'
import { tool as cssBeautifier } from './css-beautifier/definition'
import { tool as gradientGenerator } from './gradient-generator/definition'
import { tool as boxShadowGenerator } from './box-shadow-generator/definition'
import { tool as svgToCss } from './svg-to-css/definition'
import { tool as jsMinifier } from './js-minifier/definition'
import { tool as jsBeautifier } from './js-beautifier/definition'
import { tool as htmlToJsx } from './html-to-jsx/definition'
import { tool as curlToCode } from './curl-to-code/definition'
import { tool as htmlMinifier } from './html-minifier/definition'
import { tool as htmlBeautifier } from './html-beautifier/definition'
import { tool as markdownToHtml } from './markdown-to-html/definition'
import { tool as faviconGenerator } from './favicon-generator/definition'
import { tool as jsonFormatter } from './json-formatter/definition'
import { tool as xmlFormatter } from './xml-formatter/definition'
import { tool as yamlFormatter } from './yaml-formatter/definition'
import { tool as csvFormatter } from './csv-formatter/definition'
import { tool as tomlFormatter } from './toml-formatter/definition'
import { tool as xmlToJson } from './xml-to-json/definition'
import { tool as yamlToJson } from './yaml-to-json/definition'
import { tool as jsonToXml } from './json-to-xml/definition'
import { tool as csvToJson } from './csv-to-json/definition'
import { tool as tomlJsonConverter } from './toml-json-converter/definition'
import { tool as phpJsonConverter } from './php-json-converter/definition'
import { tool as jsonSchemaGenerator } from './json-schema-generator/definition'
import { tool as base64Encoder } from './base64-encoder/definition'
import { tool as urlEncoder } from './url-encoder/definition'
import { tool as htmlEncoder } from './html-encoder/definition'
import { tool as jwtDecoder } from './jwt-decoder/definition'
import { tool as jwtGenerator } from './jwt-generator/definition'
import { tool as unicodeConverter } from './unicode-converter/definition'
import { tool as asciiConverter } from './ascii-converter/definition'
import { tool as mimeTypeValidator } from './mime-type-validator/definition'
import { tool as uuidGenerator } from './uuid-generator/definition'
import { tool as passwordGenerator } from './password-generator/definition'
import { tool as qrGenerator } from './qr-generator/definition'
import { tool as robotsTxtGenerator } from './robots-txt-generator/definition'
import { tool as sitemapGenerator } from './sitemap-generator/definition'
import { tool as randomNumberGenerator } from './random-number-generator/definition'
import { tool as cronGenerator } from './cron-generator/definition'
import { tool as barcodeGenerator } from './barcode-generator/definition'
import { tool as openapiGenerator } from './openapi-generator/definition'
import { tool as mockApiGenerator } from './mock-api-generator/definition'
import { tool as regexTester } from './regex-tester/definition'
import { tool as textCaseConverter } from './text-case-converter/definition'
import { tool as wordCounter } from './word-counter/definition'
import { tool as diffChecker } from './diff-checker/definition'
import { tool as jsonDiff } from './json-diff/definition'
import { tool as loremIpsum } from './lorem-ipsum/definition'
import { tool as removeDuplicateLines } from './remove-duplicate-lines/definition'
import { tool as slugGenerator } from './slug-generator/definition'
import { tool as lineSorter } from './line-sorter/definition'
import { tool as colorConverter } from './color-converter/definition'
import { tool as unitConverter } from './unit-converter/definition'
import { tool as timestampConverter } from './timestamp-converter/definition'
import { tool as numberBaseConverter } from './number-base-converter/definition'
import { tool as currencyConverter } from './currency-converter/definition'
import { tool as fileSizeConverter } from './file-size-converter/definition'
import { tool as romanNumeral } from './roman-numeral/definition'
import { tool as sqlFormatter } from './sql-formatter/definition'
import { tool as dockerComposeConverter } from './docker-compose-converter/definition'
import { tool as kubernetesDecoder } from './kubernetes-decoder/definition'
import { tool as chmodCalculator } from './chmod-calculator/definition'
import { tool as subnetCalculator } from './subnet-calculator/definition'
import { tool as sslChecker } from './ssl-checker/definition'
import { tool as passwordStrength } from './password-strength/definition'
import { tool as emailValidator } from './email-validator/definition'
import { tool as hashGenerator } from './hash-generator/definition'
import { tool as hashVerifier } from './hash-verifier/definition'
import { tool as rsaKeyGenerator } from './rsa-key-generator/definition'
import { tool as bcryptGenerator } from './bcrypt-generator/definition'
import { tool as hmacGenerator } from './hmac-generator/definition'
import { tool as aesEncryptor } from './aes-encryptor/definition'
import { tool as certificateDecoder } from './certificate-decoder/definition'
import { tool as cronValidator } from './cron-validator/definition'
import { tool as etaCalculator } from './eta-calculator/definition'
import { tool as dateDifference } from './date-difference/definition'
import { tool as timezoneConverter } from './timezone-converter/definition'
import { tool as textStatistics } from './text-statistics/definition'
import { tool as ipLookup } from './ip-lookup/definition'
import { tool as userAgentParser } from './user-agent-parser/definition'
import { tool as macLookup } from './mac-lookup/definition'
import { tool as httpStatusCodes } from './http-status-codes/definition'
import { tool as emojiPicker } from './emoji-picker/definition'
import { tool as bip39Generator } from './bip39-generator/definition'
import { tool as benchmarkTool } from './benchmark-tool/definition'

export const allTools: ToolDefinition[] = [cssMinifier, cssBeautifier, gradientGenerator, boxShadowGenerator, svgToCss, jsMinifier, jsBeautifier, htmlToJsx, curlToCode, htmlMinifier, htmlBeautifier, markdownToHtml, faviconGenerator, jsonFormatter, xmlFormatter, yamlFormatter, csvFormatter, tomlFormatter, xmlToJson, yamlToJson, jsonToXml, csvToJson, tomlJsonConverter, phpJsonConverter, jsonSchemaGenerator, base64Encoder, urlEncoder, htmlEncoder, jwtDecoder, jwtGenerator, unicodeConverter, asciiConverter, mimeTypeValidator, uuidGenerator, passwordGenerator, qrGenerator, robotsTxtGenerator, sitemapGenerator, randomNumberGenerator, cronGenerator, barcodeGenerator, openapiGenerator, mockApiGenerator, regexTester, textCaseConverter, wordCounter, diffChecker, jsonDiff, loremIpsum, removeDuplicateLines, slugGenerator, lineSorter, colorConverter, unitConverter, timestampConverter, numberBaseConverter, currencyConverter, fileSizeConverter, romanNumeral, sqlFormatter, dockerComposeConverter, kubernetesDecoder, chmodCalculator, subnetCalculator, sslChecker, passwordStrength, emailValidator, hashGenerator, hashVerifier, rsaKeyGenerator, bcryptGenerator, hmacGenerator, aesEncryptor, certificateDecoder, cronValidator, etaCalculator, dateDifference, timezoneConverter, textStatistics, ipLookup, userAgentParser, macLookup, httpStatusCodes, emojiPicker, bip39Generator, benchmarkTool]

const categoryMetadata = [
  {
    "id": "css",
    "name": "CSS & Style",
    "icon": "fa-brands fa-css3-alt",
    "color": "#3b82f6"
  },
  {
    "id": "js",
    "name": "JavaScript",
    "icon": "fa-brands fa-js",
    "color": "#f97316"
  },
  {
    "id": "html",
    "name": "HTML & Markup",
    "icon": "fa-brands fa-html5",
    "color": "#ea580c"
  },
  {
    "id": "data",
    "name": "JSON, YAML, XML, CSV",
    "icon": "fa-solid fa-file",
    "color": "#22c55e"
  },
  {
    "id": "encoder",
    "name": "Encoders & Decoders",
    "icon": "fa-solid fa-lock",
    "color": "#ef4444"
  },
  {
    "id": "generator",
    "name": "Generators",
    "icon": "fa-solid fa-wand-magic-sparkles",
    "color": "#eb78de"
  },
  {
    "id": "text",
    "name": "Text & String",
    "icon": "fa-solid fa-font",
    "color": "#14b8a6"
  },
  {
    "id": "converter",
    "name": "Converters",
    "icon": "fa-solid fa-arrows-rotate",
    "color": "#9bd5ed"
  },
  {
    "id": "database",
    "name": "Database & DevOps",
    "icon": "fa-solid fa-database",
    "color": "#75aaf5"
  },
  {
    "id": "security",
    "name": "Security & Crypto",
    "icon": "fa-solid fa-shield-halved",
    "color": "#fbbf24"
  },
  {
    "id": "date",
    "name": "Date & Time",
    "icon": "fa-solid fa-clock",
    "color": "#f59e0b"
  },
  {
    "id": "network",
    "name": "Network & Lookup",
    "icon": "fa-solid fa-network-wired",
    "color": "#06b6d4"
  },
  {
    "id": "misc",
    "name": "Miscellaneous",
    "icon": "fa-solid fa-ellipsis-h",
    "color": "#7d7d7d"
  }
] satisfies Omit<ToolCategory, 'tools'>[]
export const categories: ToolCategory[] = categoryMetadata.map(category => ({
  ...category,
  tools: allTools.filter(tool => tool.categoryId === category.id),
}))

export const quickTools = ["css-minifier","js-minifier","html-minifier","json-formatter","color-converter","regex-tester"]
  .map(id => allTools.find(tool => tool.id === id))
  .filter((tool): tool is ToolDefinition => tool !== undefined)
export const colorTools = allTools.filter(tool => tool.id === 'color-converter' || tool.id === 'gradient-generator')
export const cssTools = categories.find(category => category.id === 'css')!.tools
export const jsTools = categories.find(category => category.id === 'js')!.tools
export const htmlTools = categories.find(category => category.id === 'html')!.tools
export const dataTools = categories.find(category => category.id === 'data')!.tools
export const encoderTools = categories.find(category => category.id === 'encoder')!.tools
export const generatorTools = categories.find(category => category.id === 'generator')!.tools
export const textTools = categories.find(category => category.id === 'text')!.tools
export const converterTools = categories.find(category => category.id === 'converter')!.tools
export const databaseTools = categories.find(category => category.id === 'database')!.tools
export const securityTools = categories.find(category => category.id === 'security')!.tools
export const dateTools = categories.find(category => category.id === 'date')!.tools
export const networkTools = categories.find(category => category.id === 'network')!.tools
export const miscTools = categories.find(category => category.id === 'misc')!.tools

export function getToolCatalogIssues(): string[] {
  const issues: string[] = []
  const ids = new Set<string>()
  const hrefs = new Set<string>()
  for (const tool of allTools) {
    const slug = tool.href.replace(/^\//, '')
    if (ids.has(tool.id)) issues.push(`Duplicate tool id: ${tool.id}`)
    if (hrefs.has(tool.href)) issues.push(`Duplicate tool href: ${tool.href}`)
    if (tool.id !== slug) issues.push(`Tool id and route slug differ: ${tool.id} -> ${tool.href}`)
    if (tool.id !== tool.id.toLowerCase() || tool.id.includes('_') || tool.id.includes(' ')) issues.push(`Tool id must be lowercase kebab-case: ${tool.id}`)
    if (!slug || slug.includes('/')) issues.push(`Invalid tool route: ${tool.href}`)
    ids.add(tool.id)
    hrefs.add(tool.href)
  }
  const categorized = new Set<string>()
  for (const category of categories) {
    if (!category.id || !category.name) issues.push('Category is missing an id or name')
    for (const tool of category.tools) {
      if (categorized.has(tool.id)) issues.push(`Tool appears in multiple categories: ${tool.id}`)
      if (tool.categoryId !== category.id) issues.push(`Tool category mismatch: ${tool.id}`)
      categorized.add(tool.id)
    }
  }
  for (const tool of allTools) if (!categorized.has(tool.id)) issues.push(`Tool is missing from categories: ${tool.id}`)
  return issues
}
