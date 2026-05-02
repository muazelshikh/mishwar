import { Router } from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { RegisterUserBody, LoginUserBody } from "@workspace/api-zod";
import { requireAuth, signToken } from "../middlewares/auth";

const router = Router();

const BCRYPT_ROUNDS = 12;
const LEGACY_HMAC_SALT = "mishwar-salt";

function legacyHash(password: string): string {
  return crypto.createHmac("sha256", LEGACY_HMAC_SALT).update(password).digest("hex");
}

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

async function verifyPassword(plain: string, stored: string): Promise<{ ok: boolean; needsRehash: boolean }> {
  if (stored.startsWith("$2a$") || stored.startsWith("$2b$") || stored.startsWith("$2y$")) {
    const ok = await bcrypt.compare(plain, stored);
    return { ok, needsRehash: false };
  }
  const expected = legacyHash(plain);
  const a = Buffer.from(stored);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return { ok: false, needsRehash: false };
  const ok = crypto.timingSafeEqual(a, b);
  return { ok, needsRehash: ok };
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

  const passwordHash = await hashPassword(password);
  const [user] = await db.insert(usersTable).values({
    name,
    phone,
    email,
    passwordHash,
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
  if (!user) {
    res.status(401).json({ error: "Invalid phone or password" });
    return;
  }

  const { ok, needsRehash } = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    res.status(401).json({ error: "Invalid phone or password" });
    return;
  }

  if (needsRehash) {
    try {
      const newHash = await hashPassword(password);
      await db.update(usersTable).set({ passwordHash: newHash }).where(eq(usersTable.id, user.id));
    } catch (e) {
      console.error("Failed to rehash legacy password:", e);
    }
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
