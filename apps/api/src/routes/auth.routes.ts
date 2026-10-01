import { Elysia, t } from "elysia";
import * as authController from "../controllers/auth.controller";

// Sign-in and session are handled by Better Auth at /api/auth/*.
export default new Elysia({ name: "auth.routes" })
  .post("/auth/register", (ctx) => authController.register(ctx), {
    body: t.Object({
      fullName: t.String({ minLength: 1 }),
      agency: t.String({ minLength: 1 }),
      email: t.String({ format: "email" }),
      password: t.String({ minLength: 8 }),
    }),
  })
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
  });
