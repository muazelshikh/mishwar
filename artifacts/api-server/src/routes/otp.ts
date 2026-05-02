import { Router } from "express";
import crypto from "crypto";
import { db, otpCodesTable, usersTable } from "@workspace/db";
import { eq, and, isNull, gt, desc, sql } from "drizzle-orm";
import { z } from "zod/v4";
import { signToken } from "../middlewares/auth";
import { sendSms } from "../lib/sms";

const router = Router();

const PHONE_RE = /^\+?[0-9]{8,16}$/;
const OTP_TTL_SEC = 300;
const MAX_REQUESTS_PER_HOUR = 5;
const MAX_VERIFY_ATTEMPTS = 5;

const requestSchema = z.object({
  phone: z.string().regex(PHONE_RE, "Invalid phone format"),
  purpose: z.enum(["login", "signup", "reset", "verify_phone"]).default("login"),
}).strict();

const verifySchema = z.object({
  phone: z.string().regex(PHONE_RE),
  code: z.string().regex(/^[0-9]{6}$/, "Code must be 6 digits"),
  purpose: z.enum(["login", "signup", "reset", "verify_phone"]).default("login"),
}).strict();

function hashCode(phone: string, code: string): string {
  return crypto.createHash("sha256").update(`${phone}:${code}`).digest("hex");
}

router.post("/auth/otp/request", async (req, res) => {
  const parsed = requestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    return;
  }
  const { phone, purpose } = parsed.data;

  const result: any = await db.execute(sql`
    SELECT COUNT(*)::int AS cnt FROM otp_codes
    WHERE phone = ${phone} AND created_at > NOW() - INTERVAL '1 hour'
  `);
  const recentCount = (result.rows ?? result)[0]?.cnt ?? 0;
  if (recentCount >= MAX_REQUESTS_PER_HOUR) {
    res.status(429).json({ error: "Too many OTP requests. Try again later." });
    return;
  }

  const code = String(Math.floor(100000 + crypto.randomInt(900000)));
  const codeHash = hashCode(phone, code);
  const expiresAt = new Date(Date.now() + OTP_TTL_SEC * 1000);

  await db.insert(otpCodesTable).values({ phone, codeHash, purpose, expiresAt });

  const message = `رمز التحقق لتطبيق مشوار: ${code}\nصالح لمدة 5 دقائق. لا تشاركه مع أحد.`;
  try {
    await sendSms(phone, message);
  } catch (e: any) {
    res.status(503).json({ error: "Failed to send SMS", reason: e?.message });
    return;
  }

  res.json({ sent: true, expiresIn: OTP_TTL_SEC });
});

router.post("/auth/otp/verify", async (req, res) => {
  const parsed = verifySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    return;
  }
  const { phone, code, purpose } = parsed.data;
  const codeHash = hashCode(phone, code);

  const [otp] = await db
    .select()
    .from(otpCodesTable)
    .where(
      and(
        eq(otpCodesTable.phone, phone),
        eq(otpCodesTable.codeHash, codeHash),
        eq(otpCodesTable.purpose, purpose),
        isNull(otpCodesTable.usedAt),
        gt(otpCodesTable.expiresAt, new Date()),
      ),
    )
    .orderBy(desc(otpCodesTable.createdAt))
    .limit(1);

  if (!otp) {
    res.status(400).json({ error: "Invalid or expired code" });
    return;
  }

  if (otp.attempts >= MAX_VERIFY_ATTEMPTS) {
    res.status(429).json({ error: "Too many verification attempts" });
    return;
  }

  await db.update(otpCodesTable).set({ usedAt: new Date() }).where(eq(otpCodesTable.id, otp.id));

  if (purpose === "login") {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.phone, phone)).limit(1);
    if (!user) {
      res.status(404).json({ error: "User not found. Please sign up first." });
      return;
    }
    const token = signToken({ id: user.id, phone: user.phone, role: user.role });
    const { passwordHash: _, ...safeUser } = user;
    res.json({ verified: true, token, user: safeUser });
    return;
  }

  res.json({ verified: true, phone });
});

export default router;
