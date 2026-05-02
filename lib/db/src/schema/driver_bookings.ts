import { pgTable, text, serial, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { driversTable } from "./drivers";

export const driverBookingsTable = pgTable("driver_bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  driverId: integer("driver_id").references(() => driversTable.id),
  purpose: text("purpose").notNull(),
  startDatetime: timestamp("start_datetime", { withTimezone: true }).notNull(),
  endDatetime: timestamp("end_datetime", { withTimezone: true }).notNull(),
  location: text("location").notNull(),
  totalHours: real("total_hours").notNull(),
  totalPrice: real("total_price").notNull(),
  status: text("status", { enum: ["pending", "confirmed", "active", "completed", "cancelled"] }).notNull().default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertDriverBookingSchema = createInsertSchema(driverBookingsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertDriverBooking = z.infer<typeof insertDriverBookingSchema>;
export type DriverBooking = typeof driverBookingsTable.$inferSelect;
