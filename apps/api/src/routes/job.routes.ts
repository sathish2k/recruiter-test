import { Elysia, t } from "elysia";
import * as jobController from "../controllers/job.controller";
import { authGuard } from "../plugins/auth-guard";

export default new Elysia({ name: "job.routes" })
  .use(authGuard)
  .get("/jobs", (ctx) => jobController.getJobs(ctx), {
    isAuth: true,
    query: t.Object({
      search: t.Optional(t.String()),
      scope: t.Optional(t.String()),
      role: t.Optional(t.String()),
      client: t.Optional(t.String()),
      status: t.Optional(t.String()),
      location: t.Optional(t.String()),
      empType: t.Optional(t.String()),
      level: t.Optional(t.String()),
      sortKey: t.Optional(t.String()),
      sortDir: t.Optional(t.String()),
    }),
  });
