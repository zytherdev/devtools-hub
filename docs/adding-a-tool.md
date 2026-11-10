# Adding a tool

Use this guide together with [CONTRIBUTING.md](../CONTRIBUTING.md). The usual path is a catalog entry plus a local utility and shared UI integration; a new route page is not needed.

## 1. Choose and register one slug

Choose a lowercase kebab-case slug, for example `csv-to-json`. Add the metadata to the appropriate category array in `app/lib/utils/tools.ts`:

```ts
{
  id: 'example-tool',
  name: 'Example Tool',
  description: 'A short, accurate description of the tool.',
  icon: 'fa-solid fa-wand-magic-sparkles',
  color: '#347a58',
  badge: '',
  href: '/example-tool',
}
```

Keep `id === href.slice(1)`. Do not add a duplicate copy to `allTools`, `quickTools`, or a separate route; those views are derived from the category arrays. Run `getToolCatalogIssues()` when changing catalog structure.

## 2. Implement the transformation

Put pure processing logic in `app/lib/tools/<domain>/<tool>.ts` (or the existing flat domain file if that is the established location for the module). Export a function that accepts the input and string-valued options, validates both, and returns the output. Avoid DOM or browser globals in utilities unless the algorithm specifically requires them. Impose practical limits for untrusted or expensive input.

## 3. Connect the executor

For a simple tool compatible with the shared editor:

1. Add its dispatch to `app/lib/tools/toolEngine.ts`; if it is a structured data conversion, add it to `runDataTool` in `app/lib/tools/dataTools.ts`.
2. Add a representative input to `samples` in `app/components/UniversalTool.tsx`.
3. Add valid defaults to `optionSamples` and choose the correct output extension in the shared download map.
4. Keep option names documented in the utility and example JSON. The UI accepts JSON primitive values and passes their string forms to the executor.

The route automatically uses `UniversalTool` for catalog entries without a specialized component.

## 4. Add a specialized interface only when needed

If the tool needs controls beyond a text editor and options object, create `app/components/tools/<tool>.tsx`, keep its visual shell and controls aligned with shared panels/tokens, and register its dynamic import in the `specializedTools` map in `app/(tools)/[slug]/page.tsx`. Keep processing logic outside React components where possible.

## 5. Test behavior and integration

Add focused tests under `tests/*.test.cjs`. Cover at least:

- A representative successful input and output.
- Invalid syntax/options and a useful error.
- Boundary cases such as empty input, malformed quoting, unsafe values, or size/depth limits.
- The actual `runTool(slug, input, options)` path so the new tool cannot be accidentally omitted from the dispatcher.

The suite uses Node's built-in test runner and TypeScript's compiler API to load TypeScript modules. Run:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## 6. Keep the UI and documentation accurate

Use the existing `PageIntro`, `ToolPanel`, `UniversalTool`, CSS variables, and light/dark theme conventions. Do not claim that input is processed locally if the tool sends it to a service. If external access is essential, show a clear notice before the request and update the privacy documentation. Update catalog/coverage notes when implementation status changes.
