import { pgTable, integer, serial, timestamp, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { walletsTable } from "./wallets";
import { usersTable } from "./users";

export const walletTransactionsTable = pgTable("wallet_transactions", {
  id: serial("id").primaryKey(),
  walletId: integer("wallet_id").notNull().references(() => walletsTable.id),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  type: text("type", {
    enum: ["topup", "ride_payment", "subscription_payment", "rental_payment", "refund", "payout", "adjustment"],
  }).notNull(),
  amount: integer("amount").notNull(),
  balanceAfter: integer("balance_after").notNull(),
  status: text("status", { enum: ["pending", "completed", "failed", "reversed"] }).notNull().default("completed"),
  description: text("description"),
  referenceType: text("reference_type"),
  referenceId: integer("reference_id"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertWalletTransactionSchema = createInsertSchema(walletTransactionsTable).omit({ id: true, createdAt: true });
export type InsertWalletTransaction = z.infer<typeof insertWalletTransactionSchema>;
export type WalletTransaction = typeof walletTransactionsTable.$inferSelect;
