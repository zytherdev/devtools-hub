# MAC Address Lookup

**Status:** Implemented

Look up the registered vendor associated with a 24-bit OUI prefix using a supplied OUI or 48-bit MAC address.

## Input and processing

Accepted input is a 6-hex-digit OUI or a 12-hex-digit MAC address, optionally formatted as colon- or dash-separated octets or in Cisco-style groups of four separated by dots. Surrounding whitespace is trimmed. Invalid characters, mixed separator forms, and other lengths are rejected before any network request.

A valid input is normalized to six uppercase hexadecimal digits. The tool makes one HTTPS `GET` request to the fixed endpoint `https://api.macvendors.com/{OUI}` only after the user presses **Lookup**. The path parameter contains only the first 24-bit prefix; the last three MAC bytes are never transmitted. No user-controlled host or URL is accepted. Browser credentials are omitted, caching is disabled, and the referrer is suppressed.

The lookup has a 5-second timeout and a 2,048-byte response limit (checked against both the declared length and streamed bytes). HTTP 404, HTTP 429, other HTTP failures, timeouts, network/CORS failures, oversized bodies, and invalid responses have distinct user-facing errors. Browser CORS behavior depends on the provider's response headers and the current browser/network; blocked cross-origin requests are reported as network/CORS failures.

## Provider, privacy, and limits

The provider is [MACVendors](https://macvendors.com/api), using its documented HTTPS API. The provider documents plain-text vendor results, HTTP 404 for no match, HTTP 429 for rate limiting, and a free quota of 1,000 requests per day at one request per second without an API key. It says its vendor data comes from the IEEE Standards Association and is updated multiple times daily. Quotas and provider behavior may change; the app does not attempt to bypass limits.

Before submission, the UI explains that only the OUI prefix is sent. The provider necessarily also receives the request's source IP and ordinary connection metadata; MACVendors' [privacy policy](https://macvendors.com/privacy-policy) states that its servers may log IP addresses and describes its data collection and retention practices. The app uses no credentials, makes no lookup automatically, and does not persist or log submitted addresses or results. Results are held only in the active page state.

OUI lookup is not a device identity check. Records can be missing or stale, and locally administered/randomized MAC addresses may not map to a registered manufacturer. A vendor match identifies a prefix registration, not the specific device or its owner. The endpoint is external and requires network access and browser permission for cross-origin HTTPS requests.

## Project files

- [definition.ts](definition.ts): catalog metadata and example.
- [logic.ts](logic.ts): validation, normalization, bounded fetch, and typed errors.
- [Tool.tsx](Tool.tsx): accessible submit-only UI and privacy disclosure.
- Focused tests: [tests/tools/mac-lookup.test.cjs](../../../tests/tools/mac-lookup.test.cjs).

Provider references: [MACVendors API documentation](https://macvendors.com/api), [MACVendors privacy policy](https://macvendors.com/privacy-policy), and [MACVendors service overview](https://macvendors.com/).
