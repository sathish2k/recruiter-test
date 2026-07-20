import { Elysia, t } from "elysia";
import * as profileController from "../controllers/profile.controller";
import { authGuard } from "../plugins/auth-guard";

export default new Elysia({ name: "profile.routes" })
  .use(authGuard)
  .get("/profile", (ctx) => profileController.getMyProfile(ctx), { isAuth: true })
  .put("/profile", (ctx) => profileController.putMyProfile(ctx), {
    isAuth: true,
    body: t.Object({
      name: t.Optional(t.String()),
      phone: t.Optional(t.String()),
      timezone: t.Optional(t.String()),
      notificationPrefs: t.Optional(t.Record(t.String(), t.Boolean())),
    }),
  })
  .put("/profile/password", (ctx) => profileController.putMyPassword(ctx), {
    isAuth: true,
    body: t.Object({
      currentPassword: t.String({ minLength: 1 }),
      newPassword: t.String({ minLength: 8 }),
    }),
  });
