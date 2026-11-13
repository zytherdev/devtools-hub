# Bcrypt Generator

**Status:** Implemented

Generate a salted bcrypt password hash or check a password against a bcrypt hash. Hashing and verification use the pinned browser-compatible `bcryptjs` 3.0.3 implementation bundled locally in `vendor/bcryptjs/`.

## Use

Choose **Generate hash** or **Verify password**. Enter the password into the masked field; it is cleared after a successful operation. Hash generation uses a fresh random salt and a configurable bcrypt cost from **4 to 14** (default **10**). Verification accepts 60-character `$2a$` and `$2b$` hashes whose encoded cost is also between 4 and 14. Results are shown as a hash or a match/no-match message. A generated hash can be copied only after clicking **Copy hash**.

Passwords must be non-empty and no more than **72 UTF-8 bytes**. Longer inputs are rejected rather than relying on bcrypt's 72-byte truncation behavior. For example, multibyte characters use more than one byte each.

The text-tool logic API is `run(password, options)`. It hashes by default; use `{ action: 'hash', cost: '10' }` to set the cost, or `{ action: 'verify', hash: '$2b$…' }` to verify. Hashing returns the encoded bcrypt string. Verification returns `Match` or `No match`. The interactive page uses the same exported `hashPassword` and `verifyPassword` logic directly.

## Privacy and handling

The bcrypt calculation runs in this browser using bundled JavaScript. The operation does not send the password or hash to an API or network endpoint, and this tool does not put either value in the URL, browser storage, or application logs. The password input is masked by default and is cleared after successful processing. The generated hash remains visible on the page until cleared or the page is left; it is not cleared automatically. If the user clicks **Copy hash**, that hash is written to the browser clipboard.

These statements describe this tool's processing code, not the whole browsing environment: loading the website requires ordinary page/network requests, and browser extensions, device compromise, browser diagnostics, or operating-system clipboard history are outside this tool's control. JavaScript cannot reliably erase immutable strings from browser memory. Do not enter a real account password into a website you do not trust; for production authentication, use a server-side password-hashing design and do not expose stored password hashes to client users.

## Timing, cost, and security limitations

Bcrypt is intentionally computationally expensive. The async implementation yields while working, but higher costs can still use substantial CPU and may take noticeably longer, especially on mobile devices. The permitted cost range bounds this browser tool's workload; each increment roughly doubles the computation. Choose a cost based on the actual deployment environment, not this tool's response time. Verification also rejects hashes with costs outside the permitted range to prevent unbounded client-side work.

Bcrypt is a one-way password hash, not encryption; it cannot recover a password. It has a 72-byte input limit, which this tool enforces rather than silently truncating. For new server-side systems, assess current password-hashing guidance (often Argon2id) and use a maintained server library with calibrated parameters. This browser utility is for local demonstration and checking, not a substitute for a production credential service. If Web Crypto secure randomness is unavailable, generation fails rather than using a weak fallback.

## Vendored implementation

`vendor/bcryptjs/` contains the CommonJS/UMD browser bundle and type declarations from `bcryptjs` **3.0.3**, under its included BSD-3-Clause license. It is kept tool-local so the project root dependency manifest and lockfile do not change. Its browser mapping excludes the Node `crypto` fallback from browser bundles; the implementation uses browser secure randomness. Review upstream releases before updating this copied source.
