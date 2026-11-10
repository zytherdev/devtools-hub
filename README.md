# DevTools Hub

An open-source collection of practical developer utilities, built with Next.js and TypeScript. The catalog is actively being brought into full implementation coverage; catalog metadata alone does not guarantee that a tool’s executor is complete. Check the shared tool route, component map, and executor before treating an entry as shipped.

[Website](https://devtools.zyther.dev) · [Issues](https://github.com/zytherdev/devtools-hub/issues) · [Contributing](CONTRIBUTING.md)

## Project principles

- Use one shared route and visual system for tool pages; avoid one-off route pages unless a framework requirement makes them necessary.
- Keep transformations local by default. If a tool needs an external lookup, clearly disclose what is sent and to whom.
- Prefer small, typed utility functions with explicit input validation, limits, and errors.
- Treat tool catalog, route, executor, examples, and tests as one contribution.

## Requirements

- Node.js **20.9 or newer** (required by the installed Next.js version).
- npm and the checked-in `package-lock.json`.

## Run locally

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
| `npm test` | Run the Node test suite. |
| `npm run build` | Create a production build. |
| `npm start` | Serve a production build; run `npm run build` first. |
| `npm run check` | Run lint, typecheck, tests, and production build in sequence. |

## Architecture at a glance

```text
app/lib/utils/tools.ts       Tool metadata and category membership
             │
             ├── app/page.tsx and shared navigation
             │
             └── app/(tools)/[slug]/page.tsx
                       ├── specialized UI: app/components/tools/*
                       └── shared UI: UniversalTool → toolEngine → app/lib/tools/*
```

Tool routes are derived from the catalog; do not add a separate `page.tsx` for every tool. The tool UI shell (`PageIntro`, `ToolPanel`, `UniversalTool`) and global design tokens keep existing and new tools visually consistent. See [the architecture guide](docs/architecture.md) and [the tool coverage notes](docs/tool-coverage.md).

## Add or improve a tool

Start with [CONTRIBUTING.md](CONTRIBUTING.md), then follow the step-by-step [Adding a tool guide](docs/adding-a-tool.md). In brief: define the tool once in the correct category in `app/lib/utils/tools.ts`, implement it in `app/lib/tools/` or `app/components/tools/`, connect it to the existing generic executor or specialized component map, add an example/options and tests, and run `npm run check`.

## Privacy

Many transformations run in the browser. Tools that perform an external lookup must disclose that behavior. The site also loads its icon stylesheet from cdnjs, and its hosting provider may process standard request metadata. See the [Privacy Policy](https://devtools.zyther.dev/privacy) for the current application-level summary.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
