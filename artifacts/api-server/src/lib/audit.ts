import { Request } from "express";
import { db, auditLogsTable } from "@workspace/db";

export type AuditOptions = {
  actorId?: number | null;
  action: string;
  entityType?: string;
  entityId?: number;
  diff?: Record<string, unknown>;
  req?: Request;
};

export async function audit(opts: AuditOptions): Promise<void> {
  try {
    await db.insert(auditLogsTable).values({
      actorId: opts.actorId ?? null,
      action: opts.action,
      entityType: opts.entityType ?? null,
      entityId: opts.entityId ?? null,
      diff: opts.diff ?? null,
      ip: opts.req?.ip ?? null,
      userAgent: opts.req?.headers?.["user-agent"] ?? null,
    });
  } catch (e) {
    // Audit must never break business flow
    console.error("Audit log insert failed:", e);
  }
}
