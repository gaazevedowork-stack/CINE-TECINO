import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByCinema = query({
  args: { cinemaId: v.id("cinemas") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_cinema", (q) => q.eq("cinemaId", args.cinemaId))
      .collect();
  },
});

export const list = query({
  args: { 
    cinemaId: v.optional(v.id("cinemas")),
    roomId: v.optional(v.id("rooms")),
    status: v.optional(v.union(v.literal("todo"), v.literal("in_progress"), v.literal("done"))),
  },
  handler: async (ctx, args) => {
    let tasks;
    
    if (args.cinemaId) {
      tasks = await ctx.db
        .query("tasks")
        .withIndex("by_cinema", (q) => q.eq("cinemaId", args.cinemaId!))
        .collect();
    } else {
      tasks = await ctx.db.query("tasks").collect();
    }
    
    return tasks.filter(task => {
      if (args.roomId && task.roomId !== args.roomId) return false;
      if (args.status && task.status !== args.status) return false;
      return true;
    });
  },
});

export const get = query({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    cinemaId: v.id("cinemas"),
    roomId: v.optional(v.id("rooms")),
    equipmentId: v.optional(v.id("equipment")),
    title: v.string(),
    description: v.string(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    assignedTo: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    category: v.union(
      v.literal("maintenance"), 
      v.literal("cleaning"), 
      v.literal("inspection"), 
      v.literal("repair"),
      v.literal("preventive_a"),
      v.literal("preventive_b"),
      v.literal("preventive_c"),
      v.literal("other")
    ),
    estimatedHours: v.optional(v.number()),
    cost: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tasks", {
      ...args,
      status: "todo",
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    status: v.optional(v.union(v.literal("todo"), v.literal("in_progress"), v.literal("done"))),
    assignedTo: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    category: v.optional(v.union(
      v.literal("maintenance"), 
      v.literal("cleaning"), 
      v.literal("inspection"), 
      v.literal("repair"),
      v.literal("preventive_a"),
      v.literal("preventive_b"),
      v.literal("preventive_c"),
      v.literal("other")
    )),
    estimatedHours: v.optional(v.number()),
    actualHours: v.optional(v.number()),
    cost: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, updates);
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("tasks"),
    status: v.union(v.literal("todo"), v.literal("in_progress"), v.literal("done")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, { status: args.status });
  },
});

export const remove = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

export const getByRoom = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();
  },
});

export const getByPriority = query({
  args: { 
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    cinemaId: v.optional(v.id("cinemas")),
  },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_priority", (q) => q.eq("priority", args.priority))
      .collect();
    
    if (args.cinemaId) {
      return tasks.filter(task => task.cinemaId === args.cinemaId);
    }
    
    return tasks;
  },
});
