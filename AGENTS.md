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
- Tailwind is v3 and global styles load from `src/client/setup.ts`.
- Keep `wasp()` from `wasp/client/vite` in `vite.config.ts`.
- Direct React Router imports should come from `react-router`.
- `.npmrc` sets `min-release-age=7`.

## Commands

```sh
nvm use
npm install
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
