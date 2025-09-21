/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as cinemas from "../cinemas.js";
import type * as clearOldData from "../clearOldData.js";
import type * as dataExport from "../dataExport.js";
import type * as equipment from "../equipment.js";
import type * as events from "../events.js";
import type * as http from "../http.js";
import type * as inventory from "../inventory.js";
import type * as maintenanceHistory from "../maintenanceHistory.js";
import type * as maintenanceRecords from "../maintenanceRecords.js";
import type * as reports from "../reports.js";
import type * as rooms from "../rooms.js";
import type * as router from "../router.js";
import type * as sampleData from "../sampleData.js";
import type * as sessionImpacts from "../sessionImpacts.js";
import type * as settings from "../settings.js";
import type * as tasks from "../tasks.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  cinemas: typeof cinemas;
  clearOldData: typeof clearOldData;
  dataExport: typeof dataExport;
  equipment: typeof equipment;
  events: typeof events;
  http: typeof http;
  inventory: typeof inventory;
  maintenanceHistory: typeof maintenanceHistory;
  maintenanceRecords: typeof maintenanceRecords;
  reports: typeof reports;
  rooms: typeof rooms;
  router: typeof router;
  sampleData: typeof sampleData;
  sessionImpacts: typeof sessionImpacts;
  settings: typeof settings;
  tasks: typeof tasks;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
