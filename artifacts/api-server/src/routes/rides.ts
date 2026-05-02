import { Router } from "express";
import { db, ridesTable, driversTable, usersTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { CreateRideBody, UpdateRideBody, ListRidesQueryParams } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router = Router();

async function enrichRide(ride: typeof ridesTable.$inferSelect) {
  if (!ride.driverId) return { ...ride, driver: null };
  const [row] = await db.select({
    driver: driversTable,
    user: { name: usersTable.name, phone: usersTable.phone, avatarUrl: usersTable.avatarUrl }
  })
    .from(driversTable)
    .leftJoin(usersTable, eq(driversTable.userId, usersTable.id))
    .where(eq(driversTable.id, ride.driverId))
    .limit(1);

  if (!row) return { ...ride, driver: null };
  return { ...ride, driver: { ...row.driver, name: row.user?.name ?? "", phone: row.user?.phone ?? "", avatarUrl: row.user?.avatarUrl ?? null } };
}

router.get("/rides", requireAuth, async (req, res) => {
  const authReq = req as typeof req & { user: { id: number; role: string } };
  const query = ListRidesQueryParams.safeParse(req.query);
  const limit = query.success ? (query.data.limit ?? 20) : 20;
  const offset = query.success ? (query.data.offset ?? 0) : 0;
  const status = query.success ? query.data.status : undefined;

  const conditions = authReq.user.role === "admin"
    ? (status ? [eq(ridesTable.status, status)] : [])
    : [eq(ridesTable.passengerId, authReq.user.id), ...(status ? [eq(ridesTable.status, status)] : [])];

  const rows = await db.select().from(ridesTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(ridesTable.createdAt))
    .limit(limit)
    .offset(offset);

  const items = await Promise.all(rows.map(enrichRide));
  res.json({ items, total: items.length });
});

router.post("/rides", requireAuth, async (req, res) => {
  const authReq = req as typeof req & { user: { id: number } };
  const parsed = CreateRideBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const estimatedPrice = Math.round(15 + Math.random() * 35);
  const [ride] = await db.insert(ridesTable).values({
    passengerId: authReq.user.id,
    estimatedPrice,
    ...parsed.data,
  }).returning();

  res.status(201).json(await enrichRide(ride));
});

router.get("/rides/:rideId", requireAuth, async (req, res) => {
  const rideId = parseInt(String(req.params.rideId));
  if (isNaN(rideId)) { res.status(400).json({ error: "Invalid rideId" }); return; }

  const [ride] = await db.select().from(ridesTable).where(eq(ridesTable.id, rideId)).limit(1);
  if (!ride) { res.status(404).json({ error: "Ride not found" }); return; }

  res.json(await enrichRide(ride));
});

router.patch("/rides/:rideId", requireAuth, async (req, res) => {
  const rideId = parseInt(String(req.params.rideId));
  if (isNaN(rideId)) { res.status(400).json({ error: "Invalid rideId" }); return; }

  const parsed = UpdateRideBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const updates: Partial<typeof ridesTable.$inferInsert> = { ...parsed.data };
  if (parsed.data.status === "completed") {
    updates.completedAt = new Date();
  }

  const [ride] = await db.update(ridesTable).set(updates).where(eq(ridesTable.id, rideId)).returning();
  if (!ride) { res.status(404).json({ error: "Ride not found" }); return; }

  res.json(await enrichRide(ride));
});

export default router;
