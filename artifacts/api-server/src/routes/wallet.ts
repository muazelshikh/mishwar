import { Router } from "express";
import { db, walletsTable, walletTransactionsTable, paymentsTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { z } from "zod/v4";
import { requireAuth } from "../middlewares/auth";

const router = Router();

async function getOrCreateWallet(userId: number) {
  const inserted = await db
    .insert(walletsTable)
    .values({ userId, balance: 0, currency: "SAR" })
    .onConflictDoNothing({ target: walletsTable.userId })
    .returning();
  if (inserted.length > 0) return inserted[0];
  const [existing] = await db
    .select()
    .from(walletsTable)
    .where(eq(walletsTable.userId, userId))
    .limit(1);
  if (!existing) {
    throw new Error("Wallet creation race could not be resolved");
  }
  return existing;
}

const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).max(100_000).default(0),
});

router.get("/wallet/me", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const wallet = await getOrCreateWallet(userId);
  res.json(wallet);
});

router.get("/wallet/transactions", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const parsed = paginationSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid pagination", details: parsed.error.issues });
    return;
  }
  const { limit, offset } = parsed.data;
  const txs = await db
    .select()
    .from(walletTransactionsTable)
    .where(eq(walletTransactionsTable.userId, userId))
    .orderBy(desc(walletTransactionsTable.createdAt))
    .limit(limit)
    .offset(offset);
  res.json({ items: txs, limit, offset });
});

const topupSchema = z.object({
  amount: z.coerce.number().int().min(1000).max(1_000_000),
}).strict();

router.post("/wallet/topup", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const parsed = topupSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid amount", details: parsed.error.issues });
    return;
  }
  const { amount } = parsed.data;

  await getOrCreateWallet(userId);

  const [payment] = await db.insert(paymentsTable).values({
    userId,
    amount,
    currency: "SAR",
    purpose: "wallet_topup",
    status: "pending",
    provider: "stripe",
  }).returning();

  res.json({
    payment,
    message: "Payment intent created. Stripe checkout URL will be issued once Stripe is connected.",
    nextStep: "stripe_checkout",
  });
});

router.get("/wallet/payments", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const parsed = paginationSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid pagination", details: parsed.error.issues });
    return;
  }
  const { limit, offset } = parsed.data;
  const items = await db
    .select()
    .from(paymentsTable)
    .where(eq(paymentsTable.userId, userId))
    .orderBy(desc(paymentsTable.createdAt))
    .limit(limit)
    .offset(offset);
  res.json({ items, limit, offset });
});

router.get("/wallet/summary", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const wallet = await getOrCreateWallet(userId);

  const result: any = await db.execute(sql`
    SELECT
      COALESCE(SUM(CASE WHEN type = 'topup' AND status = 'completed' THEN amount ELSE 0 END), 0)::int AS total_topup,
      COALESCE(SUM(CASE WHEN type IN ('ride_payment','subscription_payment','rental_payment') AND status = 'completed' THEN ABS(amount) ELSE 0 END), 0)::int AS total_spent,
      COUNT(*)::int AS tx_count
    FROM wallet_transactions
    WHERE user_id = ${userId}
  `);
  const stats = (result.rows ?? result)[0] ?? { total_topup: 0, total_spent: 0, tx_count: 0 };

  res.json({
    balance: wallet.balance,
    currency: wallet.currency,
    totalTopup: stats.total_topup ?? 0,
    totalSpent: stats.total_spent ?? 0,
    transactionCount: stats.tx_count ?? 0,
  });
});

export default router;
