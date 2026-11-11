import type { ToolOptions } from '@/app/tools/types'
import { stringify } from 'yaml'

const MAX_INPUT_CHARS = 12_000
const MAX_OUTPUT_CHARS = 24_000
const SERVICE_NAME = 'converted'
type ComposeService = Record<string, unknown>

function tokenize(input: string): string[] {
  const tokens: string[] = []
  let token = ''
  let started = false
  let quote: "'" | '"' | null = null
  for (let i = 0; i < input.length; i += 1) {
    const char = input[i]
    if (quote === "'") {
      if (char === "'") quote = null
      else token += char
      started = true
      continue
    }
    if (char === '\\') {
      if (i + 1 >= input.length) throw new Error('Incomplete escape at the end of the command.')
      const next = input[i + 1]
      if (quote === '"' && !['\\', '"', '$', '`'].includes(next)) token += '\\'
      token += next
      i += 1
      started = true
      continue
    }
    if (quote === '"') {
      if (char === '"') quote = null
      else token += char
      started = true
      continue
    }
    if (char === "'" || char === '"') {
      quote = char
      started = true
    } else if (/\s/.test(char)) {
      if (started) tokens.push(token)
      token = ''
      started = false
    } else {
      token += char
      started = true
    }
  }
  if (quote) throw new Error('Unterminated quote in command.')
  if (started) tokens.push(token)
  return tokens
}

function splitOption(token: string): [string, string | undefined] {
  const equals = token.indexOf('=')
  return equals < 0 ? [token, undefined] : [token.slice(0, equals), token.slice(equals + 1)]
}

function requireValue(flag: string, inline: string | undefined, tokens: string[], index: number): [string, number] {
  if (inline !== undefined) {
    if (!inline) throw new Error(`Option ${flag} requires a non-empty value.`)
    return [inline, index]
  }
  const value = tokens[index + 1]
  if (!value || value.startsWith('-')) throw new Error(`Option ${flag} requires a value.`)
  return [value, index + 1]
}

function validateName(name: string): void {
  if (name.length > 255 || !/^[A-Za-z0-9][A-Za-z0-9_.-]*$/.test(name)) {
    throw new Error(`Invalid container name: ${JSON.stringify(name)}.`)
  }
}

function validatePortNumber(value: string): number {
  const port = Number(value)
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error(`Invalid port: ${value}.`)
  return port
}

function validatePortRange(value: string): [number, number] {
  const parts = value.split('-')
  if (parts.length > 2 || parts.some(part => !/^\d+$/.test(part))) throw new Error(`Invalid port: ${value}.`)
  const start = validatePortNumber(parts[0])
  const end = parts.length === 2 ? validatePortNumber(parts[1]) : start
  if (end < start || end - start > 1000) throw new Error(`Invalid port range: ${value}.`)
  return [start, end]
}

function validatePort(value: string): string {
  const protocolSplit = value.split('/')
  if (protocolSplit.length > 2 || (protocolSplit.length === 2 && !['tcp', 'udp'].includes(protocolSplit[1]))) {
    throw new Error(`Invalid port mapping: ${value}.`)
  }
  const mapping = protocolSplit[0]
  let host: string | undefined
  let hostPort: string
  let containerPort: string
  const ipv6Match = mapping.match(/^(\[[0-9a-fA-F:.%]+\]):(\d+(?:-\d+)?):(\d+(?:-\d+)?)$/)
  if (ipv6Match) {
    host = ipv6Match[1]
    hostPort = ipv6Match[2]
    containerPort = ipv6Match[3]
  } else {
    const parts = mapping.split(':')
    if (parts.length === 2) [hostPort, containerPort] = parts
    else if (parts.length === 3 && parts[0]) [host, hostPort, containerPort] = parts
    else throw new Error(`Invalid port mapping: ${value}.`)
  }
  const hostRange = validatePortRange(hostPort)
  const containerRange = validatePortRange(containerPort)
  if (hostRange[1] - hostRange[0] !== containerRange[1] - containerRange[0]) {
    throw new Error(`Port ranges must have the same size: ${value}.`)
  }
  if (host && !/^\[[0-9a-fA-F:.%]+\]$/.test(host) && !/^(?:\d{1,3}\.){3}\d{1,3}$/.test(host)) {
    throw new Error(`Invalid published IP address: ${host}.`)
  }
  return `${host ? `${host}:` : ''}${hostPort}:${containerPort}${protocolSplit[1] ? `/${protocolSplit[1]}` : ''}`
}

function validateVolume(value: string): string {
  const parts = value.split(':')
  if (parts.length > 3) throw new Error(`Invalid volume: ${value}.`)
  const target = parts.length === 1 ? parts[0] : parts[1]
  if (!target || !target.startsWith('/') || /[\0\n\r]/.test(target)) {
    throw new Error(`Volume destination must be an absolute path: ${value}.`)
  }
  if (parts.length > 1 && (!parts[0] || /[\0\n\r]/.test(parts[0]))) throw new Error(`Invalid volume source: ${value}.`)
  if (parts.length === 3) {
    const modes = parts[2].split(',')
    const allowed = new Set(['ro', 'rw', 'z', 'Z', 'nocopy', 'shared', 'slave', 'private', 'rshared', 'rslave', 'rprivate', 'consistent', 'cached', 'delegated'])
    if (modes.some(mode => !allowed.has(mode))) throw new Error(`Invalid volume options: ${parts[2]}.`)
  }
  return value
}

function validateMemory(value: string): string {
  if (!/^\d+(?:\.\d+)?(?:b|k|m|g|kb|mb|gb)?$/i.test(value) || Number.parseFloat(value) <= 0) {
    throw new Error(`Invalid memory value: ${value}.`)
  }
  return value
}

function validateCpus(value: string): string {
  if (!/^\d+(?:\.\d+)?$/.test(value) || !Number.isFinite(Number(value)) || Number(value) <= 0) {
    throw new Error(`Invalid CPU value: ${value}.`)
  }
  return value
}

export function run(input: string, _options: ToolOptions = {}): string {
  void _options
  if (typeof input !== 'string' || !input.trim()) throw new Error('Provide a docker run command.')
  if (input.length > MAX_INPUT_CHARS) throw new Error(`Input exceeds the ${MAX_INPUT_CHARS.toLocaleString('en-US')}-character limit.`)
  const tokens = tokenize(input.trim())
  let index = 0
  if (tokens[index] === 'docker') {
    index += 1
    if (tokens[index] !== 'run') throw new Error('Use the "docker run" or "run" prefix.')
    index += 1
  } else if (tokens[index] === 'run') index += 1
  if (index >= tokens.length) throw new Error('Provide the required container image.')

  const service: ComposeService = {}
  const ports: string[] = []
  const volumes: string[] = []
  const environment: string[] = []
  const envFiles: string[] = []
  const labels: string[] = []
  let image: string | undefined
  let command: string[] = []

  while (index < tokens.length) {
    const token = tokens[index]
    if (!token.startsWith('-') || token === '-') {
      image = token
      command = tokens.slice(index + 1)
      break
    }
    if (token === '--rm' || token.startsWith('--rm=')) throw new Error('--rm is not supported because it has no faithful equivalent in a Compose service.')
    if (token === '--') throw new Error('The image is required before the -- separator.')
    const [flag, inlineValue] = splitOption(token)
    if (flag === '-i' || flag === '-t' || flag === '-it' || flag === '-ti') {
      if (inlineValue !== undefined) throw new Error(`Malformed option: ${token}.`)
      if (flag === '-i') service.stdin_open = true
      else if (flag === '-t') service.tty = true
      else { service.stdin_open = true; service.tty = true }
      index += 1
      continue
    }
    if (flag === '--read-only' || flag === '--privileged' || flag === '--detach') {
      if (inlineValue !== undefined) throw new Error(`Malformed option: ${token}.`)
      if (flag === '--read-only') service.read_only = true
      if (flag === '--privileged') service.privileged = true
      index += 1
      continue
    }

    const aliases: Record<string, string> = {
      '--name': 'name', '-p': 'publish', '--publish': 'publish', '-v': 'volume', '--volume': 'volume',
      '-e': 'env', '--env': 'env', '--restart': 'restart', '--network': 'network', '-w': 'workdir',
      '--workdir': 'workdir', '--user': 'user', '--hostname': 'hostname', '--entrypoint': 'entrypoint',
      '--cpus': 'cpus', '--memory': 'memory', '--label': 'label', '--env-file': 'env-file', '--platform': 'platform',
    }
    let option = aliases[flag]
    let parsedValue = inlineValue
    if (!option && /^-[pvew].+/.test(token)) {
      option = aliases[token.slice(0, 2)]
      parsedValue = token.slice(2)
    }
    if (!option) throw new Error(`Unsupported option: ${token}.`)
    const [value, nextIndex] = requireValue(flag, parsedValue, tokens, index)
    index = nextIndex + 1

    switch (option) {
      case 'name': validateName(value); service.container_name = value; break
      case 'publish': ports.push(validatePort(value)); break
      case 'volume': volumes.push(validateVolume(value)); break
      case 'env':
        if (!/^[A-Za-z_][A-Za-z0-9_]*(?:=.*)?$/.test(value)) throw new Error(`Invalid environment variable: ${value}.`)
        environment.push(value)
        break
      case 'env-file': envFiles.push(value); break
      case 'label':
        if (!value || /[\0\n\r]/.test(value)) throw new Error(`Invalid label: ${value}.`)
        labels.push(value)
        break
      case 'restart':
        if (!/^(?:no|always|unless-stopped|on-failure(?::\d+)?)$/.test(value)) throw new Error(`Invalid restart policy: ${value}.`)
        service.restart = value
        break
      case 'network': service.network_mode = value; break
      case 'workdir': service.working_dir = value; break
      case 'user': service.user = value; break
      case 'hostname': service.hostname = value; break
      case 'entrypoint': service.entrypoint = value; break
      case 'cpus': service.cpus = validateCpus(value); break
      case 'memory': service.mem_limit = validateMemory(value); break
      case 'platform': service.platform = value; break
      default: throw new Error(`Unsupported option: ${flag}.`)
    }
  }

  if (!image) throw new Error('Provide the required container image.')
  service.image = image
  if (ports.length) service.ports = ports
  if (volumes.length) service.volumes = volumes
  if (environment.length) service.environment = environment
  if (envFiles.length) service.env_file = envFiles
  if (labels.length) service.labels = labels
  if (command.length) service.command = command
  const yaml = stringify({ version: '3', services: { [SERVICE_NAME]: service } }, { lineWidth: 0, defaultStringType: 'QUOTE_DOUBLE' })
  if (yaml.length > MAX_OUTPUT_CHARS) throw new Error(`Output exceeds the ${MAX_OUTPUT_CHARS.toLocaleString('en-US')}-character limit.`)
  return yaml
}
