import { Router } from "express";
import { db } from "@workspace/db";
import {
  inviteTripsTable,
  inviteGuestsTable,
} from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import crypto from "crypto";

const router = Router();

function generateInviteCode(): string {
  return crypto.randomBytes(6).toString("hex");
}

// List my invite trips
router.get("/invite-trips", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const trips = await db
    .select()
    .from(inviteTripsTable)
    .where(eq(inviteTripsTable.creatorId, userId))
    .orderBy(desc(inviteTripsTable.createdAt));

  const tripsWithGuests = await Promise.all(
    trips.map(async (trip) => {
      const guests = await db
        .select()
        .from(inviteGuestsTable)
        .where(eq(inviteGuestsTable.inviteTripId, trip.id));
      return { ...trip, guests };
    })
  );

  res.json({ items: tripsWithGuests, total: tripsWithGuests.length });
});

// Create invite trip
router.post("/invite-trips", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const { title, fromAddress, toAddress, vehicleType, scheduledAt, maxGuests, notes } =
    req.body;

  if (!title || !fromAddress || !toAddress || !vehicleType || !scheduledAt) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const inviteCode = generateInviteCode();
  const [trip] = await db
    .insert(inviteTripsTable)
    .values({
      creatorId: userId,
      title,
      fromAddress,
      toAddress,
      vehicleType,
      scheduledAt: new Date(scheduledAt),
      inviteCode,
      maxGuests: maxGuests ?? 4,
      notes,
    })
    .returning();

  res.status(201).json({ ...trip, guests: [] });
});

// Get invite trip by ID
router.get("/invite-trips/:id", requireAuth, async (req, res) => {
  const tripId = parseInt(req.params.id);
  const [trip] = await db
    .select()
    .from(inviteTripsTable)
    .where(eq(inviteTripsTable.id, tripId))
    .limit(1);

  if (!trip) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const guests = await db
    .select()
    .from(inviteGuestsTable)
    .where(eq(inviteGuestsTable.inviteTripId, trip.id));

  res.json({ ...trip, guests });
});

// Update invite trip
router.patch("/invite-trips/:id", requireAuth, async (req, res) => {
  const tripId = parseInt(req.params.id);
  const userId = (req as any).user.id;

  const [existing] = await db
    .select()
    .from(inviteTripsTable)
    .where(eq(inviteTripsTable.id, tripId))
    .limit(1);

  if (!existing || existing.creatorId !== userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const { title, scheduledAt, status, notes } = req.body;
  const updates: Record<string, unknown> = {};
  if (title) updates.title = title;
  if (scheduledAt) updates.scheduledAt = new Date(scheduledAt);
  if (status) updates.status = status;
  if (notes !== undefined) updates.notes = notes;

  const [updated] = await db
    .update(inviteTripsTable)
    .set(updates)
    .where(eq(inviteTripsTable.id, tripId))
    .returning();

  const guests = await db
    .select()
    .from(inviteGuestsTable)
    .where(eq(inviteGuestsTable.inviteTripId, tripId));

  res.json({ ...updated, guests });
});

// Get trip by invite code (public)
router.get("/invite/:inviteCode", async (req, res) => {
  const { inviteCode } = req.params;
  const [trip] = await db
    .select()
    .from(inviteTripsTable)
    .where(eq(inviteTripsTable.inviteCode, inviteCode))
    .limit(1);

  if (!trip) {
    res.status(404).json({ error: "Invalid invite link" });
    return;
  }

  const guests = await db
    .select()
    .from(inviteGuestsTable)
    .where(eq(inviteGuestsTable.inviteTripId, trip.id));

  res.json({ ...trip, guests });
});

// Respond to invite
router.post("/invite/:inviteCode/respond", async (req, res) => {
  const { inviteCode } = req.params;
  const { name, phone, pickupAddress, response } = req.body;

  if (!name || !phone || !response) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const [trip] = await db
    .select()
    .from(inviteTripsTable)
    .where(eq(inviteTripsTable.inviteCode, inviteCode))
    .limit(1);

  if (!trip) {
    res.status(404).json({ error: "Invalid invite link" });
    return;
  }

  if (trip.status !== "open") {
    res.status(400).json({ error: "Trip is no longer accepting responses" });
    return;
  }

  const guestCount = await db
    .select()
    .from(inviteGuestsTable)
    .where(eq(inviteGuestsTable.inviteTripId, trip.id));

  const accepted = guestCount.filter((g) => g.status === "accepted");
  if (accepted.length >= trip.maxGuests && response === "accepted") {
    res.status(400).json({ error: "Trip is full" });
    return;
  }

  const [guest] = await db
    .insert(inviteGuestsTable)
    .values({
      inviteTripId: trip.id,
      name,
      phone,
      pickupAddress,
      status: response === "accepted" ? "accepted" : "declined",
    })
    .returning();

  res.status(201).json(guest);
});

// Confirm invite trip
router.post("/invite-trips/:id/confirm", requireAuth, async (req, res) => {
  const tripId = parseInt(req.params.id);
  const userId = (req as any).user.id;

  const [existing] = await db
    .select()
    .from(inviteTripsTable)
    .where(eq(inviteTripsTable.id, tripId))
    .limit(1);

  if (!existing || existing.creatorId !== userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const [updated] = await db
    .update(inviteTripsTable)
    .set({ status: "confirmed" })
    .where(eq(inviteTripsTable.id, tripId))
    .returning();

  const guests = await db
    .select()
    .from(inviteGuestsTable)
    .where(eq(inviteGuestsTable.inviteTripId, tripId));

  res.json({ ...updated, guests });
});

export default router;
