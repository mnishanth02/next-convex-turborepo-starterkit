import { api } from "@workspace/backend/convex/_generated/api"
import { Separator } from "@workspace/ui/components/separator"
import { preloadQuery } from "convex/nextjs"
import type { Metadata } from "next"
import { Suspense } from "react"
import { CreateTaskDialog } from "@/components/CreateTaskDialog"
import { TaskListSkeleton } from "@/components/TaskCardSkeleton"
import { TaskList } from "@/components/TaskList"
import { TaskStatsClient } from "@/components/TaskStatsClient"
import { TaskStatsSkeleton } from "@/components/TaskStatsSkeleton"

export const metadata: Metadata = {
  title: "Tasks",
  description:
    "Manage your tasks efficiently. Create, organize, and track your tasks in real-time with our intuitive task management system.",
  openGraph: {
    title: "Tasks - Manage Your Work",
    description:
      "Create, organize, and track your tasks in real-time. Stay productive with our modern task management application.",
  },
}

export default async function Page() {
  // Preload both tasks and stats data on the server for optimal performance
  const preloadedTasks = await preloadQuery(api.tasks.getAllTasks)
  const preloadedStats = await preloadQuery(api.tasks.getTaskStats)

  return (
    <div className="container mx-auto p-6 lg:p-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
            <p className="text-muted-foreground">Manage your tasks and stay organized</p>
          </div>
          <CreateTaskDialog />
        </div>

        {/* Statistics with Suspense */}
        <Suspense fallback={<TaskStatsSkeleton />}>
          <TaskStatsClient preloadedStats={preloadedStats} />
        </Suspense>

        <Separator />

        {/* Task List with Suspense */}
        <Suspense fallback={<TaskListSkeleton />}>
          <TaskList preloadedTasks={preloadedTasks} />
        </Suspense>
      </div>
    </div>
  )
}
