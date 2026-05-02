import { pgTable, text, serial, timestamp, integer, real, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { groupTripsTable } from "./group_trips";

export const subscriptionsTable = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  groupTripId: integer("group_trip_id").notNull().references(() => groupTripsTable.id),
  subscriptionType: text("subscription_type", { enum: ["weekly", "monthly"] }).notNull(),
  seatCount: integer("seat_count").notNull().default(1),
  pricePerPeriod: real("price_per_period").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  status: text("status", { enum: ["active", "paused", "cancelled"] }).notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptionsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptionsTable.$inferSelect;
