# UI Package - shadcn/ui Component Library

This package contains a comprehensive collection of shadcn/ui components built with Radix UI primitives, styled with Tailwind CSS v4, and configured for use across the monorepo.

## Structure

```
packages/ui/
├── src/
│   ├── components/         # All shadcn/ui components
│   ├── hooks/              # Shared React hooks
│   ├── lib/                # Utility functions
│   └── styles/
│       └── globals.css     # Global styles with Tailwind v4
├── components.json         # shadcn/ui configuration
├── tsconfig.json           # TypeScript configuration
├── biome.json              # Biome linting configuration
└── package.json
```

## Components Available

This package includes 50+ production-ready components:

### Layout Components
- **Accordion**: Collapsible content sections
- **AspectRatio**: Maintain consistent aspect ratios
- **Card**: Container with header, content, and footer
- **Separator**: Visual dividers
- **Tabs**: Tabbed interfaces

### Form Components
- **Button**: Primary interaction element with variants
- **Checkbox**: Selection controls
- **Input**: Text input fields
- **InputGroup**: Grouped input with addons
- **InputOTP**: One-time password input
- **RadioGroup**: Single selection from multiple options
- **Select**: Dropdown selection
- **Slider**: Range selection
- **Switch**: Toggle between states
- **Textarea**: Multi-line text input

### Feedback Components
- **Alert**: Important messages
- **AlertDialog**: Modal confirmation dialogs
- **Badge**: Status indicators
- **Progress**: Progress indicators
- **Skeleton**: Loading placeholders
- **Spinner**: Loading spinners
- **Toast (Sonner)**: Notification toasts

### Overlay Components
- **Dialog**: Modal dialogs
- **Drawer**: Slide-out panels
- **DropdownMenu**: Dropdown menus
- **HoverCard**: Hover-triggered content
- **Popover**: Floating content
- **Sheet**: Slide-in panels
- **Tooltip**: Contextual information

### Navigation Components
- **Breadcrumb**: Hierarchical navigation
- **NavigationMenu**: Main navigation
- **Pagination**: Page navigation
- **Sidebar**: Application sidebar

### Data Display
- **Avatar**: User profile images
- **Calendar**: Date selection
- **Chart**: Data visualization with Recharts
- **Table**: Data tables
- **Carousel**: Image/content carousel

### Utility Components
- **Collapsible**: Expandable content
- **Command**: Command palette
- **ContextMenu**: Right-click menus
- **Empty**: Empty states
- **Field**: Form field wrapper
- **Form**: Form management with react-hook-form
- **Item**: List items
- **Kbd**: Keyboard shortcuts
- **Label**: Form labels
- **Menubar**: Application menu bar
- **Resizable**: Resizable panels
- **ScrollArea**: Custom scrollbars
- **ToggleGroup**: Grouped toggles

## Getting Started

### Installation

Components are already installed in this monorepo. To use them in your app:

```bash
# Already configured in apps/web
pnpm install
```

### Basic Usage

```typescript
import { Button } from "@workspace/ui/components/button"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"

export function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hello World</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="default" size="sm">
          Click me
        </Button>
      </CardContent>
    </Card>
  )
}
```

### Adding New Components

To add more shadcn/ui components:

```bash
# From repository root
pnpm dlx shadcn@latest add <component-name> -c apps/web
```

This will install components into `packages/ui/src/components/` where they're shared across all apps.

## Configuration

### Tailwind CSS v4

This package uses Tailwind CSS v4 with the new configuration syntax:

- **No tailwind.config.js**: Configuration is CSS-based
- **@import "tailwindcss"**: Import Tailwind in globals.css
- **@source directives**: Specify content paths
- **@theme inline**: Define design tokens

See `src/styles/globals.css` for the full configuration.

### Theme System

The UI uses a CSS variable-based theme system with oklch color space:

- **Light theme**: Defined in `:root`
- **Dark theme**: Defined in `.dark` class
- **next-themes**: For theme switching

#### Custom Colors

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  /* ... more colors */
}
```

### Component Customization

All components use CVA (class-variance-authority) for variants:

```typescript
const buttonVariants = cva(
  "base-classes",
  {
    variants: {
      variant: {
        default: "...",
        destructive: "...",
      },
      size: {
        default: "...",
        sm: "...",
      }
    }
  }
)
```

## Development Scripts

```bash
# Type checking
pnpm typecheck

# Linting
pnpm lint
pnpm lint:fix

# Formatting
pnpm format
pnpm format:check

# Clean
pnpm clean
```

## Biome Configuration

This package has custom Biome rules for component library patterns:

### Relaxed Rules (Warnings Only)
- **a11y/useSemanticElements**: Warn about non-semantic HTML
- **a11y/useKeyWithClickEvents**: Warn about missing keyboard events
- **correctness/noNestedComponentDefinitions**: Warn about nested components
- **suspicious/noArrayIndexKey**: Warn about array index keys
- **security/noDangerouslySetInnerHtml**: Warn about dangerouslySetInnerHTML

### Disabled Rules
- **a11y/useFocusableInteractive**: Off (Radix UI handles this)
- **CSS rules**: Tailwind directives allowed

These are intentional for a component library where Radix UI primitives handle accessibility and certain patterns are necessary.

## TypeScript Configuration

The package extends `@workspace/typescript-config/react-library.json`:

```json
{
  "extends": "@workspace/typescript-config/react-library.json",
  "compilerOptions": {
    "paths": {
      "@workspace/ui/*": ["./src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", ".turbo"]
}
```

## Exports

The package exports components, hooks, styles, and utilities:

```json
{
  "exports": {
    "./globals.css": "./src/styles/globals.css",
    "./postcss.config": "./postcss.config.mjs",
    "./lib/*": "./src/lib/*.ts",
    "./components/*": "./src/components/*.tsx",
    "./hooks/*": "./src/hooks/*.ts"
  }
}
```

## Integration with Apps

### Next.js Configuration

In `apps/web/next.config.mjs`:

```javascript
export default {
  transpilePackages: ["@workspace/ui"],
  // ... other config
}
```

### Import Styles

In `apps/web/app/layout.tsx`:

```typescript
import "@workspace/ui/globals.css"
```

### Use Components

```typescript
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
```

## Best Practices

### Component Usage

1. **Always use className prop** for custom styling
2. **Leverage variants** instead of custom classes when possible
3. **Use asChild pattern** for composition
4. **Import utilities** from `@workspace/ui/lib/utils`

```typescript
// Good
<Button variant="outline" size="sm" className="mt-4">
  Click me
</Button>

// Better with asChild
<Button asChild>
  <Link href="/about">About</Link>
</Button>
```

### Styling

1. **Prefer Tailwind utilities** over custom CSS
2. **Use design tokens** (e.g., `bg-primary`, `text-foreground`)
3. **Use cn() utility** for conditional classes

```typescript
import { cn } from "@workspace/ui/lib/utils"

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  className
)}>
```

### Accessibility

1. **Trust Radix UI primitives** - they handle ARIA attributes
2. **Provide labels** for form inputs
3. **Use semantic HTML** when not using Radix components
4. **Test keyboard navigation**

### Performance

1. **Components are source-based** - no build step needed
2. **Tree-shaking works automatically** with the exports configuration
3. **Import only what you need** - avoid barrel imports

## Troubleshooting

### Type Errors

```bash
# Regenerate types
pnpm typecheck
```

### Linting Errors

```bash
# Auto-fix most issues
pnpm lint:fix

# Check specific rules
pnpm biome lint . --max-diagnostics=100
```

### Style Not Applying

1. Check if `@workspace/ui/globals.css` is imported in root layout
2. Verify `transpilePackages: ["@workspace/ui"]` in Next.js config
3. Check PostCSS configuration includes `@tailwindcss/postcss`

### Import Errors

```typescript
// ❌ Wrong
import { Button } from "@workspace/ui"

// ✅ Correct
import { Button } from "@workspace/ui/components/button"
```

## Adding Custom Components

To add your own components to this package:

1. Create component in `src/components/your-component.tsx`
2. Follow the existing patterns (CVA variants, cn utility, data-slot)
3. Export from package.json exports if needed
4. Add TypeScript types
5. Document usage

```typescript
// src/components/your-component.tsx
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@workspace/ui/lib/utils"

const yourComponentVariants = cva(
  "base-classes",
  {
    variants: {
      variant: {
        default: "...",
      }
    }
  }
)

export function YourComponent({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof yourComponentVariants>) {
  return (
    <div
      data-slot="your-component"
      className={cn(yourComponentVariants({ variant }), className)}
      {...props}
    />
  )
}
```

## Contributing

When adding or modifying components:

1. Run typecheck: `pnpm typecheck`
2. Run linter: `pnpm lint:fix`
3. Test in consuming app
4. Update this README if needed

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Radix UI Documentation](https://www.radix-ui.com/primitives)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs/v4-beta)
- [CVA Documentation](https://cva.style)
- [next-themes Documentation](https://github.com/pacocoursey/next-themes)
