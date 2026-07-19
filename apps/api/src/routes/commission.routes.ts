import { Elysia, t } from "elysia";
import * as commissionController from "../controllers/commission.controller";
import { authGuard } from "../plugins/auth-guard";

export default new Elysia({ name: "commission.routes" })
  .use(authGuard)
  .get("/commissions", (ctx) => commissionController.getCommissions(ctx), {
    isAuth: true,
    query: t.Object({ period: t.Optional(t.String()) }),
  })
  .patch(
    "/commissions/:id/paid",
    (ctx) => commissionController.patchCommissionPaid(ctx),
    {
      isAuth: true,
      params: t.Object({ id: t.String() }),
    },
  );
