import { Router } from "express";
import { db, usersTable, organizationsTable, orgEmployeesTable, orgRoutesTable, orgInvoicesTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

// Get org profile
router.get("/business-portal/me", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  const [org] = await db.select().from(organizationsTable).where(eq(organizationsTable.userId, userId)).limit(1);
  if (!org) { res.status(404).json({ error: "Organization not found" }); return; }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  res.json({ ...org, userName: user?.name, userPhone: user?.phone });
});

// Register organization
router.post("/business-portal/register", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  const existing = await db.select().from(organizationsTable).where(eq(organizationsTable.userId, userId)).limit(1);
  if (existing.length > 0) { res.status(409).json({ error: "Organization already registered" }); return; }
  const { name, orgType, commercialReg, industry, contactPerson, contactPhone, contactEmail, address, city, monthlyBudget } = req.body;
  if (!name || !commercialReg || !contactPerson || !contactPhone) {
    res.status(400).json({ error: "Missing required fields" }); return;
  }
  const [org] = await db.insert(organizationsTable).values({
    userId, name, orgType: orgType ?? "company", commercialReg, industry,
    contactPerson, contactPhone, contactEmail, address, city: city ?? "الرياض",
    monthlyBudget: monthlyBudget ? parseFloat(monthlyBudget) : null,
    status: "pending",
  }).returning();
  res.status(201).json(org);
});

// Update org
router.patch("/business-portal/me", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  const updates = req.body;
  const [org] = await db.update(organizationsTable).set({ ...updates, updatedAt: new Date() })
    .where(eq(organizationsTable.userId, userId)).returning();
  res.json(org);
});

// Dashboard stats
router.get("/business-portal/stats", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  const [org] = await db.select().from(organizationsTable).where(eq(organizationsTable.userId, userId)).limit(1);
  if (!org) { res.json({ employees: 0, activeEmployees: 0, routes: 0, monthlySpend: 0, pendingInvoices: 0 }); return; }
  const employees = await db.select().from(orgEmployeesTable).where(eq(orgEmployeesTable.organizationId, org.id));
  const routes = await db.select().from(orgRoutesTable).where(eq(orgRoutesTable.organizationId, org.id));
  const invoices = await db.select().from(orgInvoicesTable).where(eq(orgInvoicesTable.organizationId, org.id));
  const pendingInvoices = invoices.filter(i => i.status === "pending");
  const totalPendingAmount = pendingInvoices.reduce((a, i) => a + i.totalAmount, 0);
  res.json({
    employees: employees.length,
    activeEmployees: employees.filter(e => e.isActive).length,
    routes: routes.filter(r => r.isActive).length,
    monthlySpend: org.monthlyBudget ?? 0,
    pendingInvoices: pendingInvoices.length,
    pendingAmount: totalPendingAmount,
    status: org.status,
  });
});

// Employees CRUD
router.get("/business-portal/employees", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  const [org] = await db.select().from(organizationsTable).where(eq(organizationsTable.userId, userId)).limit(1);
  if (!org) { res.json({ items: [] }); return; }
  const employees = await db.select().from(orgEmployeesTable)
    .where(eq(orgEmployeesTable.organizationId, org.id))
    .orderBy(desc(orgEmployeesTable.createdAt));
  res.json({ items: employees });
});

router.post("/business-portal/employees", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  const [org] = await db.select().from(organizationsTable).where(eq(organizationsTable.userId, userId)).limit(1);
  if (!org) { res.status(404).json({ error: "Organization not found" }); return; }
  const { fullName, phone, email, department, employeeCode, monthlyBudget, tripsLimit } = req.body;
  if (!fullName || !phone) { res.status(400).json({ error: "fullName and phone required" }); return; }
  const [emp] = await db.insert(orgEmployeesTable).values({
    organizationId: org.id, fullName, phone, email, department, employeeCode,
    monthlyBudget: monthlyBudget ? parseFloat(monthlyBudget) : null,
    tripsLimit: tripsLimit ? parseInt(tripsLimit) : null,
  }).returning();
  await db.update(organizationsTable).set({ totalEmployees: org.totalEmployees + 1 }).where(eq(organizationsTable.id, org.id));
  res.status(201).json(emp);
});

router.patch("/business-portal/employees/:id", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  const [org] = await db.select().from(organizationsTable).where(eq(organizationsTable.userId, userId)).limit(1);
  if (!org) { res.status(404).json({ error: "Not found" }); return; }
  const empId = parseInt(req.params.id);
  const [emp] = await db.update(orgEmployeesTable).set(req.body)
    .where(and(eq(orgEmployeesTable.id, empId), eq(orgEmployeesTable.organizationId, org.id))).returning();
  res.json(emp);
});

router.delete("/business-portal/employees/:id", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  const [org] = await db.select().from(organizationsTable).where(eq(organizationsTable.userId, userId)).limit(1);
  if (!org) { res.status(404).json({ error: "Not found" }); return; }
  const empId = parseInt(req.params.id);
  await db.update(orgEmployeesTable).set({ isActive: false })
    .where(and(eq(orgEmployeesTable.id, empId), eq(orgEmployeesTable.organizationId, org.id)));
  res.json({ success: true });
});

// Routes CRUD
router.get("/business-portal/routes", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  const [org] = await db.select().from(organizationsTable).where(eq(organizationsTable.userId, userId)).limit(1);
  if (!org) { res.json({ items: [] }); return; }
  const routes = await db.select().from(orgRoutesTable).where(eq(orgRoutesTable.organizationId, org.id));
  res.json({ items: routes });
});

router.post("/business-portal/routes", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  const [org] = await db.select().from(organizationsTable).where(eq(organizationsTable.userId, userId)).limit(1);
  if (!org) { res.status(404).json({ error: "Not found" }); return; }
  const { name, startPoint, endPoint, scheduleTime, scheduleDays, vehicleType, capacity } = req.body;
  const [route] = await db.insert(orgRoutesTable).values({
    organizationId: org.id, name, startPoint, endPoint, scheduleTime,
    scheduleDays: scheduleDays ?? "الأحد-الخميس", vehicleType: vehicleType ?? "باص",
    capacity: capacity ? parseInt(capacity) : 20,
  }).returning();
  res.status(201).json(route);
});

// Invoices
router.get("/business-portal/invoices", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  const [org] = await db.select().from(organizationsTable).where(eq(organizationsTable.userId, userId)).limit(1);
  if (!org) { res.json({ items: [] }); return; }
  const invoices = await db.select().from(orgInvoicesTable)
    .where(eq(orgInvoicesTable.organizationId, org.id))
    .orderBy(desc(orgInvoicesTable.createdAt));
  res.json({ items: invoices });
});

export default router;
