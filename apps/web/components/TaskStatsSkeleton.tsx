import { Card, CardContent, CardHeader } from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"

export function TaskStatsSkeleton() {
    const skeletonIds = ["todo", "in-progress", "completed", "total"] as const

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            { skeletonIds.map((id) => (
                <Card key={ id } className="overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-12 mb-2" />
                        <Skeleton className="h-3 w-24" />
                    </CardContent>
                </Card>
            )) }
        </div>
    )
}
