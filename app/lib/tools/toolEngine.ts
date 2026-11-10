import type { ToolOptions, ToolRunner } from '@/app/tools/types'
import { run as runBase64Encoder } from '@/app/tools/base64-encoder/logic'
import { run as runCsvFormatter } from '@/app/tools/csv-formatter/logic'
import { run as runCsvToJson } from '@/app/tools/csv-to-json/logic'
import { run as runFaviconGenerator } from '@/app/tools/favicon-generator/logic'
import { run as runHtmlBeautifier } from '@/app/tools/html-beautifier/logic'
import { run as runHtmlEncoder } from '@/app/tools/html-encoder/logic'
import { run as runJsonSchemaGenerator } from '@/app/tools/json-schema-generator/logic'
import { run as runJsonToXml } from '@/app/tools/json-to-xml/logic'
import { run as runJwtDecoder } from '@/app/tools/jwt-decoder/logic'
import { run as runJwtGenerator } from '@/app/tools/jwt-generator/logic'
import { run as runMarkdownToHtml } from '@/app/tools/markdown-to-html/logic'
import { run as runPhpJsonConverter } from '@/app/tools/php-json-converter/logic'
import { run as runTomlFormatter } from '@/app/tools/toml-formatter/logic'
import { run as runTomlJsonConverter } from '@/app/tools/toml-json-converter/logic'
import { run as runUnicodeConverter } from '@/app/tools/unicode-converter/logic'
import { run as runUrlEncoder } from '@/app/tools/url-encoder/logic'
import { run as runXmlFormatter } from '@/app/tools/xml-formatter/logic'
import { run as runXmlToJson } from '@/app/tools/xml-to-json/logic'
import { run as runYamlFormatter } from '@/app/tools/yaml-formatter/logic'
import { run as runYamlToJson } from '@/app/tools/yaml-to-json/logic'

const handlers: Record<string, ToolRunner> = {
  'base64-encoder': runBase64Encoder,
  'csv-formatter': runCsvFormatter,
  'csv-to-json': runCsvToJson,
  'favicon-generator': runFaviconGenerator,
  'html-beautifier': runHtmlBeautifier,
  'html-encoder': runHtmlEncoder,
  'json-schema-generator': runJsonSchemaGenerator,
  'json-to-xml': runJsonToXml,
  'jwt-decoder': runJwtDecoder,
  'jwt-generator': runJwtGenerator,
  'markdown-to-html': runMarkdownToHtml,
  'php-json-converter': runPhpJsonConverter,
  'toml-formatter': runTomlFormatter,
  'toml-json-converter': runTomlJsonConverter,
  'unicode-converter': runUnicodeConverter,
  'url-encoder': runUrlEncoder,
  'xml-formatter': runXmlFormatter,
  'xml-to-json': runXmlToJson,
  'yaml-formatter': runYamlFormatter,
  'yaml-to-json': runYamlToJson,
}

export const genericToolSlugs = Object.keys(handlers)

export async function runTool(slug: string, input: string, options: ToolOptions = {}): Promise<string> {
  const handler = handlers[slug]
  if (!handler) throw new Error('This tool has no generic text processor.')
  return handler(input, options)
}
