import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("events").collect();
  },
});

export const listByCinema = query({
  args: { cinemaId: v.id("cinemas") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("events")
      .withIndex("by_cinema", (q) => q.eq("cinemaId", args.cinemaId))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    cinemaId: v.id("cinemas"),
    roomId: v.optional(v.id("rooms")),
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.number(),
    endTime: v.number(),
    type: v.union(
      v.literal("maintenance"), 
      v.literal("cleaning"), 
      v.literal("inspection"), 
      v.literal("meeting"),
      v.literal("preventive"),
      v.literal("events"),
      v.literal("other")
    ),
    status: v.union(v.literal("scheduled"), v.literal("in_progress"), v.literal("completed"), v.literal("cancelled")),
    assignedTo: v.optional(v.string()),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("events", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("events"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
    type: v.optional(v.union(
      v.literal("maintenance"), 
      v.literal("cleaning"), 
      v.literal("inspection"), 
      v.literal("meeting"),
      v.literal("preventive"),
      v.literal("events"),
      v.literal("other")
    )),
    status: v.optional(v.union(v.literal("scheduled"), v.literal("in_progress"), v.literal("completed"), v.literal("cancelled"))),
    assignedTo: v.optional(v.string()),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    roomId: v.optional(v.id("rooms")),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("events"),
    status: v.union(v.literal("scheduled"), v.literal("in_progress"), v.literal("completed"), v.literal("cancelled")),
  },
  handler: async (ctx, args) => {
    const { id, status } = args;
    await ctx.db.patch(id, { status });
    return id;
  },
});
