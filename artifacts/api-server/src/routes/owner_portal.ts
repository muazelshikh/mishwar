import { Router } from "express";
import { db, usersTable, carOwnersTable, ownerVehiclesTable, ownerEarningsTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { z } from "zod/v4";
import { requireAuth } from "../middlewares/auth";

const router = Router();

const registerSchema = z.object({
  ownerType: z.enum(["individual", "company"]).default("individual"),
  companyName: z.string().min(1).max(200).optional(),
  commercialReg: z.string().min(1).max(50).optional(),
  nationalId: z.string().min(1).max(20).optional(),
}).strict();

const updateProfileSchema = z.object({
  bankAccount: z.object({
    bankName: z.string().min(1).max(100),
    iban: z.string().min(1).max(50),
    accountHolder: z.string().min(1).max(200),
  }).optional(),
  companyName: z.string().min(1).max(200).optional(),
  nationalId: z.string().min(1).max(20).optional(),
}).strict();

const addVehicleSchema = z.object({
  make: z.string().min(1).max(50),
  model: z.string().min(1).max(50),
  year: z.coerce.number().int().min(1990).max(new Date().getFullYear() + 1),
  plateNumber: z.string().min(1).max(20),
  color: z.string().min(1).max(30).default("أبيض"),
  category: z.enum(["economy", "comfort", "xl", "vip"]).default("economy"),
  operationModel: z.enum(["daily_rental", "revenue_share", "rental_only", "hybrid"]).default("revenue_share"),
  dailyRentalAmount: z.coerce.number().nonnegative().max(100000).optional(),
  ownerSharePercent: z.coerce.number().min(0).max(100).default(30),
}).strict();

const updateVehicleSchema = z.object({
  isActive: z.boolean().optional(),
  operationModel: z.enum(["daily_rental", "revenue_share", "rental_only", "hybrid"]).optional(),
  dailyRentalAmount: z.coerce.number().nonnegative().max(100000).optional(),
  ownerSharePercent: z.coerce.number().min(0).max(100).optional(),
}).strict();

router.get("/owner-portal/me", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const [owner] = await db.select().from(carOwnersTable).where(eq(carOwnersTable.userId, userId)).limit(1);
  if (!owner) {
    res.status(404).json({ error: "Owner profile not found" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  res.json({ ...owner, name: user?.name, phone: user?.phone, email: user?.email });
});

router.post("/owner-portal/register", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    return;
  }
  const existing = await db.select().from(carOwnersTable).where(eq(carOwnersTable.userId, userId)).limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: "Owner profile already exists" });
    return;
  }
  const [owner] = await db.insert(carOwnersTable).values({
    userId,
    ownerType: parsed.data.ownerType,
    companyName: parsed.data.companyName,
    commercialReg: parsed.data.commercialReg,
    nationalId: parsed.data.nationalId,
    status: "pending",
  }).returning();
  res.status(201).json(owner);
});

router.patch("/owner-portal/me", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    return;
  }
  const allowedUpdates: Record<string, unknown> = { updatedAt: new Date() };
  if (parsed.data.bankAccount !== undefined) allowedUpdates.bankAccount = parsed.data.bankAccount;
  if (parsed.data.companyName !== undefined) allowedUpdates.companyName = parsed.data.companyName;
  if (parsed.data.nationalId !== undefined) allowedUpdates.nationalId = parsed.data.nationalId;
  const [owner] = await db.update(carOwnersTable)
    .set(allowedUpdates)
    .where(eq(carOwnersTable.userId, userId))
    .returning();
  res.json(owner);
});

router.get("/owner-portal/vehicles", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const [owner] = await db.select().from(carOwnersTable).where(eq(carOwnersTable.userId, userId)).limit(1);
  if (!owner) { res.json({ items: [] }); return; }
  const vehicles = await db.select().from(ownerVehiclesTable)
    .where(eq(ownerVehiclesTable.ownerId, owner.id))
    .orderBy(desc(ownerVehiclesTable.createdAt));
  res.json({ items: vehicles });
});

router.post("/owner-portal/vehicles", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const [owner] = await db.select().from(carOwnersTable).where(eq(carOwnersTable.userId, userId)).limit(1);
  if (!owner) { res.status(404).json({ error: "Owner profile not found" }); return; }
  const parsed = addVehicleSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    return;
  }
  const d = parsed.data;
  const [vehicle] = await db.insert(ownerVehiclesTable).values({
    ownerId: owner.id,
    make: d.make,
    model: d.model,
    year: d.year,
    plateNumber: d.plateNumber,
    color: d.color,
    category: d.category,
    operationModel: d.operationModel,
    dailyRentalAmount: d.dailyRentalAmount ?? null,
    ownerSharePercent: d.ownerSharePercent,
    driverSharePercent: 60,
    platformSharePercent: 10,
  }).returning();
  await db.update(carOwnersTable).set({ totalVehicles: owner.totalVehicles + 1 }).where(eq(carOwnersTable.id, owner.id));
  res.status(201).json(vehicle);
});

router.patch("/owner-portal/vehicles/:id", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const [owner] = await db.select().from(carOwnersTable).where(eq(carOwnersTable.userId, userId)).limit(1);
  if (!owner) { res.status(404).json({ error: "Not found" }); return; }
  const vehicleId = Number(req.params.id);
  if (!Number.isInteger(vehicleId) || vehicleId <= 0) {
    res.status(400).json({ error: "Invalid vehicle id" });
    return;
  }
  const parsed = updateVehicleSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    return;
  }
  const allowedUpdates: Record<string, unknown> = { updatedAt: new Date() };
  for (const k of ["isActive", "operationModel", "dailyRentalAmount", "ownerSharePercent"] as const) {
    if (parsed.data[k] !== undefined) allowedUpdates[k] = parsed.data[k];
  }
  const [updated] = await db.update(ownerVehiclesTable)
    .set(allowedUpdates)
    .where(and(eq(ownerVehiclesTable.id, vehicleId), eq(ownerVehiclesTable.ownerId, owner.id)))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Vehicle not found" });
    return;
  }
  res.json(updated);
});

router.get("/owner-portal/earnings", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
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

router.get("/owner-portal/stats", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
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
