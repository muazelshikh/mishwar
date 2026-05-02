import { Router } from "express";
import { db, subscriptionsTable, groupTripsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { CreateSubscriptionBody } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router = Router();

async function enrichSubscription(sub: typeof subscriptionsTable.$inferSelect) {
  const [trip] = await db.select().from(groupTripsTable).where(eq(groupTripsTable.id, sub.groupTripId)).limit(1);
  const groupTrip = trip ? { ...trip, registeredCount: 0, driver: null, nextDepartureDate: null } : null;
  return { ...sub, groupTrip };
}

router.get("/subscriptions", requireAuth, async (req, res) => {
  const authReq = req as typeof req & { user: { id: number } };
  const subs = await db.select().from(subscriptionsTable)
    .where(eq(subscriptionsTable.userId, authReq.user.id));

  const items = await Promise.all(subs.map(enrichSubscription));
  res.json({ items, total: items.length });
});

router.post("/subscriptions", requireAuth, async (req, res) => {
  const authReq = req as typeof req & { user: { id: number } };
  const parsed = CreateSubscriptionBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [trip] = await db.select().from(groupTripsTable).where(eq(groupTripsTable.id, parsed.data.groupTripId)).limit(1);
  if (!trip) { res.status(404).json({ error: "Group trip not found" }); return; }

  const seatCount = parsed.data.seatCount ?? 1;
  const multiplier = parsed.data.subscriptionType === "weekly" ? 4 : 1;
  const pricePerPeriod = trip.pricePerSeat * seatCount * multiplier;

  const [sub] = await db.insert(subscriptionsTable).values({
    userId: authReq.user.id,
    groupTripId: parsed.data.groupTripId,
    subscriptionType: parsed.data.subscriptionType,
    seatCount,
    pricePerPeriod,
    startDate: parsed.data.startDate as unknown as string,
    status: "active",
  }).returning();

  res.status(201).json(await enrichSubscription(sub));
});

router.get("/subscriptions/:subscriptionId", requireAuth, async (req, res) => {
  const subId = parseInt(String(req.params.subscriptionId));
  if (isNaN(subId)) { res.status(400).json({ error: "Invalid subscriptionId" }); return; }

  const [sub] = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.id, subId)).limit(1);
  if (!sub) { res.status(404).json({ error: "Subscription not found" }); return; }

  res.json(await enrichSubscription(sub));
});

router.delete("/subscriptions/:subscriptionId", requireAuth, async (req, res) => {
  const subId = parseInt(String(req.params.subscriptionId));
  if (isNaN(subId)) { res.status(400).json({ error: "Invalid subscriptionId" }); return; }

  const [sub] = await db.update(subscriptionsTable)
    .set({ status: "cancelled" })
    .where(eq(subscriptionsTable.id, subId))
    .returning();

  if (!sub) { res.status(404).json({ error: "Subscription not found" }); return; }
  res.json(await enrichSubscription(sub));
});

export default router;
