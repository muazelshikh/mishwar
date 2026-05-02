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

  try {
    const result = await db.transaction(async (tx) => {
      const [ride] = await tx.select().from(ridesTable).where(eq(ridesTable.id, rideId)).limit(1);
      if (!ride) return { error: "not_found" as const };
      if (ride.status !== "completed") return { error: "not_completed" as const };

      let ratedUserId: number;
      if (ride.passengerId === userId) {
        if (!ride.driverId) return { error: "no_driver" as const };
        const [driver] = await tx.select().from(driversTable).where(eq(driversTable.id, ride.driverId)).limit(1);
        if (!driver) return { error: "driver_missing" as const };
        ratedUserId = driver.userId;
      } else {
        const [driver] = await tx.select().from(driversTable).where(eq(driversTable.userId, userId)).limit(1);
        if (!driver || driver.id !== ride.driverId) return { error: "forbidden" as const };
        ratedUserId = ride.passengerId;
      }

      // Block self-rating defensively even if data is corrupt
      if (ratedUserId === userId) return { error: "self_rating" as const };

      const [created] = await tx.insert(ratingsTable).values({
        rideId, raterId: userId, ratedUserId, rating, comment: comment ?? null,
      }).returning();

      // Recompute average inside the same transaction so concurrent rating inserts
      // (different riders rating the same driver) all see consistent values
      const aggResult: any = await tx.execute(sql`
        SELECT AVG(rating)::real AS avg, COUNT(*)::int AS cnt
        FROM ratings WHERE rated_user_id = ${ratedUserId}
      `);
      const row = (aggResult.rows ?? aggResult)[0];
      const avg = row?.avg ?? null;

      if (avg !== null) {
        await tx.update(usersTable).set({ rating: avg }).where(eq(usersTable.id, ratedUserId));
        const [driverRow] = await tx.select().from(driversTable).where(eq(driversTable.userId, ratedUserId)).limit(1);
        if (driverRow) {
          await tx.update(driversTable).set({ rating: avg }).where(eq(driversTable.id, driverRow.id));
        }
      }

      return { ok: true as const, rating: created, newAverage: avg, totalRatings: row?.cnt ?? 0 };
    });

    if ("error" in result && result.error) {
      const map: Record<string, { status: number; msg: string }> = {
        not_found: { status: 404, msg: "Ride not found" },
        not_completed: { status: 400, msg: "Can only rate completed rides" },
        no_driver: { status: 400, msg: "No driver assigned to ride" },
        driver_missing: { status: 404, msg: "Driver not found" },
        forbidden: { status: 403, msg: "Not authorized to rate this ride" },
        self_rating: { status: 400, msg: "Cannot rate yourself" },
      };
      const m = map[result.error] ?? { status: 500, msg: "Unknown error" };
      res.status(m.status).json({ error: m.msg });
      return;
    }

    if ("ok" in result && result.ok) {
      res.status(201).json({ rating: result.rating, newAverage: result.newAverage, totalRatings: result.totalRatings });
    }
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
