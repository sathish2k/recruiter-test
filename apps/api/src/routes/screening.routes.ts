import { Elysia, t } from "elysia";
import * as screeningController from "../controllers/screening.controller";
import { authGuard } from "../plugins/auth-guard";

export default new Elysia({ name: "screening.routes" })
  .use(authGuard)
  .get("/screening", (ctx) => screeningController.getScreening(ctx), {
    isAuth: true,
  })
  .put(
    "/screening/settings",
    (ctx) => screeningController.putScreeningSettings(ctx),
    {
      isAuth: true,
      body: t.Object({
        threshold: t.Optional(t.Number()),
        autoScore: t.Optional(t.Boolean()),
        autoForward: t.Optional(t.Boolean()),
      }),
    },
  );
