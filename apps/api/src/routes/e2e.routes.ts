import { desc, eq, like } from "drizzle-orm";
import { Elysia, status, t } from "elysia";
import { db } from "../db";
import { user, verification } from "../models/auth.model";
import { emailVerification } from "../models/email-verification.model";

/**
 * Test-only helpers for the Playwright journeys.
 *
 * Handing out a live verification code is exactly the thing an attacker wants,
 * so this is fenced three ways rather than one:
 *
 * 1. It is only *registered* when `E2E_ENABLED` is set, so every path below
 *    404s otherwise — `test-cases.md` TC-SEC-002 asserts that, and a guard
 *    inside a handler would answer 403 instead and confirm the route exists.
 * 2. It refuses to mount in production whatever the flag says, so a stray
 *    environment variable cannot expose it.
 * 3. Even when mounted it only serves addresses the tests own, so a real
 *    account's code is never readable through it.
 */
const TEST_ADDRESS = /@example\.com$/i;

const enabled = process.env.E2E_ENABLED === "true" && process.env.NODE_ENV !== "production";

const app = new Elysia({ name: "e2e.routes" });

export default enabled
  ? app
      .get(
        "/e2e/verification-code",
        async ({ query }) => {
          if (!TEST_ADDRESS.test(query.email)) {
            return status(403, "Only test addresses can be read this way");
          }
          const [row] = await db
            .select({ code: emailVerification.code, token: emailVerification.token })
            .from(emailVerification)
            .where(eq(emailVerification.email, query.email))
            .limit(1);
          if (!row) return status(404, "No live code for that address");
          return { data: row };
        },
        { query: t.Object({ email: t.String({ format: "email" }) }) },
      )
      .get(
        "/e2e/reset-token",
        async ({ query }) => {
          if (!TEST_ADDRESS.test(query.email)) {
            return status(403, "Only test addresses can be read this way");
          }
          // Better Auth keys password-reset rows as `reset-password:<token>` on
          // the identifier and stores the user id in the value, so the newest row
          // pointing at this address is the link that was just mailed.
          const rows = await db
            .select({ identifier: verification.identifier, value: verification.value })
            .from(verification)
            .where(like(verification.identifier, "reset-password:%"))
            .orderBy(desc(verification.createdAt))
            .limit(50);
          const account = await db.query.user.findFirst({
            where: (row, { eq: is }) => is(row.email, query.email),
          });
          if (!account) return status(404, "No such account");
          const match = rows.find((row) => row.value === account.id);
          if (!match) return status(404, "No live reset link for that address");
          return { data: { token: match.identifier.replace("reset-password:", "") } };
        },
        { query: t.Object({ email: t.String({ format: "email" }) }) },
      )
      /**
       * Re-seats a test account.
       *
       * The dashboard draws a different set of cards per role, so verifying it
       * against the design means rendering all seven — and the role lives on
       * the user row, not in a cookie the browser can flip. Same three fences
       * as above: unmounted without `E2E_ENABLED`, never in production, and
       * `@example.com` only.
       */
      .post(
        "/e2e/role",
        async ({ body }) => {
          if (!TEST_ADDRESS.test(body.email)) {
            return status(403, "Only test addresses can be re-seated this way");
          }
          const [row] = await db
            .update(user)
            .set({ role: body.role, updatedAt: new Date() })
            .where(eq(user.email, body.email))
            .returning({ id: user.id, role: user.role });
          if (!row) return status(404, "No such account");
          return { data: row };
        },
        {
          body: t.Object({
            email: t.String({ format: "email" }),
            role: t.Union([
              t.Literal("owner"),
              t.Literal("admin"),
              t.Literal("accountManager"),
              t.Literal("profileLead"),
              t.Literal("recruiter"),
              t.Literal("sourcer"),
              t.Literal("hiringManager"),
              t.Literal("client"),
            ]),
          }),
        },
      )
  : app;
