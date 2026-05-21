# Styling (CSS, UI) Setup

Configure a CSS framework and/or component libraries for your Wasp app.

## Prerequisites

- Fetch the list of available CSS frameworks and styling options from the Wasp docs

## Steps

1. **Display the available options** to the user (e.g., Pure Tailwind CSS, ShadCN UI (on top of Tailwind CSS), etc.)
2. Using the `AskUserQuestion` tool, ask the user which CSS framework they'd like to use.
3. If the user wants to use a CSS framework, follow [adding a css framework](#adding-a-css-framework) instructions.
4. If a user wants to use ShadCN UI (on top of Tailwind CSS), follow [adding shadcn ui](#adding-shadcn-ui) instructions.
5. Restart the wasp app, if running

### Adding a CSS Framework

1. Fetch the raw GitHub doc URL for that framework's setup guide from the Wasp docs
2. Follow the installation steps in the guide

### Adding ShadCN UI

1. First set up tailwind css as per the guide for [adding a css framework](#adding-a-css-framework)
2. Fetch the guide for using [ShadCN components with Wasp](https://gist.githubusercontent.com/infomiho/b35e9366e16913949e13eaba0538f553/raw/c6da98158c1a7e46b5874868f2e7c011f24d24d1/0-README.md)
3. Follow the installation steps in the guide
