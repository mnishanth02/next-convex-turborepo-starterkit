import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("archived")
    ),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    dueDate: v.optional(v.number()), // Unix timestamp
    userId: v.optional(v.id("users")), // Reference to users table (optional for now)
    tags: v.optional(v.array(v.string())),
    completedAt: v.optional(v.number()), // Unix timestamp
  })
    // Index for querying tasks by status - most common query pattern
    .index("by_status", ["status"])
    // Compound index for user-specific queries with status filtering
    .index("by_user_and_status", ["userId", "status"])
    // Index for priority-based queries
    .index("by_priority", ["priority"])
    // Compound index for due date queries with status
    .index("by_status_and_due_date", ["status", "dueDate"]),

  // Placeholder for users table - uncomment when implementing authentication
  // users: defineTable({
  //   name: v.string(),
  //   email: v.string(),
  //   tokenIdentifier: v.string(),
  // }).index("by_token", ["tokenIdentifier"]),
})
