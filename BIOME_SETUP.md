# Biome Configuration for Turborepo

## ✅ Setup Complete

This Turborepo monorepo is configured with **Biome** as the sole formatter and linter, replacing ESLint and Prettier entirely.

> 📖 **Detailed Documentation**: See [Biome Configuration Guide](./.github/biome-configuration.md) for comprehensive setup instructions for new packages and apps.

## Configuration Overview

### Root Configuration
- **`biome.json`**: Root configuration at repository root with `"root": true`
  - Biome v2.2.5
  - VCS integration enabled (Git)
  - Workspace includes: `apps/**`, `packages/**`
  - Recommended linting rules enabled
  - Consistent formatting (2 spaces, double quotes, semicolons as needed)
  - JavaScript, TypeScript, JSX, JSON, CSS, and Markdown support configured

### Turbo Integration
- **`turbo.json`**: Root tasks configured for Biome
  - `//#format` - Format code (cached)
  - `//#format:check` - Check formatting (cached)
  - `//#check` - Lint and format check (cached)
  - `//#check:fix` - Auto-fix issues (not cached)

### Package Scripts (Root)
```bash
pnpm format         # Format all files
pnpm format:check   # Check formatting
pnpm check          # Run linter and formatter checks
pnpm check:fix      # Auto-fix linting and formatting issues
```

## Usage

### Basic Commands
```bash
# Check code quality
pnpm check

# Auto-fix issues
pnpm check:fix

# Format code
pnpm format

# Check formatting only
pnpm format:check
```

### With Turbo (for caching)
```bash
# Run with Turborepo caching
turbo run check
turbo run format

# Check specific files
pnpm biome check apps/web/app/**/*.tsx
```

### Editor Integration
Biome VS Code extension is recommended:
- Install: `biomejs.biome`
- Auto-format on save
- Inline diagnostics
- Quick fixes

## What Was Removed

✅ **No ESLint**
- Removed `lint` task from `turbo.json`
- Removed `lint` and `lint:fix` scripts from `apps/web/package.json`
- Removed `lint` script from root `package.json`
- No ESLint configuration files
- No ESLint dependencies

✅ **No Prettier**
- No Prettier configuration files
- No Prettier dependencies
- Biome handles all formatting

## Key Features

### Monorepo Support (Biome v2)
- Root configuration with workspace includes
- Automatic file discovery across apps and packages
- VCS integration with `.gitignore` support

### Linting Rules
- **Recommended rules**: Enabled by default
- **Import organization**: Auto-organize imports on save
- **TypeScript**: Type imports enforced (`useImportType`)
- **Node.js**: Import protocol required (`useNodejsImportProtocol`)
- **Quality**: Unused variables/imports are errors

### Formatting
- **Indent**: 2 spaces
- **Quotes**: Double quotes
- **Semicolons**: As needed
- **Trailing commas**: ES5 style
- **Line width**: 100 characters

### Special Overrides
1. **Config files** (`**/*.config.{js,ts,mjs,cjs}`)
   - Node.js import protocol rule disabled

2. **CSS files** (`**/*.css`)
   - Unknown at-rules allowed (for Tailwind CSS v4 `@import`, `@source`, `@theme`)
   - Invalid position at-import allowed (for CSS v4 syntax)

## Recent Improvements (October 2025)

### What Was Added:
1. ✅ **Explicit `"root": true`** - Properly declares this as the root configuration for Biome v2 monorepo support
2. ✅ **CSS Support** - Full CSS formatting and linting configuration added
3. ✅ **Markdown Support** - Added to Turbo task inputs for markdown file formatting
4. ✅ **Broader CSS Override** - Changed from specific files to `**/*.css` pattern for all CSS files
5. ✅ **Comprehensive Documentation** - Created [Biome Configuration Guide](./.github/biome-configuration.md)

### Configuration Philosophy:
- **Root Tasks Only**: Biome is so fast that per-package tasks add unnecessary complexity
- **Automatic Inheritance**: New packages/apps automatically inherit root configuration
- **VCS Integration**: Respects `.gitignore` patterns automatically (no need for explicit ignore patterns)
- **Minimal Overrides**: Only override when truly necessary

## Performance

Biome is **extremely fast** - that's why it's used as a root task:
- Written in Rust
- Parallel processing
- Incremental checking
- Fast enough to run on every save

## Caching Behavior

Turborepo caches Biome tasks based on:
- Input files matching glob patterns
- Biome configuration changes
- Biome version changes

Cache hits restore previous results instantly.

## Documentation Links

- [Biome Big Projects Guide](https://biomejs.dev/guides/big-projects/)
- [Turborepo Biome Integration](https://turborepo.com/docs/guides/tools/biome)
- [Biome Configuration Reference](https://biomejs.dev/reference/configuration/)

## Verification

All checks passed ✅:
- Biome v2.2.5 installed and working
- No ESLint or Prettier config files
- No ESLint or Prettier dependencies
- Root tasks configured correctly
- Commands tested and functional
- Documentation updated
