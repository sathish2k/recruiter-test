import { Elysia, t } from "elysia";
import * as userController from "../controllers/user.controller";
import { authGuard } from "../plugins/auth-guard";

export default new Elysia({ name: "user.routes" })
  .use(authGuard)
  .get("/users", (ctx) => userController.getUsers(ctx), { isAuth: true })
  .post("/users/invite", (ctx) => userController.postInvite(ctx), {
    isAuth: true,
    body: t.Object({
      email: t.String({ format: "email" }),
      role: t.String({ minLength: 1 }),
    }),
  })
  .patch("/users/:id/role", (ctx) => userController.patchUserRole(ctx), {
    isAuth: true,
    body: t.Object({ role: t.String({ minLength: 1 }) }),
  })
  .post("/users/:id/deactivate", (ctx) => userController.postDeactivate(ctx), {
    isAuth: true,
  });
