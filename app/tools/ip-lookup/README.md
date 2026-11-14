# IP Lookup

**Status:** Implemented

Look up approximate location and network details for a public IPv4 or IPv6 address. The tool makes no request on page load. A request occurs only after the user submits a valid public address.

## Provider and request behavior

The fixed provider is [ipwho.is](https://ipwho.is/). The tool uses the provider's HTTPS single-address endpoint, `https://ipwho.is/{IP}`, documented by [IPWHOIS.io API documentation](https://ipwhois.io/documentation). The documentation says HTTPS is supported and describes JavaScript CORS requests. The provider's published free-endpoint limits include 1,000 requests per day; it says CORS traffic is counted per domain, so limits may be shared by visitors using the same site.

Only a strictly parsed public IP address is interpolated into this fixed provider URL. The tool rejects private and special-use ranges locally before calling `fetch`. It does not accept URLs, domains, provider overrides, or request options. Requests omit credentials, bypass caches, omit the referrer, reject redirects, abort after eight seconds, and read no more than 16 KiB of response data. Results are held in component memory only; this tool does not write submitted addresses or responses to storage or logs.

## Privacy and accuracy limitations

The submitted public IP address is sent directly to ipwho.is over HTTPS. Its [privacy policy](https://ipwhois.io/privacy) describes collection of usage data, including IP addresses and pages viewed, in log files and says data may be retained as long as needed for its stated purposes; it does not provide a specific retention period for this endpoint's queried-address data. The tool therefore does not promise that the provider does not log or retain lookup requests. Review the provider policy before submitting an address.

IP geolocation is approximate and may be incomplete or inaccurate. Provider availability and free-tier limits are outside this project's control. Private, reserved, documentation, multicast, and other special-use addresses are blocked locally and never sent to the provider.

## Validation and response fields

Input must be one complete IPv4 or IPv6 address with no whitespace, URL syntax, port, bracket, or IPv6 zone identifier. Address syntax and non-global ranges are checked locally. The response is accepted only as JSON within the byte limit and is reduced to known location, connection, and time-zone fields. Provider errors, network failures, timeouts, oversized responses, and malformed data are reported without persisting query data.

## Example input and options

The catalog sample in [definition.ts](definition.ts) is `8.8.8.8`. No options are accepted; the default options are `{}`.

## Contribution files

- [definition.ts](definition.ts): tool metadata, example, and route information.
- [logic.ts](logic.ts): strict address parsing, special-use checks, bounded provider request, and response shaping.
- [Tool.tsx](Tool.tsx): explicit-submit form, provider disclosure, and results view.
- [Focused tests](../../../tests/tools/ip-lookup.test.cjs): mocked network, validation, bounds, errors, and privacy UI checks.
