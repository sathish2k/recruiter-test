import { Elysia, status } from "elysia";
import type { UserRole } from "@recruit/types";
import { jwtPlugin } from "./jwt";

export interface AuthClaims {
  sub: string;
  agencyId: string;
  role: UserRole;
}

export const authGuard = new Elysia({ name: "auth-guard" })
  .use(jwtPlugin)
  .macro({
    isAuth: {
      async resolve({ jwt, headers }) {
        const bearer = headers.authorization?.startsWith("Bearer ")
          ? headers.authorization.slice(7)
          : undefined;
        if (!bearer) return status(401, "Missing token");
        const payload = await jwt.verify(bearer);
        if (!payload) return status(401, "Invalid token");
        return { auth: payload as unknown as AuthClaims };
      },
    },
    requireLead: {
      resolve(ctx) {
        const auth = (ctx as { auth?: AuthClaims }).auth;
        if (auth?.role !== "lead") return status(403, "Lead role required");
        return {};
      },
    },
    requireAdmin: {
      resolve(ctx) {
        const auth = (ctx as { auth?: AuthClaims }).auth;
        if (auth?.role !== "admin") return status(403, "Admins only");
        return {};
      },
    },
  });
