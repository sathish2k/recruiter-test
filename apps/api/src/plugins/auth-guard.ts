import { Elysia, status } from "elysia";
import { auth } from "../auth";

// Verifies the Better Auth session (cookie or bearer) and exposes ctx.user /
// ctx.session to handlers. Guard a route with `{ isAuth: true }`.
export const authGuard = new Elysia({ name: "auth-guard" }).macro({
  isAuth: {
    async resolve({ request }) {
      const session = await auth.api.getSession({ headers: request.headers });
      if (!session) return status(401, "Unauthorized");
      return { user: session.user, session: session.session };
    },
  },
  /**
   * §5.1.2 / TC-AUTH-004 — until the address is verified the user may look
   * around but may not create records or send mail. Enforced here, on the
   * server, because a screen that can be navigated past is not verification.
   */
  isVerified: {
    async resolve({ request }) {
      const session = await auth.api.getSession({ headers: request.headers });
      if (!session) return status(401, "Unauthorized");
      if (!session.user.emailVerified) {
        return status(403, {
          code: "email-unverified",
          message: "Verify your email address before creating records or sending mail.",
        });
      }
      return { user: session.user, session: session.session };
    },
  },
  requireRole(role: string) {
    return {
      async resolve({ request }) {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) return status(401, "Unauthorized");
        if ((session.user as { role?: string }).role !== role) {
          return status(403, `Requires ${role} role`);
        }
        return { user: session.user, session: session.session };
      },
    };
  },
});
