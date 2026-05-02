import { Router } from "express";
import { db, ridesTable, groupTripsTable, subscriptionsTable, usersTable, driversTable, groupTripRegistrationsTable } from "@workspace/db";
import { eq, and, gte, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { sql } from "drizzle-orm";

const router = Router();

router.get("/stats/dashboard", async (_req, res) => {
  const [totalRidesResult] = await db.select({ count: sql<number>`count(*)` }).from(ridesTable);
  const [activeRidesResult] = await db.select({ count: sql<number>`count(*)` }).from(ridesTable)
    .where(eq(ridesTable.status, "in_progress"));
  const [totalGroupTripsResult] = await db.select({ count: sql<number>`count(*)` }).from(groupTripsTable);
  const [activeGroupTripsResult] = await db.select({ count: sql<number>`count(*)` }).from(groupTripsTable)
    .where(eq(groupTripsTable.isActive, true));
  const [totalSubscriptionsResult] = await db.select({ count: sql<number>`count(*)` }).from(subscriptionsTable)
    .where(eq(subscriptionsTable.status, "active"));
  const [totalPassengersResult] = await db.select({ count: sql<number>`count(*)` }).from(usersTable)
    .where(eq(usersTable.role, "passenger"));
  const [totalDriversResult] = await db.select({ count: sql<number>`count(*)` }).from(driversTable);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [todayCompletedResult] = await db.select({ count: sql<number>`count(*)` }).from(ridesTable)
    .where(and(eq(ridesTable.status, "completed"), gte(ridesTable.completedAt, today)));

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const [revenueResult] = await db.select({ total: sql<number>`coalesce(sum(${ridesTable.finalPrice}), 0)` }).from(ridesTable)
    .where(and(eq(ridesTable.status, "completed"), gte(ridesTable.createdAt, startOfMonth)));

  res.json({
    totalRides: Number(totalRidesResult?.count ?? 0),
    activeRides: Number(activeRidesResult?.count ?? 0),
    totalGroupTrips: Number(totalGroupTripsResult?.count ?? 0),
    activeGroupTrips: Number(activeGroupTripsResult?.count ?? 0),
    totalSubscriptions: Number(totalSubscriptionsResult?.count ?? 0),
    totalPassengers: Number(totalPassengersResult?.count ?? 0),
    totalDrivers: Number(totalDriversResult?.count ?? 0),
    completedRidesToday: Number(todayCompletedResult?.count ?? 0),
    revenueThisMonth: Number(revenueResult?.total ?? 0),
  });
});

router.get("/stats/my-activity", requireAuth, async (req, res) => {
  const authReq = req as typeof req & { user: { id: number } };
  const userId = authReq.user.id;

  const [totalRidesResult] = await db.select({ count: sql<number>`count(*)` }).from(ridesTable)
    .where(eq(ridesTable.passengerId, userId));
  const [completedRidesResult] = await db.select({ count: sql<number>`count(*)` }).from(ridesTable)
    .where(and(eq(ridesTable.passengerId, userId), eq(ridesTable.status, "completed")));
  const [activeSubsResult] = await db.select({ count: sql<number>`count(*)` }).from(subscriptionsTable)
    .where(and(eq(subscriptionsTable.userId, userId), eq(subscriptionsTable.status, "active")));
  const [upcomingRegsResult] = await db.select({ count: sql<number>`count(*)` }).from(groupTripRegistrationsTable)
    .where(and(eq(groupTripRegistrationsTable.userId, userId), eq(groupTripRegistrationsTable.status, "confirmed")));
  const [spentResult] = await db.select({ total: sql<number>`coalesce(sum(${ridesTable.finalPrice}), 0)` }).from(ridesTable)
    .where(and(eq(ridesTable.passengerId, userId), eq(ridesTable.status, "completed")));

  const recentRides = await db.select().from(ridesTable)
    .where(eq(ridesTable.passengerId, userId))
    .orderBy(desc(ridesTable.createdAt))
    .limit(5);

  const recentRegs = await db.select().from(groupTripRegistrationsTable)
    .where(eq(groupTripRegistrationsTable.userId, userId))
    .orderBy(desc(groupTripRegistrationsTable.createdAt))
    .limit(5);

  res.json({
    totalRides: Number(totalRidesResult?.count ?? 0),
    completedRides: Number(completedRidesResult?.count ?? 0),
    activeSubscriptions: Number(activeSubsResult?.count ?? 0),
    upcomingGroupTrips: Number(upcomingRegsResult?.count ?? 0),
    totalSpent: Number(spentResult?.total ?? 0),
    recentRides: recentRides.map(r => ({ ...r, driver: null })),
    recentRegistrations: recentRegs.map(r => ({ ...r, groupTrip: null, user: null })),
  });
});

export default router;
