import { Router } from "express";
import { db } from "@workspace/db";
import { driversTable, usersTable, ridesTable } from "@workspace/db";
import { eq, desc, and, gte } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

// Get driver profile
router.get("/driver-portal/me", requireAuth, async (req, res) => {
  const userId = (req as any).userId;

  const [driverRow] = await db
    .select()
    .from(driversTable)
    .where(eq(driversTable.userId, userId))
    .limit(1);

  if (!driverRow) {
    res.status(404).json({ error: "Driver profile not found. Please register as a driver first." });
    return;
  }

  const [userRow] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  res.json({
    ...driverRow,
    name: userRow?.name ?? "",
    phone: userRow?.phone ?? "",
    avatarUrl: userRow?.avatarUrl,
    driverStatus: (driverRow as any).driverStatus ?? "approved",
  });
});

// Toggle availability
router.patch("/driver-portal/availability", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  const { isAvailable } = req.body;

  if (typeof isAvailable !== "boolean") {
    res.status(400).json({ error: "isAvailable must be boolean" });
    return;
  }

  const [driverRow] = await db
    .select()
    .from(driversTable)
    .where(eq(driversTable.userId, userId))
    .limit(1);

  if (!driverRow) {
    res.status(404).json({ error: "Driver not found" });
    return;
  }

  const [updated] = await db
    .update(driversTable)
    .set({ isAvailable })
    .where(eq(driversTable.userId, userId))
    .returning();

  const [userRow] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  res.json({
    ...updated,
    name: userRow?.name ?? "",
    phone: userRow?.phone ?? "",
    avatarUrl: userRow?.avatarUrl,
    driverStatus: (updated as any).driverStatus ?? "approved",
  });
});

// Get driver's trips
router.get("/driver-portal/trips", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = parseInt(req.query.offset as string) || 0;

  const [driverRow] = await db
    .select()
    .from(driversTable)
    .where(eq(driversTable.userId, userId))
    .limit(1);

  if (!driverRow) {
    res.json({ items: [], total: 0 });
    return;
  }

  let query = db
    .select()
    .from(ridesTable)
    .where(eq(ridesTable.driverId, driverRow.id))
    .orderBy(desc(ridesTable.createdAt))
    .$dynamic();

  const status = req.query.status as string;
  if (status) {
    query = query.where(and(eq(ridesTable.driverId, driverRow.id), eq(ridesTable.status, status)));
  }

  const rides = await query.limit(limit).offset(offset);
  res.json({ items: rides, total: rides.length });
});

// Get earnings
router.get("/driver-portal/earnings", requireAuth, async (req, res) => {
  const userId = (req as any).userId;

  const [driverRow] = await db
    .select()
    .from(driversTable)
    .where(eq(driversTable.userId, userId))
    .limit(1);

  if (!driverRow) {
    res.json({
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
      total: 0,
      todayTrips: 0,
      weekTrips: 0,
      monthTrips: 0,
    });
    return;
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const allRides = await db
    .select()
    .from(ridesTable)
    .where(and(eq(ridesTable.driverId, driverRow.id), eq(ridesTable.status, "completed")));

  const todayRides = allRides.filter((r) => r.createdAt >= todayStart);
  const weekRides = allRides.filter((r) => r.createdAt >= weekStart);
  const monthRides = allRides.filter((r) => r.createdAt >= monthStart);

  const sum = (rides: typeof allRides) =>
    rides.reduce((acc, r) => acc + (r.finalPrice ?? r.estimatedPrice ?? 50), 0);

  res.json({
    today: sum(todayRides),
    thisWeek: sum(weekRides),
    thisMonth: sum(monthRides),
    total: sum(allRides),
    todayTrips: todayRides.length,
    weekTrips: weekRides.length,
    monthTrips: monthRides.length,
  });
});

// Get driver stats
router.get("/driver-portal/stats", requireAuth, async (req, res) => {
  const userId = (req as any).userId;

  const [driverRow] = await db
    .select()
    .from(driversTable)
    .where(eq(driversTable.userId, userId))
    .limit(1);

  if (!driverRow) {
    res.json({
      totalTrips: 0,
      completedTrips: 0,
      cancelledTrips: 0,
      rating: null,
      acceptanceRate: 100,
      isAvailable: false,
    });
    return;
  }

  const allRides = await db
    .select()
    .from(ridesTable)
    .where(eq(ridesTable.driverId, driverRow.id));

  const completed = allRides.filter((r) => r.status === "completed").length;
  const cancelled = allRides.filter((r) => r.status === "cancelled").length;
  const total = allRides.length;
  const acceptanceRate = total > 0 ? Math.round(((total - cancelled) / total) * 100) : 100;

  res.json({
    totalTrips: total,
    completedTrips: completed,
    cancelledTrips: cancelled,
    rating: driverRow.rating,
    acceptanceRate,
    isAvailable: driverRow.isAvailable,
  });
});

export default router;
