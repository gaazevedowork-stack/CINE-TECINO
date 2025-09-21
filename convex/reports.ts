import { query } from "./_generated/server";
import { v } from "convex/values";

export const getTechnicalReport = query({
  args: {
    cinemaId: v.optional(v.id("cinemas")),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    // Get all relevant data
    const cinemas = args.cinemaId 
      ? [await ctx.db.get(args.cinemaId)].filter(Boolean)
      : await ctx.db.query("cinemas").collect();
    
    const rooms = args.cinemaId
      ? await ctx.db.query("rooms").withIndex("by_cinema", (q) => q.eq("cinemaId", args.cinemaId!)).collect()
      : await ctx.db.query("rooms").collect();
    
    const equipment = args.cinemaId
      ? await ctx.db.query("equipment").withIndex("by_cinema", (q) => q.eq("cinemaId", args.cinemaId!)).collect()
      : await ctx.db.query("equipment").collect();
    
    const maintenanceRecords = await ctx.db.query("maintenanceRecords").collect();
    const filteredMaintenance = maintenanceRecords.filter(r => 
      r.startTime >= args.startDate && 
      r.startTime <= args.endDate &&
      (!args.cinemaId || r.cinemaId === args.cinemaId)
    );
    
    const sessionImpacts = await ctx.db.query("sessionImpacts").collect();
    const filteredImpacts = sessionImpacts.filter(i => 
      i.date >= args.startDate && 
      i.date <= args.endDate &&
      (!args.cinemaId || i.cinemaId === args.cinemaId)
    );
    
    // Calculate room availability
    const roomAvailability = rooms.map(room => {
      const roomMaintenance = filteredMaintenance.filter(m => m.roomId === room._id);
      const totalDowntime = roomMaintenance.reduce((sum, m) => sum + (m.downtime || 0), 0);
      const periodDuration = args.endDate - args.startDate;
      const availabilityPercent = Math.max(0, 100 - (totalDowntime / (periodDuration / 1000 / 60) * 100));
      
      return {
        ...room,
        availabilityPercent: Math.round(availabilityPercent * 100) / 100,
        totalDowntime: Math.round(totalDowntime / 60), // hours
        maintenanceCount: roomMaintenance.length,
      };
    });
    
    // Calculate equipment alerts
    const now = Date.now();
    const criticalEquipment = equipment.filter(eq => {
      const thirtyDaysFromNow = now + (30 * 24 * 60 * 60 * 1000);
      return (eq.nextMaintenance && eq.nextMaintenance <= thirtyDaysFromNow) ||
             eq.status === "maintenance" || 
             eq.status === "replacement";
    });
    
    // Maintenance statistics
    const completedMaintenance = filteredMaintenance.filter(m => m.status === "completed" && m.endTime);
    const avgResolutionTime = completedMaintenance.length > 0
      ? completedMaintenance.reduce((sum, m) => sum + (m.endTime! - m.startTime), 0) / completedMaintenance.length
      : 0;
    
    // Group maintenance by category
    const maintenanceByCategory = filteredMaintenance.reduce((acc, m) => {
      acc[m.category] = (acc[m.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Session impact statistics
    const impactsByType = filteredImpacts.reduce((acc, i) => {
      acc[i.impactType] = (acc[i.impactType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const impactsByCause = filteredImpacts.reduce((acc, i) => {
      acc[i.cause] = (acc[i.cause] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Cinema comparison
    const cinemaStats = cinemas.filter(cinema => cinema !== null).map(cinema => {
      const cinemaRooms = rooms.filter(r => r.cinemaId === cinema!._id);
      const cinemaMaintenance = filteredMaintenance.filter(m => m.cinemaId === cinema!._id);
      const cinemaImpacts = filteredImpacts.filter(i => i.cinemaId === cinema!._id);
      
      const avgAvailability = cinemaRooms.length > 0
        ? roomAvailability
            .filter(r => r.cinemaId === cinema!._id)
            .reduce((sum, r) => sum + r.availabilityPercent, 0) / cinemaRooms.length
        : 0;
      
      return {
        ...cinema,
        roomCount: cinemaRooms.length,
        maintenanceCount: cinemaMaintenance.length,
        impactCount: cinemaImpacts.length,
        avgAvailability: Math.round(avgAvailability * 100) / 100,
        operationalRooms: cinemaRooms.filter(r => r.status === "active").length,
      };
    });
    
    return {
      period: {
        startDate: args.startDate,
        endDate: args.endDate,
      },
      summary: {
        totalCinemas: cinemas.length,
        totalRooms: rooms.length,
        totalEquipment: equipment.length,
        criticalAlerts: criticalEquipment.length,
        totalMaintenance: filteredMaintenance.length,
        totalImpacts: filteredImpacts.length,
        avgResolutionTimeHours: Math.round(avgResolutionTime / (1000 * 60 * 60) * 100) / 100,
      },
      roomAvailability,
      criticalEquipment,
      maintenanceStats: {
        byCategory: maintenanceByCategory,
        totalCost: filteredMaintenance.reduce((sum, m) => sum + (m.cost || 0), 0),
        totalDowntime: Math.round(filteredMaintenance.reduce((sum, m) => sum + (m.downtime || 0), 0) / 60),
      },
      sessionImpacts: {
        byType: impactsByType,
        byCause: impactsByCause,
        totalDelayMinutes: filteredImpacts.reduce((sum, i) => sum + (i.delayMinutes || 0), 0),
      },
      cinemaComparison: cinemaStats,
    };
  },
});
