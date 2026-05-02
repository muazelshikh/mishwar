import { Router } from "express";
import { db } from "@workspace/db";
import {
  usersTable,
  driversTable,
  ridesTable,
  groupTripsTable,
  subscriptionsTable,
  inviteTripsTable,
  rentalBookingsTable,
  driverBookingsTable,
} from "@workspace/db";
import { eq, desc, count, like, and, gte } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

// Admin stats
router.get("/admin/stats", requireAuth, async (req, res) => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    allUsers,
    allDrivers,
    allRides,
    allGroupTrips,
    allSubs,
    allRentals,
    allDriverBookings,
    allInviteTrips,
  ] = await Promise.all([
    db.select().from(usersTable),
    db.select().from(driversTable),
    db.select().from(ridesTable),
    db.select().from(groupTripsTable),
    db.select().from(subscriptionsTable),
    db.select().from(rentalBookingsTable),
    db.select().from(driverBookingsTable),
    db.select().from(inviteTripsTable),
  ]);

  const activeDrivers = allDrivers.filter((d) => d.isAvailable).length;
  const pendingDrivers = allDrivers.filter((d) => (d as any).driverStatus === "pending").length;
  const activeRides = allRides.filter((r) =>
    ["pending", "accepted", "in_progress"].includes(r.status)
  ).length;
  const completedToday = allRides.filter(
    (r) => r.status === "completed" && r.createdAt >= todayStart
  ).length;
  const activeGroupTrips = allGroupTrips.filter((g) => g.isActive).length;
  const activeSubs = allSubs.filter((s) => s.status === "active").length;

  const completedRides = allRides.filter((r) => r.status === "completed");
  const revenueTotal = completedRides.reduce(
    (acc, r) => acc + (r.finalPrice ?? r.estimatedPrice ?? 0),
    0
  );
  const revenueToday = completedRides
    .filter((r) => r.createdAt >= todayStart)
    .reduce((acc, r) => acc + (r.finalPrice ?? r.estimatedPrice ?? 0), 0);
  const revenueThisMonth = completedRides
    .filter((r) => r.createdAt >= monthStart)
    .reduce((acc, r) => acc + (r.finalPrice ?? r.estimatedPrice ?? 0), 0);

  res.json({
    totalUsers: allUsers.length,
    totalDrivers: allDrivers.length,
    activeDrivers,
    pendingDrivers,
    totalRides: allRides.length,
    activeRides,
    completedRidesToday: completedToday,
    totalGroupTrips: allGroupTrips.length,
    activeGroupTrips,
    totalSubscriptions: activeSubs,
    totalRentals: allRentals.length,
    totalDriverBookings: allDriverBookings.length,
    totalInviteTrips: allInviteTrips.length,
    revenueToday,
    revenueThisMonth,
    revenueTotal,
  });
});

// List all users
router.get("/admin/users", requireAuth, async (req, res) => {
  const { role, status, search } = req.query;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = parseInt(req.query.offset as string) || 0;

  let users = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt));

  if (role) users = users.filter((u) => u.role === role);
  if (status) users = users.filter((u) => (u as any).status === status);
  if (search) {
    const q = (search as string).toLowerCase();
    users = users.filter(
      (u) => u.name.toLowerCase().includes(q) || u.phone.includes(q) || (u.email ?? "").toLowerCase().includes(q)
    );
  }

  const total = users.length;
  const paged = users.slice(offset, offset + limit);

  res.json({ items: paged, total });
});

// Update user status
router.patch("/admin/users/:id/status", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;

  if (!["active", "suspended", "banned"].includes(status)) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }

  const [updated] = await db
    .update(usersTable)
    .set({ updatedAt: new Date() } as any)
    .where(eq(usersTable.id, id))
    .returning();

  res.json(updated);
});

// List all drivers
router.get("/admin/drivers", requireAuth, async (req, res) => {
  const { status } = req.query;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = parseInt(req.query.offset as string) || 0;

  const drivers = await db
    .select()
    .from(driversTable)
    .orderBy(desc(driversTable.createdAt));

  const driversWithNames = await Promise.all(
    drivers.map(async (d) => {
      const [user] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, d.userId))
        .limit(1);
      return {
        ...d,
        name: user?.name ?? "",
        phone: user?.phone ?? "",
        avatarUrl: user?.avatarUrl,
        driverStatus: (d as any).driverStatus ?? "approved",
      };
    })
  );

  let filtered = driversWithNames;
  if (status) filtered = driversWithNames.filter((d) => d.driverStatus === status);

  const total = filtered.length;
  const paged = filtered.slice(offset, offset + limit);
  res.json({ items: paged, total });
});

// Update driver status
router.patch("/admin/drivers/:id/status", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  const { driverStatus } = req.body;

  if (!["approved", "rejected", "suspended"].includes(driverStatus)) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }

  const [updated] = await db
    .update(driversTable)
    .set({ updatedAt: new Date() } as any)
    .where(eq(driversTable.id, id))
    .returning();

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, updated.userId))
    .limit(1);

  res.json({
    ...updated,
    name: user?.name ?? "",
    phone: user?.phone ?? "",
    avatarUrl: user?.avatarUrl,
    driverStatus,
  });
});

// List all trips
router.get("/admin/trips", requireAuth, async (req, res) => {
  const { status } = req.query;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = parseInt(req.query.offset as string) || 0;

  let rides = await db.select().from(ridesTable).orderBy(desc(ridesTable.createdAt));
  if (status) rides = rides.filter((r) => r.status === status);

  const total = rides.length;
  const paged = rides.slice(offset, offset + limit);
  res.json({ items: paged, total });
});

// List all group trips
router.get("/admin/group-trips", requireAuth, async (req, res) => {
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = parseInt(req.query.offset as string) || 0;

  const trips = await db
    .select()
    .from(groupTripsTable)
    .orderBy(desc(groupTripsTable.createdAt));

  const total = trips.length;
  const paged = trips.slice(offset, offset + limit);
  res.json({ items: paged, total });
});

export default router;
