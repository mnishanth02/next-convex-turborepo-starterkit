"use client"

import type { api } from "@workspace/backend/convex/_generated/api"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { type Preloaded, usePreloadedQuery } from "convex/react"
import { useMemo, useState } from "react"
import { CreateTaskDialog } from "./CreateTaskDialog"
import { TaskCard } from "./TaskCard"

type TaskStatus = "todo" | "in_progress" | "completed" | "archived"
type TaskPriority = "low" | "medium" | "high"
type SortOption = "newest" | "oldest" | "priority" | "dueDate"

interface TaskListProps {
  preloadedTasks: Preloaded<typeof api.tasks.getAllTasks>
}

export function TaskList({ preloadedTasks }: TaskListProps) {
  const [activeTab, setActiveTab] = useState<TaskStatus | "all">("all")
  const [sortBy, setSortBy] = useState<SortOption>("newest")

  // Use preloaded query for initial data with real-time updates
  const tasks = usePreloadedQuery(preloadedTasks)

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks

    // Filter by status
    if (activeTab !== "all") {
      filtered = filtered.filter((task) => task.status === activeTab)
    }

    // Sort tasks
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return b._creationTime - a._creationTime
        case "oldest":
          return a._creationTime - b._creationTime
        case "priority": {
          const priorityOrder: Record<TaskPriority, number> = { high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        }
        case "dueDate":
          if (!a.dueDate && !b.dueDate) return 0
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return a.dueDate - b.dueDate
        default:
          return 0
      }
    })

    return sorted
  }, [tasks, activeTab, sortBy])

  const taskCounts = useMemo(() => {
    return {
      all: tasks.length,
      todo: tasks.filter((t) => t.status === "todo").length,
      in_progress: tasks.filter((t) => t.status === "in_progress").length,
      completed: tasks.filter((t) => t.status === "completed").length,
    }
  }, [tasks])

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => setActiveTab(value as TaskStatus | "all")}
      className="space-y-4"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <TabsList className="grid w-full grid-cols-4 sm:w-auto">
          <TabsTrigger value="all" className="text-xs sm:text-sm">
            All
            <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-xs tabular-nums">
              {taskCounts.all}
            </span>
          </TabsTrigger>
          <TabsTrigger value="todo" className="text-xs sm:text-sm">
            To Do
            <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-xs tabular-nums">
              {taskCounts.todo}
            </span>
          </TabsTrigger>
          <TabsTrigger value="in_progress" className="text-xs sm:text-sm">
            In Progress
            <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-xs tabular-nums">
              {taskCounts.in_progress}
            </span>
          </TabsTrigger>
          <TabsTrigger value="completed" className="text-xs sm:text-sm">
            Completed
            <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-xs tabular-nums">
              {taskCounts.completed}
            </span>
          </TabsTrigger>
        </TabsList>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="dueDate">Due Date</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Task List */}
      <TabsContent value={activeTab} className="mt-0 space-y-3">
        {filteredAndSortedTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
            <div className="mx-auto max-w-sm">
              <h3 className="text-lg font-semibold">No tasks found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {activeTab === "all"
                  ? "Get started by creating your first task."
                  : `No tasks in ${activeTab.replace("_", " ")} status.`}
              </p>
              {activeTab === "all" && (
                <div className="mt-4">
                  <CreateTaskDialog />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredAndSortedTasks.map((task) => (
              <TaskCard
                key={task._id}
                id={task._id}
                title={task.title}
                description={task.description}
                status={task.status}
                priority={task.priority}
                dueDate={task.dueDate}
                completedAt={task.completedAt}
              />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}
