import { Elysia } from "elysia";
import * as employeeDashboardController from "../controllers/employee-dashboard.controller";
import { authGuard } from "../plugins/auth-guard";

export default new Elysia({ name: "employee-dashboard.routes" })
  .use(authGuard)
  .get(
    "/employee-dashboard/greeting",
    (ctx) => employeeDashboardController.getGreeting(ctx),
    { isAuth: true },
  )
  .get(
    "/employee-dashboard/kpis",
    (ctx) => employeeDashboardController.getKpis(ctx),
    { isAuth: true },
  )
  .get(
    "/employee-dashboard/roles",
    (ctx) => employeeDashboardController.getRoles(ctx),
    { isAuth: true },
  )
  .get(
    "/employee-dashboard/followups",
    (ctx) => employeeDashboardController.getFollowups(ctx),
    { isAuth: true },
  )
  .get(
    "/employee-dashboard/ai-activity",
    (ctx) => employeeDashboardController.getAiActivity(ctx),
    { isAuth: true },
  )
  .get(
    "/employee-dashboard/funnel",
    (ctx) => employeeDashboardController.getFunnel(ctx),
    { isAuth: true },
  )
  .get(
    "/employee-dashboard/invites-week",
    (ctx) => employeeDashboardController.getInvitesWeek(ctx),
    { isAuth: true },
  );
