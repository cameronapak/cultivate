# Wasp 0.23 Migration Notes

Cultivate now targets Wasp `^0.23.0` after migrating from `^0.18.2` through the official Wasp migration paths.

## Current Setup

- Use Node `24.14.1` from `.nvmrc`.
- Install Wasp from npm: `npm i -g @wasp.sh/wasp-cli@0.23.0`.
- Keep npm and `package-lock.json`.
- Keep `.npmrc` with `min-release-age=7`.
- Wasp app config now lives in `main.wasp.ts`.
- Run `wasp ts-setup` after `wasp clean` or removing `node_modules`.
- Do not edit generated `.wasp/` files manually.
- Deployment validation is out of scope for this migration.

## Applied Changes

- `main.wasp` was replaced by `main.wasp.ts`.
- `package.json` uses Wasp workspaces: `[".wasp/out/*", ".wasp/out/sdk/wasp"]`.
- `package.json` includes the local `wasp-config` dev dependency for Wasp TS config.
- The old root `wasp` file dependency was removed.
- React was upgraded to 19.
- React Router was upgraded to 7, and direct `react-router-dom` imports moved to `react-router`.
- Zod was upgraded to 4.
- TypeScript was pinned to `5.9.3`.
- `vite.config.ts` uses `wasp()` from `wasp/client/vite`.
- Tailwind was upgraded to v4 with `@tailwindcss/vite`.
- Tailwind theme tokens and custom utilities now live in `src/Main.css`; there is no JS Tailwind config.
- Theme variables now store full CSS color values and `@theme inline` references them directly.
- `tailwindcss-animate` was replaced with `tw-animate-css`.
- shadcn/ui primitives were refreshed with `npx shadcn@latest add --all --overwrite`.
- Public theme CSS files were migrated to full CSS color values and can be checked with `npm run themes:check`.
- Global styles load once from `src/client/setup.ts`.

## Database Notes

Wasp can manage the dev database only when there is no custom `DATABASE_URL`.

If `.env.server` defines `DATABASE_URL`, start that database yourself before running migrations. The local migration smoke used a Docker Postgres container named `cultivate-wasp-postgres` on `localhost:5432`.

## Verification

These checks passed after the migration:

```sh
wasp compile
wasp db migrate-dev
wasp db seed
wasp start
```

Browser smoke passed with the in-app browser on:

- `/`
- `/inbox`
- `/documents`
- `/canvases`

The smoke verified that rendered pages load the shared Tailwind styles.
