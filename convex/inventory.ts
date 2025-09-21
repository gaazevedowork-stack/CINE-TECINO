import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByCinema = query({
  args: { cinemaId: v.id("cinemas") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("inventory")
      .withIndex("by_cinema", (q) => q.eq("cinemaId", args.cinemaId))
      .collect();
  },
});

export const create = mutation({
  args: {
    cinemaId: v.id("cinemas"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    quantity: v.optional(v.number()),
    category: v.optional(v.string()),
    location: v.optional(v.string()),
    minQuantity: v.optional(v.number()),
    cost: v.optional(v.number()),
    supplier: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("inventory", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("inventory"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    quantity: v.optional(v.number()),
    category: v.optional(v.string()),
    location: v.optional(v.string()),
    minQuantity: v.optional(v.number()),
    cost: v.optional(v.number()),
    supplier: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("inventory") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const getLowStockItems = query({
  args: { cinemaId: v.id("cinemas") },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("inventory")
      .withIndex("by_cinema", (q) => q.eq("cinemaId", args.cinemaId))
      .collect();
    
    return items.filter(item => 
      item.quantity !== undefined && 
      item.minQuantity !== undefined && 
      item.quantity <= item.minQuantity
    );
  },
});
