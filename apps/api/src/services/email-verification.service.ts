import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { isEmailConfigured, sendEmail } from "../lib/mailjet";
import { emailVerification, user } from "../models/auth";

const webOrigin = process.env.WEB_ORIGIN ?? "http://localhost:3000";

const TTL_MS = 30 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_SENDS_PER_HOUR = 5;
const HOUR_MS = 60 * 60 * 1000;
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
    readonly retryAfter?: number,
  ) {
    super(message);
  }
}

const sixDigits = () => String(Math.floor(100_000 + Math.random() * 900_000));

async function findUser(email: string) {
  return db.query.user.findFirst({ where: (row, { eq: is }) => is(row.email, email) });
}

function verificationEmail(name: string, code: string, link: string) {
  const minutes = String(TTL_MS / 60_000);
  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#F3F5F8;font-family:Helvetica,Arial,sans-serif;color:#0E2E5C">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:14px;padding:36px">
      <tr><td>
        <p style="margin:0 0 24px;font-size:20px;font-weight:700;letter-spacing:-.01em">HirePilot<span style="color:#F59E0B">X</span></p>
        <h1 style="margin:0 0 10px;font-size:22px;line-height:1.3">Confirm your email</h1>
        <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#4A5B76">
          Hi ${name}, use this code to finish setting up your workspace. It expires in ${minutes} minutes.
        </p>
        <p style="margin:0 0 24px;font-size:34px;font-weight:700;letter-spacing:8px;text-align:center;background:#F3F5F8;border-radius:10px;padding:18px 0">${code}</p>
        <p style="margin:0 0 28px;text-align:center">
          <a href="${link}" style="display:inline-block;background:#0E2E5C;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:13px 26px;border-radius:8px">Verify my email</a>
        </p>
        <p style="margin:0;font-size:12px;line-height:1.6;color:#7C8AA1">
          If you didn't create a HirePilotX account, you can ignore this email.
        </p>
      </td></tr>
    </table>
  </body>
</html>`;
  const text = `Confirm your email\n\nHi ${name}, your HirePilotX verification code is ${code}. It expires in ${minutes} minutes.\n\nOr verify here: ${link}\n\nIf you didn't create an account, ignore this email.`;
  return { html, text };
}

// Rate limits live here rather than on the route: the initial send and a resend
// are the same operation and must share one counter.
export async function sendVerification(email: string, { initial = false } = {}) {
  const account = await findUser(email);
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
  if (!isEmailConfigured()) {
    console.warn(`[verify] mail not configured — code for ${account.email}: ${code}`);
    return { sent: false };
  }

  const { html, text } = verificationEmail(account.name, code, link);
  try {
    await sendEmail({
      to: { email: account.email, name: account.name },
      subject: `${code} is your HirePilotX verification code`,
      html,
      text,
    });
    return { sent: true };
  } catch (error) {
    // A send failure must not lose the code — the screen's resend covers it.
    console.error(`[verify] send failed for ${account.email}`, error);
    return { sent: false };
  }
}

async function complete(userId: string) {
  await db
    .update(user)
    .set({ emailVerified: true, updatedAt: new Date() })
    .where(eq(user.id, userId));
  await db.delete(emailVerification).where(eq(emailVerification.userId, userId));
}

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
