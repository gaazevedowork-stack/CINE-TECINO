import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("rooms").collect();
  },
});

export const listByCinema = query({
  args: { cinemaId: v.id("cinemas") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("rooms")
      .withIndex("by_cinema", (q) => q.eq("cinemaId", args.cinemaId))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("rooms") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    cinemaId: v.id("cinemas"),
    name: v.optional(v.string()),
    location: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("maintenance"), v.literal("stopped")),
    statusReason: v.optional(v.string()),
    screenType: v.optional(v.string()),
    soundSystem: v.optional(v.string()),
    seating: v.optional(v.object({
      standard: v.number(),
      premium: v.number(),
      vip: v.number(),
    })),
    projectorLamp: v.optional(v.object({
      model: v.string(),
      currentHours: v.number(),
      maxHours: v.number(),
      lastReplacementDate: v.number(),
    })),
    preventiveMaintenance: v.optional(v.object({
      lastPreventiveA: v.optional(v.number()),
      lastPreventiveB: v.optional(v.number()),
      lastPreventiveC: v.optional(v.number()),
      nextPreventiveA: v.optional(v.number()),
      nextPreventiveB: v.optional(v.number()),
      nextPreventiveC: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("rooms", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("rooms"),
    name: v.optional(v.string()),
    location: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("maintenance"), v.literal("stopped"))),
    statusReason: v.optional(v.string()),
    screenType: v.optional(v.string()),
    soundSystem: v.optional(v.string()),
    seating: v.optional(v.object({
      standard: v.number(),
      premium: v.number(),
      vip: v.number(),
    })),
    projectorLamp: v.optional(v.object({
      model: v.string(),
      currentHours: v.number(),
      maxHours: v.number(),
      lastReplacementDate: v.number(),
    })),
    preventiveMaintenance: v.optional(v.object({
      lastPreventiveA: v.optional(v.number()),
      lastPreventiveB: v.optional(v.number()),
      lastPreventiveC: v.optional(v.number()),
      nextPreventiveA: v.optional(v.number()),
      nextPreventiveB: v.optional(v.number()),
      nextPreventiveC: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return id;
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("rooms"),
    status: v.union(v.literal("active"), v.literal("maintenance"), v.literal("stopped")),
    statusReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, status, statusReason } = args;
    await ctx.db.patch(id, { status, statusReason });
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("rooms") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const updateLampHours = mutation({
  args: {
    id: v.id("rooms"),
    currentHours: v.number(),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.id);
    if (!room || !room.projectorLamp) return;

    const updatedLamp = {
      ...room.projectorLamp,
      currentHours: args.currentHours,
    };

    await ctx.db.patch(args.id, {
      projectorLamp: updatedLamp,
    });

    return args.id;
  },
});

export const replaceProjectorLamp = mutation({
  args: {
    id: v.id("rooms"),
    newModel: v.optional(v.string()),
    maxHours: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.id);
    if (!room || !room.projectorLamp) return;

    const updatedLamp = {
      model: args.newModel || room.projectorLamp.model,
      currentHours: 0,
      maxHours: args.maxHours || room.projectorLamp.maxHours,
      lastReplacementDate: Date.now(),
    };

    await ctx.db.patch(args.id, {
      projectorLamp: updatedLamp,
    });

    return args.id;
  },
});

export const updatePreventiveMaintenance = mutation({
  args: {
    id: v.id("rooms"),
    type: v.union(v.literal("A"), v.literal("B"), v.literal("C")),
    date: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.id);
    if (!room) return;

    const currentDate = args.date || Date.now();
    const preventiveMaintenance = room.preventiveMaintenance || {};

    // Calculate next maintenance dates
    const nextDates = {
      A: currentDate + (30 * 24 * 60 * 60 * 1000), // 30 days
      B: currentDate + (90 * 24 * 60 * 60 * 1000), // 90 days
      C: currentDate + (365 * 24 * 60 * 60 * 1000), // 365 days
    };

    const updates: any = { ...preventiveMaintenance };

    if (args.type === "A") {
      updates.lastPreventiveA = currentDate;
      updates.nextPreventiveA = nextDates.A;
    } else if (args.type === "B") {
      updates.lastPreventiveB = currentDate;
      updates.nextPreventiveB = nextDates.B;
    } else if (args.type === "C") {
      updates.lastPreventiveC = currentDate;
      updates.nextPreventiveC = nextDates.C;
    }

    await ctx.db.patch(args.id, {
      preventiveMaintenance: updates,
    });

    return args.id;
  },
});

export const getWithAlerts = query({
  args: { id: v.id("rooms") },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.id);
    if (!room) return null;

    // Add alerts based on room conditions
    const alerts: any[] = [];
    
    if (room.projectorLamp) {
      const usagePercent = (room.projectorLamp.currentHours / room.projectorLamp.maxHours) * 100;
      if (usagePercent >= 90) {
        alerts.push({
          type: "critical",
          message: "Lâmpada do projetor precisa ser substituída",
          priority: "high"
        });
      } else if (usagePercent >= 75) {
        alerts.push({
          type: "warning",
          message: "Lâmpada do projetor próxima do fim da vida útil",
          priority: "medium"
        });
      }
    }

    return {
      ...room,
      alerts
    };
  },
});
