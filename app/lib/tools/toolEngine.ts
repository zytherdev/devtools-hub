import type { ToolOptions, ToolRunner } from '@/app/tools/types'
import { run as runAesEncryptor } from '@/app/tools/aes-encryptor/logic'
import { run as runAsciiConverter } from '@/app/tools/ascii-converter/logic'
import { run as runBase64Encoder } from '@/app/tools/base64-encoder/logic'
import { run as runBarcodeGenerator } from '@/app/tools/barcode-generator/logic'
import { run as runBenchmarkTool } from '@/app/tools/benchmark-tool/logic'
import { run as runBcryptGenerator } from '@/app/tools/bcrypt-generator/logic'
import { run as runChmodCalculator } from '@/app/tools/chmod-calculator/logic'
import { run as runCertificateDecoder } from '@/app/tools/certificate-decoder/logic'
import { run as runCsvFormatter } from '@/app/tools/csv-formatter/logic'
import { run as runCsvToJson } from '@/app/tools/csv-to-json/logic'
import { run as runCronGenerator } from '@/app/tools/cron-generator/logic'
import { run as runCronValidator } from '@/app/tools/cron-validator/logic'
import { run as runCurrencyConverter } from '@/app/tools/currency-converter/logic'
import { run as runDateDifference } from '@/app/tools/date-difference/logic'
import { run as runDiffChecker } from '@/app/tools/diff-checker/logic'
import { run as runDockerComposeConverter } from '@/app/tools/docker-compose-converter/logic'
import { run as runEmailValidator } from '@/app/tools/email-validator/logic'
import { run as runEmojiPicker } from '@/app/tools/emoji-picker/logic'
import { run as runEtaCalculator } from '@/app/tools/eta-calculator/logic'
import { run as runFileSizeConverter } from '@/app/tools/file-size-converter/logic'
import { run as runFaviconGenerator } from '@/app/tools/favicon-generator/logic'
import { run as runHtmlBeautifier } from '@/app/tools/html-beautifier/logic'
import { run as runHtmlEncoder } from '@/app/tools/html-encoder/logic'
import { run as runHashGenerator } from '@/app/tools/hash-generator/logic'
import { run as runHashVerifier } from '@/app/tools/hash-verifier/logic'
import { run as runHmacGenerator } from '@/app/tools/hmac-generator/logic'
import { run as runHttpStatusCodes } from '@/app/tools/http-status-codes/logic'
import { run as runJsonDiff } from '@/app/tools/json-diff/logic'
import { run as runJsonSchemaGenerator } from '@/app/tools/json-schema-generator/logic'
import { run as runJsonToXml } from '@/app/tools/json-to-xml/logic'
import { run as runJwtDecoder } from '@/app/tools/jwt-decoder/logic'
import { run as runJwtGenerator } from '@/app/tools/jwt-generator/logic'
import { run as runKubernetesDecoder } from '@/app/tools/kubernetes-decoder/logic'
import { run as runLineSorter } from '@/app/tools/line-sorter/logic'
import { run as runLoremIpsum } from '@/app/tools/lorem-ipsum/logic'
import { run as runMarkdownToHtml } from '@/app/tools/markdown-to-html/logic'
import { run as runMimeTypeValidator } from '@/app/tools/mime-type-validator/logic'
import { run as runMockApiGenerator } from '@/app/tools/mock-api-generator/logic'
import { run as runNumberBaseConverter } from '@/app/tools/number-base-converter/logic'
import { run as runOpenApiGenerator } from '@/app/tools/openapi-generator/logic'
import { run as runPasswordGenerator } from '@/app/tools/password-generator/logic'
import { run as runPasswordStrength } from '@/app/tools/password-strength/logic'
import { run as runPhpJsonConverter } from '@/app/tools/php-json-converter/logic'
import { run as runQrGenerator } from '@/app/tools/qr-generator/logic'
import { run as runRandomNumberGenerator } from '@/app/tools/random-number-generator/logic'
import { run as runRemoveDuplicateLines } from '@/app/tools/remove-duplicate-lines/logic'
import { run as runRsaKeyGenerator } from '@/app/tools/rsa-key-generator/logic'
import { run as runRobotsTxtGenerator } from '@/app/tools/robots-txt-generator/logic'
import { run as runRomanNumeral } from '@/app/tools/roman-numeral/logic'
import { run as runSitemapGenerator } from '@/app/tools/sitemap-generator/logic'
import { run as runSlugGenerator } from '@/app/tools/slug-generator/logic'
import { run as runSqlFormatter } from '@/app/tools/sql-formatter/logic'
import { run as runSslChecker } from '@/app/tools/ssl-checker/logic'
import { run as runSubnetCalculator } from '@/app/tools/subnet-calculator/logic'
import { run as runTimestampConverter } from '@/app/tools/timestamp-converter/logic'
import { run as runTomlFormatter } from '@/app/tools/toml-formatter/logic'
import { run as runTomlJsonConverter } from '@/app/tools/toml-json-converter/logic'
import { run as runTextCaseConverter } from '@/app/tools/text-case-converter/logic'
import { run as runTextStatistics } from '@/app/tools/text-statistics/logic'
import { run as runTimezoneConverter } from '@/app/tools/timezone-converter/logic'
import { run as runUnicodeConverter } from '@/app/tools/unicode-converter/logic'
import { run as runUnitConverter } from '@/app/tools/unit-converter/logic'
import { run as runUrlEncoder } from '@/app/tools/url-encoder/logic'
import { run as runUserAgentParser } from '@/app/tools/user-agent-parser/logic'
import { run as runUuidGenerator } from '@/app/tools/uuid-generator/logic'
import { run as runXmlFormatter } from '@/app/tools/xml-formatter/logic'
import { run as runXmlToJson } from '@/app/tools/xml-to-json/logic'
import { run as runYamlFormatter } from '@/app/tools/yaml-formatter/logic'
import { run as runYamlToJson } from '@/app/tools/yaml-to-json/logic'
import { run as runWordCounter } from '@/app/tools/word-counter/logic'

const handlers: Record<string, ToolRunner> = {
  'aes-encryptor': runAesEncryptor,
  'ascii-converter': runAsciiConverter,
  'base64-encoder': runBase64Encoder,
  'barcode-generator': runBarcodeGenerator,
  'benchmark-tool': runBenchmarkTool,
  'bcrypt-generator': runBcryptGenerator,
  'chmod-calculator': runChmodCalculator,
  'certificate-decoder': runCertificateDecoder,
  'csv-formatter': runCsvFormatter,
  'csv-to-json': runCsvToJson,
  'cron-generator': runCronGenerator,
  'cron-validator': runCronValidator,
  'currency-converter': runCurrencyConverter,
  'date-difference': runDateDifference,
  'diff-checker': runDiffChecker,
  'docker-compose-converter': runDockerComposeConverter,
  'email-validator': runEmailValidator,
  'emoji-picker': runEmojiPicker,
  'eta-calculator': runEtaCalculator,
  'file-size-converter': runFileSizeConverter,
  'favicon-generator': runFaviconGenerator,
  'hash-generator': runHashGenerator,
  'hash-verifier': runHashVerifier,
  'hmac-generator': runHmacGenerator,
  'html-beautifier': runHtmlBeautifier,
  'html-encoder': runHtmlEncoder,
  'http-status-codes': runHttpStatusCodes,
  'json-diff': runJsonDiff,
  'json-schema-generator': runJsonSchemaGenerator,
  'json-to-xml': runJsonToXml,
  'jwt-decoder': runJwtDecoder,
  'jwt-generator': runJwtGenerator,
  'kubernetes-decoder': runKubernetesDecoder,
  'line-sorter': runLineSorter,
  'lorem-ipsum': runLoremIpsum,
  'markdown-to-html': runMarkdownToHtml,
  'mime-type-validator': runMimeTypeValidator,
  'mock-api-generator': runMockApiGenerator,
  'number-base-converter': runNumberBaseConverter,
  'openapi-generator': runOpenApiGenerator,
  'password-generator': runPasswordGenerator,
  'password-strength': runPasswordStrength,
  'php-json-converter': runPhpJsonConverter,
  'qr-generator': runQrGenerator,
  'random-number-generator': runRandomNumberGenerator,
  'remove-duplicate-lines': runRemoveDuplicateLines,
  'rsa-key-generator': runRsaKeyGenerator,
  'robots-txt-generator': runRobotsTxtGenerator,
  'roman-numeral': runRomanNumeral,
  'sitemap-generator': runSitemapGenerator,
  'slug-generator': runSlugGenerator,
  'sql-formatter': runSqlFormatter,
  'ssl-checker': runSslChecker,
  'subnet-calculator': runSubnetCalculator,
  'text-case-converter': runTextCaseConverter,
  'text-statistics': runTextStatistics,
  'timestamp-converter': runTimestampConverter,
  'timezone-converter': runTimezoneConverter,
  'toml-formatter': runTomlFormatter,
  'toml-json-converter': runTomlJsonConverter,
  'unicode-converter': runUnicodeConverter,
  'unit-converter': runUnitConverter,
  'url-encoder': runUrlEncoder,
  'user-agent-parser': runUserAgentParser,
  'uuid-generator': runUuidGenerator,
  'xml-formatter': runXmlFormatter,
  'xml-to-json': runXmlToJson,
  'yaml-formatter': runYamlFormatter,
  'yaml-to-json': runYamlToJson,
  'word-counter': runWordCounter,
}

export const genericToolSlugs = Object.keys(handlers)

export async function runTool(slug: string, input: string, options: ToolOptions = {}): Promise<string> {
  const handler = handlers[slug]
  if (!handler) throw new Error('This tool has no generic text processor.')
  return handler(input, options)
}
