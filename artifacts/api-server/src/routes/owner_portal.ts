import { Router } from "express";
import { db, usersTable, carOwnersTable, ownerVehiclesTable, ownerEarningsTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

// Get or create owner profile
router.get("/owner-portal/me", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  const [owner] = await db.select().from(carOwnersTable).where(eq(carOwnersTable.userId, userId)).limit(1);
  if (!owner) {
    res.status(404).json({ error: "Owner profile not found" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  res.json({ ...owner, name: user?.name, phone: user?.phone, email: user?.email });
});

// Register as owner
router.post("/owner-portal/register", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  const existing = await db.select().from(carOwnersTable).where(eq(carOwnersTable.userId, userId)).limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: "Owner profile already exists" });
    return;
  }
  const { ownerType, companyName, commercialReg, nationalId } = req.body;
  const [owner] = await db.insert(carOwnersTable).values({
    userId,
    ownerType: ownerType ?? "individual",
    companyName,
    commercialReg,
    nationalId,
    status: "pending",
  }).returning();
  res.status(201).json(owner);
});

// Update owner profile
router.patch("/owner-portal/me", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  const { bankAccount, companyName, nationalId } = req.body;
  const [owner] = await db.update(carOwnersTable)
    .set({ bankAccount, companyName, nationalId, updatedAt: new Date() })
    .where(eq(carOwnersTable.userId, userId))
    .returning();
  res.json(owner);
});

// Get vehicles
router.get("/owner-portal/vehicles", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  const [owner] = await db.select().from(carOwnersTable).where(eq(carOwnersTable.userId, userId)).limit(1);
  if (!owner) { res.json({ items: [] }); return; }
  const vehicles = await db.select().from(ownerVehiclesTable)
    .where(eq(ownerVehiclesTable.ownerId, owner.id))
    .orderBy(desc(ownerVehiclesTable.createdAt));
  res.json({ items: vehicles });
});

// Add vehicle
router.post("/owner-portal/vehicles", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  const [owner] = await db.select().from(carOwnersTable).where(eq(carOwnersTable.userId, userId)).limit(1);
  if (!owner) { res.status(404).json({ error: "Owner profile not found" }); return; }
  const { make, model, year, plateNumber, color, category, operationModel, dailyRentalAmount, ownerSharePercent } = req.body;
  const [vehicle] = await db.insert(ownerVehiclesTable).values({
    ownerId: owner.id, make, model, year: parseInt(year), plateNumber, color: color ?? "أبيض",
    category: category ?? "economy", operationModel: operationModel ?? "revenue_share",
    dailyRentalAmount: dailyRentalAmount ? parseFloat(dailyRentalAmount) : null,
    ownerSharePercent: ownerSharePercent ? parseFloat(ownerSharePercent) : 30,
    driverSharePercent: 60, platformSharePercent: 10,
  }).returning();
  await db.update(carOwnersTable).set({ totalVehicles: owner.totalVehicles + 1 }).where(eq(carOwnersTable.id, owner.id));
  res.status(201).json(vehicle);
});

// Update vehicle
router.patch("/owner-portal/vehicles/:id", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  const [owner] = await db.select().from(carOwnersTable).where(eq(carOwnersTable.userId, userId)).limit(1);
  if (!owner) { res.status(404).json({ error: "Not found" }); return; }
  const vehicleId = parseInt(req.params.id);
  const { isActive, operationModel, dailyRentalAmount, ownerSharePercent } = req.body;
  const [updated] = await db.update(ownerVehiclesTable)
    .set({ isActive, operationModel, dailyRentalAmount, ownerSharePercent, updatedAt: new Date() })
    .where(and(eq(ownerVehiclesTable.id, vehicleId), eq(ownerVehiclesTable.ownerId, owner.id)))
    .returning();
  res.json(updated);
});

// Get earnings
router.get("/owner-portal/earnings", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  const [owner] = await db.select().from(carOwnersTable).where(eq(carOwnersTable.userId, userId)).limit(1);
  if (!owner) { res.json({ items: [], stats: { today: 0, thisMonth: 0, total: 0 } }); return; }
  const earnings = await db.select().from(ownerEarningsTable)
    .where(eq(ownerEarningsTable.ownerId, owner.id))
    .orderBy(desc(ownerEarningsTable.createdAt))
    .limit(50);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const todayEarnings = earnings.filter(e => new Date(e.createdAt) >= todayStart);
  const monthEarnings = earnings.filter(e => new Date(e.createdAt) >= monthStart);
  const sum = (arr: typeof earnings) => arr.reduce((acc, e) => acc + e.amount, 0);
  res.json({
    items: earnings,
    stats: {
      today: sum(todayEarnings),
      thisMonth: sum(monthEarnings),
      total: owner.totalEarnings,
    }
  });
});

// Dashboard stats
router.get("/owner-portal/stats", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  const [owner] = await db.select().from(carOwnersTable).where(eq(carOwnersTable.userId, userId)).limit(1);
  if (!owner) {
    res.json({ totalVehicles: 0, activeVehicles: 0, totalEarnings: 0, monthEarnings: 0, pendingEarnings: 0 });
    return;
  }
  const vehicles = await db.select().from(ownerVehiclesTable).where(eq(ownerVehiclesTable.ownerId, owner.id));
  const activeVehicles = vehicles.filter(v => v.isActive).length;
  const earnings = await db.select().from(ownerEarningsTable).where(eq(ownerEarningsTable.ownerId, owner.id));
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const monthEarnings = earnings.filter(e => new Date(e.createdAt) >= monthStart).reduce((a, e) => a + e.amount, 0);
  const pendingEarnings = earnings.filter(e => e.paymentStatus === "pending").reduce((a, e) => a + e.amount, 0);
  res.json({
    totalVehicles: owner.totalVehicles,
    activeVehicles,
    totalEarnings: owner.totalEarnings,
    monthEarnings,
    pendingEarnings,
    status: owner.status,
  });
});

export default router;
