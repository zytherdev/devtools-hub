# K8s Secret Decoder

**Status:** Implemented

Decode one Kubernetes `kind: Secret` YAML document. Values in `data` are strictly base64-decoded as UTF-8 text and moved to `stringData`; the original `stringData` values take precedence when a key appears in both fields. All other Secret fields, including `metadata`, are preserved, and `data` is removed from the output.

## Usage and validation

Paste a single YAML document with `kind: Secret` and a `metadata` mapping. `data` and `stringData` are optional mappings of valid Kubernetes Secret keys to strings. Data values must use canonical, correctly padded base64 and decode to valid UTF-8. Other Kubernetes resource kinds, malformed YAML, multiple documents, invalid fields, and invalid Secret keys are rejected.

Input is limited to 500,000 characters. A Secret may contain at most 10,000 total keys across `data` and `stringData`; individual keys are limited to 253 characters and the Kubernetes Secret key character set (`A-Z`, `a-z`, `0-9`, `.`, `_`, `-`). There are no configuration options.

## Privacy and output warning

**Warning: the output contains secrets in plain text. Processing takes place locally in your browser, without sending data over the network.** Treat the output as sensitive credentials, avoid sharing it or saving it in public locations, and clear the fields after using the tool. The content is displayed, copied, and downloaded in plain text at the operator's discretion.

## Files

- [definition.ts](definition.ts): tool metadata, safe example, and YAML output type.
- [logic.ts](logic.ts): bounded YAML parsing and strict local decoding.
- [Tool.tsx](Tool.tsx): visible secret-handling warning and UniversalTool interface.
- Focused tests: [tests/tools/kubernetes-decoder.test.cjs](../../../tests/tools/kubernetes-decoder.test.cjs).
