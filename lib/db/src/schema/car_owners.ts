import { pgTable, text, serial, timestamp, integer, real, json, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const carOwnersTable = pgTable("car_owners", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id).unique(),
  ownerType: text("owner_type", { enum: ["individual", "company"] }).notNull().default("individual"),
  companyName: text("company_name"),
  commercialReg: text("commercial_reg"),
  nationalId: text("national_id"),
  bankAccount: json("bank_account").$type<{ bankName: string; iban: string; accountHolder: string }>(),
  status: text("status", { enum: ["pending", "approved", "suspended", "active"] }).notNull().default("pending"),
  totalVehicles: integer("total_vehicles").notNull().default(0),
  totalEarnings: real("total_earnings").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const ownerVehiclesTable = pgTable("owner_vehicles", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").notNull().references(() => carOwnersTable.id),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  plateNumber: text("plate_number").notNull(),
  color: text("color").notNull().default("أبيض"),
  category: text("category", { enum: ["economy", "comfort", "xl", "vip"] }).notNull().default("economy"),
  operationModel: text("operation_model", { enum: ["daily_rental", "revenue_share", "rental_only", "hybrid"] }).notNull().default("revenue_share"),
  dailyRentalAmount: real("daily_rental_amount"),
  ownerSharePercent: real("owner_share_percent").default(30),
  driverSharePercent: real("driver_share_percent").default(60),
  platformSharePercent: real("platform_share_percent").default(10),
  isActive: boolean("is_active").notNull().default(true),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const ownerEarningsTable = pgTable("owner_earnings", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").notNull().references(() => carOwnersTable.id),
  vehicleId: integer("vehicle_id").references(() => ownerVehiclesTable.id),
  earningType: text("earning_type", { enum: ["daily_rental", "trip_share", "rental_share", "bonus"] }).notNull(),
  amount: real("amount").notNull(),
  description: text("description"),
  earningDate: timestamp("earning_date", { withTimezone: true }).notNull().defaultNow(),
  paymentStatus: text("payment_status", { enum: ["pending", "paid"] }).notNull().default("pending"),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCarOwnerSchema = createInsertSchema(carOwnersTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertOwnerVehicleSchema = createInsertSchema(ownerVehiclesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type CarOwner = typeof carOwnersTable.$inferSelect;
export type OwnerVehicle = typeof ownerVehiclesTable.$inferSelect;
export type InsertCarOwner = z.infer<typeof insertCarOwnerSchema>;
export type InsertOwnerVehicle = z.infer<typeof insertOwnerVehicleSchema>;
