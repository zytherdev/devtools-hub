# Adding a tool

Use this guide together with [CONTRIBUTING.md](../CONTRIBUTING.md). Each tool has one canonical folder; do not add per-tool Next.js routes or scatter its logic across domain folders.

## 1. Create the canonical folder

Choose one lowercase kebab-case slug, such as `csv-to-json`, and use it identically for the folder, definition ID, and route:

```text
app/tools/csv-to-json/
├── definition.ts
├── logic.ts
├── Tool.tsx
├── README.md
└── lib/                 # only for helpers private to this tool

tests/tools/csv-to-json.test.cjs
```

Use an existing catalog entry's folder if the tool is already listed. Do not make another entry with a different spelling.

## 2. Define metadata and UI defaults

In `definition.ts`, export the typed definition containing `id`, `name`, `description`, `categoryId`, `href`, icon/color, implementation status, sample input, default options, and output extension. Keep `id === folder name === href.slice(1)`. Add this definition to `app/tools/registry.ts`; do not manually duplicate the object in category arrays or quick links.

## 3. Implement bounded logic

In `logic.ts`, export `run(input, options)`. Keep it pure and typed; validate all options and input, set reasonable size/depth/work limits, and provide useful errors. Put tool-private helpers in the same folder's `lib/`. Only put a helper in shared `app/lib/tools/` if multiple tools truly use it. Do not use `eval`, execute pasted code, or make undisclosed network requests.

## 4. Add the UI entry point

Every tool has `Tool.tsx`. Add its static import to `app/tools/componentRegistry.ts`. For a standard text-in/text-out interface, compose the shared `UniversalTool` with this tool's definition and slug; `app/lib/tools/toolEngine.ts` dispatches the slug to `logic.ts`. For richer controls, implement a specialized UI in this same file and call local logic; reuse `PageIntro`, `ToolPanel`, shared CSS tokens, inline errors, and accessible controls. Never add another route page: `app/(tools)/[slug]/page.tsx` resolves every slug.

## 5. Document and test

Update the folder's `README.md` with purpose, options, output, limitations, and data/privacy behavior. Add `tests/tools/<slug>.test.cjs` covering:

- A representative success case.
- Invalid syntax and options with useful errors.
- Boundary and malformed inputs.
- Safety/privacy requirements and the registry connection.

Only set `status: 'implemented'` after the logic and UI are connected and meaningful tests pass. Pending entries use the same folder contract and an explicit pending state.

## 6. Validate

Run the full checks before opening a pull request:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Or run `npm run check`. Update tool coverage when implementation status changes.
