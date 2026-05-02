import { pgTable, text, serial, timestamp, integer, real, boolean, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const rentalCarsTable = pgTable("rental_cars", {
  id: serial("id").primaryKey(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  plate: text("plate").notNull().unique(),
  vehicleType: text("vehicle_type", { enum: ["economy", "comfort", "xl", "suv", "luxury"] }).notNull(),
  dailyRate: real("daily_rate").notNull(),
  isAvailable: boolean("is_available").notNull().default(true),
  imageUrl: text("image_url"),
  features: text("features"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const rentalBookingsTable = pgTable("rental_bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  carId: integer("car_id").notNull().references(() => rentalCarsTable.id),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  totalDays: integer("total_days").notNull(),
  totalPrice: real("total_price").notNull(),
  status: text("status", { enum: ["pending", "confirmed", "active", "returned", "cancelled"] }).notNull().default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertRentalCarSchema = createInsertSchema(rentalCarsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertRentalCar = z.infer<typeof insertRentalCarSchema>;
export type RentalCar = typeof rentalCarsTable.$inferSelect;

export const insertRentalBookingSchema = createInsertSchema(rentalBookingsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertRentalBooking = z.infer<typeof insertRentalBookingSchema>;
export type RentalBooking = typeof rentalBookingsTable.$inferSelect;
