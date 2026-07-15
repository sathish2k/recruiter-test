import { Elysia, t } from "elysia";
import * as teamActivityController from "../controllers/team-activity.controller";
import { authGuard } from "../plugins/auth-guard";

export default new Elysia({ name: "team-activity.routes" })
  .use(authGuard)
  .get("/team-activity", (ctx) => teamActivityController.getTeamActivity(ctx), {
    isAuth: true,
    query: t.Object({
      viewer: t.Optional(t.String()),
      role: t.Optional(t.String()),
      period: t.Optional(t.String()),
    }),
  });
