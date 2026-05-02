import { pgTable, integer, serial, timestamp, text, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { ridesTable } from "./rides";

export const ratingsTable = pgTable("ratings", {
  id: serial("id").primaryKey(),
  rideId: integer("ride_id").references(() => ridesTable.id),
  raterId: integer("rater_id").notNull().references(() => usersTable.id),
  ratedUserId: integer("rated_user_id").notNull().references(() => usersTable.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  uniqRaterRide: uniqueIndex("ratings_rater_ride_unique").on(table.raterId, table.rideId),
}));

export const insertRatingSchema = createInsertSchema(ratingsTable).omit({ id: true, createdAt: true });
export type InsertRating = z.infer<typeof insertRatingSchema>;
export type Rating = typeof ratingsTable.$inferSelect;
