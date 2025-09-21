import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByRoom = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("maintenanceHistory")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .order("desc")
      .collect();
  },
});

export const listByCinema = query({
  args: { cinemaId: v.id("cinemas") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("maintenanceHistory")
      .withIndex("by_cinema", (q) => q.eq("cinemaId", args.cinemaId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    roomId: v.id("rooms"),
    cinemaId: v.id("cinemas"),
    date: v.number(),
    type: v.union(
      v.literal("preventive_a"),
      v.literal("preventive_b"), 
      v.literal("preventive_c"),
      v.literal("lamp_replacement"),
      v.literal("corrective"),
      v.literal("cleaning"),
      v.literal("inspection"),
      v.literal("other")
    ),
    description: v.string(),
    technician: v.optional(v.string()),
    cost: v.optional(v.number()),
    notes: v.optional(v.string()),
    partsUsed: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("maintenanceHistory", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("maintenanceHistory"),
    date: v.optional(v.number()),
    type: v.optional(v.union(
      v.literal("preventive_a"),
      v.literal("preventive_b"), 
      v.literal("preventive_c"),
      v.literal("lamp_replacement"),
      v.literal("corrective"),
      v.literal("cleaning"),
      v.literal("inspection"),
      v.literal("other")
    )),
    description: v.optional(v.string()),
    technician: v.optional(v.string()),
    cost: v.optional(v.number()),
    notes: v.optional(v.string()),
    partsUsed: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("maintenanceHistory") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const getMaintenanceStats = query({
  args: { cinemaId: v.id("cinemas") },
  handler: async (ctx, args) => {
    const records = await ctx.db
      .query("maintenanceHistory")
      .withIndex("by_cinema", (q) => q.eq("cinemaId", args.cinemaId))
      .collect();

    const stats = {
      total: records.length,
      preventiveA: records.filter(r => r.type === "preventive_a").length,
      preventiveB: records.filter(r => r.type === "preventive_b").length,
      preventiveC: records.filter(r => r.type === "preventive_c").length,
      lampReplacements: records.filter(r => r.type === "lamp_replacement").length,
      corrective: records.filter(r => r.type === "corrective").length,
      totalCost: records.reduce((sum, r) => sum + (r.cost || 0), 0),
    };

    return stats;
  },
});
