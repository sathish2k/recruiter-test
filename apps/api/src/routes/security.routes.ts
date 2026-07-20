import { Elysia, t } from "elysia";
import * as securityController from "../controllers/security.controller";
import { authGuard } from "../plugins/auth-guard";

export default new Elysia({ name: "security.routes" })
  .use(authGuard)
  .get("/security", (ctx) => securityController.getSecurity(ctx), { isAuth: true })
  .get("/security/logins", (ctx) => securityController.getLoginHistory(ctx), {
    isAuth: true,
    query: t.Object({ result: t.Optional(t.String()) }),
  })
  .delete("/security/sessions/:id", (ctx) => securityController.deleteSession(ctx), {
    isAuth: true,
  })
  .delete("/security/sessions", (ctx) => securityController.deleteOtherSessions(ctx), {
    isAuth: true,
  })
  .post("/security/tokens", (ctx) => securityController.postToken(ctx), {
    isAuth: true,
    body: t.Optional(
      t.Object({
        name: t.Optional(t.String()),
        expiresInDays: t.Optional(t.Number()),
      }),
    ),
  })
  .delete("/security/tokens/:id", (ctx) => securityController.deleteToken(ctx), {
    isAuth: true,
  })
  .put("/security/two-factor", (ctx) => securityController.putTwoFactor(ctx), {
    isAuth: true,
    body: t.Object({ enabled: t.Boolean() }),
  })
  .post("/security/recovery-codes", (ctx) => securityController.postRecoveryCodes(ctx), {
    isAuth: true,
  })
  .put("/security/notifications", (ctx) => securityController.putNotifications(ctx), {
    isAuth: true,
    body: t.Object({
      notifyNewDevice: t.Optional(t.Boolean()),
      notifyPasswordChange: t.Optional(t.Boolean()),
      notifyTwoFactorDisabled: t.Optional(t.Boolean()),
      notifySsoChange: t.Optional(t.Boolean()),
    }),
  })
  .post("/security/recipients", (ctx) => securityController.postRecipient(ctx), {
    isAuth: true,
    body: t.Object({ email: t.String({ format: "email" }) }),
  })
  .delete("/security/recipients/:id", (ctx) => securityController.deleteRecipient(ctx), {
    isAuth: true,
  });
