import { Elysia } from "elysia";
import * as leadDashboardController from "../controllers/lead-dashboard.controller";
import { authGuard } from "../plugins/auth-guard";

export default new Elysia({ name: "lead-dashboard.routes" })
  .use(authGuard)
  .get(
    "/lead-dashboard/greeting",
    (ctx) => leadDashboardController.getGreeting(ctx),
    {
      isAuth: true,
    },
  )
  .get("/lead-dashboard/kpis", (ctx) => leadDashboardController.getKpis(ctx), {
    isAuth: true,
  })
  .get(
    "/lead-dashboard/cv-queue",
    (ctx) => leadDashboardController.getCvQueue(ctx),
    {
      isAuth: true,
    },
  )
  .get(
    "/lead-dashboard/client-decisions",
    (ctx) => leadDashboardController.getClientDecisions(ctx),
    { isAuth: true },
  )
  .get(
    "/lead-dashboard/interviews-today",
    (ctx) => leadDashboardController.getInterviewsToday(ctx),
    { isAuth: true },
  )
  .get(
    "/lead-dashboard/funnel",
    (ctx) => leadDashboardController.getFunnel(ctx),
    {
      isAuth: true,
    },
  )
  .get(
    "/lead-dashboard/sourcers",
    (ctx) => leadDashboardController.getSourcers(ctx),
    {
      isAuth: true,
    },
  );
