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
    }),
  });
