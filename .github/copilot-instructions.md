# Next.js + shadcn/ui Turborepo Template

## Architecture Overview

This is a **pnpm workspace monorepo** using Turborepo for build orchestration. The structure separates concerns into:

- **`apps/web`**: Next.js 15+ app (App Router) with React 19, Turbopack dev server
- **`packages/ui`**: Shared shadcn/ui component library with Tailwind CSS v4
- **`packages/typescript-config`**: Shared TypeScript base configurations

The UI package acts as a **centralized component library** - all shadcn components live in `packages/ui/src/components` and are imported via workspace protocol (`@workspace/ui/components/*`).

## Critical Workflows

### Adding shadcn/ui Components
**Always run from the repository root** and specify the web app as the target:

```bash
pnpm dlx shadcn@latest add <component-name> -c apps/web
```

This installs components into `packages/ui/src/components/` where they're shared across all apps. The `-c apps/web` flag is critical—it ensures proper resolution of the component's destination.

### Development Commands
```bash
pnpm dev          # Starts all apps with Turbopack (persistent task, not cached)
pnpm build        # Production build for all packages (caches with Turbo)
pnpm check        # Runs Biome linter and formatter checks (cached via Turbo root task)
pnpm check:fix    # Auto-fixes Biome issues (format + lint, not cached)
pnpm format       # Runs Biome formatter in write mode
pnpm format:check # Runs Biome formatter in check mode (cached via Turbo root task)
```

Alternatively, use Turbo directly for caching benefits:
```bash
turbo run format        # Runs //#format root task with caching
turbo run format:check  # Runs //#format:check root task with caching
turbo run check         # Runs //#check root task with caching
turbo run check:fix     # Runs //#check:fix root task (not cached)
```

### TypeScript Type Checking
No global typecheck script exists. Run per-app:
```bash
cd apps/web && pnpm typecheck    # Uses tsc --noEmit
```

## Project-Specific Conventions

### Import Patterns
- **UI Components**: `import { Button } from "@workspace/ui/components/button"`
- **UI Utils**: `import { cn } from "@workspace/ui/lib/utils"`
- **Styles**: `import "@workspace/ui/globals.css"` (in `app/layout.tsx` only, not per-component)
- **App Internals**: `import { Providers } from "@/components/providers"` (uses `@/*` alias)

### Workspace Dependencies
All internal packages use `workspace:*` protocol in package.json. External dependencies should match versions across packages where shared (React 19.2.0, TypeScript 5.9.3, Next 15.5.4+).

### Styling & Theming
- **Tailwind CSS v4** with new `@import "tailwindcss"` syntax in `packages/ui/src/styles/globals.css`
- **No tailwind.config.js/ts** - configuration is CSS-based via `@source` directives and `@theme inline` blocks
- Theme system via `next-themes` with class-based dark mode (`attribute="class"`)
- CSS variables use **oklch color space** for design tokens (see `:root` and `.dark` in globals.css)
- Fonts loaded in `apps/web/app/layout.tsx` (Geist & Geist Mono from next/font/google)

### Component Patterns
- Use **CVA (class-variance-authority)** for variant-based styling (see `packages/ui/src/components/button.tsx`)
- `asChild` pattern with `@radix-ui/react-slot` for polymorphic components
- Consistent focus-visible ring styling: `focus-visible:ring-ring/50 focus-visible:ring-[3px]`
- Import `cn` utility from `@workspace/ui/lib/utils` for className merging (uses `tailwind-merge` + `clsx`)
- Client-only components must use `"use client"` directive (e.g., `apps/web/components/providers.tsx`)

## Configuration Cascade
- **TypeScript**: Root extends `@workspace/typescript-config/base.json`, apps extend `@workspace/typescript-config/nextjs.json`
- **Path Aliases**: Apps configure `@/*` for app-relative imports and `@workspace/ui/*` for direct UI source imports
- **Biome**: Root configuration at `biome.json` with `"root": true` for monorepo setup (see [Biome Configuration Guide](./docs/reference/biome-configuration.md))
  - Only tool for formatting and linting (2 space indent, double quotes, semicolons as needed, ES5 trailing commas)
  - Linter rules: `useImportType` (error), `useNodejsImportProtocol` (error), `noUnusedVariables` (error), `noUnusedImports` (error)
  - Root configuration located at `biome.json`, configures entire monorepo with VCS integration and workspace includes
  - Supports JavaScript, TypeScript, JSX, JSON, CSS, and Markdown
  - CSS overrides enabled for Tailwind v4 (noUnknownAtRules, noInvalidPositionAtImportRule disabled)
- **Turbo**: Caches build/check/format tasks, marks `dev` as persistent, uses root tasks for Biome (`//#format`, `//#check`)
- **No ESLint** - Biome handles all linting; ESLint and Prettier are not used in this project
- **No Prettier** - Biome handles all formatting with built-in formatter

## Key Files & Integration Points

- **`apps/web/next.config.mjs`**: Must include `transpilePackages: ["@workspace/ui"]` to bundle workspace dependency
- **`apps/web/components/providers.tsx`**: Client component wrapping `next-themes` ThemeProvider (required for SSR + hydration)
- **`packages/ui/package.json`**: Uses granular `exports` field for subpath imports (components, lib, hooks, globals.css, postcss.config)
- **`packages/ui/src/styles/globals.css`**: Tailwind v4 entry point with `@source` directives pointing to `apps/**` and `packages/ui/**`
- **`turbo.json`**: Defines task dependencies (`^build` = "build dependencies first"), outputs, and cache behavior

## Package Manager & Tooling

- **pnpm 10.4.1+** required (enforced via `packageManager` field)
- **Node.js 20+** required (engine constraint)
- **Turbo 2.5.8+** runs in TUI mode by default (`"ui": "tui"`)
- **Biome 2.2.5** handles all formatting and linting (replaces Prettier and ESLint entirely)

## When Adding New Apps

1. Add workspace pattern to `pnpm-workspace.yaml` (already includes `apps/*`)
2. Create `next.config.mjs` with `transpilePackages: ["@workspace/ui"]`
3. Import `@workspace/ui/globals.css` in root `app/layout.tsx`
4. Add dependencies: `@workspace/ui: "workspace:*"`, `@workspace/typescript-config: "workspace:*"`
5. Configure `tsconfig.json`:
   - Extend `@workspace/typescript-config/nextjs.json`
   - Add path aliases: `"@/*": ["./*"]`, `"@workspace/ui/*": ["../../packages/ui/src/*"]`
6. Create `providers.tsx` with `"use client"` and `next-themes` setup
7. **Biome Configuration**: No action needed - root config applies automatically!
   - Only create `biome.json` if package-specific overrides are required (see [Biome Configuration Guide](./docs/reference/biome-configuration.md))

## When Adding New Packages

1. Create package structure in `packages/new-package/src`
2. Configure `package.json` with proper `exports` field for library packages
3. Configure `tsconfig.json` extending appropriate base config from `@workspace/typescript-config`
4. Add workspace dependencies as needed
5. **Biome Configuration**: No action needed - root config applies automatically!
   - Only create `biome.json` if package-specific overrides are required (see [Biome Configuration Guide](./docs/reference/biome-configuration.md))

## Common Pitfalls

- **Don't install shadcn components directly in apps** - always use `-c apps/web` flag to route to UI package
- **Tailwind config is CSS-based in v4** - no `tailwind.config.{js,ts}` files (uses `@import`, `@source`, `@theme` directives)
- **Client components need "use client"** - especially theme providers and interactive components
- **Don't import globals.css in multiple places** - only in root `layout.tsx` to avoid CSS duplication
- **Turbo cache issues?** Run `pnpm turbo clean` or delete `.turbo` and `node_modules/.cache` directories
- **Workspace imports must be transpiled** - always include `transpilePackages: ["@workspace/ui"]` in Next.js config
