import { Router } from "express";
import { db, driversTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateDriverBody, ListDriversQueryParams } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/drivers", async (req, res) => {
  const query = ListDriversQueryParams.safeParse(req.query);
  const limit = query.success ? (query.data.limit ?? 20) : 20;
  const offset = query.success ? (query.data.offset ?? 0) : 0;

  const rows = await db.select({
    driver: driversTable,
    user: {
      name: usersTable.name,
      phone: usersTable.phone,
      avatarUrl: usersTable.avatarUrl,
    }
  })
    .from(driversTable)
    .leftJoin(usersTable, eq(driversTable.userId, usersTable.id))
    .limit(limit)
    .offset(offset);

  const items = rows.map(r => ({
    ...r.driver,
    name: r.user?.name ?? "",
    phone: r.user?.phone ?? "",
    avatarUrl: r.user?.avatarUrl ?? null,
  }));

  res.json({ items, total: items.length });
});

router.get("/drivers/:driverId", async (req, res) => {
  const driverId = parseInt(req.params.driverId);
  if (isNaN(driverId)) { res.status(400).json({ error: "Invalid driverId" }); return; }

  const [row] = await db.select({
    driver: driversTable,
    user: { name: usersTable.name, phone: usersTable.phone, avatarUrl: usersTable.avatarUrl }
  })
    .from(driversTable)
    .leftJoin(usersTable, eq(driversTable.userId, usersTable.id))
    .where(eq(driversTable.id, driverId))
    .limit(1);

  if (!row) { res.status(404).json({ error: "Driver not found" }); return; }
  res.json({ ...row.driver, name: row.user?.name ?? "", phone: row.user?.phone ?? "", avatarUrl: row.user?.avatarUrl ?? null });
});

router.post("/drivers", requireAuth, async (req, res) => {
  const authReq = req as typeof req & { user: { id: number } };
  const parsed = CreateDriverBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const existing = await db.select().from(driversTable).where(eq(driversTable.userId, authReq.user.id)).limit(1);
  if (existing.length > 0) { res.status(409).json({ error: "Already registered as driver" }); return; }

  const [driver] = await db.insert(driversTable).values({
    userId: authReq.user.id,
    ...parsed.data,
  }).returning();

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, authReq.user.id)).limit(1);
  res.status(201).json({ ...driver, name: user?.name ?? "", phone: user?.phone ?? "", avatarUrl: user?.avatarUrl ?? null });
});

export default router;
