import { Elysia, t } from "elysia";
import * as userController from "../controllers/user.controller";
import { authGuard } from "../plugins/auth-guard";

const role = t.Union([
  t.Literal("admin"),
  t.Literal("lead"),
  t.Literal("employee"),
  t.Literal("client"),
]);

export default new Elysia({ name: "user.routes" })
  .use(authGuard)
  .get("/users", (ctx) => userController.getUsers(ctx), {
    isAuth: true,
    requireAdmin: true,
  })
  .patch("/users/:id/role", (ctx) => userController.patchUserRole(ctx), {
    isAuth: true,
    requireAdmin: true,
    params: t.Object({ id: t.String() }),
    body: t.Object({ role }),
  })
  .post("/users/invite", (ctx) => userController.postInvite(ctx), {
    isAuth: true,
    requireAdmin: true,
    body: t.Object({ email: t.String({ format: "email" }), role }),
  })
  .post("/users/:id/deactivate", (ctx) => userController.postDeactivate(ctx), {
    isAuth: true,
    requireAdmin: true,
    params: t.Object({ id: t.String() }),
  });
