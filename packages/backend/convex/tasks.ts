import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

/**
 * Query: Get all tasks
 *
 * Best Practice: Uses order by _creationTime and limits results
 * to avoid loading unbounded data. For production, use pagination instead.
 */
export const getAllTasks = query({
  args: {},
  handler: async (ctx) => {
    // Order by creation time (descending) and limit results
    const tasks = await ctx.db.query("tasks").order("desc").take(100) // Limit to 100 most recent tasks

    return tasks
  },
})

/**
 * Query: Get tasks by status with pagination support
 *
 * Best Practice: Uses index for efficient filtering and supports pagination
 */
export const getTasksByStatus = query({
  args: {
    status: v.union(
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("archived")
    ),
    paginationOpts: v.optional(
      v.object({
        numItems: v.number(),
        cursor: v.union(v.string(), v.null()),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Use index for efficient status filtering
    if (args.paginationOpts) {
      return await ctx.db
        .query("tasks")
        .withIndex("by_status", (q) => q.eq("status", args.status))
        .order("desc")
        .paginate(args.paginationOpts)
    }

    // Fallback to limited results if no pagination
    return await ctx.db
      .query("tasks")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .order("desc")
      .take(50)
  },
})

/**
 * Query: Get a single task by ID
 *
 * Best Practice: Returns null if not found instead of throwing error
 */
export const getTask = query({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

/**
 * Query: Get tasks by priority
 *
 * Best Practice: Uses index for efficient priority filtering
 */
export const getTasksByPriority = query({
  args: {
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_priority", (q) => q.eq("priority", args.priority))
      .order("desc")
      .take(50)
  },
})

/**
 * Query: Get upcoming tasks (by due date)
 *
 * Best Practice: Uses compound index for efficient filtering
 */
export const getUpcomingTasks = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now()

    // Get non-archived tasks with due dates
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_status_and_due_date")
      .filter((q) => q.neq(q.field("status"), "archived"))
      .filter((q) => q.neq(q.field("status"), "completed"))
      .take(50)

    // Filter in code for due date comparison (more flexible than index)
    return tasks
      .filter((task) => task.dueDate && task.dueDate >= now)
      .sort((a, b) => (a.dueDate || 0) - (b.dueDate || 0))
  },
})

/**
 * Mutation: Create a new task
 *
 * Best Practice: Validates all inputs and returns the created task
 */
export const createTask = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("todo"),
        v.literal("in_progress"),
        v.literal("completed"),
        v.literal("archived")
      )
    ),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    dueDate: v.optional(v.number()),
    userId: v.optional(v.id("users")),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // Validate title is not empty
    if (args.title.trim().length === 0) {
      throw new Error("Task title cannot be empty")
    }

    const taskId = await ctx.db.insert("tasks", {
      title: args.title,
      description: args.description,
      status: args.status ?? "todo", // Default to 'todo'
      priority: args.priority ?? "medium", // Default to 'medium'
      dueDate: args.dueDate,
      userId: args.userId,
      tags: args.tags,
      completedAt: undefined,
    })

    // Return the created task
    return await ctx.db.get(taskId)
  },
})

/**
 * Mutation: Update a task
 *
 * Best Practice: Only updates provided fields, handles status transitions
 */
export const updateTask = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("todo"),
        v.literal("in_progress"),
        v.literal("completed"),
        v.literal("archived")
      )
    ),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    dueDate: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args

    // Get existing task
    const existingTask = await ctx.db.get(id)
    if (!existingTask) {
      throw new Error("Task not found")
    }

    // Handle status transition to completed
    const updateData: Record<string, unknown> = { ...updates }
    if (updates.status === "completed" && existingTask.status !== "completed") {
      updateData.completedAt = Date.now()
    } else if (updates.status && updates.status !== "completed") {
      updateData.completedAt = undefined
    }

    // Update task
    await ctx.db.patch(id, updateData)

    // Return updated task
    return await ctx.db.get(id)
  },
})

/**
 * Mutation: Delete a task
 *
 * Best Practice: Soft delete by archiving instead of hard delete
 */
export const deleteTask = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id)
    if (!task) {
      throw new Error("Task not found")
    }

    // Soft delete: archive instead of delete
    await ctx.db.patch(args.id, { status: "archived" })

    return { success: true }
  },
})

/**
 * Mutation: Hard delete a task (use with caution)
 *
 * Best Practice: Only for administrative purposes
 */
export const hardDeleteTask = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
    return { success: true }
  },
})

/**
 * Mutation: Toggle task completion status
 *
 * Best Practice: Convenience function for common operation
 */
export const toggleTaskComplete = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id)
    if (!task) {
      throw new Error("Task not found")
    }

    const newStatus = task.status === "completed" ? "todo" : "completed"
    const completedAt = newStatus === "completed" ? Date.now() : undefined

    await ctx.db.patch(args.id, {
      status: newStatus,
      completedAt,
    })

    return await ctx.db.get(args.id)
  },
})

/**
 * Query: Get task statistics
 *
 * Best Practice: Efficient aggregation using indexes
 */
export const getTaskStats = query({
  args: {},
  handler: async (ctx) => {
    // Use indexes for efficient counting
    const todoTasks = await ctx.db
      .query("tasks")
      .withIndex("by_status", (q) => q.eq("status", "todo"))
      .take(1000)

    const inProgressTasks = await ctx.db
      .query("tasks")
      .withIndex("by_status", (q) => q.eq("status", "in_progress"))
      .take(1000)

    const completedTasks = await ctx.db
      .query("tasks")
      .withIndex("by_status", (q) => q.eq("status", "completed"))
      .take(1000)

    return {
      todo: todoTasks.length,
      inProgress: inProgressTasks.length,
      completed: completedTasks.length,
      total: todoTasks.length + inProgressTasks.length + completedTasks.length,
    }
  },
})
