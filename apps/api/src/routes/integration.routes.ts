import { Elysia, t } from "elysia";
import * as integrationController from "../controllers/integration.controller";
import { authGuard } from "../plugins/auth-guard";

export default new Elysia({ name: "integration.routes" })
  .use(authGuard)
  .get("/integrations", (ctx) => integrationController.getIntegrations(ctx), { isAuth: true })
  .post("/integrations", (ctx) => integrationController.postConnect(ctx), {
    isAuth: true,
    body: t.Object({
      provider: t.String(),
      account: t.Optional(t.String()),
      direction: t.Optional(t.String()),
    }),
  })
  .post("/integrations/:provider/reconnect", (ctx) => integrationController.postReconnect(ctx), {
    isAuth: true,
  })
  .delete("/integrations/:provider", (ctx) => integrationController.deleteIntegration(ctx), {
    isAuth: true,
  });
