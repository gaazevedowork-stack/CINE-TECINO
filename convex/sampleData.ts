import { mutation } from "./_generated/server";

export const createSampleData = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    // Create sample cinemas
    const morumbiId = await ctx.db.insert("cinemas", {
      name: "Morumbi Town",
      location: "Shopping Morumbi Town",
    });

    const freiCanecaId = await ctx.db.insert("cinemas", {
      name: "Frei Caneca",
      location: "Shopping Frei Caneca",
    });

    const hortolandiaId = await ctx.db.insert("cinemas", {
      name: "Hortolândia",
      location: "Shopping Hortolândia",
    });

    // Create sample rooms for Morumbi Town
    const room1Id = await ctx.db.insert("rooms", {
      cinemaId: morumbiId,
      name: "Sala 1",
      capacity: 150,
      status: "active",
      screenType: "2D/3D",
      soundSystem: "Dolby Atmos 7.1",
      nextPreventiveA: now + (30 * 24 * 60 * 60 * 1000),
      nextPreventiveB: now + (90 * 24 * 60 * 60 * 1000),
      nextPreventiveC: now + (365 * 24 * 60 * 60 * 1000),
    });

    const room2Id = await ctx.db.insert("rooms", {
      cinemaId: morumbiId,
      name: "Sala 2",
      capacity: 120,
      status: "active",
      screenType: "2D/3D",
      soundSystem: "Dolby Atmos 7.1",
      nextPreventiveA: now + (30 * 24 * 60 * 60 * 1000),
      nextPreventiveB: now + (90 * 24 * 60 * 60 * 1000),
      nextPreventiveC: now + (365 * 24 * 60 * 60 * 1000),
    });

    const room3Id = await ctx.db.insert("rooms", {
      cinemaId: morumbiId,
      name: "Sala 3",
      capacity: 200,
      status: "maintenance",
      screenType: "IMAX",
      soundSystem: "IMAX Sound System",
      nextPreventiveA: now + (30 * 24 * 60 * 60 * 1000),
      nextPreventiveB: now + (90 * 24 * 60 * 60 * 1000),
      nextPreventiveC: now + (365 * 24 * 60 * 60 * 1000),
    });

    // Create sample rooms for Frei Caneca
    const room4Id = await ctx.db.insert("rooms", {
      cinemaId: freiCanecaId,
      name: "Sala 1",
      capacity: 100,
      status: "active",
      screenType: "2D/3D",
      soundSystem: "Dolby Digital 5.1",
      nextPreventiveA: now + (30 * 24 * 60 * 60 * 1000),
      nextPreventiveB: now + (90 * 24 * 60 * 60 * 1000),
      nextPreventiveC: now + (365 * 24 * 60 * 60 * 1000),
    });

    const room5Id = await ctx.db.insert("rooms", {
      cinemaId: freiCanecaId,
      name: "Sala 2",
      capacity: 80,
      status: "active",
      screenType: "2D",
      soundSystem: "Dolby Digital 5.1",
      nextPreventiveA: now + (30 * 24 * 60 * 60 * 1000),
      nextPreventiveB: now + (90 * 24 * 60 * 60 * 1000),
      nextPreventiveC: now + (365 * 24 * 60 * 60 * 1000),
    });

    // Create sample rooms for Hortolândia
    const room6Id = await ctx.db.insert("rooms", {
      cinemaId: hortolandiaId,
      name: "Sala 1",
      capacity: 180,
      status: "active",
      screenType: "2D/3D/4DX",
      soundSystem: "Dolby Atmos 9.1",
      nextPreventiveA: now + (30 * 24 * 60 * 60 * 1000),
      nextPreventiveB: now + (90 * 24 * 60 * 60 * 1000),
      nextPreventiveC: now + (365 * 24 * 60 * 60 * 1000),
    });

    const room7Id = await ctx.db.insert("rooms", {
      cinemaId: hortolandiaId,
      name: "Sala 2",
      capacity: 90,
      status: "stopped",
      screenType: "2D",
      soundSystem: "Dolby Digital 5.1",
      nextPreventiveA: now + (30 * 24 * 60 * 60 * 1000),
      nextPreventiveB: now + (90 * 24 * 60 * 60 * 1000),
      nextPreventiveC: now + (365 * 24 * 60 * 60 * 1000),
    });

    // Create sample equipment
    await ctx.db.insert("equipment", {
      roomId: room1Id,
      cinemaId: morumbiId,
      name: "Projetor Christie CP2230",
      description: "Projetor digital cinema 2K com tecnologia DLP",
      category: "projection",
      status: "operational",
      serialNumber: "CP2230-001",
      model: "CP2230",
      manufacturer: "Christie",
      lumens: 4000,
      resolution: "2K (2048x1080)",
      lampHours: 1200,
      maxLampHours: 2000,
      installDate: now - (365 * 24 * 60 * 60 * 1000),
      cost: 85000,
    });

    await ctx.db.insert("equipment", {
      roomId: room1Id,
      cinemaId: morumbiId,
      name: "Processador de Som Dolby CP750",
      description: "Processador de áudio digital Dolby Atmos",
      category: "sound",
      status: "operational",
      serialNumber: "CP750-001",
      model: "CP750",
      manufacturer: "Dolby",
      channels: 16,
      power: 1000,
      frequency: "20Hz - 20kHz",
      installDate: now - (365 * 24 * 60 * 60 * 1000),
      cost: 25000,
    });

    await ctx.db.insert("equipment", {
      roomId: room1Id,
      cinemaId: morumbiId,
      name: "Ar Condicionado Central",
      description: "Sistema de climatização central para sala de cinema",
      category: "climate",
      status: "operational",
      serialNumber: "AC-001",
      model: "VRF-60",
      manufacturer: "Carrier",
      capacity_btu: 60000,
      temperature_range: "18°C - 24°C",
      installDate: now - (365 * 24 * 60 * 60 * 1000),
      cost: 15000,
    });

    // Create sample tasks
    await ctx.db.insert("tasks", {
      cinemaId: morumbiId,
      roomId: room1Id,
      title: "Limpeza semanal da sala",
      description: "Limpeza completa da sala incluindo poltronas e tela",
      priority: "medium",
      status: "todo",
      category: "cleaning",
      dueDate: now + (7 * 24 * 60 * 60 * 1000),
      estimatedHours: 2,
    });

    await ctx.db.insert("tasks", {
      cinemaId: morumbiId,
      roomId: room3Id,
      title: "Manutenção preventiva do projetor",
      description: "Verificação e limpeza do sistema de projeção IMAX",
      priority: "high",
      status: "in_progress",
      category: "preventive_a",
      dueDate: now + (2 * 24 * 60 * 60 * 1000),
      estimatedHours: 4,
    });

    // Create sample events
    await ctx.db.insert("events", {
      cinemaId: morumbiId,
      roomId: room2Id,
      title: "Manutenção preventiva mensal",
      description: "Verificação geral dos equipamentos",
      startTime: now + (3 * 24 * 60 * 60 * 1000),
      endTime: now + (3 * 24 * 60 * 60 * 1000) + (4 * 60 * 60 * 1000),
      type: "preventive",
      status: "scheduled",
      priority: "medium",
    });

    return "Sample data created successfully!";
  },
});
