# Contributing to DevTools Hub

Thanks for helping improve the project. Small, focused contributions with tests and clear documentation are easiest to review.

## 1. Set up the repository

Use Node.js 20.9 or newer and npm. Fork the repository, then clone your fork:

```bash
git clone https://github.com/<your-github-user>/devtools-hub.git
cd devtools-hub
npm ci
npm run dev
```

Open <http://localhost:3000>. Keep the upstream repository as `upstream` if you want to sync changes:

```bash
git remote add upstream https://github.com/zytherdev/devtools-hub.git
```

## 2. Choose a focused branch

```bash
git switch -c feat/short-description
```

Use a concise branch name that describes one change. Avoid mixing unrelated refactors and features.

## 3. Follow the same folder contract for every tool

Every tool has exactly one canonical folder: `app/tools/<slug>/`. It contains `definition.ts` (metadata and UI defaults), `logic.ts` (the public `run(input, options)` entry point), `Tool.tsx` (the UI entry), and `README.md` (usage, options, limitations, and privacy). Put private helpers in that folder's `lib/`. Tests are at `tests/tools/<slug>.test.cjs`. Do not create tool-specific code under `app/components/tools`, `app/lib/tools`, or a separate route.

The `id`, folder name, and `href` slug must be identical. Add the definition to `app/tools/registry.ts` and the view to `app/tools/componentRegistry.ts`. The first is the canonical metadata registry; `app/lib/utils/tools.ts` provides derived catalog/category views to the rest of the app. Keep categories and quick links derived from tool definitions—never duplicate a tool object.

The App Router has one dynamic page at `app/(tools)/[slug]/page.tsx`; do not add one route page per tool. A standard `Tool.tsx` composes `UniversalTool` with its definition and slug; the shared `toolEngine.ts` dispatches that slug to the folder's `logic.ts`. Use a bespoke UI in the same `Tool.tsx` only when richer controls are required. Shared UI primitives belong in `app/components`; helpers belong in `app/lib/tools` only when genuinely shared by multiple tools.

## 4. Keep the experience consistent

Use the shared page header, panel components, global tokens, input/output conventions, and inline error feedback. Support light and dark themes, keyboard access, and narrow screens. Keep processing separate from React state where possible.

## 5. Security and privacy requirements

- Prefer local processing. If a feature needs a network request, explain the request in the UI and document what input is sent and to which provider.
- Never execute user input or use `eval`/`Function` to process it. Do not use unsafe deserialization.
- Render user-controlled data as text; validate parser options and impose reasonable input, output, depth, and workload limits.
- Handle malformed input with a useful inline error. Do not use blocking dialogs or return an error message as if it were valid output.
- Do not set a tool's status to implemented until its logic and UI are connected and meaningful tests pass.

## 6. Run checks

Before opening a pull request, run:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Or run the same sequence with `npm run check`. If a check cannot run, include the exact command and reason in the PR description.

## 7. Open a pull request

Push your branch to your fork and open a PR against `zytherdev/devtools-hub`. Include the problem and intended behavior, a concise change summary, test commands and results, screenshots for visual changes when practical, and any network/data-flow changes.

### Checklist

- [ ] The slug, folder, definition, registry entry, route, and output behavior agree.
- [ ] The tool uses shared components/tokens and works with both themes and mobile widths.
- [ ] Normal, invalid, boundary, and safety-sensitive inputs are tested.
- [ ] Per-tool README and coverage status are accurate.
- [ ] `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` pass.
