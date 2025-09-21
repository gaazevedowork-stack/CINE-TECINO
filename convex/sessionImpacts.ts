import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    cinemaId: v.optional(v.id("cinemas")),
    roomId: v.optional(v.id("rooms")),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let impacts = args.cinemaId
      ? await ctx.db
          .query("sessionImpacts")
          .withIndex("by_cinema", (q) => q.eq("cinemaId", args.cinemaId!))
          .collect()
      : await ctx.db.query("sessionImpacts").collect();
    
    if (args.roomId) {
      impacts = impacts.filter(i => i.roomId === args.roomId);
    }
    
    if (args.startDate && args.endDate) {
      impacts = impacts.filter(i => i.date >= args.startDate! && i.date <= args.endDate!);
    }
    
    return impacts.sort((a, b) => b.date - a.date);
  },
});

export const create = mutation({
  args: {
    roomId: v.id("rooms"),
    cinemaId: v.id("cinemas"),
    date: v.number(),
    sessionTime: v.string(),
    impactType: v.union(v.literal("cancelled"), v.literal("delayed"), v.literal("interrupted")),
    cause: v.union(
      v.literal("projection"), 
      v.literal("sound"), 
      v.literal("climate"), 
      v.literal("electrical"), 
      v.literal("network"),
      v.literal("other")
    ),
    delayMinutes: v.optional(v.number()),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("sessionImpacts", {
      ...args,
      resolved: false,
    });
  },
});

export const resolve = mutation({
  args: {
    id: v.id("sessionImpacts"),
    resolutionTime: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      resolved: true,
      resolutionTime: args.resolutionTime,
    });
  },
});

export const getStatistics = query({
  args: {
    cinemaId: v.optional(v.id("cinemas")),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const impacts = args.cinemaId
      ? await ctx.db
          .query("sessionImpacts")
          .withIndex("by_cinema", (q) => q.eq("cinemaId", args.cinemaId!))
          .collect()
      : await ctx.db.query("sessionImpacts").collect();
    const filteredImpacts = impacts.filter(i => 
      i.date >= args.startDate && i.date <= args.endDate
    );
    
    // Group by cause
    const byCause = filteredImpacts.reduce((acc, impact) => {
      acc[impact.cause] = (acc[impact.cause] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Group by impact type
    const byType = filteredImpacts.reduce((acc, impact) => {
      acc[impact.impactType] = (acc[impact.impactType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Calculate total delay time
    const totalDelayMinutes = filteredImpacts.reduce((sum, i) => sum + (i.delayMinutes || 0), 0);
    
    return {
      totalImpacts: filteredImpacts.length,
      byCause,
      byType,
      totalDelayMinutes,
      resolvedImpacts: filteredImpacts.filter(i => i.resolved).length,
    };
  },
});
