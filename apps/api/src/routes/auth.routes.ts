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
  .post("/auth/forgot-password", (ctx) => authController.forgotPassword(ctx), {
    body: t.Object({ email: t.String({ format: "email" }) }),
  })
  .post("/auth/reset-password", (ctx) => authController.resetPassword(ctx), {
    body: t.Object({
      token: t.String({ minLength: 1 }),
      password: t.String({ minLength: 8 }),
    }),
  });
