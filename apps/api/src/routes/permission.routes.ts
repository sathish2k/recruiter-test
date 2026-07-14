import { Elysia, t } from "elysia";
import * as permissionController from "../controllers/permission.controller";
import { authGuard } from "../plugins/auth-guard";

const action = t.Union([
  t.Literal("read"),
  t.Literal("create"),
  t.Literal("edit"),
  t.Literal("update"),
  t.Literal("delete"),
]);

export default new Elysia({ name: "permission.routes" })
  .use(authGuard)
  .get("/permissions", (ctx) => permissionController.getPermissions(ctx), {
    isAuth: true,
  })
  .get(
    "/permissions/mine",
    (ctx) => permissionController.getMyPermissions(ctx),
    { isAuth: true },
  )
  .put(
    "/permissions/:role",
    (ctx) => permissionController.putRolePermissions(ctx),
    {
      isAuth: true,
      requireAdmin: true,
      params: t.Object({ role: t.String() }),
      body: t.Object({
        permissions: t.Array(
          t.Object({ resource: t.String(), actions: t.Array(action) }),
        ),
      }),
    },
  );
