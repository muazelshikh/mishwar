import { Router } from "express";
import { db, groupTripsTable, groupTripRegistrationsTable, driversTable, usersTable, subscriptionsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import {
  CreateGroupTripBody, UpdateGroupTripBody, ListGroupTripsQueryParams,
  RegisterForGroupTripBody, CreateSubscriptionBody
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router = Router();

async function getRegisteredCount(groupTripId: number): Promise<number> {
  const result = await db.select({ count: sql<number>`coalesce(sum(${groupTripRegistrationsTable.seatCount}), 0)` })
    .from(groupTripRegistrationsTable)
    .where(and(
      eq(groupTripRegistrationsTable.groupTripId, groupTripId),
      eq(groupTripRegistrationsTable.status, "confirmed")
    ));
  return Number(result[0]?.count ?? 0);
}

async function enrichGroupTrip(trip: typeof groupTripsTable.$inferSelect) {
  const registeredCount = await getRegisteredCount(trip.id);
  if (!trip.driverId) return { ...trip, registeredCount, driver: null, nextDepartureDate: null };

  const [row] = await db.select({
    driver: driversTable,
    user: { name: usersTable.name, phone: usersTable.phone, avatarUrl: usersTable.avatarUrl }
  })
    .from(driversTable)
    .leftJoin(usersTable, eq(driversTable.userId, usersTable.id))
    .where(eq(driversTable.id, trip.driverId))
    .limit(1);

  const driver = row ? { ...row.driver, name: row.user?.name ?? "", phone: row.user?.phone ?? "", avatarUrl: row.user?.avatarUrl ?? null } : null;
  return { ...trip, registeredCount, driver, nextDepartureDate: null };
}

router.get("/group-trips", async (req, res) => {
  const query = ListGroupTripsQueryParams.safeParse(req.query);
  const limit = query.success ? (query.data.limit ?? 20) : 20;
  const offset = query.success ? (query.data.offset ?? 0) : 0;

  const trips = await db.select().from(groupTripsTable)
    .where(eq(groupTripsTable.isActive, true))
    .limit(limit).offset(offset);

  const items = await Promise.all(trips.map(enrichGroupTrip));
  res.json({ items, total: items.length });
});

router.post("/group-trips", requireAuth, async (req, res) => {
  const parsed = CreateGroupTripBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [trip] = await db.insert(groupTripsTable).values(parsed.data).returning();
  res.status(201).json(await enrichGroupTrip(trip));
});

router.get("/group-trips/:groupTripId", async (req, res) => {
  const groupTripId = parseInt(String(req.params.groupTripId));
  if (isNaN(groupTripId)) { res.status(400).json({ error: "Invalid groupTripId" }); return; }

  const [trip] = await db.select().from(groupTripsTable).where(eq(groupTripsTable.id, groupTripId)).limit(1);
  if (!trip) { res.status(404).json({ error: "Group trip not found" }); return; }

  res.json(await enrichGroupTrip(trip));
});

router.patch("/group-trips/:groupTripId", requireAuth, async (req, res) => {
  const groupTripId = parseInt(String(req.params.groupTripId));
  if (isNaN(groupTripId)) { res.status(400).json({ error: "Invalid groupTripId" }); return; }

  const parsed = UpdateGroupTripBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [trip] = await db.update(groupTripsTable).set(parsed.data).where(eq(groupTripsTable.id, groupTripId)).returning();
  if (!trip) { res.status(404).json({ error: "Group trip not found" }); return; }

  res.json(await enrichGroupTrip(trip));
});

router.post("/group-trips/:groupTripId/register", requireAuth, async (req, res) => {
  const authReq = req as typeof req & { user: { id: number } };
  const groupTripId = parseInt(String(req.params.groupTripId));
  if (isNaN(groupTripId)) { res.status(400).json({ error: "Invalid groupTripId" }); return; }

  const parsed = RegisterForGroupTripBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [trip] = await db.select().from(groupTripsTable).where(eq(groupTripsTable.id, groupTripId)).limit(1);
  if (!trip) { res.status(404).json({ error: "Group trip not found" }); return; }

  const seatCount = parsed.data.seatCount ?? 1;
  const registeredCount = await getRegisteredCount(groupTripId);
  if (registeredCount + seatCount > trip.capacity) {
    res.status(400).json({ error: "Not enough seats available" }); return;
  }

  const [reg] = await db.insert(groupTripRegistrationsTable).values({
    groupTripId,
    userId: authReq.user.id,
    seatCount,
    totalPrice: trip.pricePerSeat * seatCount,
    tripDate: parsed.data.tripDate as unknown as string,
    status: "confirmed",
  }).returning();

  res.status(201).json({ ...reg, groupTrip: await enrichGroupTrip(trip), user: null });
});

router.get("/group-trips/:groupTripId/registrations", requireAuth, async (req, res) => {
  const groupTripId = parseInt(String(req.params.groupTripId));
  if (isNaN(groupTripId)) { res.status(400).json({ error: "Invalid groupTripId" }); return; }

  const regs = await db.select().from(groupTripRegistrationsTable)
    .where(eq(groupTripRegistrationsTable.groupTripId, groupTripId));

  res.json({ items: regs, total: regs.length });
});

export default router;
