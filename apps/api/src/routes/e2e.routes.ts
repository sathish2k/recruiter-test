import { and, eq } from "drizzle-orm";
import { Elysia, status, t } from "elysia";
import { db } from "../db";
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
  ? app.get(
      "/e2e/verification-code",
      async ({ query }) => {
        if (!TEST_ADDRESS.test(query.email)) {
          return status(403, "Only test addresses can be read this way");
        }
        const [row] = await db
          .select({ code: emailVerification.code, token: emailVerification.token })
          .from(emailVerification)
          .where(and(eq(emailVerification.email, query.email)))
          .limit(1);
        if (!row) return status(404, "No live code for that address");
        return { data: row };
      },
      { query: t.Object({ email: t.String({ format: "email" }) }) },
    )
  : app;
