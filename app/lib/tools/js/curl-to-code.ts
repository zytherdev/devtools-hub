/* eslint-disable @typescript-eslint/no-explicit-any */
export type Language = 'javascript' | 'python' | 'php' | 'go' | 'ruby' | 'java' | 'csharp'
export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'

export interface CurlToCodeOptions {
  language: Language
  method: Method
  url: string
  headers: { [key: string]: string }
  data?: string
  formData?: { [key: string]: string }
  auth?: { username: string; password: string }
  bearerToken?: string
}

export function parseCurl(curlCommand: string): CurlToCodeOptions | null {
  if (!curlCommand || typeof curlCommand !== 'string') return null

  // rm 'curl' prefix
  let cmd = curlCommand.trim()
  if (cmd.startsWith('curl ')) {
    cmd = cmd.substring(5)
  }

  const options: CurlToCodeOptions = {
    language: 'javascript',
    method: 'GET',
    url: '',
    headers: {},
  }

  // parse URL
  const urlMatch = cmd.match(/['"]?(https?:\/\/[^\s'"]+)['"]?/)
  if (urlMatch) {
    options.url = urlMatch[1]
    cmd = cmd.replace(urlMatch[0], '')
  }

  // parse method
  const methodMatch = cmd.match(/-X\s+['"]?([A-Z]+)['"]?/)
  if (methodMatch) {
    options.method = methodMatch[1] as Method
    cmd = cmd.replace(methodMatch[0], '')
  }

  // parse headers
  const headerRegex = /-H\s+['"]([^'"]+)['"]/g
  let headerMatch
  while ((headerMatch = headerRegex.exec(cmd)) !== null) {
    const header = headerMatch[1]
    const colonIndex = header.indexOf(':')
    if (colonIndex !== -1) {
      const key = header.substring(0, colonIndex).trim()
      const value = header.substring(colonIndex + 1).trim()
      options.headers[key] = value
    }
    cmd = cmd.replace(headerMatch[0], '')
  }

  // parse data
  const dataMatch = cmd.match(/-d\s+['"]([^'"]+)['"]/)
  if (dataMatch) {
    options.data = dataMatch[1]
    cmd = cmd.replace(dataMatch[0], '')
    if (!options.method || options.method === 'GET') {
      options.method = 'POST'
    }
  }

  // parse form data
  const formMatch = cmd.match(/-F\s+['"]([^'"]+)['"]/)
  if (formMatch) {
    const formString = formMatch[1]
    const formParts = formString.split('=')
    if (formParts.length === 2) {
      if (!options.formData) options.formData = {}
      options.formData[formParts[0]] = formParts[1]
    }
    cmd = cmd.replace(formMatch[0], '')
    if (!options.method || options.method === 'GET') {
      options.method = 'POST'
    }
  }

  // parse bearer token
  const bearerMatch = cmd.match(/-H\s+['"]Authorization:\s*Bearer\s+([^'"]+)['"]/)
  if (bearerMatch) {
    options.bearerToken = bearerMatch[1]
  }

  // parse basic auth
  const authMatch = cmd.match(/-u\s+['"]?([^:]+):([^'"]+)['"]?/)
  if (authMatch) {
    options.auth = {
      username: authMatch[1],
      password: authMatch[2],
    }
  }

  return options
}

export function generateCode(options: CurlToCodeOptions): string {
  const { language, method, url, headers, data, formData, auth, bearerToken } = options

  switch (language) {
    case 'javascript':
      return generateJavaScript(method, url, headers, data, formData, auth, bearerToken)
    case 'python':
      return generatePython(method, url, headers, data, formData, auth, bearerToken)
    case 'php':
      return generatePHP(method, url, headers, data, formData, auth, bearerToken)
    case 'go':
      return generateGo(method, url, headers, data, formData, auth, bearerToken)
    case 'ruby':
      return generateRuby(method, url, headers, data, formData, auth, bearerToken)
    case 'java':
      return generateJava(method, url, headers, data, formData, auth, bearerToken)
    case 'csharp':
      return generateCSharp(method, url, headers, data, formData, auth, bearerToken)
    default:
      return '// Language not supported'
  }
}

function generateJavaScript(
  method: string,
  url: string,
  headers: { [key: string]: string },
  data?: string,
  formData?: { [key: string]: string },
  auth?: { username: string; password: string },
  bearerToken?: string
): string {
  let code = ''

  // Headers
  const headerObj: { [key: string]: string } = { ...headers }
  if (bearerToken) {
    headerObj['Authorization'] = `Bearer ${bearerToken}`
  }
  if (auth) {
    const credentials = btoa(`${auth.username}:${auth.password}`)
    headerObj['Authorization'] = `Basic ${credentials}`
  }

  // build fetch options
  const options: any = {
    method,
    headers: headerObj,
  }

  if (data) {
    options.body = data
    if (!headerObj['Content-Type']) {
      headerObj['Content-Type'] = 'application/json'
    }
  }

  if (formData) {
    const fd = new FormData()
    for (const [key, value] of Object.entries(formData)) {
      fd.append(key, value)
    }
    options.body = fd
  }

  // gen code
  code += `fetch('${url}', ${JSON.stringify(options, null, 2)})\n`
  code += `  .then(response => response.json())\n`
  code += `  .then(data => console.log(data))\n`
  code += `  .catch(error => console.error('Error:', error));`

  return code
}

function generatePython(
  method: string,
  url: string,
  headers: { [key: string]: string },
  data?: string,
  formData?: { [key: string]: string },
  auth?: { username: string; password: string },
  bearerToken?: string
): string {
  let code = 'import requests\n\n'

  const headerObj = { ...headers }
  if (bearerToken) {
    headerObj['Authorization'] = `Bearer ${bearerToken}`
  }

  code += `url = "${url}"\n`
  code += `headers = ${JSON.stringify(headerObj, null, 2)}\n`

  if (auth) {
    code += `auth = (${JSON.stringify(auth.username)}, ${JSON.stringify(auth.password)})\n`
  }

  let dataVar = ''
  if (data) {
    try {
      JSON.parse(data)
      dataVar = `json = ${data}`
    } catch {
      dataVar = `data = ${JSON.stringify(data)}`
    }
  }

  if (formData) {
    dataVar = `data = ${JSON.stringify(formData)}`
  }

  if (dataVar) {
    code += `${dataVar}\n`
  }

  code += `\nresponse = requests.${method.toLowerCase()}(\n`
  code += `    url,\n`
  code += `    headers=headers,\n`
  if (dataVar) {
    code += `    ${dataVar.includes('json') ? 'json' : 'data'}=${dataVar.split(' = ')[0]},\n`
  }
  if (auth) {
    code += `    auth=auth,\n`
  }
  code += `)\n\n`
  code += `print(response.json())`

  return code
}

function generatePHP(
  method: string,
  url: string,
  headers: { [key: string]: string },
  data?: string,
  formData?: { [key: string]: string },
  auth?: { username: string; password: string },
  bearerToken?: string
): string {
  let code = '<?php\n\n'
  code += `$curl = curl_init();\n\n`

  code += `curl_setopt_array($curl, [\n`
  code += `  CURLOPT_URL => "${url}",\n`
  code += `  CURLOPT_RETURNTRANSFER => true,\n`
  code += `  CURLOPT_ENCODING => "",\n`
  code += `  CURLOPT_MAXREDIRS => 10,\n`
  code += `  CURLOPT_TIMEOUT => 30,\n`
  code += `  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\n`
  code += `  CURLOPT_CUSTOMREQUEST => "${method}",\n`

  // Headers
  const headerList: string[] = []
  for (const [key, value] of Object.entries(headers)) {
    headerList.push(`"${key}: ${value}"`)
  }
  if (bearerToken) {
    headerList.push(`"Authorization: Bearer ${bearerToken}"`)
  }
  if (auth) {
    code += `  CURLOPT_USERPWD => "${auth.username}:${auth.password}",\n`
  }
  if (headerList.length > 0) {
    code += `  CURLOPT_HTTPHEADER => [\n`
    for (const header of headerList) {
      code += `    ${header},\n`
    }
    code += `  ],\n`
  }

  if (data) {
    code += `  CURLOPT_POSTFIELDS => ${JSON.stringify(data)},\n`
  }
  if (formData) {
    code += `  CURLOPT_POSTFIELDS => ${JSON.stringify(formData)},\n`
  }

  code += `]);\n\n`
  code += `$response = curl_exec($curl);\n`
  code += `$err = curl_error($curl);\n\n`
  code += `curl_close($curl);\n\n`
  code += `if ($err) {\n`
  code += `  echo "cURL Error #:" . $err;\n`
  code += `} else {\n`
  code += `  echo $response;\n`
  code += `}`

  return code
}

function generateGo(
  method: string,
  url: string,
  headers: { [key: string]: string },
  data?: string,
  formData?: { [key: string]: string },
  auth?: { username: string; password: string },
  bearerToken?: string
): string {
  let code = 'package main\n\n'
  code += 'import (\n'
  code += '  "fmt"\n'
  code += '  "io/ioutil"\n'
  code += '  "net/http"\n'
  if (data || formData) {
    code += '  "strings"\n'
  }
  if (auth) {
    code += '  "encoding/base64"\n'
  }
  code += ')\n\n'

  code += 'func main() {\n'

  if (data) {
    code += `  payload := strings.NewReader(${JSON.stringify(data)})\n`
  }
  if (formData) {
    code += `  payload := strings.NewReader(${JSON.stringify(formData)})\n`
  }

  code += `  url := "${url}"\n`

  code += `  req, err := http.NewRequest("${method}", url, ${data || formData ? 'payload' : 'nil'})\n`
  code += '  if err != nil {\n'
  code += '    fmt.Println(err)\n'
  code += '    return\n'
  code += '  }\n\n'

  for (const [key, value] of Object.entries(headers)) {
    code += `  req.Header.Add("${key}", "${value}")\n`
  }
  if (bearerToken) {
    code += `  req.Header.Add("Authorization", "Bearer ${bearerToken}")\n`
  }
  if (auth) {
    code += `  req.Header.Add("Authorization", "Basic " + base64.StdEncoding.EncodeToString([]byte("${auth.username}:${auth.password}")))\n`
  }

  code += '\n  client := &http.Client{}\n'
  code += '  resp, err := client.Do(req)\n'
  code += '  if err != nil {\n'
  code += '    fmt.Println(err)\n'
  code += '    return\n'
  code += '  }\n'
  code += '  defer resp.Body.Close()\n\n'

  code += '  body, err := ioutil.ReadAll(resp.Body)\n'
  code += '  if err != nil {\n'
  code += '    fmt.Println(err)\n'
  code += '    return\n'
  code += '  }\n\n'

  code += '  fmt.Println(string(body))\n'
  code += '}\n'

  return code
}

function generateRuby(
  method: string,
  url: string,
  headers: { [key: string]: string },
  data?: string,
  formData?: { [key: string]: string },
  auth?: { username: string; password: string },
  bearerToken?: string
): string {
  let code = 'require "uri"\n'
  code += 'require "net/http"\n'
  code += 'require "json"\n\n'

  code += `uri = URI.parse("${url}")\n`

  if (method !== 'GET') {
    code += `http = Net::HTTP.new(uri.host, uri.port)\n`
    code += `http.use_ssl = true if uri.scheme == "https"\n`
  }

  if (data) {
    code += `data = ${JSON.stringify(data)}\n`
    code += `headers = ${JSON.stringify(headers)}\n`
    code += `request = Net::HTTP::Post.new(uri.path, headers)\n`
    code += `request.body = data\n`
  } else if (formData) {
    code += `form_data = ${JSON.stringify(formData)}\n`
    code += `headers = ${JSON.stringify(headers)}\n`
    code += `request = Net::HTTP::Post.new(uri.path, headers)\n`
    code += `request.set_form_data(form_data)\n`
  } else {
    code += `headers = ${JSON.stringify(headers)}\n`
    code += `request = Net::HTTP::${method}(${method === 'GET' ? 'Get' : method}).new(uri.path, headers)\n`
  }

  if (bearerToken) {
    code += `request["Authorization"] = "Bearer ${bearerToken}"\n`
  }
  if (auth) {
    code += `request.basic_auth("${auth.username}", "${auth.password}")\n`
  }

  code += `\nresponse = http.request(request)\n`
  code += `puts response.body`

  return code
}

function generateJava(
  method: string,
  url: string,
  headers: { [key: string]: string },
  data?: string,
  formData?: { [key: string]: string },
  auth?: { username: string; password: string },
  bearerToken?: string
): string {
  let code = 'import java.net.http.HttpClient;\n'
  code += 'import java.net.http.HttpRequest;\n'
  code += 'import java.net.http.HttpResponse;\n'
  code += 'import java.net.URI;\n'
  if (data) {
    code += 'import java.net.http.HttpRequest.BodyPublishers;\n'
  }
  code += '\n'

  code += 'public class Main {\n'
  code += '  public static void main(String[] args) throws Exception {\n'
  code += `    HttpClient client = HttpClient.newHttpClient();\n\n`

  let requestBuilder = `    HttpRequest.newBuilder()\n`
  requestBuilder += `      .uri(URI.create("${url}"))\n`

  for (const [key, value] of Object.entries(headers)) {
    requestBuilder += `      .header("${key}", "${value}")\n`
  }
  if (bearerToken) {
    requestBuilder += `      .header("Authorization", "Bearer ${bearerToken}")\n`
  }
  if (auth) {
    const credentials = btoa(`${auth.username}:${auth.password}`)
    requestBuilder += `      .header("Authorization", "Basic ${credentials}")\n`
  }

  if (method !== 'GET') {
    requestBuilder += `      .method("${method}", `
    if (data) {
      requestBuilder += `BodyPublishers.ofString(${JSON.stringify(data)})`
    } else if (formData) {
      requestBuilder += `BodyPublishers.ofString(${JSON.stringify(formData)})`
    } else {
      requestBuilder += `BodyPublishers.noBody()`
    }
    requestBuilder += `)\n`
  }

  requestBuilder += `      .build();\n\n`

  code += requestBuilder
  code += `    HttpRequest request = requestBuilder.build();\n\n`
  code += `    HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());\n`
  code += `    System.out.println(response.body());\n`
  code += '  }\n'
  code += '}'

  return code
}

function generateCSharp(
  method: string,
  url: string,
  headers: { [key: string]: string },
  data?: string,
  formData?: { [key: string]: string },
  auth?: { username: string; password: string },
  bearerToken?: string
): string {
  let code = 'using System;\n'
  code += 'using System.Net.Http;\n'
  code += 'using System.Threading.Tasks;\n'
  if (data || formData) {
    code += 'using System.Text;\n'
  }
  code += '\n'

  code += 'class Program\n'
  code += '{\n'
  code += '  static async Task Main()\n'
  code += '  {\n'
  code += `    using var client = new HttpClient();\n\n`

  if (data) {
    code += `    var data = ${JSON.stringify(data)};\n`
    code += `    var content = new StringContent(data, Encoding.UTF8, "application/json");\n`
  } else if (formData) {
    code += `    var formData = new MultipartFormDataContent();\n`
    for (const [key, value] of Object.entries(formData)) {
      code += `    formData.Add(new StringContent("${value}"), "${key}");\n`
    }
    code += `    var content = formData;\n`
  }

  code += `    var request = new HttpRequestMessage(HttpMethod.${method}, "${url}");\n`

  for (const [key, value] of Object.entries(headers)) {
    code += `    request.Headers.Add("${key}", "${value}");\n`
  }
  if (bearerToken) {
    code += `    request.Headers.Add("Authorization", "Bearer ${bearerToken}");\n`
  }
  if (auth) {
    const credentials = btoa(`${auth.username}:${auth.password}`)
    code += `    request.Headers.Add("Authorization", "Basic ${credentials}");\n`
  }

  if (data || formData) {
    code += '    request.Content = content;\n'
  }

  code += '\n    var response = await client.SendAsync(request);\n'
  code += '    var responseBody = await response.Content.ReadAsStringAsync();\n'
  code += '    Console.WriteLine(responseBody);\n'
  code += '  }\n'
  code += '}'

  return code
}

export const sampleCurlCommands = [
  {
    name: 'GET Request',
    command: 'curl https://api.github.com/users/octocat',
  },
  {
    name: 'POST with JSON',
    command: 'curl -X POST https://httpbin.org/post -H "Content-Type: application/json" -d \'{"name":"John","age":30}\'',
  },
  {
    name: 'with Bearer Token',
    command: 'curl -X GET https://api.example.com/users -H "Authorization: Bearer your_token_here"',
  },
  {
    name: 'with Basic Auth',
    command: 'curl -X GET https://api.example.com/protected -u username:password',
  },
]