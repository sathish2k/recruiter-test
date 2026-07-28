import { Elysia, t } from "elysia";
import * as applicationController from "../controllers/application.controller";
import { authGuard } from "../plugins/auth-guard";

const listQuery = t.Object({
  jobId: t.Optional(t.String()),
  clientId: t.Optional(t.String()),
  ownerId: t.Optional(t.String()),
  candidateId: t.Optional(t.String()),
  search: t.Optional(t.String()),
  includeClosed: t.Optional(t.String()),
  wipLimit: t.Optional(t.String()),
});

export default new Elysia({ name: "application.routes" })
  .use(authGuard)
  .get("/applications", (ctx) => applicationController.getApplications(ctx), {
    isAuth: true,
    query: listQuery,
  })
  /** The board read model — columns, owners and SLA breaches in one call. */
  .get("/applications/board", (ctx) => applicationController.getBoard(ctx), {
    isAuth: true,
    query: listQuery,
  })
  .get("/applications/:id", (ctx) => applicationController.getApplicationById(ctx), {
    isAuth: true,
  })
  .get("/applications/:id/history", (ctx) => applicationController.getHistory(ctx), {
    isAuth: true,
  })
  .post("/applications", (ctx) => applicationController.postApplication(ctx), {
    isVerified: true,
    body: t.Object({
      candidateId: t.String(),
      jobId: t.String(),
      ownerId: t.Optional(t.String()),
      stageId: t.Optional(t.String()),
      source: t.Optional(t.String({ maxLength: 40 })),
    }),
  })
  /** The only write that changes stage or status — see moveApplication. */
  .post("/applications/:id/move", (ctx) => applicationController.postMove(ctx), {
    isVerified: true,
    body: t.Object({
      toStageId: t.Optional(t.String()),
      status: t.Optional(
        t.Union([
          t.Literal("active"),
          t.Literal("rejected"),
          t.Literal("withdrawn"),
          t.Literal("hired"),
        ]),
      ),
      reasonId: t.Optional(t.String()),
      note: t.Optional(t.String({ maxLength: 2000 })),
      force: t.Optional(t.Boolean()),
    }),
  });
