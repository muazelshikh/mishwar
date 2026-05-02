import { pgTable, text, serial, timestamp, integer, real, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { driversTable } from "./drivers";

export const SERVICE_TYPES = [
  "solo",
  "group",
  "invite",
  "interstate",
  "loved_ones",
  "delivery",
  "school",
  "medical",
  "corporate",
  "hajj_umrah",
  "tourism",
  "events",
  "rental",
  "hire_driver",
] as const;

export type ServiceType = typeof SERVICE_TYPES[number];

export const ridesTable = pgTable("rides", {
  id: serial("id").primaryKey(),
  passengerId: integer("passenger_id").notNull().references(() => usersTable.id),
  driverId: integer("driver_id").references(() => driversTable.id),
  fromAddress: text("from_address").notNull(),
  toAddress: text("to_address").notNull(),
  fromLat: real("from_lat"),
  fromLng: real("from_lng"),
  toLat: real("to_lat"),
  toLng: real("to_lng"),
  status: text("status", { enum: ["pending", "accepted", "in_progress", "completed", "cancelled"] }).notNull().default("pending"),
  estimatedPrice: real("estimated_price"),
  finalPrice: real("final_price"),
  vehicleType: text("vehicle_type", { enum: ["economy", "comfort", "xl"] }).notNull().default("economy"),
  serviceType: text("service_type", { enum: SERVICE_TYPES }).notNull().default("solo"),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertRideSchema = createInsertSchema(ridesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertRide = z.infer<typeof insertRideSchema>;
export type Ride = typeof ridesTable.$inferSelect;
