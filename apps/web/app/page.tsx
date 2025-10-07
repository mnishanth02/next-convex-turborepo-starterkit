import { preloadQuery } from "convex/nextjs"
import { api } from "@workspace/backend/convex/_generated/api"
import { TaskList } from "@/components/TaskList"

export default async function Page() {
  // Preload tasks data on the server for optimal performance
  const preloadedTasks = await preloadQuery(api.tasks.getAllTasks)

  return (
    <div className="container mx-auto p-6 lg:p-8">
      <TaskList preloadedTasks={preloadedTasks} />
    </div>
  )
}
