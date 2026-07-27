import { Elysia, t } from "elysia";
import * as dashboardController from "../controllers/dashboard.controller";
import { authGuard } from "../plugins/auth-guard";

export default new Elysia({ name: "dashboard.routes" })
  .use(authGuard)
  .get("/dashboard/summary", (ctx) => dashboardController.getDashboardSummary(ctx), {
    isAuth: true,
  })
  .get("/dashboard/pipeline", (ctx) => dashboardController.getDashboardPipeline(ctx), {
    isAuth: true,
  })
  .get("/dashboard/next-interview", (ctx) => dashboardController.getDashboardNextInterview(ctx), {
    isAuth: true,
  })
  .get("/dashboard/sla", (ctx) => dashboardController.getDashboardSla(ctx), { isAuth: true })
  .get("/dashboard/priorities", (ctx) => dashboardController.getDashboardPriorities(ctx), {
    isAuth: true,
  })
  .get(
    "/dashboard/upcoming-interviews",
    (ctx) => dashboardController.getDashboardUpcomingInterviews(ctx),
    { isAuth: true, query: t.Object({ range: t.Optional(t.String()) }) },
  )
  .get("/dashboard/activity-feed", (ctx) => dashboardController.getDashboardActivityFeed(ctx), {
    isAuth: true,
  })
  .get(
    "/dashboard/recent-candidates",
    (ctx) => dashboardController.getDashboardRecentCandidates(ctx),
    { isAuth: true },
  )
  .get("/dashboard/activity", (ctx) => dashboardController.getDashboardActivity(ctx), {
    isAuth: true,
    query: t.Object({ days: t.Optional(t.String()) }),
  });
