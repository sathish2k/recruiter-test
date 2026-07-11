import { Elysia, t } from "elysia";
import * as authController from "../controllers/auth.controller";
import { jwtPlugin } from "../plugins/jwt";

export default new Elysia({ name: "auth.routes" })
  .use(jwtPlugin)
  .post("/auth/register", (ctx) => authController.register(ctx), {
    body: t.Object({
      fullName: t.String({ minLength: 1 }),
      agency: t.String({ minLength: 1 }),
      email: t.String({ format: "email" }),
      password: t.String({ minLength: 8 }),
    }),
  })
  .post("/auth/login", (ctx) => authController.login(ctx), {
    body: t.Object({
      email: t.String({ format: "email" }),
      password: t.String({ minLength: 1 }),
    }),
  });
