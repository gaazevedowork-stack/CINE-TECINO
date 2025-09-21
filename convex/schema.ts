import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  cinemas: defineTable({
    name: v.string(),
    location: v.string(),
    // Temporary fields to allow old data
    totalRooms: v.optional(v.number()),
    activeRooms: v.optional(v.number()),
    availability: v.optional(v.number()),
  }),
  
  rooms: defineTable({
    cinemaId: v.id("cinemas"),
    name: v.optional(v.string()),
    location: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("maintenance"), v.literal("stopped")),
    statusReason: v.optional(v.string()), // Reason for maintenance or stopped status
    screenType: v.optional(v.string()),
    soundSystem: v.optional(v.string()),
    
    // Detailed seating structure
    seating: v.optional(v.object({
      standard: v.number(),
      premium: v.number(),
      vip: v.number(),
    })),
    
    // Projector lamp tracking
    projectorLamp: v.optional(v.object({
      model: v.string(),
      currentHours: v.number(),
      maxHours: v.number(),
      lastReplacementDate: v.number(),
    })),
    
    // Preventive maintenance tracking
    preventiveMaintenance: v.optional(v.object({
      lastPreventiveA: v.optional(v.number()), // 30 days
      lastPreventiveB: v.optional(v.number()), // 90 days
      lastPreventiveC: v.optional(v.number()), // 365 days
      nextPreventiveA: v.optional(v.number()),
      nextPreventiveB: v.optional(v.number()),
      nextPreventiveC: v.optional(v.number()),
    })),
    
    // Legacy fields for backward compatibility
    capacity: v.optional(v.number()),
    lastPreventiveA: v.optional(v.number()),
    lastPreventiveB: v.optional(v.number()),
    lastPreventiveC: v.optional(v.number()),
    nextPreventiveA: v.optional(v.number()),
    nextPreventiveB: v.optional(v.number()),
    nextPreventiveC: v.optional(v.number()),
    number: v.optional(v.number()),
    projector: v.optional(v.string()),
    projectorLampModel: v.optional(v.string()),
    projectorLampHours: v.optional(v.number()),
    projectorLampMaxHours: v.optional(v.number()),
    projectorType: v.optional(v.string()),
    projectorIp: v.optional(v.string()),
    server: v.optional(v.string()),
    additionalInfo: v.optional(v.string()),
    amplifiers: v.optional(v.string()),
  })
    .index("by_cinema", ["cinemaId"])
    .index("by_status", ["status"]),

  maintenanceHistory: defineTable({
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
  })
    .index("by_room", ["roomId"])
    .index("by_cinema", ["cinemaId"])
    .index("by_type", ["type"])
    .index("by_date", ["date"]),

  inventory: defineTable({
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
  })
    .index("by_cinema", ["cinemaId"])
    .index("by_category", ["category"]),

  equipment: defineTable({
    roomId: v.id("rooms"),
    cinemaId: v.id("cinemas"),
    name: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("projection"), 
      v.literal("sound"), 
      v.literal("climate"), 
      v.literal("electrical"), 
      v.literal("network"),
      v.literal("other")
    ),
    status: v.union(v.literal("operational"), v.literal("maintenance"), v.literal("replacement")),
    ipAddress: v.optional(v.string()),
    installDate: v.optional(v.number()),
    cost: v.optional(v.number()),
    lastMaintenance: v.optional(v.number()),
    nextMaintenance: v.optional(v.number()),
    // Specific fields for different equipment types
    serialNumber: v.optional(v.string()),
    model: v.optional(v.string()),
    manufacturer: v.optional(v.string()),
    // Projector specific
    lumens: v.optional(v.number()),
    resolution: v.optional(v.string()),
    lampHours: v.optional(v.number()),
    maxLampHours: v.optional(v.number()),
    // Sound specific
    channels: v.optional(v.number()),
    power: v.optional(v.number()),
    frequency: v.optional(v.string()),
    // Climate specific
    capacity_btu: v.optional(v.number()),
    temperature_range: v.optional(v.string()),
    // Network specific
    mac_address: v.optional(v.string()),
    ip_range: v.optional(v.string()),
    port_count: v.optional(v.number()),
  })
    .index("by_room", ["roomId"])
    .index("by_cinema", ["cinemaId"])
    .index("by_category", ["category"])
    .index("by_status", ["status"]),

  tasks: defineTable({
    cinemaId: v.id("cinemas"),
    roomId: v.optional(v.id("rooms")),
    equipmentId: v.optional(v.id("equipment")),
    title: v.string(),
    description: v.string(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    status: v.union(v.literal("todo"), v.literal("in_progress"), v.literal("done")),
    assignedTo: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    category: v.union(
      v.literal("maintenance"), 
      v.literal("cleaning"), 
      v.literal("inspection"), 
      v.literal("repair"),
      v.literal("preventive_a"),
      v.literal("preventive_b"),
      v.literal("preventive_c"),
      v.literal("other")
    ),
    estimatedHours: v.optional(v.number()),
    actualHours: v.optional(v.number()),
    cost: v.optional(v.number()),
  })
    .index("by_cinema", ["cinemaId"])
    .index("by_room", ["roomId"])
    .index("by_status", ["status"])
    .index("by_priority", ["priority"])
    .index("by_category", ["category"]),

  events: defineTable({
    cinemaId: v.id("cinemas"),
    roomId: v.optional(v.id("rooms")),
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.number(),
    endTime: v.number(),
    type: v.union(
      v.literal("maintenance"), 
      v.literal("cleaning"), 
      v.literal("inspection"), 
      v.literal("meeting"),
      v.literal("preventive"),
      v.literal("events"),
      v.literal("other")
    ),
    status: v.union(v.literal("scheduled"), v.literal("in_progress"), v.literal("completed"), v.literal("cancelled")),
    assignedTo: v.optional(v.string()),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
  })
    .index("by_cinema", ["cinemaId"])
    .index("by_room", ["roomId"])
    .index("by_start_time", ["startTime"])
    .index("by_status", ["status"]),

  maintenanceRecords: defineTable({
    cinemaId: v.id("cinemas"),
    roomId: v.id("rooms"),
    equipmentId: v.optional(v.id("equipment")),
    taskId: v.optional(v.id("tasks")),
    type: v.union(v.literal("corrective"), v.literal("preventive"), v.literal("predictive")),
    category: v.union(
      v.literal("projection"), 
      v.literal("sound"), 
      v.literal("climate"), 
      v.literal("electrical"), 
      v.literal("network"),
      v.literal("cleaning"),
      v.literal("preventive_a"),
      v.literal("preventive_b"),
      v.literal("preventive_c"),
      v.literal("other")
    ),
    description: v.string(),
    startTime: v.number(),
    endTime: v.optional(v.number()),
    status: v.union(v.literal("scheduled"), v.literal("in_progress"), v.literal("completed"), v.literal("cancelled")),
    technician: v.optional(v.string()),
    cost: v.optional(v.number()),
    downtime: v.optional(v.number()), // minutes
    notes: v.optional(v.string()),
    partsUsed: v.optional(v.array(v.string())),
  })
    .index("by_cinema", ["cinemaId"])
    .index("by_room", ["roomId"])
    .index("by_equipment", ["equipmentId"])
    .index("by_type", ["type"])
    .index("by_category", ["category"])
    .index("by_status", ["status"]),

  sessionImpacts: defineTable({
    cinemaId: v.id("cinemas"),
    roomId: v.id("rooms"),
    date: v.number(),
    sessionTime: v.string(),
    movieTitle: v.optional(v.string()),
    impactType: v.union(v.literal("cancelled"), v.literal("delayed"), v.literal("interrupted")),
    cause: v.union(
      v.literal("projection"), 
      v.literal("sound"), 
      v.literal("climate"), 
      v.literal("electrical"), 
      v.literal("network"),
      v.literal("other")
    ),
    description: v.string(),
    delayMinutes: v.optional(v.number()),
    affectedCustomers: v.optional(v.number()),
    refundAmount: v.optional(v.number()),
    resolved: v.boolean(),
    resolutionTime: v.optional(v.number()),
  })
    .index("by_cinema", ["cinemaId"])
    .index("by_room", ["roomId"])
    .index("by_date", ["date"])
    .index("by_impact_type", ["impactType"]),

  settings: defineTable({
    key: v.string(),
    value: v.string(),
  }).index("by_key", ["key"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
