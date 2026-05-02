import { Router } from "express";
import { db, ratingsTable, ridesTable, driversTable, usersTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { z } from "zod/v4";
import { requireAuth } from "../middlewares/auth";

const router = Router();

const createSchema = z.object({
  rideId: z.coerce.number().int().positive(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
}).strict();

router.post("/ratings", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    return;
  }
  const { rideId, rating, comment } = parsed.data;

  const [ride] = await db.select().from(ridesTable).where(eq(ridesTable.id, rideId)).limit(1);
  if (!ride) { res.status(404).json({ error: "Ride not found" }); return; }
  if (ride.status !== "completed") {
    res.status(400).json({ error: "Can only rate completed rides" });
    return;
  }

  let ratedUserId: number;
  if (ride.passengerId === userId) {
    if (!ride.driverId) { res.status(400).json({ error: "No driver assigned to ride" }); return; }
    const [driver] = await db.select().from(driversTable).where(eq(driversTable.id, ride.driverId)).limit(1);
    if (!driver) { res.status(404).json({ error: "Driver not found" }); return; }
    ratedUserId = driver.userId;
  } else {
    const [driver] = await db.select().from(driversTable).where(eq(driversTable.userId, userId)).limit(1);
    if (!driver || driver.id !== ride.driverId) {
      res.status(403).json({ error: "Not authorized to rate this ride" });
      return;
    }
    ratedUserId = ride.passengerId;
  }

  try {
    const [created] = await db.insert(ratingsTable).values({
      rideId, raterId: userId, ratedUserId, rating, comment: comment ?? null,
    }).returning();

    const result: any = await db.execute(sql`
      SELECT AVG(rating)::real AS avg, COUNT(*)::int AS cnt
      FROM ratings WHERE rated_user_id = ${ratedUserId}
    `);
    const row = (result.rows ?? result)[0];
    const avg = row?.avg ?? null;
    if (avg !== null) {
      await db.update(usersTable).set({ rating: avg }).where(eq(usersTable.id, ratedUserId));
      const [driverRow] = await db.select().from(driversTable).where(eq(driversTable.userId, ratedUserId)).limit(1);
      if (driverRow) {
        await db.update(driversTable).set({ rating: avg }).where(eq(driversTable.id, driverRow.id));
      }
    }

    res.status(201).json({ rating: created, newAverage: avg, totalRatings: row?.cnt ?? 0 });
  } catch (e: any) {
    const pgCode = e?.code ?? e?.cause?.code;
    const msg = String(e?.message ?? "");
    if (pgCode === "23505" || msg.includes("ratings_rater_ride_unique") || msg.includes("duplicate key")) {
      res.status(409).json({ error: "You already rated this ride" });
      return;
    }
    throw e;
  }
});

router.get("/ratings/user/:userId", requireAuth, async (req, res) => {
  const userId = parseInt(String(req.params.userId));
  if (isNaN(userId)) { res.status(400).json({ error: "Invalid userId" }); return; }
  const limit = Math.min(parseInt(String(req.query.limit ?? "50")), 100);
  const items = await db
    .select()
    .from(ratingsTable)
    .where(eq(ratingsTable.ratedUserId, userId))
    .orderBy(desc(ratingsTable.createdAt))
    .limit(limit);
  res.json({ items });
});

router.get("/ratings/ride/:rideId", requireAuth, async (req, res) => {
  const rideId = parseInt(String(req.params.rideId));
  if (isNaN(rideId)) { res.status(400).json({ error: "Invalid rideId" }); return; }
  const items = await db
    .select()
    .from(ratingsTable)
    .where(eq(ratingsTable.rideId, rideId));
  res.json({ items });
});

export default router;
