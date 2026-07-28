import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { user } from "../models/auth.model";
import { emailVerification } from "../models/email-verification.model";
import { sendTemplateEmail } from "./transactional-email.service";

const webOrigin = process.env.WEB_ORIGIN ?? "http://localhost:3000";

/** §5.1.2 — code and link both expire in 30 minutes. */
const TTL_MS = 30 * 60 * 1000;
/** Resend is capped at 1 per 60s and 5 per hour. */
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_SENDS_PER_HOUR = 5;
const HOUR_MS = 60 * 60 * 1000;
/** Wrong codes against one row before it is burned and a resend is required. */
const MAX_ATTEMPTS = 5;

export class VerificationError extends Error {
  constructor(
    message: string,
    readonly code:
      | "unknown-email"
      | "already-verified"
      | "cooldown"
      | "hourly-cap"
      | "expired"
      | "invalid"
      | "too-many-attempts",
    /** Seconds until the caller may retry — only set for `cooldown`. */
    readonly retryAfter?: number,
  ) {
    super(message);
  }
}

const sixDigits = () => String(Math.floor(100_000 + Math.random() * 900_000));

async function findUser(email: string) {
  return db.query.user.findFirst({ where: (row, { eq: is }) => is(row.email, email) });
}

/**
 * Issues a fresh code + token and emails both. Replaces any live row, so the
 * previous code stops working immediately.
 *
 * Rate limits are enforced here rather than at the route, because a resend and
 * the initial send are the same operation and must share one counter.
 */
export async function sendVerification(email: string, { initial = false } = {}) {
  const account = await findUser(email);
  // Never reveal whether an address has an account — the caller treats an
  // unknown address as success and simply sends nothing.
  if (!account) throw new VerificationError("No such account", "unknown-email");
  if (account.emailVerified) throw new VerificationError("Already verified", "already-verified");

  const [existing] = await db
    .select()
    .from(emailVerification)
    .where(eq(emailVerification.userId, account.id))
    .limit(1);

  const now = Date.now();
  let sendsThisHour = 1;
  let hourStartedAt = new Date(now);

  if (existing && !initial) {
    const since = now - existing.createdAt.getTime();
    if (since < RESEND_COOLDOWN_MS) {
      throw new VerificationError(
        "Please wait before requesting another code",
        "cooldown",
        Math.ceil((RESEND_COOLDOWN_MS - since) / 1000),
      );
    }
    const withinHour = now - existing.hourStartedAt.getTime() < HOUR_MS;
    if (withinHour && existing.sendsThisHour >= MAX_SENDS_PER_HOUR) {
      throw new VerificationError("Too many codes requested this hour", "hourly-cap");
    }
    sendsThisHour = withinHour ? existing.sendsThisHour + 1 : 1;
    hourStartedAt = withinHour ? existing.hourStartedAt : new Date(now);
  }

  const code = sixDigits();
  const token = randomUUID();

  await db.delete(emailVerification).where(eq(emailVerification.userId, account.id));
  await db.insert(emailVerification).values({
    id: randomUUID(),
    userId: account.id,
    email: account.email,
    code,
    token,
    expiresAt: new Date(now + TTL_MS),
    sendsThisHour,
    hourStartedAt,
  });

  const link = `${webOrigin}/verify?token=${token}`;
  const result = await sendTemplateEmail({
    agencyId: account.agencyId ?? "",
    key: "verify",
    to: { email: account.email, name: account.name },
    vars: {
      name: account.name,
      code,
      expiry_minutes: String(TTL_MS / 60_000),
    },
    actionUrl: link,
  });
  if (!result.sent) {
    console.warn(`[verify] not sent (${result.reason}) — code for ${account.email}: ${code}`);
  }
  return { sent: result.sent };
}

/** Marks the account verified and burns the row. Shared by both paths. */
async function complete(userId: string) {
  await db
    .update(user)
    .set({ emailVerified: true, updatedAt: new Date() })
    .where(eq(user.id, userId));
  await db.delete(emailVerification).where(eq(emailVerification.userId, userId));
}

/** Confirms the typed 6-digit code. */
export async function confirmCode(email: string, code: string) {
  const account = await findUser(email);
  if (!account) throw new VerificationError("Invalid code", "invalid");
  if (account.emailVerified) return { alreadyVerified: true };

  const [row] = await db
    .select()
    .from(emailVerification)
    .where(and(eq(emailVerification.userId, account.id), eq(emailVerification.email, email)))
    .limit(1);

  if (!row) throw new VerificationError("Request a new code", "expired");
  if (row.expiresAt.getTime() < Date.now()) {
    await db.delete(emailVerification).where(eq(emailVerification.id, row.id));
    throw new VerificationError("That code has expired", "expired");
  }
  if (row.attempts >= MAX_ATTEMPTS) {
    await db.delete(emailVerification).where(eq(emailVerification.id, row.id));
    throw new VerificationError("Too many attempts — request a new code", "too-many-attempts");
  }
  if (row.code !== code) {
    await db
      .update(emailVerification)
      .set({ attempts: row.attempts + 1 })
      .where(eq(emailVerification.id, row.id));
    throw new VerificationError("That code is not right", "invalid");
  }

  await complete(account.id);
  return { alreadyVerified: false };
}

/** Confirms the magic link. Single-use — the row is deleted on success. */
export async function confirmToken(token: string) {
  const [row] = await db
    .select()
    .from(emailVerification)
    .where(eq(emailVerification.token, token))
    .limit(1);

  if (!row) throw new VerificationError("This link has already been used", "invalid");
  if (row.expiresAt.getTime() < Date.now()) {
    await db.delete(emailVerification).where(eq(emailVerification.id, row.id));
    throw new VerificationError("This link has expired", "expired");
  }

  await complete(row.userId);
  return { email: row.email };
}

/** Whether the signed-in user has verified — read by the route guard. */
export async function isVerified(userId: string) {
  const account = await db.query.user.findFirst({
    where: (row, { eq: is }) => is(row.id, userId),
  });
  return Boolean(account?.emailVerified);
}
