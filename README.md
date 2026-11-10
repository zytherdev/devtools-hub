# DevTools Hub

An open-source collection of practical developer utilities, built with Next.js and TypeScript. The catalog is being implemented in focused batches; a listed entry is not considered complete until its tool folder includes connected logic, UI, and meaningful tests. See the [coverage guide](docs/tool-coverage.md) for current status.

[Website](https://devtools.zyther.dev) · [Issues](https://github.com/zytherdev/devtools-hub/issues) · [Contributing](CONTRIBUTING.md)

## Project principles

Use one shared route and visual system for tool pages. Keep transformations local by default, validate untrusted input, and disclose any network access. Treat each tool's definition, logic, UI, documentation, and tests as one contribution.

## Requirements and setup

Use Node.js **20.9 or newer** and npm with the checked-in lockfile:

```bash
git clone https://github.com/zytherdev/devtools-hub.git
cd devtools-hub
npm ci
npm run dev
```

Open <http://localhost:3000>.

## Project commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server. |
| `npm run lint` | Run ESLint. |
| `npm run typecheck` | Check TypeScript without emitting files. |
| `npm test` | Run the per-tool Node test suite. |
| `npm run build` | Create a production build. |
| `npm start` | Serve a production build; run `npm run build` first. |
| `npm run check` | Run lint, typecheck, tests, and production build in sequence. |

## Architecture at a glance

```text
app/tools/<slug>/definition.ts   Metadata and UI defaults
app/tools/<slug>/logic.ts        Pure, bounded implementation
app/tools/<slug>/Tool.tsx        Standard or specialized UI entry
app/tools/<slug>/README.md       Usage, options, limits, and privacy
app/tools/<slug>/lib/            Private helpers for this tool

tests/tools/<slug>.test.cjs      Focused behavior tests
app/tools/registry.ts            Canonical metadata and category views
app/tools/componentRegistry.ts   Static imports of each Tool.tsx
app/(tools)/[slug]/page.tsx      The one dynamic tool route
```

Every catalog entry follows this layout. When adding a tool, register its definition in `registry.ts` and its `Tool.tsx` in `componentRegistry.ts`. Shared UI lives in `app/components`; helpers used by multiple tools may live in `app/lib/tools`. Do not add per-tool route pages or leave tool-specific logic in a central dispatcher. Read [Architecture](docs/architecture.md) and [Adding a tool](docs/adding-a-tool.md) before contributing.

## Add or improve a tool

Start with [CONTRIBUTING.md](CONTRIBUTING.md), then follow the [step-by-step guide](docs/adding-a-tool.md). A contribution updates the tool's `definition.ts`, `logic.ts`, `Tool.tsx`, `README.md`, and focused test together. Run `npm run check` before opening a pull request.

## Privacy

Many transformations run in the browser. Tools that perform an external lookup must disclose that behavior. The site also loads its icon stylesheet from cdnjs, and its hosting provider may process standard request metadata. See the [Privacy Policy](https://devtools.zyther.dev/privacy) for the current application-level summary.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
