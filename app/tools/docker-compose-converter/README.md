# Docker Run to Compose

**Status:** Implemented

Converts a `docker run` (or `run`) command locally in the browser, without executing commands, into a YAML document with a version 3 Compose service. The result contains only `version` and `services`; no external named network or volume is created.

## Supported flags

- Identification and image: `--name`.
- Ports and volumes: `-p` / `--publish`, `-v` / `--volume`.
- Environment: `-e` / `--env`, `--env-file`, `--label`.
- Execution: `--restart`, `--network`, `-w` / `--workdir`, `--user`, `--hostname`, `--entrypoint`, `--platform`.
- Resources and security: `--cpus`, `--memory`, `--read-only`, `--privileged`.
- Terminal and mode: `-i`, `-t`, `-it` (also `-ti`) and `--detach`.

Values with single or double quotes and escapes are tokenized; the text after the image is preserved as the positional command. Options that take a value also accept the `--option=value` form; short options that take a value accept an attached value, such as `-p8080:80`.

## Limitations and validation

Unknown or malformed options are rejected; there is no variable expansion, interpolation, shell execution, or file reading. `--rm` is rejected because it has no faithful equivalent in the lifecycle of a Compose service. `--detach` is not emitted because detached mode has no equivalent meaning in a service definition. Only the values and options listed above are considered; other Docker options are not preserved.

Ports must use `host:container`, `ip:host:container`, or an equivalent range, with an optional `tcp`/`udp` protocol; volumes must have an absolute destination; container names are validated. Input is limited to 12,000 characters and output to 24,000 characters. Review the generated YAML before using it, especially in production.

## Example

Input:

~~~sh
docker run --name api -p 8080:80 -e MODE="safe mode" -v ./data:/var/lib/app:ro nginx:alpine nginx -g "daemon off;"
~~~

The output is a Compose v3 YAML with the `converted` service, image, ports, environment, volume, container name, and command.
