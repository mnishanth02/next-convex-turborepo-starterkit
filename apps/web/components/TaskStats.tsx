"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { CheckCircle2, Circle, Clock, ListTodo } from "lucide-react"

interface TaskStatsProps {
    stats: {
        todo: number
        inProgress: number
        completed: number
        total: number
    }
}

const statsConfig = [
    {
        key: "todo" as const,
        label: "To Do",
        icon: Circle,
        color: "text-gray-500",
        bgColor: "bg-gray-100 dark:bg-gray-800",
    },
    {
        key: "inProgress" as const,
        label: "In Progress",
        icon: Clock,
        color: "text-blue-500",
        bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
        key: "completed" as const,
        label: "Completed",
        icon: CheckCircle2,
        color: "text-green-500",
        bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
        key: "total" as const,
        label: "Total Tasks",
        icon: ListTodo,
        color: "text-purple-500",
        bgColor: "bg-purple-100 dark:bg-purple-900/20",
    },
]

export function TaskStats({ stats }: TaskStatsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            { statsConfig.map((config) => {
                const Icon = config.icon
                const count = stats[config.key]

                return (
                    <Card key={ config.key } className="overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{ config.label }</CardTitle>
                            <div className={ `rounded-full p-2 ${config.bgColor}` }>
                                <Icon className={ `h-4 w-4 ${config.color}` } />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{ count }</div>
                            <p className="text-xs text-muted-foreground">
                                { config.key === "total"
                                    ? "Total tasks"
                                    : `${((count / (stats.total || 1)) * 100).toFixed(0)}% of total` }
                            </p>
                        </CardContent>
                    </Card>
                )
            }) }
        </div>
    )
}
