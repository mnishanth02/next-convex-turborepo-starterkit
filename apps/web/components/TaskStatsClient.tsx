"use client"

import { type Preloaded, usePreloadedQuery } from "convex/react"
import type { api } from "@workspace/backend/convex/_generated/api"
import { TaskStats } from "./TaskStats"

interface TaskStatsClientProps {
    preloadedStats: Preloaded<typeof api.tasks.getTaskStats>
}

export function TaskStatsClient({ preloadedStats }: TaskStatsClientProps) {
    const stats = usePreloadedQuery(preloadedStats)

    return (
        <TaskStats
            stats={ {
                todo: stats.todo,
                inProgress: stats.inProgress,
                completed: stats.completed,
                total: stats.total,
            } }
        />
    )
}
