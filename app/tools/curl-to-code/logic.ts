export type Language = 'javascript' | 'python' | 'php' | 'go' | 'ruby' | 'java' | 'csharp'
export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'

export interface FormField {
  name: string
  value: string
}

export interface CurlToCodeOptions {
  language: Language
  method: Method
  url: string
  headers: Record<string, string>
  data?: string
  formData?: FormField[]
  auth?: { username: string; password: string }
  bearerToken?: string
}

const METHODS = new Set<Method>(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'])
const LANGUAGES = new Set<Language>(['javascript', 'python', 'php', 'go', 'ruby', 'java', 'csharp'])
const UNSUPPORTED_SEMANTIC_OPTIONS = new Set([
  '-L', '--location', '--location-trusted',
  '-f', '--fail', '--fail-early', '--fail-with-body',
  '-m', '--max-time', '--connect-timeout', '--connect-timeout-ms',
  '--retry', '--retry-delay', '--retry-max-time', '--retry-all-errors', '--retry-connrefused',
  '--max-redirs', '--post301', '--post302', '--post303', '--speed-limit', '--speed-time', '--compressed',
])

function shellTokens(input: string): string[] | null {
  const tokens: string[] = []
  let token = ''
  let quote: "'" | '"' | null = null
  let active = false
  for (let i = 0; i < input.length; i++) {
    const char = input[i]
    if (quote === "'") {
      if (char === "'") quote = null
      else token += char
      active = true
      continue
    }
    if (char === '\\' && i + 1 < input.length) {
      const next = input[++i]
      if (next !== '\n' && next !== '\r') token += next
      active = true
      continue
    }
    if (quote === '"') {
      if (char === '"') quote = null
      else token += char
      active = true
      continue
    }
    if (char === "'" || char === '"') { quote = char; active = true; continue }
    if (/\s/.test(char)) {
      if (active) { tokens.push(token); token = ''; active = false }
      continue
    }
    token += char
    active = true
  }
  if (quote) return null
  if (active) tokens.push(token)
  return tokens
}

export function parseCurl(curlCommand: string): CurlToCodeOptions | null {
  if (!curlCommand || typeof curlCommand !== 'string' || curlCommand.length > 100_000) return null
  const tokens = shellTokens(curlCommand.trim())
  if (!tokens?.length || !/^curl(?:\.exe)?$/i.test(tokens[0])) return null
  const result: CurlToCodeOptions = { language: 'javascript', method: 'GET', url: '', headers: {} }
  let hasBody = false
  let hasExplicitMethod = false
  const take = (index: number, inline?: string): [string | undefined, number] => {
    if (inline !== undefined) return [inline, index]
    const value = tokens[index + 1]
    if (value === undefined || value.startsWith('-')) return [undefined, index]
    return [value, index + 1]
  }

  for (let i = 1; i < tokens.length; i++) {
    const arg = tokens[i]
    const equals = arg.startsWith('--') ? arg.indexOf('=') : -1
    const [name, inline] = equals >= 0 ? [arg.slice(0, equals), arg.slice(equals + 1)] : [arg, undefined]
    if (UNSUPPORTED_SEMANTIC_OPTIONS.has(name)) return null
    if (['-s', '--silent', '-S', '--show-error', '--globoff', '-v', '--verbose'].includes(name)) continue
    if (['-k', '--insecure', '-G', '--get', '--url-query', '-o', '--output', '-T', '--upload-file'].includes(name)) return null

    if (['-I', '--head'].includes(name)) { result.method = 'HEAD'; hasExplicitMethod = true; continue }
    if (name === '--url') {
      const [value, next] = take(i, inline)
      if (!value || result.url) return null
      result.url = value; i = next; continue
    }
    if (['-A', '--user-agent'].includes(name)) {
      const [value, next] = take(i, inline)
      if (value === undefined) return null
      result.headers['User-Agent'] = value; i = next; continue
    }
    if (['-X', '--request'].includes(name)) {
      const [value, next] = take(i, inline)
      if (!value) return null
      const method = value.toUpperCase() as Method
      if (!METHODS.has(method)) return null
      result.method = method; hasExplicitMethod = true; i = next; continue
    }
    if (['-H', '--header'].includes(name)) {
      const [value, next] = take(i, inline)
      if (value === undefined) return null
      const colon = value.indexOf(':')
      if (colon < 1) return null
      const key = value.slice(0, colon).trim()
      const headerValue = value.slice(colon + 1).trim()
      if (!/^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/.test(key) || /[\r\n]/.test(headerValue)) return null
      result.headers[key] = headerValue
      i = next; continue
    }
    if (['-d', '--data', '--data-raw', '--data-binary'].includes(name)) {
      const [value, next] = take(i, inline)
      if (value === undefined) return null
      result.data = result.data === undefined ? value : `${result.data}&${value}`
      hasBody = true; i = next; continue
    }
    if (['-F', '--form'].includes(name)) {
      const [value, next] = take(i, inline)
      if (value === undefined) return null
      const equalsIndex = value.indexOf('=')
      if (equalsIndex < 1) return null
      const fieldName = value.slice(0, equalsIndex)
      const fieldValue = value.slice(equalsIndex + 1)
      if (/[\r\n]/.test(fieldName) || fieldValue.startsWith('@') || fieldValue.startsWith('<')) return null
      result.formData ??= []
      result.formData.push({ name: fieldName, value: fieldValue })
      hasBody = true; i = next; continue
    }
    if (['-u', '--user'].includes(name)) {
      const [value, next] = take(i, inline)
      if (value === undefined) return null
      const colon = value.indexOf(':')
      if (colon < 0) return null
      result.auth = { username: value.slice(0, colon), password: value.slice(colon + 1) }; i = next; continue
    }
    if (name === '--bearer') {
      const [value, next] = take(i, inline)
      if (value === undefined) return null
      result.bearerToken = value; i = next; continue
    }
    if (name.startsWith('-')) return null
    if (/^https?:\/\//i.test(arg) && !result.url) result.url = arg
    else return null
  }
  if (!result.url) return null
  try { const parsed = new URL(result.url); if (!['http:', 'https:'].includes(parsed.protocol)) return null }
  catch { return null }
  if (result.data !== undefined && result.formData) return null
  if (hasBody && !hasExplicitMethod) result.method = 'POST'
  for (const [key, value] of Object.entries(result.headers)) {
    if (key.toLowerCase() === 'authorization' && /^Bearer\s+/i.test(value)) result.bearerToken = value.replace(/^Bearer\s+/i, '')
  }
  return result
}

function js(value: string): string { return JSON.stringify(value) }
function py(value: string): string { return JSON.stringify(value) }
function php(value: string): string { return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'` }
function go(value: string): string { return JSON.stringify(value) }
function ruby(value: string): string { return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'` }
function java(value: string): string { return JSON.stringify(value) }
function csharp(value: string): string { return JSON.stringify(value) }

function authHeader(options: CurlToCodeOptions): string | undefined {
  if (options.auth) {
    const bytes = new TextEncoder().encode(`${options.auth.username}:${options.auth.password}`)
    let binary = ''; bytes.forEach(byte => { binary += String.fromCharCode(byte) })
    return `Basic ${btoa(binary)}`
  }
  return options.bearerToken ? `Bearer ${options.bearerToken}` : undefined
}

function effectiveHeaders(options: CurlToCodeOptions): Record<string, string> {
  const headers = { ...options.headers }
  if (options.formData) {
    for (const key of Object.keys(headers)) if (key.toLowerCase() === 'content-type') delete headers[key]
  }
  if (options.data !== undefined && !Object.keys(headers).some(key => key.toLowerCase() === 'content-type')) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded'
  }
  const authorization = authHeader(options)
  if (authorization) {
    for (const key of Object.keys(headers)) if (key.toLowerCase() === 'authorization') delete headers[key]
    headers.Authorization = authorization
  }
  return headers
}

export function generateCode(options: CurlToCodeOptions): string {
  const headers = effectiveHeaders(options)
  switch (options.language) {
    case 'javascript': return generateJavaScript(options, headers)
    case 'python': return generatePython(options, headers)
    case 'php': return generatePHP(options, headers)
    case 'go': return generateGo(options, headers)
    case 'ruby': return generateRuby(options, headers)
    case 'java': return generateJava(options, headers)
    case 'csharp': return generateCSharp(options, headers)
  }
}

export function run(input: string, options: { language?: Language } = {}): string {
  const parsed = parseCurl(input)
  if (!parsed) throw new Error('Invalid or unsupported cURL command')
  const language = options.language ?? 'javascript'
  if (!LANGUAGES.has(language)) throw new Error('Unsupported target language')
  return generateCode({ ...parsed, language })
}

function bodyValue(options: CurlToCodeOptions): string | undefined { return options.data }

function generateJavaScript(o: CurlToCodeOptions, headers: Record<string,string>): string {
  const body = bodyValue(o)
  const hasForm = o.formData !== undefined
  if ((body !== undefined || hasForm) && (o.method === 'GET' || o.method === 'HEAD')) {
    throw new Error('JavaScript fetch cannot send a GET or HEAD request body. Choose another target language to preserve this cURL request.')
  }
  const fetchHeaders = { ...headers }
  const lines = [`const headers = ${JSON.stringify(fetchHeaders, null, 2)};`, 'const options = {', `  method: ${js(o.method)},`, '  headers,']
  if (hasForm) lines.push('  body: (() => { const form = new FormData();', ...o.formData!.map(field => `    form.append(${js(field.name)}, ${js(field.value)});`), '    return form; })(),')
  else if (body !== undefined) lines.push(`  body: ${js(body)},`)
  lines.push('};', '', `const response = await fetch(${js(o.url)}, options);`, 'const responseText = await response.text();', 'console.log(responseText);')
  return lines.join('\n')
}

function generatePython(o: CurlToCodeOptions, headers: Record<string,string>): string {
  const lines = ['import requests', '', `url = ${py(o.url)}`, `headers = ${JSON.stringify(headers, null, 2)}`]
  if (o.auth) lines.push(`auth = (${py(o.auth.username)}, ${py(o.auth.password)})`)
  if (o.formData) lines.push(`form_data = [${o.formData.map(field => `(${py(field.name)}, (None, ${py(field.value)}))`).join(', ')}]`)
  else if (o.data !== undefined) lines.push(`body = ${py(o.data)}`)
  lines.push('', `response = requests.request(${py(o.method)}, url, headers=headers${o.auth ? ', auth=auth' : ''}${o.formData ? ', files=form_data' : o.data !== undefined ? ', data=body' : ''})`, 'print(response.text)')
  return lines.join('\n')
}
function generatePHP(o: CurlToCodeOptions, headers: Record<string,string>): string {
  const boundary = '----DevToolsHubBoundary7MA4YWxkTrZu0gW'
  const headerEntries = Object.entries(headers).filter(([key]) => !(o.formData && key.toLowerCase() === 'content-type'))
  if (o.formData) headerEntries.push(['Content-Type', `multipart/form-data; boundary=${boundary}`])
  const headerLines = headerEntries.map(([key,value]) => `    ${php(`${key}: ${value}`)}`).join(',\n')
  const lines = ['<?php', '$ch = curl_init();']
  if (o.formData) {
    const phpCRLF = '"\\r\\n"'
    const phpCRLFCRLF = '"\\r\\n\\r\\n"'
    lines.push("$body = '';")
    for (const field of o.formData) {
      const quotedName = field.name.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
      lines.push(`$body .= ${php(`--${boundary}`)} . ${phpCRLF};`)
      lines.push(`$body .= ${php(`Content-Disposition: form-data; name="${quotedName}"`)} . ${phpCRLFCRLF};`)
      lines.push(`$body .= ${php(field.value)} . ${phpCRLF};`)
    }
    lines.push(`$body .= ${php(`--${boundary}--`)} . ${phpCRLF};`)
  }
  lines.push('$options = [', `  CURLOPT_URL => ${php(o.url)},`, '  CURLOPT_RETURNTRANSFER => true,', `  CURLOPT_CUSTOMREQUEST => ${php(o.method)},`)
  if (headerLines) lines.push(`  CURLOPT_HTTPHEADER => [\n${headerLines}\n  ],`)
  if (o.formData) lines.push('  CURLOPT_POSTFIELDS => $body,')
  else if (o.data !== undefined) lines.push(`  CURLOPT_POSTFIELDS => ${php(o.data)},`)
  if (o.auth) lines.push(`  CURLOPT_USERPWD => ${php(`${o.auth.username}:${o.auth.password}`)},`)
  lines.push('];', 'curl_setopt_array($ch, $options);', '$response = curl_exec($ch);', 'if ($response === false) { throw new RuntimeException(curl_error($ch)); }', 'curl_close($ch);', 'echo $response;')
  return lines.join('\n')
}
function generateGo(o: CurlToCodeOptions, headers: Record<string,string>): string {
  const imports = ['"fmt"', '"io"', '"net/http"']
  if (o.formData) imports.push('"bytes"', '"mime/multipart"')
  else if (o.data !== undefined) imports.push('"strings"')
  const lines = ['package main', '', 'import (', ...imports.map(value => `  ${value}`), ')', '', 'func main() {']
  if (o.formData) {
    lines.push('  var body bytes.Buffer', '  writer := multipart.NewWriter(&body)', `  for _, formField := range [][2]string{${o.formData.map(field => `{${go(field.name)}, ${go(field.value)}}`).join(', ')}} {`, '    part, err := writer.CreateFormField(formField[0])', '    if err != nil { panic(err) }', '    if _, err := part.Write([]byte(formField[1])); err != nil { panic(err) }', '  }', '  if err := writer.Close(); err != nil { panic(err) }', `  req, err := http.NewRequest(${go(o.method)}, ${go(o.url)}, &body)`)
  } else lines.push(`  req, err := http.NewRequest(${go(o.method)}, ${go(o.url)}, ${o.data !== undefined ? `strings.NewReader(${go(o.data)})` : 'nil'})`)
  lines.push('  if err != nil { panic(err) }')
  for (const [key,value] of Object.entries(headers)) if (!(o.formData && key.toLowerCase() === 'content-type')) lines.push(`  req.Header.Set(${go(key)}, ${go(value)})`)
  if (o.formData) lines.push('  req.Header.Set("Content-Type", writer.FormDataContentType())')
  lines.push('  resp, err := http.DefaultClient.Do(req)', '  if err != nil { panic(err) }', '  defer resp.Body.Close()', '  responseBody, err := io.ReadAll(resp.Body)', '  if err != nil { panic(err) }', '  fmt.Println(string(responseBody))', '}')
  return lines.join('\n')
}
function generateRuby(o: CurlToCodeOptions, headers: Record<string,string>): string {
  const requestClass = ({ GET:'Get', POST:'Post', PUT:'Put', PATCH:'Patch', DELETE:'Delete', HEAD:'Head', OPTIONS:'Options' } as Record<Method,string>)[o.method]
  const lines = ['require "uri"', 'require "net/http"', '', `uri = URI(${ruby(o.url)})`, 'http = Net::HTTP.new(uri.host, uri.port)', 'http.use_ssl = uri.scheme == "https"', `request = Net::HTTP::${requestClass}.new(uri)`, `headers = ${JSON.stringify(headers, null, 2)}`, 'headers.each { |key, value| request[key] = value }']
  if (o.formData) lines.push(`request.set_form(${JSON.stringify(o.formData.map(field => [field.name, field.value]))}, 'multipart/form-data')`)
  else if (o.data !== undefined) lines.push(`request.body = ${ruby(o.data)}`)
  if (o.auth) lines.push(`request.basic_auth(${ruby(o.auth.username)}, ${ruby(o.auth.password)})`)
  lines.push('response = http.request(request)', 'puts response.body')
  return lines.join('\n')
}
function generateJava(o: CurlToCodeOptions, headers: Record<string,string>): string {
  const lines = ['import java.net.URI;', 'import java.net.http.HttpClient;', 'import java.net.http.HttpRequest;', 'import java.net.http.HttpResponse;', 'import java.nio.charset.StandardCharsets;', '', 'public class Main {', '  public static void main(String[] args) throws Exception {', '    HttpClient client = HttpClient.newHttpClient();', `    HttpRequest.Builder builder = HttpRequest.newBuilder().uri(URI.create(${java(o.url)}));`]
  let bodyPublisher = 'HttpRequest.BodyPublishers.noBody()'
  if (o.formData) {
    const boundary = '----DevToolsHubBoundary7MA4YWxkTrZu0gW'
    const chunks = o.formData.map(field => {
      const quotedName = field.name.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
      return `--${boundary}\r\nContent-Disposition: form-data; name="${quotedName}"\r\n\r\n${field.value}\r\n`
    })
    chunks.push(`--${boundary}--\r\n`)
    bodyPublisher = `HttpRequest.BodyPublishers.ofString(${java(chunks.join(''))}, StandardCharsets.UTF_8)`
    lines.push(`    builder.header("Content-Type", "multipart/form-data; boundary=${boundary}");`)
  } else if (o.data !== undefined) bodyPublisher = `HttpRequest.BodyPublishers.ofString(${java(o.data)}, StandardCharsets.UTF_8)`
  for (const [key,value] of Object.entries(headers)) lines.push(`    builder.header(${java(key)}, ${java(value)});`)
  lines.push(`    HttpRequest request = builder.method(${java(o.method)}, ${bodyPublisher}).build();`, '    HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());', '    System.out.println(response.body());', '  }', '}')
  return lines.join('\n')
}
function generateCSharp(o: CurlToCodeOptions, headers: Record<string,string>): string {
  const lines = ['using System;', 'using System.Net.Http;', 'using System.Text;', 'using System.Threading.Tasks;', '', 'class Program {', '  static async Task Main() {', '    using var client = new HttpClient();', `    using var request = new HttpRequestMessage(new HttpMethod(${csharp(o.method)}), ${csharp(o.url)});`]
  if (o.formData) {
    lines.push('    var multipart = new MultipartFormDataContent();')
    for (const field of o.formData) lines.push(`    multipart.Add(new StringContent(${csharp(field.value)}), ${csharp(field.name)});`)
    lines.push('    request.Content = multipart;')
  } else if (o.data !== undefined) {
    const contentType = Object.entries(headers).find(([key]) => key.toLowerCase() === 'content-type')?.[1] ?? 'application/x-www-form-urlencoded'
    lines.push(`    request.Content = new StringContent(${csharp(o.data)}, Encoding.UTF8, ${csharp(contentType)});`)
  }
  const contentHeaderNames = new Set(['content-type', 'content-length', 'content-encoding', 'content-language', 'content-location', 'content-md5', 'content-range', 'content-disposition', 'content-expires', 'content-last-modified', 'content-transfer-encoding'])
  for (const [key,value] of Object.entries(headers)) {
    if (o.formData && key.toLowerCase() === 'content-type') continue
    if (key.toLowerCase() === 'content-type' && o.data !== undefined) continue
    if (contentHeaderNames.has(key.toLowerCase())) {
      lines.push('    request.Content ??= new ByteArrayContent(Array.Empty<byte>());', `    request.Content.Headers.TryAddWithoutValidation(${csharp(key)}, ${csharp(value)});`)
    } else lines.push(`    request.Headers.TryAddWithoutValidation(${csharp(key)}, ${csharp(value)});`)
  }
  lines.push('    using var response = await client.SendAsync(request);', '    var responseText = await response.Content.ReadAsStringAsync();', '    Console.WriteLine(responseText);', '  }', '}')
  return lines.join('\n')
}

export const sampleCurlCommands = [
  { name: 'GET Request', command: 'curl https://api.github.com/users/octocat' },
  { name: 'POST with JSON', command: `curl -X POST https://httpbin.org/post -H "Content-Type: application/json" -d '{"name":"John","age":30}'` },
  { name: 'with Bearer Token', command: 'curl -X GET https://api.example.com/users -H "Authorization: Bearer your_token_here"' },
  { name: 'with Basic Auth', command: 'curl -X GET https://api.example.com/protected -u username:password' },
]
