import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("cinemas").collect();
  },
});

export const get = query({
  args: { id: v.id("cinemas") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    location: v.string(),
    totalRooms: v.optional(v.number()),
    activeRooms: v.optional(v.number()),
    availability: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("cinemas", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("cinemas"),
    name: v.optional(v.string()),
    location: v.optional(v.string()),
    totalRooms: v.optional(v.number()),
    activeRooms: v.optional(v.number()),
    availability: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("cinemas") },
  handler: async (ctx, args) => {
    // Get all rooms for this cinema
    const rooms = await ctx.db
      .query("rooms")
      .withIndex("by_cinema", (q) => q.eq("cinemaId", args.id))
      .collect();

    // Remove all related data for each room
    for (const room of rooms) {
      // Remove equipment
      const equipment = await ctx.db
        .query("equipment")
        .withIndex("by_room", (q) => q.eq("roomId", room._id))
        .collect();
      
      for (const eq of equipment) {
        await ctx.db.delete(eq._id);
      }

      // Remove maintenance records
      const maintenanceRecords = await ctx.db
        .query("maintenanceRecords")
        .withIndex("by_room", (q) => q.eq("roomId", room._id))
        .collect();
      
      for (const record of maintenanceRecords) {
        await ctx.db.delete(record._id);
      }

      // Remove session impacts
      const sessionImpacts = await ctx.db
        .query("sessionImpacts")
        .withIndex("by_room", (q) => q.eq("roomId", room._id))
        .collect();
      
      for (const impact of sessionImpacts) {
        await ctx.db.delete(impact._id);
      }

      // Remove the room
      await ctx.db.delete(room._id);
    }

    // Remove cinema-level data
    const cinemaTasks = await ctx.db
      .query("tasks")
      .withIndex("by_cinema", (q) => q.eq("cinemaId", args.id))
      .collect();
    
    for (const task of cinemaTasks) {
      await ctx.db.delete(task._id);
    }

    const cinemaEvents = await ctx.db
      .query("events")
      .withIndex("by_cinema", (q) => q.eq("cinemaId", args.id))
      .collect();
    
    for (const event of cinemaEvents) {
      await ctx.db.delete(event._id);
    }

    // Finally remove the cinema
    return await ctx.db.delete(args.id);
  },
});

export const updateStats = mutation({
  args: { id: v.id("cinemas") },
  handler: async (ctx, args) => {
    const rooms = await ctx.db
      .query("rooms")
      .withIndex("by_cinema", (q) => q.eq("cinemaId", args.id))
      .collect();

    const totalRooms = rooms.length;
    const activeRooms = rooms.filter(room => room.status === "active").length;
    const availability = totalRooms > 0 ? Math.round((activeRooms / totalRooms) * 100) : 0;

    // Return cinema with calculated stats (not stored in DB)
    const cinema = await ctx.db.get(args.id);
    return {
      ...cinema,
      totalRooms,
      activeRooms,
      availability,
    };
  },
});
