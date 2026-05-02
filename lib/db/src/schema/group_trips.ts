import { pgTable, text, serial, timestamp, integer, real, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { driversTable } from "./drivers";

export const groupTripsTable = pgTable("group_trips", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  fromCity: text("from_city").notNull(),
  toCity: text("to_city").notNull(),
  fromAddress: text("from_address").notNull(),
  toAddress: text("to_address").notNull(),
  departureTime: text("departure_time").notNull(),
  scheduleType: text("schedule_type", { enum: ["weekly", "monthly", "one_time"] }).notNull(),
  scheduleDays: text("schedule_days"),
  scheduleDay: integer("schedule_day"),
  capacity: integer("capacity").notNull(),
  pricePerSeat: real("price_per_seat").notNull(),
  vehicleType: text("vehicle_type", { enum: ["bus", "van", "minibus"] }).notNull(),
  driverId: integer("driver_id").references(() => driversTable.id),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertGroupTripSchema = createInsertSchema(groupTripsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertGroupTrip = z.infer<typeof insertGroupTripSchema>;
export type GroupTrip = typeof groupTripsTable.$inferSelect;
