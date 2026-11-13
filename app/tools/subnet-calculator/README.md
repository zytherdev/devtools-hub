# Subnet Calculator

**Status:** Implemented

Calculate IPv4 and IPv6 subnet ranges from one address in CIDR notation. The calculation is deterministic, bounded, and runs locally in the browser; it does not contact a network service or store input.

## Input contract

Provide exactly one address and one decimal prefix separated by `/`, for example `192.168.1.10/24` or `2001:db8::1/64`. Input is limited to 64 characters. No surrounding whitespace is trimmed or accepted. Options must be an empty object.

IPv4 must use exactly four decimal octets from 0 through 255. Octets must not contain leading zeroes (except the value `0`). IPv6 accepts eight hexadecimal groups, with at most one `::` compressing one or more groups; a final embedded IPv4 dotted-decimal component is also accepted. IPv6 zone identifiers are not supported. IPv6 output uses lowercase hexadecimal and compresses the longest run of at least two zero groups (the leftmost run wins ties).

Prefixes are decimal integers without signs, whitespace, or leading zeroes: `0–32` for IPv4 and `0–128` for IPv6. The input address may be a host address within the subnet; the network range is derived from it.

## Derived fields

The processor returns formatted JSON. Both versions include `version`, original `input`, `prefixLength`, `networkAddress`, `totalAddresses` (a decimal string), and `isNetworkAddress`.

IPv4 additionally includes `broadcastAddress`, `subnetMask`, `wildcardMask`, `firstUsableAddress`, `lastUsableAddress`, `usableHostCount` (a decimal string), and `isBroadcastAddress`. `usableHostCount` follows the common IPv4 subnet convention: prefixes `/0` through `/30` exclude network and broadcast; `/31` treats both addresses as usable for point-to-point links; `/32` contains one usable address. For `/31`, the first/last usable address are the network/broadcast endpoints; for `/32`, both are the sole address.

IPv6 additionally includes `lastAddress`, the inclusive final address in the prefix range. IPv6 does not have a broadcast address, and the processor does not classify usable hosts or derive IPv6 subnet masks, wildcard masks, or interface identifiers. No other IP versions or derived-field families are supported.

## Example

Input:

~~~text
192.168.1.10/24
~~~

Output:

~~~json
{
  "version": 4,
  "input": "192.168.1.10/24",
  "prefixLength": 24,
  "networkAddress": "192.168.1.0",
  "broadcastAddress": "192.168.1.255",
  "subnetMask": "255.255.255.0",
  "wildcardMask": "0.0.0.255",
  "firstUsableAddress": "192.168.1.1",
  "lastUsableAddress": "192.168.1.254",
  "totalAddresses": "256",
  "usableHostCount": "254",
  "isNetworkAddress": false,
  "isBroadcastAddress": false
}
~~~

## Contribution files

- [definition.ts](definition.ts): catalog metadata, example input, and defaults.
- [logic.ts](logic.ts): bounded strict parser, address arithmetic, and JSON processor.
- [Tool.tsx](Tool.tsx): dynamic-route UI using the shared tool panel design system.
- Focused tests: [tests/tools/subnet-calculator.test.cjs](../../../tests/tools/subnet-calculator.test.cjs).

Run `node --test tests/tools/subnet-calculator.test.cjs` for the focused native tests.
