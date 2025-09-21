import { mutation } from "./_generated/server";

export const clearAllData = mutation({
  args: {},
  handler: async (ctx) => {
    // Clear all tables to start fresh with new schema
    const tables = ["cinemas", "rooms", "equipment", "tasks", "events", "maintenanceRecords", "sessionImpacts"];
    
    for (const tableName of tables) {
      const documents = await ctx.db.query(tableName as any).collect();
      for (const doc of documents) {
        await ctx.db.delete(doc._id);
      }
    }
    
    return "All data cleared successfully";
  },
});
