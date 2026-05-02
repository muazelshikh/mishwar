import { pgTable, integer, serial, timestamp, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const paymentsTable = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  amount: integer("amount").notNull(),
  currency: text("currency", { enum: ["SAR", "SDG", "USD"] }).notNull().default("SAR"),
  purpose: text("purpose", {
    enum: ["wallet_topup", "ride_direct", "subscription", "rental", "invoice"],
  }).notNull(),
  status: text("status", {
    enum: ["pending", "processing", "succeeded", "failed", "refunded", "canceled"],
  }).notNull().default("pending"),
  provider: text("provider", { enum: ["stripe", "manual"] }).notNull().default("stripe"),
  stripePaymentIntentId: text("stripe_payment_intent_id").unique(),
  stripeCheckoutSessionId: text("stripe_checkout_session_id").unique(),
  referenceType: text("reference_type"),
  referenceId: integer("reference_id"),
  failureReason: text("failure_reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertPaymentSchema = createInsertSchema(paymentsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof paymentsTable.$inferSelect;
