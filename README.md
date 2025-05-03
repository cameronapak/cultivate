https://github.com/user-attachments/assets/6f489e2e-d820-4cb5-a796-f504aadc8648


# 🌱 Cultivate (alpha)

Imagine if Notion & Basecamp had a baby. 

Cultivate is a PKM tool where you can calmly brain dump, write, manage projects, and get things done.

> [!WARNING]
> This is a alpha project in active development. There will be bugs and breaking changes. Please report any issues in the Issues tab.

## Stack

- [Wasp](https://wasp.sh) - a Rails-like framework for JS, with a focus on reducing boilerplate
- [Shadcn-ui](https://ui.shadcn.com/) - a beautiful component library/framework
- [Lucide Icons](https://lucide.dev/) - Beautiful & consistent icons

## How to Run

1. [Download the Wasp Compiler](https://wasp.sh/docs/quick-start)
2. Install Docker or [Orbstack](https://orbstack.dev/) (recommended for macOS). Wasp uses this to standup the database.
3. Run `wasp db migrate-dev` to set up the database schema. This command also automatically runs the seed script (`src/server/scripts/seedDevData.ts`) which creates a default user (`dev_user` / `password`) if no users exist, and ensures the initial invite code (`JESUS-SAVES`) is available.
4. Run `wasp start` to get the app running locally at `localhost:3000`

## Contributing

This project is open source code and open to ideas, with the direction honed in by its creator, Cam Pak.

Please create an issue for any ideas you have! 

If you create a PR, there's a chance I will not merge it in if it doesn't align with the heart and vision of Cultivate.

[Modified MIT License with a Non-Commercial Clause](./LICENSE.md)
