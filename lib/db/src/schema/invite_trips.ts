import { pgTable, text, serial, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const inviteTripsTable = pgTable("invite_trips", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").notNull().references(() => usersTable.id),
  title: text("title").notNull(),
  fromAddress: text("from_address").notNull(),
  toAddress: text("to_address").notNull(),
  vehicleType: text("vehicle_type", { enum: ["economy", "comfort", "xl", "bus", "van", "minibus"] }).notNull(),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
  inviteCode: text("invite_code").notNull().unique(),
  status: text("status", { enum: ["open", "confirmed", "completed", "cancelled"] }).notNull().default("open"),
  maxGuests: integer("max_guests").notNull().default(4),
  notes: text("notes"),
  estimatedPrice: real("estimated_price"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const inviteGuestsTable = pgTable("invite_guests", {
  id: serial("id").primaryKey(),
  inviteTripId: integer("invite_trip_id").notNull().references(() => inviteTripsTable.id),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  pickupAddress: text("pickup_address"),
  status: text("status", { enum: ["pending", "accepted", "declined"] }).notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertInviteTripSchema = createInsertSchema(inviteTripsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertInviteTrip = z.infer<typeof insertInviteTripSchema>;
export type InviteTrip = typeof inviteTripsTable.$inferSelect;

export const insertInviteGuestSchema = createInsertSchema(inviteGuestsTable).omit({ id: true, createdAt: true });
export type InsertInviteGuest = z.infer<typeof insertInviteGuestSchema>;
export type InviteGuest = typeof inviteGuestsTable.$inferSelect;
