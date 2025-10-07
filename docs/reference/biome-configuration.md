# Biome Configuration Guide for Turborepo Monorepo

## 📋 Overview

This monorepo uses **Biome v2** as the sole formatter and linter, replacing ESLint and Prettier entirely. Biome is extraordinarily fast (written in Rust) and provides comprehensive linting and formatting for JavaScript, TypeScript, JSX, JSON, CSS, and Markdown.

## 🏗️ Architecture

### Root Configuration Pattern

This repository follows the **Biome v2 monorepo pattern** with a root configuration that cascades to all packages:

- **Root `biome.json`**: Located at repository root with `"root": true`
- **Workspace Includes**: Automatically processes `apps/**` and `packages/**`
- **VCS Integration**: Respects `.gitignore` patterns automatically
- **Root Tasks**: Biome runs as Turborepo root tasks for optimal performance

### Why Root Tasks?

Biome is **so fast** that splitting it into per-package tasks adds unnecessary complexity without performance benefits. The official Turborepo guide recommends root tasks for Biome specifically.

## 📁 Current Configuration

### Root biome.json

```json
{
  "$schema": "https://biomejs.dev/schemas/2.2.5/schema.json",
  "root": true,
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "files": {
    "ignoreUnknown": false,
    "includes": ["apps/**", "packages/**"],
    "ignore": [
      "**/node_modules/**",
      "**/dist/**",
      "**/.next/**",
      "**/.turbo/**",
      "**/build/**",
      "**/coverage/**"
    ]
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "style": {
        "noNonNullAssertion": "off",
        "useImportType": "error",
        "useNodejsImportProtocol": "error"
      },
      "suspicious": {
        "noExplicitAny": "warn"
      },
      "correctness": {
        "noUnusedVariables": "error",
        "noUnusedImports": "error"
      }
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "double",
      "semicolons": "asNeeded",
      "trailingCommas": "es5",
      "arrowParentheses": "always"
    }
  },
  "json": {
    "formatter": {
      "enabled": true,
      "indentWidth": 2
    }
  },
  "css": {
    "formatter": {
      "enabled": true,
      "indentWidth": 2
    },
    "linter": {
      "enabled": true
    }
  },
  "assist": {
    "enabled": true,
    "actions": {
      "source": {
        "organizeImports": "on"
      }
    }
  },
  "overrides": [
    {
      "includes": ["**/*.config.{js,ts,mjs,cjs}"],
      "linter": {
        "rules": {
          "style": {
            "useNodejsImportProtocol": "off"
          }
        }
      }
    },
    {
      "includes": ["**/*.css"],
      "linter": {
        "rules": {
          "suspicious": {
            "noUnknownAtRules": "off"
          },
          "correctness": {
            "noInvalidPositionAtImportRule": "off"
          }
        }
      }
    }
  ]
}
```

### Turborepo Integration (turbo.json)

```json
{
  "tasks": {
    "//#format": {
      "cache": true,
      "inputs": ["**/*.{js,jsx,ts,tsx,json,md,css}"]
    },
    "//#format:check": {
      "cache": true,
      "inputs": ["**/*.{js,jsx,ts,tsx,json,md,css}"]
    },
    "//#check": {
      "cache": true,
      "inputs": ["**/*.{js,jsx,ts,tsx,json,css}"]
    },
    "//#check:fix": {
      "cache": false
    }
  }
}
```

### Package Scripts (Root package.json)

```json
{
  "scripts": {
    "format": "biome format --write .",
    "format:check": "biome format .",
    "check": "biome check .",
    "check:fix": "biome check --write ."
  },
  "devDependencies": {
    "@biomejs/biome": "2.2.5"
  }
}
```

## 🎯 Adding New Packages or Apps

### Option 1: Inherit Root Configuration (Recommended)

**Most packages should simply inherit from the root configuration.** No additional Biome configuration needed!

1. Create your package/app structure:
   ```bash
   mkdir -p packages/new-package/src
   ```

2. That's it! The root `biome.json` automatically applies to all files in `apps/**` and `packages/**`.

### Option 2: Package-Specific Overrides (When Needed)

If a package requires **different** Biome settings (e.g., different team, different standards):

1. Create `packages/new-package/biome.json`:

   ```json
   {
     "extends": ["//"],
     "formatter": {
       "lineWidth": 120
     }
   }
   ```

   **Note**:
   - `"extends": "//"` means "extend from root configuration"
   - `"root": false` is implied and can be omitted when using `"extends": "//"`

2. **Example: Disable Formatter for Generated Code**

   ```json
   {
     "extends": ["//"],
     "formatter": {
       "enabled": false
     }
   }
   ```

3. **Example: Package-Specific Rule Overrides**

   ```json
   {
     "extends": ["//"],
     "linter": {
       "rules": {
         "suspicious": {
           "noConsole": "off"
         }
       }
     }
   }
   ```

### Option 3: Completely Independent Configuration (Rare)

If a package should **NOT** inherit from root (e.g., different team with entirely different standards):

1. Create `packages/independent-package/biome.json`:

   ```json
   {
     "root": false,
     "formatter": {
       "lineWidth": 80,
       "indentWidth": 4
     },
     "linter": {
       "enabled": true,
       "rules": {
         "recommended": true
       }
     }
   }
   ```

   **Note**: Omit `"extends": "//"` to prevent inheritance.

## 🔧 Common Configuration Patterns

### Ignoring Specific Files/Folders in a Package

Add to package's `biome.json`:

```json
{
  "extends": ["//"],
  "files": {
    "ignore": ["src/generated/**", "**/*.test.ts"]
  }
}
```

### Different Formatting for Specific Files

```json
{
  "extends": ["//"],
  "overrides": [
    {
      "includes": ["scripts/**/*.js"],
      "formatter": {
        "lineWidth": 120
      }
    }
  ]
}
```

### Disabling Specific Rules for Test Files

```json
{
  "extends": ["//"],
  "overrides": [
    {
      "includes": ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"],
      "linter": {
        "rules": {
          "suspicious": {
            "noExplicitAny": "off"
          }
        }
      }
    }
  ]
}
```

## 📝 Available Commands

### Root-Level Commands (Recommended)

```bash
# Format all files
pnpm format

# Check formatting (no changes)
pnpm format:check

# Lint and format check
pnpm check

# Auto-fix linting and formatting issues
pnpm check:fix
```

### With Turborepo (For Caching)

```bash
# Run with Turbo caching
turbo run format
turbo run format:check
turbo run check
turbo run check:fix

# Run on specific files
pnpm biome check apps/web/app/**/*.tsx

# Run on specific package
pnpm biome check packages/ui/
```

### Package-Level Commands

While root commands are recommended, you can run Biome from within a package:

```bash
cd apps/web
pnpm biome check .
```

## 🎨 Editor Integration

### VS Code Setup

1. **Install Extension**:
   - Install `biomejs.biome` from VS Code marketplace

2. **Workspace Settings** (`.vscode/settings.json`):

   ```json
   {
     "[javascript]": {
       "editor.defaultFormatter": "biomejs.biome",
       "editor.formatOnSave": true
     },
     "[typescript]": {
       "editor.defaultFormatter": "biomejs.biome",
       "editor.formatOnSave": true
     },
     "[javascriptreact]": {
       "editor.defaultFormatter": "biomejs.biome",
       "editor.formatOnSave": true
     },
     "[typescriptreact]": {
       "editor.defaultFormatter": "biomejs.biome",
       "editor.formatOnSave": true
     },
     "[json]": {
       "editor.defaultFormatter": "biomejs.biome",
       "editor.formatOnSave": true
     },
     "[css]": {
       "editor.defaultFormatter": "biomejs.biome",
       "editor.formatOnSave": true
     },
     "editor.codeActionsOnSave": {
       "source.organizeImports.biome": "explicit",
       "quickfix.biome": "explicit"
     }
   }
   ```

### Other Editors

- **Neovim**: Use `nvim-lspconfig` with `biome` LSP
- **Zed**: Built-in Biome support
- **WebStorm/IntelliJ**: Use Biome plugin

## ⚡ Performance & Caching

### Why Biome is Fast

- **Written in Rust**: Native performance
- **Parallel Processing**: Uses all CPU cores
- **Incremental Checking**: Only processes changed files
- **No Node.js Overhead**: Direct binary execution

### Turborepo Caching

Turbo caches Biome tasks based on:
- Input file content (matching glob patterns)
- Biome configuration changes
- Biome version changes

Cache hits restore results instantly without re-running Biome.

### Cache Invalidation

```bash
# Clear Turbo cache
pnpm turbo clean

# Or manually delete cache directories
rm -rf .turbo node_modules/.cache
```

## 🚫 What NOT to Do

### ❌ Don't Install ESLint or Prettier

Biome **replaces** both tools. Having both creates conflicts:
- Competing formatters
- Inconsistent results
- Slower performance
- Configuration conflicts

### ❌ Don't Create Package-Specific Scripts Unless Needed

The root configuration handles 99% of cases. Only create package-specific configs when truly needed.

### ❌ Don't Use Both Biome Tasks and Root Tasks

Choose one pattern:
- ✅ Root tasks (recommended)
- ❌ Per-package tasks (unnecessary complexity)

### ❌ Don't Ignore VCS Integration

Keep `vcs.enabled: true` to respect `.gitignore` patterns automatically.

## 🔍 Troubleshooting

### Issue: Biome Not Formatting Files

**Solution**: Ensure files match the `includes` pattern in `biome.json`:
```json
{
  "files": {
    "includes": ["apps/**", "packages/**"]
  }
}
```

### Issue: CSS Linting Errors with Tailwind v4

**Solution**: Add CSS override in `biome.json`:
```json
{
  "overrides": [
    {
      "includes": ["**/*.css"],
      "linter": {
        "rules": {
          "suspicious": {
            "noUnknownAtRules": "off"
          },
          "correctness": {
            "noInvalidPositionAtImportRule": "off"
          }
        }
      }
    }
  ]
}
```

### Issue: Config File Not Found

**Solution**: Biome searches upwards from working directory. Ensure:
1. Root `biome.json` has `"root": true`
2. You're running commands from repository root or subdirectory
3. Use `--config-path` if needed: `biome check --config-path=../../`

### Issue: Import Organization Not Working

**Solution**: Enable assist in `biome.json`:
```json
{
  "assist": {
    "enabled": true,
    "actions": {
      "source": {
        "organizeImports": "on"
      }
    }
  }
}
```

### Issue: Turbo Cache Always Missing

**Solution**: Ensure task `inputs` match your file patterns:
```json
{
  "tasks": {
    "//#check": {
      "inputs": ["**/*.{js,jsx,ts,tsx,json,css}"]
    }
  }
}
```

## 📚 Reference Links

- [Biome Documentation](https://biomejs.dev/)
- [Biome Big Projects Guide](https://biomejs.dev/guides/big-projects/)
- [Turborepo Biome Integration](https://turborepo.com/docs/guides/tools/biome)
- [Biome Configuration Reference](https://biomejs.dev/reference/configuration/)
- [Biome VS Code Extension](https://marketplace.visualstudio.com/items?itemName=biomejs.biome)

## 🆕 When Adding a New App to Turborepo

Follow this checklist when creating a new app in `apps/`:

1. **Create App Structure**:
   ```bash
   mkdir -p apps/new-app/src
   cd apps/new-app
   pnpm init
   ```

2. **Configure TypeScript** (if applicable):
   ```json
   {
     "extends": "@workspace/typescript-config/nextjs.json",
     "compilerOptions": {
       "paths": {
         "@/*": ["./*"]
       }
     }
   }
   ```

3. **Add Workspace Dependencies**:
   ```json
   {
     "dependencies": {
       "@workspace/ui": "workspace:*"
     },
     "devDependencies": {
       "@workspace/typescript-config": "workspace:*"
     }
   }
   ```

4. **Biome Configuration**:
   - ✅ **Do nothing** - root config applies automatically!
   - Only create `biome.json` if you need package-specific overrides

5. **Verify Biome Works**:
   ```bash
   # From app directory
   pnpm biome check .

   # From root
   pnpm check
   ```

6. **Add Turbo Task** (if app-specific build needed):
   - Root `turbo.json`:
   ```json
   {
     "tasks": {
       "build": {
         "dependsOn": ["^build"],
         "outputs": [".next/**", "dist/**"]
       }
     }
   }
   ```

## 🆕 When Adding a New Package to Turborepo

Follow this checklist when creating a new package in `packages/`:

1. **Create Package Structure**:
   ```bash
   mkdir -p packages/new-package/src
   cd packages/new-package
   pnpm init
   ```

2. **Configure Package Exports** (if library):
   ```json
   {
     "name": "@workspace/new-package",
     "type": "module",
     "exports": {
       "./component": "./src/component.tsx",
       "./lib/*": "./src/lib/*.ts"
     }
   }
   ```

3. **Configure TypeScript**:
   ```json
   {
     "extends": "@workspace/typescript-config/react-library.json",
     "compilerOptions": {
       "outDir": "dist"
     }
   }
   ```

4. **Biome Configuration**:
   - ✅ **Default**: No config needed (inherits from root)
   - 🔧 **Custom**: Only if different standards required

5. **Verify Setup**:
   ```bash
   cd packages/new-package
   pnpm biome check .
   ```

6. **Import in Other Packages**:
   ```typescript
   import { Component } from "@workspace/new-package/component";
   ```

## 🎯 Quick Reference: Configuration Decision Tree

```
Need to add a new package/app?
│
├─ Does it follow the same coding standards as the root?
│  └─ YES → ✅ No Biome config needed! (Inherits from root)
│
├─ Need minor tweaks (e.g., disable one rule, different line width)?
│  └─ YES → Create biome.json with `"extends": ["//"]` + overrides
│
└─ Completely different standards (different team, legacy code)?
   └─ YES → Create independent biome.json with `"root": false`
```

---

**Last Updated**: October 2025
**Biome Version**: 2.2.5
**Turborepo Version**: 2.5.8+
