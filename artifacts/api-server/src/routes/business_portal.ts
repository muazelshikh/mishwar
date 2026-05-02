import { Router } from "express";
import { db, usersTable, organizationsTable, orgEmployeesTable, orgRoutesTable, orgInvoicesTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { z } from "zod/v4";
import { requireAuth } from "../middlewares/auth";

const router = Router();

const orgTypeEnum = z.enum(["company", "university", "factory", "hospital", "hotel", "travel_agency", "relief_org", "other"]);

const registerSchema = z.object({
  name: z.string().min(1).max(200),
  orgType: orgTypeEnum.default("company"),
  commercialReg: z.string().min(1).max(50),
  industry: z.string().max(100).optional(),
  contactPerson: z.string().min(1).max(200),
  contactPhone: z.string().min(1).max(20),
  contactEmail: z.string().email().max(200).optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).default("الرياض"),
  monthlyBudget: z.coerce.number().nonnegative().max(10_000_000).optional(),
}).strict();

const updateOrgSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  orgType: orgTypeEnum.optional(),
  industry: z.string().max(100).optional(),
  contactPerson: z.string().min(1).max(200).optional(),
  contactPhone: z.string().min(1).max(20).optional(),
  contactEmail: z.string().email().max(200).optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  monthlyBudget: z.coerce.number().nonnegative().max(10_000_000).optional(),
  bankAccount: z.object({
    bankName: z.string().min(1).max(100),
    iban: z.string().min(1).max(50),
    accountHolder: z.string().min(1).max(200),
  }).optional(),
}).strict();

const addEmployeeSchema = z.object({
  fullName: z.string().min(1).max(200),
  phone: z.string().min(1).max(20),
  email: z.string().email().max(200).optional(),
  department: z.string().max(100).optional(),
  employeeCode: z.string().max(50).optional(),
  monthlyBudget: z.coerce.number().nonnegative().max(1_000_000).optional(),
  tripsLimit: z.coerce.number().int().nonnegative().max(10000).optional(),
}).strict();

const updateEmployeeSchema = z.object({
  fullName: z.string().min(1).max(200).optional(),
  phone: z.string().min(1).max(20).optional(),
  email: z.string().email().max(200).optional(),
  department: z.string().max(100).optional(),
  employeeCode: z.string().max(50).optional(),
  monthlyBudget: z.coerce.number().nonnegative().max(1_000_000).optional(),
  tripsLimit: z.coerce.number().int().nonnegative().max(10000).optional(),
  isActive: z.boolean().optional(),
}).strict();

const addRouteSchema = z.object({
  name: z.string().min(1).max(200),
  startPoint: z.string().min(1).max(200),
  endPoint: z.string().min(1).max(200),
  scheduleTime: z.string().min(1).max(50),
  scheduleDays: z.string().max(100).default("الأحد-الخميس"),
  vehicleType: z.string().max(50).default("باص"),
  capacity: z.coerce.number().int().min(1).max(100).default(20),
}).strict();

router.get("/business-portal/me", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const [org] = await db.select().from(organizationsTable).where(eq(organizationsTable.userId, userId)).limit(1);
  if (!org) { res.status(404).json({ error: "Organization not found" }); return; }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  res.json({ ...org, userName: user?.name, userPhone: user?.phone });
});

router.post("/business-portal/register", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    return;
  }
  const existing = await db.select().from(organizationsTable).where(eq(organizationsTable.userId, userId)).limit(1);
  if (existing.length > 0) { res.status(409).json({ error: "Organization already registered" }); return; }
  const d = parsed.data;
  const [org] = await db.insert(organizationsTable).values({
    userId,
    name: d.name,
    orgType: d.orgType,
    commercialReg: d.commercialReg,
    industry: d.industry,
    contactPerson: d.contactPerson,
    contactPhone: d.contactPhone,
    contactEmail: d.contactEmail,
    address: d.address,
    city: d.city,
    monthlyBudget: d.monthlyBudget ?? null,
    status: "pending",
  }).returning();
  res.status(201).json(org);
});

router.patch("/business-portal/me", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const parsed = updateOrgSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    return;
  }
  const allowedUpdates: Record<string, unknown> = { updatedAt: new Date() };
  for (const k of ["name", "orgType", "industry", "contactPerson", "contactPhone", "contactEmail", "address", "city", "monthlyBudget", "bankAccount"] as const) {
    if (parsed.data[k] !== undefined) allowedUpdates[k] = parsed.data[k];
  }
  const [org] = await db.update(organizationsTable).set(allowedUpdates)
    .where(eq(organizationsTable.userId, userId)).returning();
  if (!org) {
    res.status(404).json({ error: "Organization not found" });
    return;
  }
  res.json(org);
});

router.get("/business-portal/stats", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
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

router.get("/business-portal/employees", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const [org] = await db.select().from(organizationsTable).where(eq(organizationsTable.userId, userId)).limit(1);
  if (!org) { res.json({ items: [] }); return; }
  const employees = await db.select().from(orgEmployeesTable)
    .where(eq(orgEmployeesTable.organizationId, org.id))
    .orderBy(desc(orgEmployeesTable.createdAt));
  res.json({ items: employees });
});

router.post("/business-portal/employees", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const [org] = await db.select().from(organizationsTable).where(eq(organizationsTable.userId, userId)).limit(1);
  if (!org) { res.status(404).json({ error: "Organization not found" }); return; }
  const parsed = addEmployeeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    return;
  }
  const d = parsed.data;
  const [emp] = await db.insert(orgEmployeesTable).values({
    organizationId: org.id,
    fullName: d.fullName,
    phone: d.phone,
    email: d.email,
    department: d.department,
    employeeCode: d.employeeCode,
    monthlyBudget: d.monthlyBudget ?? null,
    tripsLimit: d.tripsLimit ?? null,
  }).returning();
  await db.update(organizationsTable).set({ totalEmployees: org.totalEmployees + 1 }).where(eq(organizationsTable.id, org.id));
  res.status(201).json(emp);
});

router.patch("/business-portal/employees/:id", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const [org] = await db.select().from(organizationsTable).where(eq(organizationsTable.userId, userId)).limit(1);
  if (!org) { res.status(404).json({ error: "Not found" }); return; }
  const empId = Number(req.params.id);
  if (!Number.isInteger(empId) || empId <= 0) {
    res.status(400).json({ error: "Invalid employee id" });
    return;
  }
  const parsed = updateEmployeeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    return;
  }
  const allowedUpdates: Record<string, unknown> = {};
  for (const k of ["fullName", "phone", "email", "department", "employeeCode", "monthlyBudget", "tripsLimit", "isActive"] as const) {
    if (parsed.data[k] !== undefined) allowedUpdates[k] = parsed.data[k];
  }
  const [emp] = await db.update(orgEmployeesTable).set(allowedUpdates)
    .where(and(eq(orgEmployeesTable.id, empId), eq(orgEmployeesTable.organizationId, org.id))).returning();
  if (!emp) {
    res.status(404).json({ error: "Employee not found" });
    return;
  }
  res.json(emp);
});

router.delete("/business-portal/employees/:id", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const [org] = await db.select().from(organizationsTable).where(eq(organizationsTable.userId, userId)).limit(1);
  if (!org) { res.status(404).json({ error: "Not found" }); return; }
  const empId = Number(req.params.id);
  if (!Number.isInteger(empId) || empId <= 0) {
    res.status(400).json({ error: "Invalid employee id" });
    return;
  }
  await db.update(orgEmployeesTable).set({ isActive: false })
    .where(and(eq(orgEmployeesTable.id, empId), eq(orgEmployeesTable.organizationId, org.id)));
  res.json({ success: true });
});

router.get("/business-portal/routes", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const [org] = await db.select().from(organizationsTable).where(eq(organizationsTable.userId, userId)).limit(1);
  if (!org) { res.json({ items: [] }); return; }
  const routes = await db.select().from(orgRoutesTable).where(eq(orgRoutesTable.organizationId, org.id));
  res.json({ items: routes });
});

router.post("/business-portal/routes", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const [org] = await db.select().from(organizationsTable).where(eq(organizationsTable.userId, userId)).limit(1);
  if (!org) { res.status(404).json({ error: "Not found" }); return; }
  const parsed = addRouteSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    return;
  }
  const d = parsed.data;
  const [route] = await db.insert(orgRoutesTable).values({
    organizationId: org.id,
    name: d.name,
    startPoint: d.startPoint,
    endPoint: d.endPoint,
    scheduleTime: d.scheduleTime,
    scheduleDays: d.scheduleDays,
    vehicleType: d.vehicleType,
    capacity: d.capacity,
  }).returning();
  res.status(201).json(route);
});

router.get("/business-portal/invoices", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const [org] = await db.select().from(organizationsTable).where(eq(organizationsTable.userId, userId)).limit(1);
  if (!org) { res.json({ items: [] }); return; }
  const invoices = await db.select().from(orgInvoicesTable)
    .where(eq(orgInvoicesTable.organizationId, org.id))
    .orderBy(desc(orgInvoicesTable.createdAt));
  res.json({ items: invoices });
});

export default router;
