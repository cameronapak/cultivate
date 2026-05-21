# AGENTS.md

## Core Philosophy

- Prefer simple, direct solutions.
- Do not add abstractions, future-proofing, or complex error handling unless required.
- Hardcode reasonable defaults before building configuration systems.
- Prefer single-file changes when that keeps the work clear.

## Communication

- Be extremely concise.

## Technology Standards

- TypeScript preferred.
- This project currently uses npm because Wasp owns the app workflow here.
- Use `type` over `interface`.
- Never use `as any`.
- Add comments only when code is not self-explanatory.

## Boundaries

- Do not commit unless explicitly told.
- Ask before adding dependencies or changing architecture.
- Do not modify `node_modules/`, `vendor/`, or generated `.wasp/` files.
- Do not push to main without review.

## Project Reality

- Cultivate is a Wasp app targeting Wasp `^0.23.0`.
- Use Node `24.14.1` from `.nvmrc`.
- Install the matching CLI with `npm i -g @wasp.sh/wasp-cli@0.23.0`.
- Use npm and `package-lock.json`.
- Wasp workspaces are `[".wasp/out/*", ".wasp/out/sdk/wasp"]`.
- Wasp app config lives in `main.wasp.ts`.
- Run `wasp ts-setup` after `wasp clean` or removing `node_modules`.
- Tailwind is v4, uses `@tailwindcss/vite`, and global styles load from `src/client/setup.ts`.
- Tailwind theme tokens and custom utilities live in `src/Main.css`; there is no JS Tailwind config.
- Theme variables should store full CSS color values like `hsl(...)`; runtime theme writes go through `src/lib/fix-global-css.ts`.
- Public theme CSS files in `public/themes` should pass `npm run themes:check`.
- Animations use `tw-animate-css`, not `tailwindcss-animate`.
- Keep `wasp()` from `wasp/client/vite` in `vite.config.ts`.
- Direct React Router imports should come from `react-router`.
- `.npmrc` sets `min-release-age=7`.

## Commands

```sh
nvm use
npm install
wasp ts-setup
wasp compile
wasp db migrate-dev
wasp db seed
wasp start
```

If `.env.server` defines `DATABASE_URL`, start that database yourself. Wasp does not start its managed dev database when a custom `DATABASE_URL` is present.

<!-- DOC_FRESHNESS_START -->
Repo reality is the source of truth. If `AGENTS.md` or `README.md` becomes false, update it in the same change when the fix is objective.

Objective facts include repo structure, tracked paths, setup commands, validation commands, runtime/tooling, skill/resource/prompt inventory, and workflow constraints proven by the repo.

- Update `AGENTS.md` when it is stale about agent-facing repo reality.
- Update `README.md` when it is stale about human-facing purpose, entry points, install, or use.
- Ask before changing policy, philosophy, positioning, or workflow intent.
- If both docs are stale, update both. Do not make them mirror each other unless the same fact belongs in both.
- Ignore temporary, generated, local-only, and unrelated untracked files.
- If unrelated user changes make docs look stale, ask before broadening scope.
- After repo-reality changes, check `AGENTS.md` and `README.md` before finishing.
<!-- DOC_FRESHNESS_END -->

<!-- CODEGRAPH_START -->
## CodeGraph

This project has a CodeGraph MCP server (`codegraph_*` tools) configured. CodeGraph is a tree-sitter-parsed knowledge graph of every symbol, edge, and file. Reads are sub-millisecond and return structural information grep cannot.

### When to prefer codegraph over native search

Use codegraph for **structural** questions — what calls what, what would break, where is X defined, what is X's signature. Use native grep/read only for **literal text** queries (string contents, comments, log messages) or after you already have a specific file open.

| Question | Tool |
|---|---|
| "Where is X defined?" / "Find symbol named X" | `codegraph_search` |
| "What calls function Y?" | `codegraph_callers` |
| "What does Y call?" | `codegraph_callees` |
| "What would break if I changed Z?" | `codegraph_impact` |
| "Show me Y's signature / source / docstring" | `codegraph_node` |
| "Give me focused context for a task/area" | `codegraph_context` |
| "Survey an unfamiliar module/topic" | `codegraph_explore` |
| "What files exist under path/" | `codegraph_files` |
| "Is the index healthy?" | `codegraph_status` |

### Rules of thumb

- **Trust codegraph results.** They come from a full AST parse. Do NOT re-verify them with grep — that's slower, less accurate, and wastes context.
- **Don't grep first** when looking up a symbol by name. `codegraph_search` is faster and returns kind + location + signature in one call.
- **Don't chain `codegraph_search` + `codegraph_node`** when you just want context — `codegraph_context` is one call.
- **`codegraph_explore` is the heavy hitter** for unfamiliar areas — it returns full source from all relevant files in one call, but is token-heavy. If your harness supports parallel subagents (e.g., Claude Code's Task tool), spawn one for explore-class questions to keep main session context clean.
- **Index lag**: the file watcher debounces ~500ms behind writes; don't re-query immediately after editing a file in the same turn.

### If `.codegraph/` doesn't exist

The MCP server returns "not initialized." Ask the user: *"I notice this project doesn't have CodeGraph initialized. Want me to run `codegraph init -i` to build the index?"*
<!-- CODEGRAPH_END -->

# Wasp Knowledge [GENERATED BY WASP v1]

This project uses Wasp, a batteries-included framework for building full-stack web apps with React, Node.js, and Prisma.

## Development Guidelines

### Start a Wasp Development Session with Full Debugging Visibility

Run the plugin's `start-dev-server` skill with the recommended options to give Claude full debugging visibility:

- Start the Wasp development server as a background task to give Claude direct access to server logs and build errors.
- Select the Chrome DevTools MCP server to give Claude visibility into browser console logs, UI functionality, network requests, and runtime errors.

### Documentation

Always fetch and verify your knowledge against the current Wasp documentation before taking on tasks, answering questions, or doing any development work in a Wasp project as your Wasp knowledge may be outdated:

1. Run `wasp version` to get the current Wasp CLI version.
2. Find and fetch the correct version of the Wasp documentation maps from the [LLMs.txt index](https://wasp.sh/llms.txt). The map contains raw markdown file GitHub URLs of all documentation sections.
3. Fetch the guides relevant to the current task or query from those raw.githubusercontent.com URLs directly - do NOT use HTML page URLs.

### Database Schema and Migrations

Always run database migrations with the `--name` flag:

```bash
wasp db migrate-dev --name <descriptive-name>
```

Changes to `schema.prisma` are not applied until database migrations are run.

**Track pending migrations:** The dev server warns about this, but users may miss it if Wasp is running as a background task. Continue coding freely but inform users of pending migrations before testing/viewing the app and offer to run migrations when the user wants to.

## Project Reference

### Structure

```text
.
├── .wasp/                    # Wasp output (auto-generated, do not edit)
├── public/                   # Static assets
├── src/                      # Feature code: server `operations.ts` and client `pages.tsx` files
├── main.wasp or main.wasp.ts # Wasp config file: routes, pages, auth, operations, jobs, etc.
├── schema.prisma             # Database schema (Prisma)
```

### Recommended Code Organization

Unless user specifies otherwise, use a vertical, per-feature code organization (not per-type):

```text
src/
├── tasks/
│   ├── TasksPage.tsx      # Page component
│   ├── TaskList.tsx       # Component
│   └── operations.ts      # Queries & actions
├── auth/
│   ├── LoginPage.tsx
│   └── google.ts
```

### Starter Templates

Highly recommend that the user chose one of the following templates when scaffolding a new Wasp app:

```bash
wasp new my-basic-app -t basic # creates a basic starter app with core Wasp features like auth, operations, pages, etc.
wasp new my-saas-app -t saas # creates a full-featured SaaS starter app with auth, payments, demo app, AWS S3, and more (OpenSaaS.sh)
```

See the **Starter Templates** section in the Wasp documentation for more templates.

### Customization

**Do NOT configure Vite, Express, React Query, etc. the usual way.** Wasp has its own mechanisms for customizing these tools. See the **Project Setup & Customization** section in the Wasp docs.

### Advanced Features

Wasp provides **advanced features**:

- custom HTTP API endpoints
- background (cron) jobs
- type-safe links
- websockets
- middleware
- email sending

See the **Advanced Features** section in the Wasp docs for more details.

### Wasp Conventions

#### Imports

**In TypeScript files:**

- ✅ `import type { User } from 'wasp/entities'`
- ✅ `import type { GetTasks } from 'wasp/server/operations'`
- ✅ `import { getTasks, createTask, useQuery } from 'wasp/client/operations'`
- ✅ `import { SubscriptionStatus } from '@prisma/client'` (for Prisma enums)
- ✅ Local code: relative paths `import { X } from './X'`

**In main.wasp:**

- ✅ `fn: import { getTasks } from "@src/tasks/operations"`
- ❌ Never relative paths

**In main.wasp.ts:**

See the **TypeScript Config** section in the Wasp docs for more details.

#### Operations

- ⚠️ Call actions directly using `async/await`. DO NOT use Wasp's `useAction` hook unless optimistic updates are needed.

## Troubleshooting

### Debugging

Always ground your knowledge against the [Wasp documentation](#documentation).

If you don't have full debugging visibility as described in the [Start a Wasp Development Session with Full Debugging Visibility](#start-a-wasp-development-session-with-full-debugging-visibility) section, do the following:

1. Insist that the user run the `start-dev-server` skill as described in the [Start a Wasp Development Session with Full Debugging Visibility](#start-a-wasp-development-session-with-full-debugging-visibility) section.
2. If the user refuses, ask them to share the output of the `wasp start` command and the browser console logs.

### Common Mistakes

| Symptom | Fix |
|---------|-----|
| `context.entities.X undefined` | Add entity to `entities: [...]` in main.wasp |
| Schema changes not applying | Run `wasp db migrate-dev --name <descriptive-name>` |
| Can't login after email signup with `Dummy` email provider | Check the server logs for the verification link or set SKIP_EMAIL_VERIFICATION_IN_DEV=true in .env.server |
| Types stale/IDE errors after changes | Restart TS server `Cmd+Shift+P` |
| Wasp not recognizing changes | **WAIT PATIENTLY** as Wasp recompiles the project. Re-run `wasp start` if necessary. |
| Persistent weirdness after waiting patiently and restarting. | Run `wasp clean` && `wasp start` |
