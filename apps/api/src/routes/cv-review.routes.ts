import { Elysia, t } from "elysia";
import * as cvReviewController from "../controllers/cv-review.controller";
import { authGuard } from "../plugins/auth-guard";

export default new Elysia({ name: "cv-review.routes" })
  .use(authGuard)
  .get("/cv-review/queue", (ctx) => cvReviewController.getQueue(ctx), {
    isAuth: true,
  })
  .patch("/cv-review/:id", (ctx) => cvReviewController.patchReview(ctx), {
    isAuth: true,
    params: t.Object({ id: t.String() }),
    body: t.Object({
      decision: t.Union([t.Literal("submitted"), t.Literal("returned")]),
      note: t.Optional(t.String()),
    }),
  });
