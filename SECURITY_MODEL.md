# Security model — Cultivate

What this system protects, who can reach it, and which attackers count. Security scans and reviewers use it to judge findings. Facts marked **(owner)** come from the repo owner; the rest is drawn from the code.

## Components

| Component | Code |
|---|---|
| Cultivate App | `main.wasp.ts`, `src/` operations/queries, `schema.prisma`, `fly-*.toml` |

## Trust boundaries and entry points

Wasp app (React client + Node/Prisma server on Fly). Username/password auth; anyone can create an account **(owner)**; invite codes (`checkInviteCode` unauthenticated, `claimInviteCode`) gate features, not sign-up. All pages `authRequired`; operations must scope data to `context.user`.

## Assets

All assets matter equally **(owner)**.

- Users' private notes, documents, projects and canvases.

## Attackers that matter

Every attacker below matters **(owner)**.

- Anonymous internet user.
- Signed-up user attacking other users' data (anyone can create an account).

## Existing controls

Wasp `authRequired` on pages; operations scope data to `context.user`; invite codes gate features.

## Out of scope / accepted risk

Nothing is out of scope; demo, prototype and tooling code count too **(owner)**.
