/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { parse } = require('yaml')
const { tool } = require('../../app/tools/docker-compose-converter/definition.ts')
const { run } = require('../../app/tools/docker-compose-converter/logic.ts')

function serviceFor(input) {
  return parse(run(input)).services.converted
}

test('docker-compose-converter is implemented and connected to the universal tool', () => {
  assert.equal(tool.id, 'docker-compose-converter')
  assert.equal(tool.href, '/docker-compose-converter')
  assert.equal(tool.status, 'implemented')
  assert.equal(tool.badge, '')
  assert.equal(tool.outputExtension, 'yaml')
  assert.equal(typeof run, 'function')
})

test('accepts docker run and run prefixes and tokenizes quoted command arguments', () => {
  const service = serviceFor(`docker run nginx:alpine sh -c 'echo hello world' "arg with spaces" escaped\\ value`)
  assert.equal(service.image, 'nginx:alpine')
  assert.deepEqual(service.command, ['sh', '-c', 'echo hello world', 'arg with spaces', 'escaped value'])
  assert.equal(serviceFor('run alpine').image, 'alpine')
  assert.throws(() => run('docker build alpine'), /docker run|prefix/i)
  assert.throws(() => run('docker run'), /image/i)
  assert.throws(() => run(`run alpine 'unterminated`), /quote/i)
  assert.throws(() => run('run alpine trailing\\'), /escape/i)
})

test('converts publish, environment, env files and volumes while validating their syntax', () => {
  const service = serviceFor(`run -p 127.0.0.1:8080:80/tcp --publish=9000:90 -e 'MODE=safe mode' --env API_KEY --env-file .env -v ./data:/var/lib/app:ro --volume=/tmp:/tmp image`)
  assert.deepEqual(service.ports, ['127.0.0.1:8080:80/tcp', '9000:90'])
  assert.deepEqual(service.environment, ['MODE=safe mode', 'API_KEY'])
  assert.deepEqual(service.env_file, ['.env'])
  assert.deepEqual(service.volumes, ['./data:/var/lib/app:ro', '/tmp:/tmp'])
  assert.throws(() => run('run -p 70000:80 image'), /port/i)
  assert.throws(() => run('run -p 80 image'), /port mapping/i)
  assert.throws(() => run('run -v data:relative image'), /absolute path/i)
  assert.throws(() => run('run -v :/data image'), /volume source/i)
  assert.throws(() => run('run -v data:/data:invalid image'), /volume options/i)
})

test('maps the supported runtime, resource and metadata flags', () => {
  const service = serviceFor('run --name api-1 --restart unless-stopped --network host -w /srv --user 1000:1000 --hostname api --entrypoint /bin/sh --cpus 1.5 --memory 512m --label team=infra --platform linux/amd64 --read-only --privileged -i -t --detach busybox -c true')
  assert.equal(service.container_name, 'api-1')
  assert.equal(service.restart, 'unless-stopped')
  assert.equal(service.network_mode, 'host')
  assert.equal(service.working_dir, '/srv')
  assert.equal(service.user, '1000:1000')
  assert.equal(service.hostname, 'api')
  assert.equal(service.entrypoint, '/bin/sh')
  assert.equal(service.cpus, '1.5')
  assert.equal(service.mem_limit, '512m')
  assert.deepEqual(service.labels, ['team=infra'])
  assert.equal(service.platform, 'linux/amd64')
  assert.equal(service.read_only, true)
  assert.equal(service.privileged, true)
  assert.equal(service.stdin_open, true)
  assert.equal(service.tty, true)
  assert.deepEqual(service.command, ['-c', 'true'])
  assert.equal('detach' in service, false)
  assert.equal('networks' in parse(run('run image')), false)
  assert.throws(() => run('run --name bad/name image'), /container name/i)
})

test('rejects --rm, unsupported flags, malformed valued and boolean options, and missing values', () => {
  assert.throws(() => run('run --rm alpine'), /--rm.*not supported/i)
  assert.throws(() => run('run --mount type=bind alpine'), /unsupported option/i)
  assert.throws(() => run('run --detach=true alpine'), /malformed option/i)
  assert.throws(() => run('run --name alpine'), /image/i)
  assert.throws(() => run('run --publish --detach alpine'), /requires a value/i)
  assert.throws(() => run('run -p 8080:80 --rm image'), /--rm.*not supported/i)
})
