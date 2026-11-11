# Chmod Calculator

**Status:** Implemented

Convert a Unix/Linux permission mode in octal to its symbolic mode and the numeric values for owner, group, and others.

## Input

Enter exactly three or four octal digits, from `0` to `7`, with no spaces, prefixes, or options. Valid examples: `755`, `0644`, and `4755`. Three-digit modes receive a leading zero in the output; the output always uses four digits (for example, `0755`). The input limit is four characters.

## Output

The tool returns JSON with `octal` (canonical four-digit mode), `symbolic` (permissions in the `rwxr-xr-x` format), and the numeric values `owner`, `group`, and `others`.

### Examples

Input `755`:

~~~json
{
  "octal": "0755",
  "symbolic": "rwxr-xr-x",
  "owner": 7,
  "group": 5,
  "others": 5
}
~~~

Input `644`:

~~~json
{
  "octal": "0644",
  "symbolic": "rw-r--r--",
  "owner": 6,
  "group": 4,
  "others": 4
}
~~~

Input `4755` enables setuid. Because the owner also has execute permission, it appears as `s`:

~~~json
{
  "octal": "4755",
  "symbolic": "rwsr-xr-x",
  "owner": 7,
  "group": 5,
  "others": 5
}
~~~

Input `2755` enables setgid:

~~~json
{
  "octal": "2755",
  "symbolic": "rwxr-sr-x",
  "owner": 7,
  "group": 5,
  "others": 5
}
~~~

Input `1777` enables sticky:

~~~json
{
  "octal": "1777",
  "symbolic": "rwxrwxrwt",
  "owner": 7,
  "group": 7,
  "others": 7
}
~~~

When setuid or setgid is enabled without execute permission for the corresponding group, the output uses uppercase `S`; sticky without execute permission for others uses uppercase `T`. For example, mode `4644` produces `rwSr--r--`.

## Options and validation

There are no options: the options object must remain empty (`{}`). Empty inputs, inputs with a length other than three or four digits, digits outside `0`–`7`, spaces, or prefixes are rejected with an error.

## Processing and privacy

The conversion is entirely local and deterministic. The tool only calculates and formats the specified mode: it does not execute the `chmod` command, access files, or send data over the network.
