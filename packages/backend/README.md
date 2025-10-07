# Backend Package - Convex Database

This package contains the Convex database schema and functions for the Next.js application.

## Structure

```
packages/backend/
├── convex/
│   ├── _generated/     # Auto-generated Convex types and API
│   ├── schema.ts       # Database schema definition
│   ├── tasks.ts        # Task CRUD functions
│   ├── tsconfig.json   # TypeScript config for Convex
│   └── README.md       # Convex quick reference
├── package.json
└── .env.local          # Convex deployment URL (gitignored)
```

## Getting Started

### Prerequisites

1. Install dependencies from the root:
   ```bash
   pnpm install
   ```

2. Set up Convex (first time only):
   ```bash
   cd packages/backend
   npx convex dev
   ```
   This will:
   - Create a new Convex project (if needed)
   - Generate `.env.local` with your deployment URL
   - Start the development server
   - Push your schema and functions

### Development Workflow

#### Start Convex Dev Server

From the backend package or use Turborepo:

```bash
# From backend directory
pnpm dev

# Or from project root with Turborepo
pnpm --filter @workspace/backend dev
```

#### Run Scripts

```bash
# Type checking
pnpm typecheck

# Linting
pnpm lint
pnpm lint:fix

# Formatting
pnpm format
pnpm format:check

# Deploy to production
pnpm deploy
```

## Schema

The database schema is defined in `convex/schema.ts` and provides type safety across your entire application.

### Tasks Table

```typescript
{
  title: string,
  description?: string,
  status: "todo" | "in_progress" | "completed" | "archived",
  priority: "low" | "medium" | "high",
  dueDate?: number,  // Unix timestamp
  userId?: Id<"users">,
  tags?: string[],
  completedAt?: number  // Unix timestamp
}
```

### Indexes

The tasks table has the following indexes for efficient querying:

- `by_status` - Query tasks by status
- `by_user_and_status` - User-specific task queries with status filtering
- `by_priority` - Query tasks by priority
- `by_status_and_due_date` - Query tasks by status and due date

## Available Functions

### Queries (Read Operations)

- `getAllTasks()` - Get up to 100 most recent tasks
- `getTasksByStatus(status)` - Get tasks filtered by status (supports pagination)
- `getTask(id)` - Get a single task by ID
- `getTasksByPriority(priority)` - Get tasks by priority level
- `getUpcomingTasks()` - Get non-completed tasks with upcoming due dates
- `getTaskStats()` - Get task count statistics

### Mutations (Write Operations)

- `createTask({ title, description?, status?, priority?, dueDate?, tags? })` - Create a new task
- `updateTask(id, { title?, description?, status?, priority?, dueDate?, tags? })` - Update an existing task
- `deleteTask(id)` - Soft delete (archive) a task
- `hardDeleteTask(id)` - Permanently delete a task
- `toggleTaskComplete(id)` - Toggle task completion status

## Using in the Web App

### 1. Install Convex Client

The Convex client should already be installed, but if needed:

```bash
cd apps/web
pnpm add convex
```

### 2. Configure Next.js App

In `apps/web/next.config.mjs`, ensure you transpile the backend package:

```javascript
transpilePackages: ["@workspace/backend"]
```

### 3. Set Up Convex Provider

Update `apps/web/components/providers.tsx`:

```typescript
"use client"

import { ConvexProvider, ConvexReactClient } from "convex/react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ReactNode } from "react"

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ConvexProvider client={convex}>
      <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        enableColorScheme
      >
        {children}
      </NextThemesProvider>
    </ConvexProvider>
  )
}
```

### 4. Add Environment Variables

Create `apps/web/.env.local`:

```bash
NEXT_PUBLIC_CONVEX_URL=<your-convex-deployment-url>
```

You can find this URL in `packages/backend/.env.local` or your Convex dashboard.

### 5. Use in Components

```typescript
"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "@workspace/backend/convex/_generated/api"

export function TaskList() {
  const tasks = useQuery(api.tasks.getAllTasks)
  const createTask = useMutation(api.tasks.createTask)

  const handleCreateTask = async () => {
    await createTask({
      title: "New Task",
      priority: "medium",
      status: "todo"
    })
  }

  return (
    <div>
      <button onClick={handleCreateTask}>Create Task</button>
      {tasks?.map((task) => (
        <div key={task._id}>
          <h3>{task.title}</h3>
          <p>{task.description}</p>
          <span>{task.status}</span>
        </div>
      ))}
    </div>
  )
}
```

## Best Practices Implemented

### 1. Schema Validation
- All tables have strict schemas for type safety
- Optional fields explicitly marked with `v.optional()`
- Enum-like values using `v.union(v.literal())`

### 2. Efficient Querying
- Proper indexes for common query patterns
- Avoids `.collect()` on unbounded data
- Uses `.take()` to limit results
- Supports pagination where appropriate

### 3. Error Handling
- Input validation (e.g., non-empty titles)
- Proper error messages
- Null checks before operations

### 4. Soft Deletes
- Tasks are archived instead of hard deleted by default
- Maintains data integrity
- `hardDeleteTask` available for admin use

### 5. Status Transitions
- Automatic `completedAt` timestamp when marking as completed
- Clears `completedAt` when reverting to other statuses

### 6. Code Organization
- Clear function naming
- Comprehensive JSDoc comments
- Separation of queries and mutations

## Turborepo Integration

The backend package is fully integrated with Turborepo:

- **Caching**: Build, typecheck, and lint operations are cached
- **Task Dependencies**: Proper task ordering with `^build`, `^typecheck`
- **Persistent Dev**: Convex dev server runs persistently with `cache: false`

## Production Deployment

### Deploy to Convex Production

```bash
cd packages/backend
npx convex deploy --prod
```

This will:
1. Push schema to production deployment
2. Validate all functions
3. Update production environment

### Environment Variables

For production, update `NEXT_PUBLIC_CONVEX_URL` in your hosting platform (Vercel, etc.) with the production Convex URL.

## Monitoring and Debugging

### Convex Dashboard

Access your Convex dashboard at: https://dashboard.convex.dev

Features:
- Real-time data viewer
- Function logs
- Performance metrics
- Schema inspector

### Local Development

The Convex dev server provides:
- Hot reloading of functions
- Type regeneration on schema changes
- Real-time sync with deployed functions

## Common Issues

### Issue: Types Not Updating

**Solution**: Restart the Convex dev server to regenerate types:
```bash
pnpm dev
```

### Issue: Schema Validation Errors

**Solution**: Ensure all existing data matches the new schema before pushing changes. Use migrations if needed.

### Issue: Import Errors in Web App

**Solution**:
1. Ensure `transpilePackages: ["@workspace/backend"]` in `next.config.mjs`
2. Import from the correct path: `@workspace/backend/convex/_generated/api`

## Additional Resources

- [Convex Documentation](https://docs.convex.dev)
- [Convex Best Practices](https://docs.convex.dev/production/best-practices)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Next.js + Convex Guide](https://docs.convex.dev/client/react/nextjs)
