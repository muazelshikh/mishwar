import { Router } from "express";
import { db, ridesTable, driversTable, usersTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { CreateRideBody, UpdateRideBody, ListRidesQueryParams } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";
import { debitWalletInTx, creditWalletInTx, InsufficientFundsError } from "../lib/wallet-service";

const router = Router();

const DRIVER_SHARE_PERCENT = 80;

class RideNotFoundError extends Error {
  constructor() { super("Ride not found"); this.name = "RideNotFoundError"; }
}

async function enrichRide(ride: typeof ridesTable.$inferSelect) {
  if (!ride.driverId) return { ...ride, driver: null };
  const [row] = await db.select({
    driver: driversTable,
    user: { name: usersTable.name, phone: usersTable.phone, avatarUrl: usersTable.avatarUrl }
  })
    .from(driversTable)
    .leftJoin(usersTable, eq(driversTable.userId, usersTable.id))
    .where(eq(driversTable.id, ride.driverId))
    .limit(1);

  if (!row) return { ...ride, driver: null };
  return { ...ride, driver: { ...row.driver, name: row.user?.name ?? "", phone: row.user?.phone ?? "", avatarUrl: row.user?.avatarUrl ?? null } };
}

router.get("/rides", requireAuth, async (req, res) => {
  const authReq = req as typeof req & { user: { id: number; role: string } };
  const query = ListRidesQueryParams.safeParse(req.query);
  const limit = query.success ? (query.data.limit ?? 20) : 20;
  const offset = query.success ? (query.data.offset ?? 0) : 0;
  const status = query.success ? query.data.status : undefined;

  const conditions = authReq.user.role === "admin"
    ? (status ? [eq(ridesTable.status, status)] : [])
    : [eq(ridesTable.passengerId, authReq.user.id), ...(status ? [eq(ridesTable.status, status)] : [])];

  const rows = await db.select().from(ridesTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(ridesTable.createdAt))
    .limit(limit)
    .offset(offset);

  const items = await Promise.all(rows.map(enrichRide));
  res.json({ items, total: items.length });
});

router.post("/rides", requireAuth, async (req, res) => {
  const authReq = req as typeof req & { user: { id: number } };
  const parsed = CreateRideBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const estimatedPrice = Math.round(15 + Math.random() * 35);
  const [ride] = await db.insert(ridesTable).values({
    passengerId: authReq.user.id,
    estimatedPrice,
    ...parsed.data,
  }).returning();

  res.status(201).json(await enrichRide(ride));
});

router.get("/rides/:rideId", requireAuth, async (req, res) => {
  const rideId = parseInt(String(req.params.rideId));
  if (isNaN(rideId)) { res.status(400).json({ error: "Invalid rideId" }); return; }

  const [ride] = await db.select().from(ridesTable).where(eq(ridesTable.id, rideId)).limit(1);
  if (!ride) { res.status(404).json({ error: "Ride not found" }); return; }

  res.json(await enrichRide(ride));
});

router.patch("/rides/:rideId", requireAuth, async (req, res) => {
  const rideId = parseInt(String(req.params.rideId));
  if (isNaN(rideId)) { res.status(400).json({ error: "Invalid rideId" }); return; }

  const parsed = UpdateRideBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  let updatedRide: typeof ridesTable.$inferSelect;
  try {
    updatedRide = await db.transaction(async (tx) => {
      // Lock the ride row to serialize concurrent completion attempts (prevents double-debit TOCTOU)
      const [existing] = await tx
        .select()
        .from(ridesTable)
        .where(eq(ridesTable.id, rideId))
        .for("update")
        .limit(1);

      if (!existing) throw new RideNotFoundError();

      const updates: Partial<typeof ridesTable.$inferInsert> = { ...parsed.data };
      const isCompleting = parsed.data.status === "completed" && existing.status !== "completed";

      if (isCompleting) {
        const finalPrice = updates.finalPrice ?? existing.finalPrice ?? existing.estimatedPrice ?? 0;
        if (finalPrice > 0) {
          const halalas = Math.round(finalPrice * 100);

          // Debit passenger inside the same transaction — rollback on insufficient funds
          await debitWalletInTx(tx, {
            userId: existing.passengerId,
            amount: halalas,
            type: "ride_payment",
            description: `دفع رحلة #${existing.id}: ${existing.fromAddress} → ${existing.toAddress}`,
            referenceType: "ride",
            referenceId: existing.id,
          });

          // Credit driver
          if (existing.driverId) {
            const [driver] = await tx
              .select()
              .from(driversTable)
              .where(eq(driversTable.id, existing.driverId))
              .limit(1);
            if (driver?.userId) {
              const driverShare = Math.round((halalas * DRIVER_SHARE_PERCENT) / 100);
              await creditWalletInTx(tx, {
                userId: driver.userId,
                amount: driverShare,
                type: "payout",
                description: `أرباح رحلة #${existing.id}`,
                referenceType: "ride",
                referenceId: existing.id,
              });
            }
          }
        }
        updates.finalPrice = updates.finalPrice ?? existing.finalPrice ?? existing.estimatedPrice ?? 0;
        updates.completedAt = new Date();
      }

      const [updated] = await tx
        .update(ridesTable)
        .set(updates)
        .where(eq(ridesTable.id, rideId))
        .returning();
      return updated;
    });
  } catch (e) {
    if (e instanceof RideNotFoundError) {
      res.status(404).json({ error: "Ride not found" });
      return;
    }
    if (e instanceof InsufficientFundsError) {
      res.status(402).json({
        error: "رصيد المحفظة غير كافٍ لإتمام الرحلة",
        balance: e.balance,
        required: e.required,
        currency: "SAR",
      });
      return;
    }
    throw e;
  }

  res.json(await enrichRide(updatedRide));
});

export default router;
