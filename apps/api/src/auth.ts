import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { bearer } from "better-auth/plugins";
import { db, schema } from "./db";
import { record as recordAudit } from "./services/audit-log.service";
import { getLockoutState, LOCKOUT_MINUTES } from "./services/lockout.service";
import { parseUserAgent, recordLogin } from "./services/security.service";
import { sendTemplateEmail } from "./services/transactional-email.service";

const webOrigin = process.env.WEB_ORIGIN ?? "http://localhost:3000";

/** Reset links last 30 minutes, matching the verification code's own lifetime.
 * The screen copy and the email both read this, so the three cannot drift. */
const RESET_TOKEN_TTL_SECONDS = 30 * 60;

/**
 * Turns away sign-ins for an address that has just failed too many times, before
 * the password is even checked — so a locked account cannot be probed.
 *
 * The refusal is recorded as `blocked` rather than `failed`, which is what keeps
 * a locked account from re-arming its own lock every time someone retries.
 */
const guardLockout = createAuthMiddleware(async (ctx) => {
  if (ctx.path !== "/sign-in/email") return;
  const email = (ctx.body as { email?: string } | undefined)?.email;
  if (!email) return;

  const state = await getLockoutState(email);
  if (!state.locked) return;

  const ip = ctx.headers?.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const userAgent = ctx.headers?.get("user-agent") ?? null;
  try {
    const account = await db.query.user.findFirst({
      where: (row, { eq }) => eq(row.email, email),
    });
    await recordLogin({
      organizationId: account?.agencyId ?? null,
      userId: account?.id ?? null,
      email,
      userAgent,
      ip,
      result: "blocked",
    });
    if (account?.agencyId) {
      const { browser, os } = parseUserAgent(userAgent);
      await recordAudit({
        organizationId: account.agencyId,
        userId: account.id,
        actorName: account.name ?? email,
        event: `Sign-in blocked for ${email} — account temporarily locked`,
        category: "security",
        severity: "failure",
        ip,
        details: { Browser: browser, Device: os },
      });
    }
  } catch (error) {
    // Never let the record-keeping decide whether someone gets in.
    console.error("[auth] failed to log blocked sign-in", error);
  }

  throw new APIError("FORBIDDEN", {
    code: "ACCOUNT_LOCKED",
    message: `Too many failed attempts. Try again in ${LOCKOUT_MINUTES} minutes.`,
    retryAfter: state.retryAfter,
  });
});

/** Sign-in attempts are logged here rather than in a controller — Better Auth
 * owns the endpoint, and failures never reach one. Never throws: a logging
 * failure must not block a sign-in. */
const logSignIn = createAuthMiddleware(async (ctx) => {
  if (ctx.path !== "/sign-in/email") return;
  try {
    const email = (ctx.body as { email?: string } | undefined)?.email;
    if (!email) return;
    const session = ctx.context.newSession;
    // A failed attempt has no session — resolve the account by email so the
    // failure still shows up in that user's own login history.
    const account =
      (session?.user as { id: string; name?: string; agencyId?: string } | undefined) ??
      (await db.query.user.findFirst({ where: (row, { eq }) => eq(row.email, email) }));
    const ip = ctx.headers?.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    const userAgent = ctx.headers?.get("user-agent") ?? null;

    await recordLogin({
      organizationId: account?.agencyId ?? null,
      userId: account?.id ?? null,
      email,
      userAgent,
      ip,
      result: session ? "success" : "failed",
    });

    if (account?.agencyId) {
      const { browser, os } = parseUserAgent(userAgent);
      await recordAudit({
        organizationId: account.agencyId,
        userId: account.id,
        actorName: account.name ?? email,
        event: session
          ? `${account.name ?? email} signed in`
          : `Login failed for ${email} — wrong password`,
        category: "security",
        severity: session ? "success" : "failure",
        ip,
        details: session ? undefined : { Browser: browser, Device: os },
      });
    }
  } catch (error) {
    console.error("[auth] failed to log sign-in", error);
  }
});

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3001",
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    resetPasswordTokenExpiresIn: RESET_TOKEN_TTL_SECONDS,
    // The reset screen states every other session ends; this is what makes that
    // true. Better Auth leaves it off by default.
    revokeSessionsOnPasswordReset: true,
    async sendResetPassword({ user, url }) {
      const agencyId = (user as { agencyId?: string | null }).agencyId ?? "";
      await sendTemplateEmail({
        agencyId,
        key: "forgot",
        to: { email: user.email, name: user.name },
        vars: { name: user.name, expiry_minutes: String(RESET_TOKEN_TTL_SECONDS / 60) },
        actionUrl: url,
      });
    },
    // The reset screen also states the change is written to the audit log. The
    // reset endpoint is unauthenticated, so this hook is the only place that
    // knows which account it was.
    async onPasswordReset({ user }) {
      const account = user as { id: string; name?: string; email: string; agencyId?: string };
      await recordAudit({
        organizationId: account.agencyId ?? null,
        userId: account.id,
        actorName: account.name ?? account.email,
        event: `${account.name ?? account.email} reset their password`,
        category: "security",
        severity: "success",
      });
    },
  },
  user: {
    additionalFields: {
      role: { type: "string", required: false, defaultValue: "admin", input: true },
      agencyId: { type: "string", required: false, input: true },
      status: { type: "string", required: false, defaultValue: "active", input: false },
      phone: { type: "string", required: false, input: true },
      timezone: { type: "string", required: false, input: true },
    },
  },
  hooks: { before: guardLockout, after: logSignIn },
  // Accept `Authorization: Bearer <token>` (the SDK httpClient sends the session
  // token this way) in addition to the session cookie.
  plugins: [bearer()],
  trustedOrigins: [webOrigin],
});

export type Auth = typeof auth;
