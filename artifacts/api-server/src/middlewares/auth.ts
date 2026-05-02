import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

const RAW_SECRET = process.env.SESSION_SECRET;
const FORBIDDEN_DEFAULTS = new Set(["mishwar-secret-key", "secret", "changeme", "default", ""]);

if (!RAW_SECRET || RAW_SECRET.length < 16 || FORBIDDEN_DEFAULTS.has(RAW_SECRET)) {
  throw new Error(
    "SESSION_SECRET env var is required and must be at least 16 chars (and not a known default). Refusing to start.",
  );
}

const SECRET: string = RAW_SECRET;
const DEFAULT_TTL_SEC = 7 * 24 * 60 * 60;

export function signToken(payload: Record<string, unknown>, ttlSec: number = DEFAULT_TTL_SEC): string {
  const now = Math.floor(Date.now() / 1000);
  const claims = { ...payload, iat: now, exp: now + ttlSec };
  const data = JSON.stringify(claims);
  const encoded = Buffer.from(data).toString("base64url");
  const sig = crypto.createHmac("sha256", SECRET).update(encoded).digest("base64url");
  return `${encoded}.${sig}`;
}

export function verifyToken(token: string): Record<string, unknown> | null {
  try {
    const [encoded, sig] = token.split(".");
    if (!encoded || !sig) return null;
    const expected = crypto.createHmac("sha256", SECRET).update(encoded).digest("base64url");
    const sigBuf = Buffer.from(sig);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length) return null;
    if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null;

    const claims = JSON.parse(Buffer.from(encoded, "base64url").toString());
    const exp = typeof claims.exp === "number" ? claims.exp : null;
    if (exp === null) return null;
    const now = Math.floor(Date.now() / 1000);
    if (exp < now) return null;
    return claims;
  } catch {
    return null;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }
  (req as Request & { user: Record<string, unknown> }).user = payload;
  next();
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const payload = verifyToken(token);
    if (payload) {
      (req as Request & { user: Record<string, unknown> }).user = payload;
    }
  }
  next();
}
