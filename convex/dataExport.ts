import { query } from "./_generated/server";

export const getCompleteData = query({
  args: {},
  handler: async (ctx) => {
    const cinemas = await ctx.db.query("cinemas").collect();
    const rooms = await ctx.db.query("rooms").collect();
    const equipment = await ctx.db.query("equipment").collect();
    const maintenanceRecords = await ctx.db.query("maintenanceRecords").collect();
    const sessionImpacts = await ctx.db.query("sessionImpacts").collect();
    const tasks = await ctx.db.query("tasks").collect();
    const events = await ctx.db.query("events").collect();
    const settings = await ctx.db.query("settings").collect();

    return {
      exportDate: Date.now(),
      cinemas,
      rooms,
      equipment,
      maintenanceRecords,
      sessionImpacts,
      tasks,
      events,
      settings,
    };
  },
});
