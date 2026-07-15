import { Elysia, t } from "elysia";
import * as automationController from "../controllers/automation.controller";
import { authGuard } from "../plugins/auth-guard";

export default new Elysia({ name: "automation.routes" })
  .use(authGuard)
  .get("/automations", (ctx) => automationController.getAutomations(ctx), {
    isAuth: true,
    requireAdmin: true,
  })
  .patch(
    "/automations/:id",
    (ctx) => automationController.patchAutomation(ctx),
    {
      isAuth: true,
      requireAdmin: true,
      params: t.Object({ id: t.String() }),
      body: t.Object({ enabled: t.Boolean() }),
    },
  );
