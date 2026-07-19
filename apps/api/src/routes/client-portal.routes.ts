import { Elysia, t } from "elysia";
import * as clientPortalController from "../controllers/client-portal.controller";

export default new Elysia({ name: "client-portal.routes" })
  .post(
    "/client-portal/magic-link",
    (ctx) => clientPortalController.postMagicLink(ctx),
    { body: t.Object({ email: t.String({ minLength: 1 }) }) },
  )
  .get(
    "/client-portal/:token",
    (ctx) => clientPortalController.getClientPortal(ctx),
    { params: t.Object({ token: t.String() }) },
  )
  .post(
    "/client-portal/:token/decide",
    (ctx) => clientPortalController.postPortalDecision(ctx),
    {
      params: t.Object({ token: t.String() }),
      body: t.Object({
        submissionId: t.String({ minLength: 1 }),
        decision: t.Union([t.Literal("approved"), t.Literal("declined")]),
        reason: t.Optional(t.String()),
      }),
    },
  );
