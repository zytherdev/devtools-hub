# Architecture

## Canonical tool structure

Every catalog entry has the same home under `app/tools/<slug>/`:

```text
app/tools/<slug>/
├── definition.ts       # metadata, category, status, sample/defaults and output type
├── logic.ts            # public run(input, options) entry point
├── Tool.tsx            # the tool's page UI entry point
├── README.md           # usage, options, limitations and privacy notes
└── lib/                # private helpers used only by this tool (when needed)

tests/tools/<slug>.test.cjs  # focused behavior and integration tests
```

Do not put tool-specific implementation in `app/components/tools`, `app/lib/tools`, or the dynamic route. `app/components` is for shared interface primitives; `app/lib/tools` is reserved for helpers used by more than one tool. If a helper is tool-specific, place it in that tool's `lib/` folder. A generic `Tool.tsx` composes the shared `UniversalTool`; a bespoke `Tool.tsx` may provide richer controls, but both use the same page shell and design tokens.

## Route and data flow

```text
app/tools/<slug>/definition.ts ──> app/tools/registry.ts ──> app/lib/utils/tools.ts
                                             │                  ├─> home, categories, navigation
                                             │                  └─> tool metadata/page shell
app/tools/<slug>/Tool.tsx ───────> app/tools/componentRegistry.ts ──> app/(tools)/[slug]/page.tsx
app/tools/<slug>/logic.ts ───────> bespoke Tool.tsx
                         └───────> toolEngine.ts ──> UniversalTool (standard text tools)
tests/tools/<slug>.test.cjs ─────> logic and registry contracts
```

The App Router uses one dynamic route for tool pages. Its `generateStaticParams()` derives slugs from the registry; invalid slugs return a 404. Category pages use the same registry and one dynamic category route. Do not create a separate Next.js page for a tool or manually maintain a second list of tool URLs.

## Definitions and registry

`definition.ts` is the single source for that tool's slug, name, description, category, icon/color, implementation status, sample input, default options, and output extension. The slug, folder name, and route slug must match exactly. `app/tools/registry.ts` imports each definition and derives categories; `app/tools/componentRegistry.ts` contains statically analyzable dynamic imports of each `Tool.tsx`. `app/lib/utils/tools.ts` exposes derived catalog/category views for existing app consumers. Keep both registries synchronized; do not copy tool objects into quick links or separate route lists.

A catalog entry is not automatically implemented. Mark `status: 'implemented'` only when `logic.ts`, `Tool.tsx`, and meaningful passing tests are connected. Planned entries use the same folder contract and an explicit planned state. See [Tool coverage](tool-coverage.md).

## Logic and UI

`logic.ts` exports the typed `run(input, options)` function. It performs bounded, validated local work and returns a result string or throws a useful error. It does not import React or mutate UI state. Keep tool-private parser/helper files under that tool's `lib/`. A helper belongs in shared `app/lib/tools/` only when at least two tools genuinely reuse it.

Every `Tool.tsx` is the UI entry point. Simple text-in/text-out tools compose `app/components/UniversalTool.tsx` with the tool definition and slug; `app/lib/tools/toolEngine.ts` maps generic slugs to each folder's `logic.ts`. Tools needing richer controls may use a bespoke component and call their local logic, but should still use shared `PageIntro`, `ToolPanel`, CSS tokens, inline errors, accessibility patterns, and light/dark theme support.

## Tests and checks

Add focused tests at `tests/tools/<slug>.test.cjs`. Cover success, malformed input/options, boundary limits, and privacy-sensitive behavior. Test the exported logic and the registry connection so a tool cannot be listed without an implementation. The Node test runner is built in; no extra test framework is required. Run `npm run check` for ESLint, TypeScript, tests, and a production build.
