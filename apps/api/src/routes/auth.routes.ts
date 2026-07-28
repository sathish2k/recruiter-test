import { Elysia, t } from "elysia";
import * as authController from "../controllers/auth.controller";

// Sign-in / session are handled by Better Auth at /api/auth/*. These routes
// cover the recruit-auth module's register / forgot / reset flows.
export default new Elysia({ name: "auth.routes" })
  .post("/auth/register", (ctx) => authController.register(ctx), {
    body: t.Object({
      fullName: t.String({ minLength: 1 }),
      agency: t.String({ minLength: 1 }),
      email: t.String({ format: "email" }),
      password: t.String({ minLength: 8 }),
    }),
  })
  // §5.1.2 — code and magic link, both 30 minutes, resend rate-limited.
  .post("/auth/verify/send", (ctx) => authController.sendVerificationCode(ctx), {
    body: t.Object({ email: t.String({ format: "email" }) }),
  })
  .post("/auth/verify/confirm", (ctx) => authController.confirmVerificationCode(ctx), {
    body: t.Object({
      email: t.String({ format: "email" }),
      code: t.String({ minLength: 6, maxLength: 6 }),
    }),
  })
  .get("/auth/verify/link", (ctx) => authController.confirmVerificationLink(ctx), {
    query: t.Object({ token: t.Optional(t.String()) }),
  })
  .post("/auth/forgot-password", (ctx) => authController.forgotPassword(ctx), {
    body: t.Object({ email: t.String({ format: "email" }) }),
  })
  .post("/auth/reset-password", (ctx) => authController.resetPassword(ctx), {
    body: t.Object({
      token: t.String({ minLength: 1 }),
      password: t.String({ minLength: 8 }),
    }),
  });
