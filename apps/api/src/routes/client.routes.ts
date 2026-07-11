import { Elysia, t } from "elysia";
import * as clientController from "../controllers/client.controller";
import { authGuard } from "../plugins/auth-guard";

export default new Elysia({ name: "client.routes" })
  .use(authGuard)
  .get("/clients", (ctx) => clientController.getClients(ctx), {
    isAuth: true,
    query: t.Object({
      search: t.Optional(t.String()),
      status: t.Optional(t.String()),
    }),
  })
  .post("/clients", (ctx) => clientController.postClient(ctx), {
    isAuth: true,
    body: t.Object({
      name: t.String({ minLength: 1 }),
      industry: t.Optional(t.String()),
      manager: t.Optional(t.String()),
    }),
  });
