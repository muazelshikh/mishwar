import { Router } from "express";
import { db } from "@workspace/db";
import { rentalCarsTable, rentalBookingsTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

// List available rental cars
router.get("/rentals", async (req, res) => {
  const { vehicleType } = req.query;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = parseInt(req.query.offset as string) || 0;

  let query = db.select().from(rentalCarsTable).$dynamic();

  if (vehicleType) {
    query = query.where(eq(rentalCarsTable.vehicleType, vehicleType as string));
  }

  const cars = await query.limit(limit).offset(offset);
  const total = cars.length;

  res.json({ items: cars, total });
});

// Book a rental car
router.post("/rentals", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  const { carId, startDate, endDate, notes } = req.body;

  if (!carId || !startDate || !endDate) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const [car] = await db
    .select()
    .from(rentalCarsTable)
    .where(eq(rentalCarsTable.id, parseInt(carId)))
    .limit(1);

  if (!car) {
    res.status(404).json({ error: "Car not found" });
    return;
  }

  if (!car.isAvailable) {
    res.status(400).json({ error: "Car is not available" });
    return;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const totalPrice = totalDays * car.dailyRate;

  const [booking] = await db
    .insert(rentalBookingsTable)
    .values({
      userId,
      carId: car.id,
      startDate,
      endDate,
      totalDays,
      totalPrice,
      notes,
      status: "pending",
    })
    .returning();

  res.status(201).json({ ...booking, car });
});

// List my rental bookings
router.get("/rentals/my-bookings", requireAuth, async (req, res) => {
  const userId = (req as any).userId;

  const bookings = await db
    .select()
    .from(rentalBookingsTable)
    .where(eq(rentalBookingsTable.userId, userId))
    .orderBy(desc(rentalBookingsTable.createdAt));

  const bookingsWithCars = await Promise.all(
    bookings.map(async (booking) => {
      const [car] = await db
        .select()
        .from(rentalCarsTable)
        .where(eq(rentalCarsTable.id, booking.carId))
        .limit(1);
      return { ...booking, car };
    })
  );

  res.json({ items: bookingsWithCars, total: bookingsWithCars.length });
});

// Get rental booking
router.get("/rentals/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);

  const [booking] = await db
    .select()
    .from(rentalBookingsTable)
    .where(eq(rentalBookingsTable.id, id))
    .limit(1);

  if (!booking) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const [car] = await db
    .select()
    .from(rentalCarsTable)
    .where(eq(rentalCarsTable.id, booking.carId))
    .limit(1);

  res.json({ ...booking, car });
});

// Cancel rental booking
router.delete("/rentals/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  const userId = (req as any).userId;

  const [booking] = await db
    .select()
    .from(rentalBookingsTable)
    .where(and(eq(rentalBookingsTable.id, id), eq(rentalBookingsTable.userId, userId)))
    .limit(1);

  if (!booking) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const [updated] = await db
    .update(rentalBookingsTable)
    .set({ status: "cancelled" })
    .where(eq(rentalBookingsTable.id, id))
    .returning();

  const [car] = await db
    .select()
    .from(rentalCarsTable)
    .where(eq(rentalCarsTable.id, booking.carId))
    .limit(1);

  res.json({ ...updated, car });
});

export default router;
