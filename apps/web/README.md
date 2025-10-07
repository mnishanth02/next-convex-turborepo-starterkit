# Web App - Next.js 15 Application

This is the main Next.js 15 application using the App Router, React 19, and Turbopack dev server.

## Structure

```
apps/web/
├── app/              # Next.js App Router
│   ├── layout.tsx    # Root layout with theme provider
│   ├── page.tsx      # Home page
│   └── favicon.ico   # App favicon
├── components/       # App-specific components
│   └── providers.tsx # Client-side providers (theme, etc.)
├── hooks/            # Custom React hooks
├── lib/              # Utility functions
├── next.config.mjs   # Next.js configuration
├── tsconfig.json     # TypeScript configuration
└── package.json      # Package dependencies and scripts
```

## Tech Stack

- **Framework**: Next.js 15.5.4+ (App Router)
- **React**: 19.2.0
- **UI Library**: @workspace/ui (shadcn/ui components)
- **Styling**: Tailwind CSS v4 (via @workspace/ui)
- **Theme**: next-themes for dark mode
- **Fonts**: Geist Sans & Geist Mono (from next/font/google)
- **Dev Server**: Turbopack (Next.js built-in)
- **TypeScript**: 5.9.3 with strict mode
- **Linting/Formatting**: Biome (inherits from root)

## Getting Started

### Installation

```bash
# From repository root
pnpm install
```

### Development

```bash
# Start dev server with Turbopack
pnpm dev

# Or from repository root
pnpm --filter web dev
```

The app will be available at `http://localhost:3000`.

### Build

```bash
# Production build
pnpm build

# Start production server
pnpm start
```

## Configuration

### Next.js Configuration (next.config.mjs)

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],
}

export default nextConfig
```

**Key Settings**:

- **transpilePackages**: Required to compile the UI workspace package
- Turbopack dev server enabled via `--turbopack` flag in dev script

### TypeScript Configuration

```jsonc
{
  "extends": "@workspace/typescript-config/nextjs.json",
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@workspace/ui/*": ["../../packages/ui/src/*"]
    },
    "plugins": [{ "name": "next" }]
  },
  "include": ["next-env.d.ts", "next.config.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**Path Aliases**:

- `@/*`: App-relative imports (e.g., `@/components/providers`)
- `@workspace/ui/*`: Direct access to UI package source

### PostCSS Configuration

```javascript
export { default } from "@workspace/ui/postcss.config"
```

The app uses the PostCSS configuration from the UI package, which includes the Tailwind CSS v4 plugin.

### Biome Configuration

**No local biome.json** - The web app inherits configuration from the root `biome.json`:

- ✅ Linting rules: recommended + custom rules
- ✅ Formatting: 2 space indent, double quotes, semicolons as needed
- ✅ Import organization: auto-organize on format
- ✅ Special overrides for config files, CSS, and generated files

This ensures consistent code style across the entire monorepo.

## Using UI Components

### Import Pattern

```typescript
// ✅ Correct - Import from specific component file
import { Button } from "@workspace/ui/components/button"
import { Card, CardHeader, CardTitle } from "@workspace/ui/components/card"

// ✅ Also correct - Import utilities
import { cn } from "@workspace/ui/lib/utils"

// ❌ Wrong - No barrel exports
import { Button } from "@workspace/ui"
```

### Example Usage

```tsx
import { Button } from "@workspace/ui/components/button"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"

export default function Page() {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="default" size="lg">
            Get Started
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
```

### Available Components

The UI package includes 61 shadcn/ui components. See `packages/ui/README.md` for the full list.

**Most Common**:

- Layout: Card, Separator, Tabs, Accordion
- Form: Button, Input, Select, Checkbox, Switch
- Feedback: Alert, Badge, Toast, Spinner
- Overlay: Dialog, Sheet, Popover, Tooltip
- Navigation: Breadcrumb, Pagination, Sidebar

## Theme System

### Root Layout Setup

```tsx
import { Geist, Geist_Mono } from "next/font/google"
import "@workspace/ui/globals.css" // Import global styles
import { Providers } from "@/components/providers"

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

**Key Points**:

- Import `@workspace/ui/globals.css` in root layout (once only)
- Use `suppressHydrationWarning` on `<html>` for theme hydration
- Wrap children with `<Providers>` for theme context

### Theme Provider

```tsx
// components/providers.tsx
"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
    >
      {children}
    </NextThemesProvider>
  )
}
```

**Configuration**:

- `attribute="class"`: Uses `.dark` class for dark mode
- `defaultTheme="system"`: Respects OS preference
- `enableSystem`: Allows system theme detection
- `enableColorScheme`: Sets `color-scheme` CSS property

### Using Theme in Components

```tsx
"use client"

import { useTheme } from "next-themes"
import { Button } from "@workspace/ui/components/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      Toggle Theme
    </Button>
  )
}
```

## Styling with Tailwind CSS v4

### Design Tokens

The UI package defines design tokens using CSS variables in oklch color space:

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.984 0 0);
  /* ... more tokens */
}
```

### Using Tokens

```tsx
// Use semantic color classes
<div className="bg-background text-foreground">
  <h1 className="text-primary">Title</h1>
  <Button className="bg-primary text-primary-foreground">Click</Button>
</div>
```

### Custom Styling

```tsx
import { cn } from "@workspace/ui/lib/utils"

export function CustomCard({ className, ...props }) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-6 shadow-sm",
        "hover:shadow-md transition-shadow",
        className
      )}
      {...props}
    />
  )
}
```

## Development Scripts

```bash
# Development server (Turbopack)
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Type checking
pnpm typecheck

# Linting
pnpm lint
pnpm lint:fix

# Formatting
pnpm format
pnpm format:check

# Clean build artifacts
pnpm clean
```

## Turborepo Integration

The web app is part of a Turborepo monorepo. Tasks are cached for performance:

```json
// turbo.json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

**From repository root**:

```bash
# Run specific task for web app
turbo run dev --filter=web
turbo run build --filter=web

# Run task for all apps/packages
turbo run lint
turbo run typecheck
```

## Adding New Pages

### App Router Structure

```
app/
├── layout.tsx           # Root layout (shared)
├── page.tsx             # Home page (/)
├── about/
│   └── page.tsx         # About page (/about)
├── dashboard/
│   ├── layout.tsx       # Dashboard layout
│   ├── page.tsx         # Dashboard home (/dashboard)
│   └── settings/
│       └── page.tsx     # Settings page (/dashboard/settings)
└── api/
    └── route.ts         # API route (/api)
```

### Example Page

```tsx
// app/dashboard/page.tsx
import { Button } from "@workspace/ui/components/button"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Stats</CardTitle>
          </CardHeader>
          <CardContent>{/* Content */}</CardContent>
        </Card>
      </div>
    </div>
  )
}
```

## Environment Variables

Create `.env.local` for local environment variables:

```bash
# .env.local
NEXT_PUBLIC_APP_URL=http://localhost:3000
# Add your variables here
```

**Rules**:

- `NEXT_PUBLIC_*`: Exposed to browser
- Others: Server-side only
- Never commit `.env.local` to git

## Best Practices

### Component Organization

```
app/
├── (marketing)/        # Route group (no URL segment)
│   ├── layout.tsx
│   ├── page.tsx
│   └── about/page.tsx
└── (dashboard)/
    ├── layout.tsx
    └── page.tsx

components/             # Shared components
├── ui/                 # App-specific UI components
├── forms/              # Form components
└── providers.tsx       # Client providers
```

### Performance

1. **Use React Server Components** by default (no "use client")
2. **Lazy load client components** when needed:

```tsx
import dynamic from "next/dynamic"

const HeavyComponent = dynamic(() => import("@/components/heavy-component"), {
  loading: () => <Spinner />,
})
```

3. **Optimize images** with next/image:

```tsx
import Image from "next/image"

<Image src="/hero.jpg" alt="Hero" width={1200} height={600} priority />
```

4. **Use metadata for SEO**:

```tsx
export const metadata = {
  title: "Dashboard",
  description: "Manage your account",
}
```

### Type Safety

```tsx
// Use proper types for props
interface PageProps {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function Page({ params, searchParams }: PageProps) {
  // ...
}
```

### Error Handling

```tsx
// app/error.tsx
"use client"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Something went wrong!</h2>
        <Button onClick={() => reset()}>Try again</Button>
      </div>
    </div>
  )
}
```

## Troubleshooting

### Module Not Found

```bash
# Clear Next.js cache
pnpm clean

# Reinstall dependencies
pnpm install

# Verify UI package is linked
ls -la node_modules/@workspace/ui
```

### Type Errors

```bash
# Regenerate Next.js types
rm -rf .next
pnpm dev  # Let Next.js regenerate types

# Check TypeScript
pnpm typecheck
```

### Tailwind Classes Not Working

1. Verify `@workspace/ui/globals.css` is imported in root layout
2. Check `transpilePackages: ["@workspace/ui"]` in next.config.mjs
3. Ensure PostCSS config exports UI package config

### Theme Not Working

1. Verify `suppressHydrationWarning` on `<html>` tag
2. Check `<Providers>` wraps children in layout
3. Ensure `next-themes` is installed

## Testing

### Unit Testing (Future)

```bash
# Install testing dependencies (when needed)
pnpm add -D @testing-library/react @testing-library/jest-dom vitest
```

### E2E Testing (Future)

```bash
# Install Playwright (when needed)
pnpm add -D @playwright/test
```

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel
```

### Docker

```dockerfile
# Dockerfile
FROM node:24-alpine AS base
# ... (Add proper Dockerfile for Turborepo)
```

### Environment Variables

Set production environment variables in your deployment platform:

- Vercel: Project Settings → Environment Variables
- Docker: Use `.env.production` or pass via `docker run -e`

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React 19 Documentation](https://react.dev)
- [Tailwind CSS v4](https://tailwindcss.com/docs/v4-beta)
- [shadcn/ui](https://ui.shadcn.com)
- [next-themes](https://github.com/pacocoursey/next-themes)
- [Turborepo](https://turbo.build/repo/docs)
