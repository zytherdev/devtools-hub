<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Repository conventions

- Read `CONTRIBUTING.md`, `docs/architecture.md`, and `docs/adding-a-tool.md` before changing tool registration, execution, or page structure.
- Every catalog entry has one canonical folder at `app/tools/<slug>/` containing `definition.ts`, `logic.ts`, `Tool.tsx`, and `README.md`; private helpers go in its `lib/` subfolder and tests in `tests/tools/<slug>.test.cjs`.
- Keep tool `id`, folder name, and route slug identical. Register metadata in `app/tools/registry.ts` and its view in `app/tools/componentRegistry.ts`; `app/lib/utils/tools.ts` exposes derived views only.
- Use the single dynamic route `app/(tools)/[slug]/page.tsx`; never add a per-tool route page or scatter tool-specific logic under shared folders.
- Shared UI belongs in `app/components`; helpers used by multiple tools may live in `app/lib/tools`. Reuse `PageIntro`, `ToolPanel`, shared CSS tokens, and existing accessibility/error patterns.
- Keep input local unless a tool clearly explains its external request. Keep utility functions typed and bounded; add success, invalid-input, and boundary tests.
- Use npm with the checked-in lockfile: `npm ci`.
- Before a change is ready, run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` (or `npm run check`).
