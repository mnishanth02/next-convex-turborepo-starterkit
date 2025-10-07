import { TaskStatsSkeleton } from "@/components/TaskStatsSkeleton"
import { TaskListSkeleton } from "@/components/TaskCardSkeleton"
import { Separator } from "@workspace/ui/components/separator"
import { Skeleton } from "@workspace/ui/components/skeleton"

export default function Loading() {
    return (
        <div className="container mx-auto p-6 lg:p-8">
            <div className="space-y-6">
                {/* Header Skeleton */ }
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-9 w-32" />
                        <Skeleton className="h-5 w-64" />
                    </div>
                    <Skeleton className="h-10 w-32" />
                </div>

                {/* Statistics Skeleton */ }
                <TaskStatsSkeleton />

                <Separator />

                {/* Task List Skeleton */ }
                <TaskListSkeleton />
            </div>
        </div>
    )
}
