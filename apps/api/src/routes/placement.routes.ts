import { Elysia, t } from "elysia";
import * as placementController from "../controllers/placement.controller";
import { authGuard } from "../plugins/auth-guard";

export default new Elysia({ name: "placement.routes" })
  .use(authGuard)
  .get("/placements", (ctx) => placementController.getPlacements(ctx), {
    isAuth: true,
  })
  .post(
    "/placements",
    (ctx) => {
      ctx.set.status = 201;
      return placementController.postPlacement(ctx);
    },
    {
      isAuth: true,
      body: t.Object({
        candidateName: t.String({ minLength: 1 }),
        ctc: t.Number(),
        role: t.Optional(t.String()),
        client: t.Optional(t.String()),
      }),
    },
  )
  .patch(
    "/placements/:id/invoice",
    (ctx) => placementController.patchInvoice(ctx),
    {
      isAuth: true,
      params: t.Object({ id: t.String() }),
      body: t.Object({
        invoiceStatus: t.Union([
          t.Literal("none"),
          t.Literal("invoiced"),
          t.Literal("paid"),
        ]),
      }),
    },
  )
  .patch(
    "/placements/:id/status",
    (ctx) => placementController.patchStatus(ctx),
    {
      isAuth: true,
      params: t.Object({ id: t.String() }),
      body: t.Object({
        status: t.Union([
          t.Literal("Sent"),
          t.Literal("Accepted"),
          t.Literal("Negotiating"),
          t.Literal("Declined"),
        ]),
      }),
    },
  );
