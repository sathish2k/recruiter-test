import { Elysia, t } from "elysia";
import * as notificationController from "../controllers/notification.controller";
import { authGuard } from "../plugins/auth-guard";

export default new Elysia({ name: "notification.routes" })
  .use(authGuard)
  .get(
    "/notifications",
    (ctx) => notificationController.getNotifications(ctx),
    {
      isAuth: true,
    },
  )
  .patch(
    "/notifications/read-all",
    (ctx) => notificationController.patchReadAll(ctx),
    { isAuth: true },
  )
  .patch(
    "/notifications/:id/read",
    (ctx) => notificationController.patchRead(ctx),
    {
      isAuth: true,
      params: t.Object({ id: t.String() }),
    },
  );
