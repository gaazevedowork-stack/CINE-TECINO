import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    cinemaId: v.optional(v.id("cinemas")),
    roomId: v.optional(v.id("rooms")),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    type: v.optional(v.union(v.literal("preventive"), v.literal("corrective"), v.literal("emergency"))),
    category: v.optional(v.union(
      v.literal("projection"), 
      v.literal("sound"), 
      v.literal("climate"), 
      v.literal("electrical"), 
      v.literal("network"),
      v.literal("cleaning"),
      v.literal("other")
    )),
  },
  handler: async (ctx, args) => {
    let records = args.cinemaId
      ? await ctx.db
          .query("maintenanceRecords")
          .withIndex("by_cinema", (q) => q.eq("cinemaId", args.cinemaId!))
          .collect()
      : await ctx.db.query("maintenanceRecords").collect();
    
    // Apply filters
    if (args.roomId) {
      records = records.filter(r => r.roomId === args.roomId);
    }
    
    if (args.startDate && args.endDate) {
      records = records.filter(r => r.startTime >= args.startDate! && r.startTime <= args.endDate!);
    }
    
    if (args.type) {
      records = records.filter(r => r.type === args.type);
    }
    
    if (args.category) {
      records = records.filter(r => r.category === args.category);
    }
    
    return records.sort((a, b) => b.startTime - a.startTime);
  },
});

export const create = mutation({
  args: {
    equipmentId: v.optional(v.id("equipment")),
    roomId: v.id("rooms"),
    cinemaId: v.id("cinemas"),
    type: v.union(v.literal("preventive"), v.literal("corrective"), v.literal("predictive")),
    category: v.union(
      v.literal("projection"), 
      v.literal("sound"), 
      v.literal("climate"), 
      v.literal("electrical"), 
      v.literal("network"),
      v.literal("cleaning"),
      v.literal("other")
    ),
    description: v.string(),
    cost: v.optional(v.number()),
    downtime: v.optional(v.number()),
    technician: v.optional(v.string()),
    startTime: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("maintenanceRecords", {
      ...args,
      status: "scheduled",
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("maintenanceRecords"),
    endTime: v.optional(v.number()),
    status: v.optional(v.union(v.literal("scheduled"), v.literal("in_progress"), v.literal("completed"), v.literal("cancelled"))),
    cost: v.optional(v.number()),
    downtime: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, updates);
  },
});

export const getStatistics = query({
  args: {
    cinemaId: v.optional(v.id("cinemas")),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const records = args.cinemaId
      ? await ctx.db
          .query("maintenanceRecords")
          .withIndex("by_cinema", (q) => q.eq("cinemaId", args.cinemaId!))
          .collect()
      : await ctx.db.query("maintenanceRecords").collect();
    const filteredRecords = records.filter(r => 
      r.startTime >= args.startDate && r.startTime <= args.endDate
    );
    
    const completedRecords = filteredRecords.filter(r => r.status === "completed" && r.endTime);
    
    // Calculate average resolution time
    const resolutionTimes = completedRecords
      .filter(r => r.endTime)
      .map(r => r.endTime! - r.startTime);
    
    const avgResolutionTime = resolutionTimes.length > 0 
      ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length 
      : 0;
    
    // Group by category
    const byCategory = filteredRecords.reduce((acc, record) => {
      acc[record.category] = (acc[record.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Group by type
    const byType = filteredRecords.reduce((acc, record) => {
      acc[record.type] = (acc[record.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Calculate total costs and downtime
    const totalCost = filteredRecords.reduce((sum, r) => sum + (r.cost || 0), 0);
    const totalDowntime = filteredRecords.reduce((sum, r) => sum + (r.downtime || 0), 0);
    
    return {
      totalRecords: filteredRecords.length,
      completedRecords: completedRecords.length,
      avgResolutionTime: Math.round(avgResolutionTime / (1000 * 60 * 60)), // hours
      byCategory,
      byType,
      totalCost,
      totalDowntime: Math.round(totalDowntime / 60), // hours
    };
  },
});
