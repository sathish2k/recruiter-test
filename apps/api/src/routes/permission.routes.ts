import { Elysia, t } from "elysia";
import * as permissionController from "../controllers/permission.controller";
import { authGuard } from "../plugins/auth-guard";

export default new Elysia({ name: "permission.routes" })
  .use(authGuard)
  .get("/permissions", (ctx) => permissionController.getPermissions(ctx), {
    isAuth: true,
  })
  .put("/permissions/:role", (ctx) => permissionController.putRolePermissions(ctx), {
    isAuth: true,
    body: t.Object({
      permissions: t.Array(
        t.Object({
          resource: t.String(),
          actions: t.Array(t.String()),
        }),
      ),
      scope: t.Optional(t.Record(t.String(), t.String())),
    }),
  })
  .post("/permissions/roles", (ctx) => permissionController.postRole(ctx), {
    isAuth: true,
    body: t.Object({
      label: t.String({ minLength: 1 }),
      description: t.Optional(t.String()),
      icon: t.Optional(t.String()),
      from: t.Optional(t.String()),
    }),
  })
  .delete("/permissions/roles/:role", (ctx) => permissionController.deleteRoleHandler(ctx), {
    isAuth: true,
    body: t.Optional(t.Object({ reassignTo: t.Optional(t.String()) })),
  });
