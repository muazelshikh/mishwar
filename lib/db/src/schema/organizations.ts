import { pgTable, text, serial, timestamp, integer, real, json, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const organizationsTable = pgTable("organizations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  orgType: text("org_type", { enum: ["company", "university", "factory", "hospital", "hotel", "travel_agency", "relief_org", "other"] }).notNull().default("company"),
  name: text("name").notNull(),
  commercialReg: text("commercial_reg").notNull(),
  industry: text("industry"),
  contactPerson: text("contact_person").notNull(),
  contactPhone: text("contact_phone").notNull(),
  contactEmail: text("contact_email"),
  address: text("address"),
  city: text("city").notNull().default("الرياض"),
  bankAccount: json("bank_account").$type<{ bankName: string; iban: string; accountHolder: string }>(),
  totalEmployees: integer("total_employees").notNull().default(0),
  monthlyBudget: real("monthly_budget"),
  status: text("status", { enum: ["pending", "approved", "active", "suspended"] }).notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const orgEmployeesTable = pgTable("org_employees", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull().references(() => organizationsTable.id),
  employeeCode: text("employee_code"),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  department: text("department"),
  monthlyBudget: real("monthly_budget"),
  tripsLimit: integer("trips_limit"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const orgRoutesTable = pgTable("org_routes", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull().references(() => organizationsTable.id),
  name: text("name").notNull(),
  startPoint: text("start_point").notNull(),
  endPoint: text("end_point").notNull(),
  scheduleTime: text("schedule_time").notNull(),
  scheduleDays: text("schedule_days").notNull().default("الأحد-الخميس"),
  vehicleType: text("vehicle_type").notNull().default("باص"),
  capacity: integer("capacity").notNull().default(20),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const orgInvoicesTable = pgTable("org_invoices", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull().references(() => organizationsTable.id),
  invoiceNumber: text("invoice_number").notNull().unique(),
  periodStart: timestamp("period_start", { withTimezone: true }).notNull(),
  periodEnd: timestamp("period_end", { withTimezone: true }).notNull(),
  totalTrips: integer("total_trips").notNull().default(0),
  totalAmount: real("total_amount").notNull().default(0),
  status: text("status", { enum: ["pending", "paid", "overdue"] }).notNull().default("pending"),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertOrganizationSchema = createInsertSchema(organizationsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertOrgEmployeeSchema = createInsertSchema(orgEmployeesTable).omit({ id: true, createdAt: true });
export type Organization = typeof organizationsTable.$inferSelect;
export type OrgEmployee = typeof orgEmployeesTable.$inferSelect;
export type OrgRoute = typeof orgRoutesTable.$inferSelect;
export type OrgInvoice = typeof orgInvoicesTable.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
