# Next.js + shadcn/ui Turborepo Template

## Architecture Overview

This is a **pnpm workspace monorepo** using Turborepo for build orchestration. The structure separates concerns into:

- **`apps/web`**: Next.js 15+ app (App Router) with React 19
- **`packages/ui`**: Shared shadcn/ui component library with Tailwind CSS v4
- **`packages/eslint-config`**: Shared ESLint configurations
- **`packages/typescript-config`**: Shared TypeScript base configurations

The UI package acts as a **centralized component library** - all shadcn components live in `packages/ui/src/components` and are imported via workspace protocol (`@workspace/ui/components/*`).

## Critical Workflows

### Adding shadcn/ui Components
**Always run from the repository root** and specify the web app as the target:

```bash
pnpm dlx shadcn@latest add <component-name> -c apps/web
```

This installs components into `packages/ui/src/components/` where they're shared across all apps.

### Development
```bash
pnpm dev          # Starts all apps in parallel (uses Turbo cache)
pnpm build        # Production build for all packages
pnpm lint         # Runs ESLint across all workspaces (framework-specific rules only)
pnpm check        # Runs Biome linter and formatter checks
pnpm check:fix    # Auto-fixes Biome issues (format + lint)
pnpm format       # Runs Biome formatter (write mode)
pnpm format:check # Runs Biome formatter (check mode)
```

### TypeScript Type Checking
```bash
cd apps/web && pnpm typecheck    # Per-app type checking
```

## Project-Specific Conventions

### Import Patterns
- **UI Components**: `import { Button } from "@workspace/ui/components/button"`
- **UI Utils**: `import { cn } from "@workspace/ui/lib/utils"`
- **Styles**: `import "@workspace/ui/globals.css"` (in layout.tsx only)
- **App Internals**: `import { Providers } from "@/components/providers"`

### Workspace Dependencies
All internal packages use `workspace:*` protocol in package.json. External dependencies should match versions across packages where shared (React, TypeScript, etc.).

### Styling & Theming
- Tailwind CSS **v4** (uses new `@import` syntax in globals.css)
- Theme system via `next-themes` with class-based dark mode
- All global styles centralized in `packages/ui/src/styles/globals.css`
- Font variables defined in `apps/web/app/layout.tsx` (Geist & Geist Mono)

### Component Patterns
- Use **CVA (class-variance-authority)** for variant-based styling (see `button.tsx`)
- `asChild` pattern with Radix Slot for polymorphic components
- Consistent focus-visible ring styling with `focus-visible:ring-ring/50`
- Import `cn` utility for className merging

### Configuration Cascade
- **TypeScript**: Root extends `@workspace/typescript-config/base.json`, apps extend `/nextjs.json`
- **ESLint**: Minimal config focused on Next.js, React, and Turbo framework-specific rules only
- **Biome**: Primary tool for formatting and general linting (2 space indent, double quotes, auto-organize imports)
- **Turbo**: Caches build/lint tasks, marks `dev` as persistent, includes Biome root tasks

## Key Files & Patterns

- **`apps/web/next.config.mjs`**: Must include `transpilePackages: ["@workspace/ui"]` for workspace imports
- **`apps/web/components/providers.tsx`**: Client component wrapping ThemeProvider (required for SSR)
- **`packages/ui/package.json`**: Uses granular `exports` field for subpath imports
- **`turbo.json`**: Defines task dependencies (^build means "build dependencies first")

## Package Manager & Tooling

- **pnpm 10.4.1+** required (specified in `packageManager` field)
- **Node.js 20+** required (engine constraint)
- Turbo runs in TUI mode by default (`"ui": "tui"`)
- **Biome** handles formatting and general linting (replaces Prettier, supplements ESLint)
- **ESLint** handles framework-specific rules (Next.js, React, Turbo) with warnings-only output

## When Adding New Apps

1. Add to `pnpm-workspace.yaml` (already includes `apps/*`)
2. Ensure `next.config.mjs` has `transpilePackages: ["@workspace/ui"]`
3. Import `@workspace/ui/globals.css` in root layout
4. Add workspace dependencies: `@workspace/ui`, `@workspace/typescript-config`, `@workspace/eslint-config`
5. Configure path aliases in `tsconfig.json` for `@/*` and `@workspace/ui/*`

## Common Pitfalls

- **Don't install shadcn components directly in apps** - always use `-c apps/web` flag to route to UI package
- **Tailwind config is CSS-based in v4** - no JS config files (uses `@tailwind` imports in globals.css)
- **Client components need "use client"** - especially theme providers (see `providers.tsx`)
- **Turbo cache issues?** Run `pnpm turbo clean` or delete `.turbo` directory
