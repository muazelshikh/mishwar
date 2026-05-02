import { pgTable, text, serial, timestamp, integer, real, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { groupTripsTable } from "./group_trips";

export const groupTripRegistrationsTable = pgTable("group_trip_registrations", {
  id: serial("id").primaryKey(),
  groupTripId: integer("group_trip_id").notNull().references(() => groupTripsTable.id),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  seatCount: integer("seat_count").notNull().default(1),
  totalPrice: real("total_price").notNull(),
  status: text("status", { enum: ["confirmed", "cancelled", "pending"] }).notNull().default("confirmed"),
  tripDate: date("trip_date").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertGroupTripRegistrationSchema = createInsertSchema(groupTripRegistrationsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertGroupTripRegistration = z.infer<typeof insertGroupTripRegistrationSchema>;
export type GroupTripRegistration = typeof groupTripRegistrationsTable.$inferSelect;
