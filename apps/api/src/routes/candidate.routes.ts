import { Elysia, t } from "elysia";
import * as candidateController from "../controllers/candidate.controller";
import { authGuard } from "../plugins/auth-guard";

export default new Elysia({ name: "candidate.routes" })
  .use(authGuard)
  .get("/candidates", (ctx) => candidateController.getCandidates(ctx), {
    isAuth: true,
    query: t.Object({
      search: t.Optional(t.String()),
      scope: t.Optional(t.String()),
      stage: t.Optional(t.String()),
      client: t.Optional(t.String()),
      role: t.Optional(t.String()),
      source: t.Optional(t.String()),
      exp: t.Optional(t.String()),
      match: t.Optional(t.String()),
      sortKey: t.Optional(t.String()),
      sortDir: t.Optional(t.String()),
      page: t.Optional(t.String()),
      pageSize: t.Optional(t.String()),
    }),
  })
  .get("/candidates/:id", (ctx) => candidateController.getCandidate(ctx), {
    isAuth: true,
    params: t.Object({ id: t.String() }),
  })
  .post("/candidates", (ctx) => candidateController.postCandidate(ctx), {
    isAuth: true,
    body: t.Object({
      firstName: t.String(),
      lastName: t.Optional(t.String()),
      email: t.Optional(t.String()),
      phone: t.Optional(t.String()),
      location: t.Optional(t.String()),
      linkedin: t.Optional(t.String()),
      job: t.Optional(t.String()),
      source: t.Optional(t.String()),
      currentTitle: t.Optional(t.String()),
      years: t.Optional(t.Number()),
      skills: t.Optional(t.Array(t.String())),
      notes: t.Optional(t.String()),
    }),
  });
