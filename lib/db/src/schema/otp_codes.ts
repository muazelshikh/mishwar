import { pgTable, integer, serial, timestamp, text, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const otpCodesTable = pgTable("otp_codes", {
  id: serial("id").primaryKey(),
  phone: text("phone").notNull(),
  codeHash: text("code_hash").notNull(),
  purpose: text("purpose", { enum: ["login", "signup", "reset", "verify_phone"] }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  attempts: integer("attempts").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  phoneIdx: index("otp_phone_created_idx").on(table.phone, table.createdAt),
}));

export const insertOtpCodeSchema = createInsertSchema(otpCodesTable).omit({ id: true, createdAt: true });
export type InsertOtpCode = z.infer<typeof insertOtpCodeSchema>;
export type OtpCode = typeof otpCodesTable.$inferSelect;
