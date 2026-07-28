import { Elysia } from "elysia";
import * as pipelineController from "../controllers/pipeline.controller";
import { authGuard } from "../plugins/auth-guard";

export default new Elysia({ name: "pipeline.routes" })
  .use(authGuard)
  .get("/pipeline/stages", (ctx) => pipelineController.getStages(ctx), { isAuth: true })
  .get("/pipeline/rejection-reasons", (ctx) => pipelineController.getRejectionReasons(ctx), {
    isAuth: true,
  });
