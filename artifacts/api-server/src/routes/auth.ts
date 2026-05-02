import { Router } from "express";
import crypto from "crypto";
import { db, usersTable, driversTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { RegisterUserBody, LoginUserBody } from "@workspace/api-zod";
import { requireAuth, signToken } from "../middlewares/auth";

const router = Router();

function hashPassword(password: string): string {
  return crypto.createHmac("sha256", "mishwar-salt").update(password).digest("hex");
}

router.post("/auth/register", async (req, res) => {
  const parsed = RegisterUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { name, phone, email, password, role } = parsed.data;

  const existing = await db.select().from(usersTable).where(eq(usersTable.phone, phone)).limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: "Phone already registered" });
    return;
  }

  const [user] = await db.insert(usersTable).values({
    name,
    phone,
    email,
    passwordHash: hashPassword(password),
    role: role ?? "passenger",
  }).returning();

  const token = signToken({ id: user.id, phone: user.phone, role: user.role });
  const { passwordHash: _, ...safeUser } = user;
  res.status(201).json({ token, user: safeUser });
});

router.post("/auth/login", async (req, res) => {
  const parsed = LoginUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { phone, password } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.phone, phone)).limit(1);
  if (!user || user.passwordHash !== hashPassword(password)) {
    res.status(401).json({ error: "Invalid phone or password" });
    return;
  }

  const token = signToken({ id: user.id, phone: user.phone, role: user.role });
  const { passwordHash: _, ...safeUser } = user;
  res.json({ token, user: safeUser });
});

router.get("/auth/me", requireAuth, async (req, res) => {
  const authReq = req as typeof req & { user: { id: number } };
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, authReq.user.id)).limit(1);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const { passwordHash: _, ...safeUser } = user;
  res.json(safeUser);
});

export default router;
