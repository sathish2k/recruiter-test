import { Elysia, t } from "elysia";
import * as billingController from "../controllers/billing.controller";
import { authGuard } from "../plugins/auth-guard";

export default new Elysia({ name: "billing.routes" })
  .use(authGuard)
  .get("/billing", (ctx) => billingController.getBilling(ctx), { isAuth: true })
  .get("/billing/invoices", (ctx) => billingController.getInvoices(ctx), { isAuth: true })
  .post("/billing/seats", (ctx) => billingController.postSeats(ctx), {
    isAuth: true,
    body: t.Object({ delta: t.Number() }),
  })
  .put("/billing/plan", (ctx) => billingController.putPlan(ctx), {
    isAuth: true,
    body: t.Object({ plan: t.String() }),
  })
  .put("/billing/payment", (ctx) => billingController.putPayment(ctx), {
    isAuth: true,
    body: t.Object({
      paymentBrand: t.Optional(t.String()),
      paymentLast4: t.Optional(t.String()),
      paymentExpiry: t.Optional(t.String()),
      billingEmail: t.Optional(t.String()),
      billingName: t.Optional(t.String()),
      gstin: t.Optional(t.String()),
      billingAddress: t.Optional(t.String()),
    }),
  });
