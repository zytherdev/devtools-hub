<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Repository conventions

- Read `CONTRIBUTING.md`, `docs/architecture.md`, and `docs/adding-a-tool.md` before changing tool registration, execution, or page structure.
- `app/lib/utils/tools.ts` is the catalog source. A tool's `id` must match the slug in its `href`; categories and quick links are derived views, not places for duplicate metadata.
- Tool pages use `app/(tools)/[slug]/page.tsx`. Generic tools share `UniversalTool` and the executor under `app/lib/tools`; specialized UIs live in `app/components/tools` and are registered in the dynamic route map.
- Reuse `PageIntro`, `ToolPanel`, shared CSS tokens, and existing accessibility/error patterns. Keep user input local unless a tool clearly explains its external request.
- Keep utility functions typed and bounded; add success, invalid-input, and boundary tests in `tests/`.
- Use npm with the checked-in lockfile: `npm ci`.
- Before a change is ready, run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` (or `npm run check`).
