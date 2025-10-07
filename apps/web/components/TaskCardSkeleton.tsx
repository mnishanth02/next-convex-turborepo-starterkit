import { Card, CardContent, CardHeader } from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"

export function TaskCardSkeleton() {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-6 w-6 rounded-full shrink-0" />
                            <Skeleton className="h-5 w-48" />
                        </div>
                        <Skeleton className="h-4 w-full ml-8" />
                    </div>
                    <Skeleton className="h-8 w-8 shrink-0" />
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="flex flex-wrap items-center gap-2 pl-8">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-20" />
                </div>
            </CardContent>
        </Card>
    )
}

export function TaskListSkeleton() {
    const skeletonIds = ["task-1", "task-2", "task-3"] as const

    return (
        <div className="grid gap-3">
            { skeletonIds.map((id) => (
                <TaskCardSkeleton key={ id } />
            )) }
        </div>
    )
}
