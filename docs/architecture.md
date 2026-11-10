# Architecture

## Route and data flow

```text
app/lib/utils/tools.ts
  ├─ categories / allTools ──> home, category pages, header, footer
  └─ href slug ──────────────> app/(tools)/[slug]/page.tsx
                                  ├─ specializedTools map
                                  │    └─ app/components/tools/*.tsx
                                  │         └─ app/lib/tools/** utilities
                                  └─ UniversalTool
                                       └─ app/lib/tools/toolEngine.ts
                                            └─ app/lib/tools/dataTools.ts
```

The App Router uses one dynamic route for tool pages. Its `generateStaticParams()` derives slugs from `allTools`; invalid slugs return a 404. Category pages use the same catalog and a dynamic category route. Do not create a duplicate page route or manually maintain a second list of tool URLs.

## Catalog

`app/lib/utils/tools.ts` is the source for tool and category metadata. Each tool has an `id`, display name, description, icon, color, and `href`. The canonical invariant is `id === href.slice(1)`. `allTools`, category views, `colorTools`, and `quickTools` should be derived from the category arrays rather than copying tool objects. `getToolCatalogIssues()` reports duplicate IDs/routes, invalid slugs, duplicate categories, and missing or multiply assigned category entries.

Catalog metadata controls discovery and page headings; it does **not** by itself implement a tool. A tool is functional only when a generic executor or specialized UI is connected and tested. See [Tool coverage](tool-coverage.md).

## UI modes

### Generic tools

`app/components/UniversalTool.tsx` provides the shared input/output editor, options JSON, sample input, copy/download actions, processing state, and inline errors. The generic dynamic route renders the same shell for all generic tools. Add samples, default options, and output extensions to its per-slug configuration when adding a tool.

`app/lib/tools/toolEngine.ts` is the generic execution entry point. It handles simple text/markup tools and delegates structured data tools to `app/lib/tools/dataTools.ts`. Keep reusable transforms in separate modules under `app/lib/tools/`; validate input/options and return result strings or throw useful errors.

### Specialized tools

Use `app/components/tools/<tool>.tsx` when the tool needs interactive controls that do not fit the generic text-in/text-out editor. Add its component to the `specializedTools` map in `app/(tools)/[slug]/page.tsx`. Its utility logic should remain separate under `app/lib/tools/` when practical.

## Shared styling

Tool pages use `PageIntro`, `ToolPanel`, `UniversalTool`, `ToolCard`, and the CSS variables/classes in `app/styles/globals.css`. Keep new and existing tools on the same border, surface, spacing, typography, interaction, and theme tokens. Do not add a separate design system for a single tool. Public content pages use `ContentPage` and the same `PageIntro`/panel tokens; the home page has a distinct discovery hero but shares cards and global navigation.

## Tests and checks

The Node test suite is under `tests/` and runs with `npm test`. Tests load focused TypeScript utility modules through the installed TypeScript compiler; no extra test framework is required. Use `npm run check` for ESLint, TypeScript, tests, and a production build. Add coverage for normal, malformed, boundary, and privacy-sensitive cases.
