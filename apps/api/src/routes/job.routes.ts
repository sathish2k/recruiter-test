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
      page: t.Optional(t.String()),
      pageSize: t.Optional(t.String()),
    }),
  })
  .get("/jobs/:id", (ctx) => jobController.getJob(ctx), {
    isAuth: true,
    params: t.Object({ id: t.String() }),
  })
  .post("/jobs", (ctx) => jobController.postJob(ctx), {
    isAuth: true,
    body: t.Object({
      title: t.String(),
      client: t.Optional(t.String()),
      roleCat: t.Optional(t.String()),
      level: t.Optional(t.String()),
      location: t.Optional(t.String()),
      empType: t.Optional(t.String()),
      openings: t.Optional(t.Number()),
      description: t.Optional(t.String()),
      salaryMin: t.Optional(t.String()),
      salaryMax: t.Optional(t.String()),
      skills: t.Optional(t.Array(t.String())),
      status: t.Optional(t.String()),
    }),
  })
  .patch("/jobs/:id", (ctx) => jobController.patchJob(ctx), {
    isAuth: true,
    params: t.Object({ id: t.String() }),
    body: t.Object({
      title: t.Optional(t.String()),
      client: t.Optional(t.String()),
      openings: t.Optional(t.Number()),
      empType: t.Optional(t.String()),
      location: t.Optional(t.String()),
      salaryMin: t.Optional(t.String()),
      salaryMax: t.Optional(t.String()),
      description: t.Optional(t.String()),
      skills: t.Optional(t.Array(t.String())),
      screeningOn: t.Optional(t.Boolean()),
      screeningThreshold: t.Optional(t.Number()),
      status: t.Optional(t.String()),
    }),
  })
  .delete("/jobs/:id", (ctx) => jobController.removeJob(ctx), {
    isAuth: true,
    params: t.Object({ id: t.String() }),
  });
