https://github.com/user-attachments/assets/6f489e2e-d820-4cb5-a796-f504aadc8648


# 🌱 Cultivate (alpha)

Imagine if Notion & Basecamp had a baby. 

Cultivate is a PKM tool where you can calmly brain dump, write, manage projects, and get things done.

> [!WARNING]
> This is a alpha project in active development. There will be bugs and breaking changes. Please report any issues in the Issues tab.

## Stack

- [Wasp](https://wasp.sh) `^0.23.0` - a Rails-like framework for JS, with a focus on reducing boilerplate
- [Tailwind CSS](https://tailwindcss.com/) `^4.3.0` - utility-first CSS
- [Shadcn-ui](https://ui.shadcn.com/) - a beautiful component library/framework
- [Lucide Icons](https://lucide.dev/) - Beautiful & consistent icons

## How to Run

1. Use Node `24.14.1`: `nvm use`
2. Install the Wasp CLI: `npm i -g @wasp.sh/wasp-cli@0.23.0`
3. Install Docker or [Orbstack](https://orbstack.dev/) (recommended for macOS).
4. Run `npm install`
5. Run `wasp ts-setup` if you ran `wasp clean` or removed `node_modules`.
6. Run `wasp db migrate-dev` to set up the database schema.
7. Run `wasp db seed` to create the default user (`dev_user` / `password`) and initial invite code (`JESUS-SAVES`).
8. Run `wasp start` to get the app running locally at `localhost:3000`.

If `.env.server` defines `DATABASE_URL`, start that database yourself before running Wasp commands. Without a custom `DATABASE_URL`, use Wasp's managed dev database flow.

## Development Notes

- Global Tailwind styles load from `src/client/setup.ts`.
- Tailwind v4 uses `@tailwindcss/vite`; theme tokens live in `src/Main.css`.
- Wasp app config lives in `main.wasp.ts`.
- Run `wasp compile` after framework, Wasp, or dependency changes.

## Contributing

This project is open source code and open to ideas, with the direction honed in by its creator, Cam Pak.

Please create an issue for any ideas you have! 

If you create a PR, there's a chance I will not merge it in if it doesn't align with the heart and vision of Cultivate.

[Modified MIT License with a Non-Commercial Clause](./LICENSE.md)
