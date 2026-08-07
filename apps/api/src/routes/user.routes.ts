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
  // Name, role and team — the edit dialog's three fields, each optional so a
  // role change and a rename are the same call.
  .patch("/users/:id", (ctx) => userController.patchUser(ctx), {
    isAuth: true,
    body: t.Object({
      name: t.Optional(t.String({ minLength: 1 })),
      role: t.Optional(t.String({ minLength: 1 })),
      team: t.Optional(t.String()),
    }),
  })
  .post("/users/:id/activate", (ctx) => userController.postActivate(ctx), { isAuth: true })
  .post("/users/:id/reset-password", (ctx) => userController.postResetPassword(ctx), {
    isAuth: true,
  })
  .post("/users/:id/suspend", (ctx) => userController.postSuspend(ctx), { isAuth: true })
  .delete("/users/:id", (ctx) => userController.deleteMember(ctx), { isAuth: true })
  .post("/users/:id/deactivate", (ctx) => userController.postDeactivate(ctx), {
    isAuth: true,
  });
