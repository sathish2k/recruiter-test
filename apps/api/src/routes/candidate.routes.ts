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
  });
