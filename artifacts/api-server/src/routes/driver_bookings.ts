import { Router } from "express";
import { db } from "@workspace/db";
import { driverBookingsTable, driversTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

// List my driver bookings
router.get("/driver-bookings", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;

  const bookings = await db
    .select()
    .from(driverBookingsTable)
    .where(eq(driverBookingsTable.userId, userId))
    .orderBy(desc(driverBookingsTable.createdAt));

  const bookingsWithDrivers = await Promise.all(
    bookings.map(async (booking) => {
      if (!booking.driverId) return { ...booking, driver: null };
      const [driverRow] = await db
        .select()
        .from(driversTable)
        .where(eq(driversTable.id, booking.driverId))
        .limit(1);
      if (!driverRow) return { ...booking, driver: null };
      const [userRow] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, driverRow.userId))
        .limit(1);
      return {
        ...booking,
        driver: userRow
          ? {
              ...driverRow,
              name: userRow.name,
              phone: userRow.phone,
              avatarUrl: userRow.avatarUrl,
            }
          : null,
      };
    })
  );

  res.json({ items: bookingsWithDrivers, total: bookingsWithDrivers.length });
});

// Book a private driver
router.post("/driver-bookings", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const { driverId, purpose, startDatetime, endDatetime, location, notes } = req.body;

  if (!purpose || !startDatetime || !endDatetime || !location) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const start = new Date(startDatetime);
  const end = new Date(endDatetime);
  const totalHours = Math.max(1, (end.getTime() - start.getTime()) / (1000 * 60 * 60));
  const hourlyRate = 50; // SAR per hour
  const totalPrice = totalHours * hourlyRate;

  const [booking] = await db
    .insert(driverBookingsTable)
    .values({
      userId,
      driverId: driverId ? parseInt(driverId) : null,
      purpose,
      startDatetime: start,
      endDatetime: end,
      location,
      totalHours,
      totalPrice,
      notes,
      status: "pending",
    })
    .returning();

  res.status(201).json({ ...booking, driver: null });
});

// Get driver booking
router.get("/driver-bookings/:id", requireAuth, async (req, res) => {
  const id = parseInt(String(req.params.id));

  const [booking] = await db
    .select()
    .from(driverBookingsTable)
    .where(eq(driverBookingsTable.id, id))
    .limit(1);

  if (!booking) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  let driver = null;
  if (booking.driverId) {
    const [driverRow] = await db
      .select()
      .from(driversTable)
      .where(eq(driversTable.id, booking.driverId))
      .limit(1);
    if (driverRow) {
      const [userRow] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, driverRow.userId))
        .limit(1);
      driver = userRow
        ? { ...driverRow, name: userRow.name, phone: userRow.phone, avatarUrl: userRow.avatarUrl }
        : null;
    }
  }

  res.json({ ...booking, driver });
});

// Update driver booking status
router.patch("/driver-bookings/:id", requireAuth, async (req, res) => {
  const id = parseInt(String(req.params.id));
  const { status, driverId } = req.body;

  const updates: Record<string, unknown> = {};
  if (status) updates.status = status;
  if (driverId) updates.driverId = parseInt(driverId);

  const [updated] = await db
    .update(driverBookingsTable)
    .set(updates)
    .where(eq(driverBookingsTable.id, id))
    .returning();

  res.json({ ...updated, driver: null });
});

export default router;
