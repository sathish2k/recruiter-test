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
  .get("/clients/:id", (ctx) => clientController.getClient(ctx), {
    isAuth: true,
    params: t.Object({ id: t.String() }),
  })
  .post("/clients", (ctx) => clientController.postClient(ctx), {
    isAuth: true,
    body: t.Object({
      name: t.String({ minLength: 1 }),
      industry: t.Optional(t.String()),
      manager: t.Optional(t.String()),
    }),
  })
  .patch("/clients/:id", (ctx) => clientController.patchClient(ctx), {
    isAuth: true,
    params: t.Object({ id: t.String() }),
    body: t.Object({
      name: t.Optional(t.String()),
      industry: t.Optional(t.String()),
      manager: t.Optional(t.String()),
      primaryContact: t.Optional(t.String()),
      placementFee: t.Optional(t.String()),
      status: t.Optional(t.Union([t.Literal("hiring"), t.Literal("paused")])),
    }),
  })
  .delete("/clients/:id", (ctx) => clientController.removeClient(ctx), {
    isAuth: true,
    params: t.Object({ id: t.String() }),
  })
  .patch(
    "/clients/:id/submissions/:sid",
    (ctx) => clientController.patchSubmission(ctx),
    {
      isAuth: true,
      params: t.Object({ id: t.String(), sid: t.String() }),
      body: t.Object({
        decision: t.Union([t.Literal("approved"), t.Literal("rejected")]),
        reason: t.Optional(t.String()),
      }),
    },
  );
