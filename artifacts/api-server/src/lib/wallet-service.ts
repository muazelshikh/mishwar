import { db, walletsTable, walletTransactionsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

export type CreditOptions = {
  userId: number;
  amount: number;
  type: "topup" | "refund" | "adjustment" | "payout";
  description?: string;
  referenceType?: string;
  referenceId?: number;
  stripePaymentIntentId?: string;
};

export type DebitOptions = {
  userId: number;
  amount: number;
  type: "ride_payment" | "subscription_payment" | "rental_payment" | "adjustment";
  description?: string;
  referenceType?: string;
  referenceId?: number;
  allowNegative?: boolean;
};

export class InsufficientFundsError extends Error {
  constructor(public balance: number, public required: number) {
    super(`Insufficient funds: balance=${balance}, required=${required}`);
    this.name = "InsufficientFundsError";
  }
}

async function ensureAndLockWallet(tx: any, userId: number) {
  await tx
    .insert(walletsTable)
    .values({ userId, balance: 0, currency: "SAR" })
    .onConflictDoNothing({ target: walletsTable.userId });

  const [wallet] = await tx
    .select()
    .from(walletsTable)
    .where(eq(walletsTable.userId, userId))
    .for("update")
    .limit(1);

  if (!wallet) throw new Error(`Wallet missing for user ${userId} after upsert`);
  return wallet;
}

export async function creditWallet(opts: CreditOptions) {
  if (opts.amount <= 0) throw new Error("Credit amount must be positive");
  return await db.transaction(async (tx) => {
    const wallet = await ensureAndLockWallet(tx, opts.userId);
    const newBalance = wallet.balance + opts.amount;
    await tx.update(walletsTable).set({ balance: newBalance }).where(eq(walletsTable.id, wallet.id));
    const [txn] = await tx
      .insert(walletTransactionsTable)
      .values({
        walletId: wallet.id,
        userId: opts.userId,
        type: opts.type,
        amount: opts.amount,
        balanceAfter: newBalance,
        status: "completed",
        description: opts.description ?? null,
        referenceType: opts.referenceType ?? null,
        referenceId: opts.referenceId ?? null,
        stripePaymentIntentId: opts.stripePaymentIntentId ?? null,
      })
      .returning();
    return { wallet: { ...wallet, balance: newBalance }, transaction: txn };
  });
}

export async function debitWallet(opts: DebitOptions) {
  if (opts.amount <= 0) throw new Error("Debit amount must be positive");
  return await db.transaction(async (tx) => {
    const wallet = await ensureAndLockWallet(tx, opts.userId);
    const newBalance = wallet.balance - opts.amount;
    if (newBalance < 0 && !opts.allowNegative) {
      throw new InsufficientFundsError(wallet.balance, opts.amount);
    }
    await tx.update(walletsTable).set({ balance: newBalance }).where(eq(walletsTable.id, wallet.id));
    const [txn] = await tx
      .insert(walletTransactionsTable)
      .values({
        walletId: wallet.id,
        userId: opts.userId,
        type: opts.type,
        amount: -opts.amount,
        balanceAfter: newBalance,
        status: "completed",
        description: opts.description ?? null,
        referenceType: opts.referenceType ?? null,
        referenceId: opts.referenceId ?? null,
      })
      .returning();
    return { wallet: { ...wallet, balance: newBalance }, transaction: txn };
  });
}
