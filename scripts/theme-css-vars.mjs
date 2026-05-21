import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const themeDir = new URL("../public/themes/", import.meta.url);
const colorTokens = new Set([
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "destructive-foreground",
  "border",
  "input",
  "ring",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
  "sidebar",
  "sidebar-background",
  "sidebar-foreground",
  "sidebar-primary",
  "sidebar-primary-foreground",
  "sidebar-accent",
  "sidebar-accent-foreground",
  "sidebar-border",
  "sidebar-ring",
]);

const rawHslPattern = /^(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?%)\s+(-?\d+(?:\.\d+)?%)$/;
const declarationPattern =
  /(--([a-z0-9-]+):\s*)([^;\n]+)(;[^\n]*)(\n?)/gi;

const mode = process.argv[2];

if (!["--write", "--check"].includes(mode)) {
  console.error("Usage: node scripts/theme-css-vars.mjs --write|--check");
  process.exit(1);
}

let changedCount = 0;
const errors = [];

for (const fileName of readdirSync(themeDir).filter((file) => file.endsWith(".css")).sort()) {
  const path = join(themeDir.pathname, fileName);
  const original = readFileSync(path, "utf8");
  let fileChanged = false;

  const migrated = original.replace(
    declarationPattern,
    (full, prefix, token, value, suffix, newline) => {
      if (!colorTokens.has(token)) {
        return full;
      }

      const trimmedValue = value.trim();

      if (/hsl\(\s*hsl\(/i.test(trimmedValue)) {
        errors.push(`${fileName}: --${token} is double-wrapped`);
        return full;
      }

      if (rawHslPattern.test(trimmedValue)) {
        fileChanged = true;
        return `${prefix}hsl(${trimmedValue})${suffix}${newline}`;
      }

      return full;
    },
  );

  const remainingRawTokens = [];
  migrated.replace(declarationPattern, (full, _prefix, token, value) => {
    if (colorTokens.has(token) && rawHslPattern.test(value.trim())) {
      remainingRawTokens.push(`--${token}`);
    }

    return full;
  });

  if (remainingRawTokens.length > 0) {
    errors.push(`${fileName}: raw HSL tokens remain: ${remainingRawTokens.join(", ")}`);
  }

  if (fileChanged) {
    changedCount += 1;
  }

  if (mode === "--write" && migrated !== original) {
    writeFileSync(path, migrated);
  }
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

if (mode === "--check" && changedCount > 0) {
  console.error(`${changedCount} theme file(s) need migration. Run npm run themes:migrate.`);
  process.exit(1);
}

console.log(
  mode === "--write"
    ? `Migrated ${changedCount} theme file(s).`
    : "Theme CSS variables are Tailwind v4-ready.",
);
