"use client"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { useMutation } from "convex/react"
import { CheckCircle2, Circle, Clock, MoreVertical, Trash2 } from "lucide-react"
import { api } from "@workspace/backend/convex/_generated/api"
import type { Id } from "@workspace/backend/convex/_generated/dataModel"
import { toast } from "sonner"

type TaskStatus = "todo" | "in_progress" | "completed" | "archived"
type TaskPriority = "low" | "medium" | "high"

interface TaskCardProps {
  id: Id<"tasks">
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  dueDate?: number
  completedAt?: number
}

const statusConfig = {
  todo: { label: "To Do", color: "bg-gray-500", icon: Circle },
  in_progress: { label: "In Progress", color: "bg-blue-500", icon: Clock },
  completed: { label: "Completed", color: "bg-green-500", icon: CheckCircle2 },
  archived: { label: "Archived", color: "bg-gray-400", icon: Circle },
}

const priorityConfig = {
  low: { label: "Low", variant: "secondary" as const },
  medium: { label: "Medium", variant: "default" as const },
  high: { label: "High", variant: "destructive" as const },
}

export function TaskCard({
  id,
  title,
  description,
  status,
  priority,
  dueDate,
  completedAt,
}: TaskCardProps) {
  const toggleComplete = useMutation(api.tasks.toggleTaskComplete)
  const deleteTask = useMutation(api.tasks.deleteTask)
  const updateTask = useMutation(api.tasks.updateTask)

  const StatusIcon = statusConfig[status].icon

  const handleToggleComplete = async () => {
    try {
      await toggleComplete({ id })
      toast.success(status === "completed" ? "Task reopened" : "Task completed!")
    } catch {
      toast.error("Failed to update task")
    }
  }

  const handleDelete = async () => {
    try {
      await deleteTask({ id })
      toast.success("Task archived")
    } catch {
      toast.error("Failed to archive task")
    }
  }

  const handleStatusChange = async (newStatus: TaskStatus) => {
    try {
      await updateTask({ id, status: newStatus })
      toast.success(`Task moved to ${statusConfig[newStatus].label}`)
    } catch {
      toast.error("Failed to update task")
    }
  }

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return null
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const isOverdue = dueDate && dueDate < Date.now() && status !== "completed"

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={handleToggleComplete}
              >
                <StatusIcon
                  className={`h-5 w-5 ${status === "completed" ? "text-green-500" : "text-muted-foreground"}`}
                />
              </Button>
              <CardTitle
                className={`text-base ${status === "completed" ? "line-through text-muted-foreground" : ""}`}
              >
                {title}
              </CardTitle>
            </div>
            {description && (
              <CardDescription className="pl-8 text-sm">{description}</CardDescription>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleStatusChange("todo")}>
                Move to To Do
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("in_progress")}>
                Move to In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("completed")}>
                Move to Completed
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Archive Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap items-center gap-2 pl-8">
          <Badge variant={priorityConfig[priority].variant} className="text-xs">
            {priorityConfig[priority].label}
          </Badge>
          <Badge variant="outline" className={`text-xs ${statusConfig[status].color} text-white`}>
            {statusConfig[status].label}
          </Badge>
          {dueDate && (
            <Badge
              variant="outline"
              className={`text-xs ${isOverdue ? "border-red-500 text-red-500" : ""}`}
            >
              Due {formatDate(dueDate)}
            </Badge>
          )}
          {completedAt && (
            <Badge variant="outline" className="text-xs text-green-600">
              Completed {formatDate(completedAt)}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
