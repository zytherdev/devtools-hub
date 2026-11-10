# Contributing to DevTools Hub

Thanks for helping improve the project. Small, focused contributions with tests and clear documentation are easiest to review.

## 1. Set up the repository

Use Node.js 20.9 or newer and npm. Fork the repository on GitHub, then clone **your fork**:

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

## 3. Understand the tool architecture

- `app/lib/utils/tools.ts` defines catalog metadata, category membership, and derived quick links. Keep each `id` identical to its route slug (`href: '/<id>'`) and do not duplicate entries.
- `app/(tools)/[slug]/page.tsx` resolves every tool route. Do not create a per-tool route page by default.
- Generic tools render through `app/components/UniversalTool.tsx` and execute through `app/lib/tools/toolEngine.ts` or its data-tool dispatcher.
- Tools that need bespoke controls live under `app/components/tools/` and are registered in the specialized component map in the dynamic route.
- Pure parsing, conversion, or generation logic belongs in `app/lib/tools/`. See [Architecture](docs/architecture.md) and [Adding a tool](docs/adding-a-tool.md).

## 4. Keep the experience consistent

New tools should use the shared page header, panel components, global tokens, input/output conventions, and inline error feedback. Reuse the existing `UniversalTool` whenever its input/options/output model fits. A specialized UI is appropriate when the tool needs richer controls, but it should still use shared components and support the light and dark themes, keyboard access, and narrow screens.

## 5. Security and privacy requirements

- Prefer local processing. If a feature needs a network request, explain the request in the UI and document what input is sent and to which provider.
- Never execute user input or use `eval`/`Function` to process it. Do not use unsafe deserialization.
- Render user-controlled data as text; validate parser options and impose reasonable input, output, depth, and workload limits.
- Handle malformed input with a useful inline error. Do not use blocking dialogs or return an error message as if it were valid output.
- Do not claim a tool is implemented until it has a connected UI/executor and meaningful tests.

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

Push your branch to your fork and open a PR against `zytherdev/devtools-hub`. Include:

- The problem and intended behavior.
- A concise list of code/documentation changes.
- Test commands and their results.
- Screenshots or a short recording for visual changes, when practical.
- A note about network/data-flow changes, if applicable.

### Checklist

- [ ] Tool slug, `id`, `href`, category, executor/component, and download behavior agree.
- [ ] The UI uses shared components and works with both themes and mobile widths.
- [ ] Normal, invalid, boundary, and safety-sensitive inputs are tested.
- [ ] `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` pass.
- [ ] README or the relevant guide is updated when behavior or contribution steps change.
