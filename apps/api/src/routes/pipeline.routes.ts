import { Elysia, t } from "elysia";
import * as pipelineController from "../controllers/pipeline.controller";
import { authGuard } from "../plugins/auth-guard";

export default new Elysia({ name: "pipeline.routes" })
  .use(authGuard)
  .get("/pipeline", (ctx) => pipelineController.getPipelineBoard(ctx), {
    isAuth: true,
    query: t.Object({
      client: t.Optional(t.String()),
      owner: t.Optional(t.String()),
      search: t.Optional(t.String()),
    }),
  })
  .patch(
    "/pipeline/:id/stage",
    (ctx) => pipelineController.patchCandidateStage(ctx),
    {
      isAuth: true,
      params: t.Object({ id: t.String() }),
      body: t.Object({ stage: t.String() }),
    },
  );
