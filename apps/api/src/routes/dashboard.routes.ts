import { Elysia, t } from "elysia";
import * as dashboardController from "../controllers/dashboard.controller";
import { authGuard } from "../plugins/auth-guard";

export default new Elysia({ name: "dashboard.routes" })
  .use(authGuard)
  .get("/dashboard/summary", (ctx) => dashboardController.getDashboardSummary(ctx), {
    isAuth: true,
  })
  // Both are composed from the caller's permissions, so one route serves every
  // role's dashboard — see dashboard.service.ts.
  .get("/dashboard/alert", (ctx) => dashboardController.getDashboardAlert(ctx), {
    isAuth: true,
  })
  .get("/dashboard/queue", (ctx) => dashboardController.getDashboardQueue(ctx), {
    isAuth: true,
  })
  .get("/dashboard/kpis", (ctx) => dashboardController.getDashboardKpis(ctx), {
    isAuth: true,
  })
  .get("/dashboard/status", (ctx) => dashboardController.getDashboardStatus(ctx), {
    isAuth: true,
  })
  .get("/dashboard/today-work", (ctx) => dashboardController.getDashboardTodayWork(ctx), {
    isAuth: true,
  })
  .get("/dashboard/top-clients", (ctx) => dashboardController.getDashboardTopClients(ctx), {
    isAuth: true,
  })
  .get("/dashboard/client-health", (ctx) => dashboardController.getDashboardClientHealth(ctx), {
    isAuth: true,
  })
  .get("/dashboard/security-events", (ctx) => dashboardController.getDashboardSecurityEvents(ctx), {
    isAuth: true,
  })
  .get("/dashboard/assigned-jobs", (ctx) => dashboardController.getDashboardAssignedJobs(ctx), {
    isAuth: true,
  })
  .get(
    "/dashboard/rejection-reasons",
    (ctx) => dashboardController.getDashboardRejectionReasons(ctx),
    { isAuth: true },
  )
  .get("/dashboard/open-roles", (ctx) => dashboardController.getDashboardOpenRoles(ctx), {
    isAuth: true,
  })
  .get("/dashboard/system-status", (ctx) => dashboardController.getDashboardSystemStatus(ctx), {
    isAuth: true,
  })
  .get("/dashboard/team-health", (ctx) => dashboardController.getDashboardTeamHealth(ctx), {
    isAuth: true,
  })
  .get("/dashboard/my-pipeline", (ctx) => dashboardController.getDashboardMyPipeline(ctx), {
    isAuth: true,
  })
  .get("/dashboard/week-goals", (ctx) => dashboardController.getDashboardWeekGoals(ctx), {
    isAuth: true,
  })
  .get("/dashboard/ai-findings", (ctx) => dashboardController.getDashboardAiFindings(ctx), {
    isAuth: true,
  })
  .get(
    "/dashboard/revenue-by-quarter",
    (ctx) => dashboardController.getDashboardRevenueByQuarter(ctx),
    { isAuth: true },
  )
  .get(
    "/dashboard/team-performance",
    (ctx) => dashboardController.getDashboardTeamPerformance(ctx),
    { isAuth: true },
  )
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
