import { Elysia } from "elysia";
import * as dashboardController from "../controllers/dashboard.controller";
import { authGuard } from "../plugins/auth-guard";

export default new Elysia({ name: "dashboard.routes" })
  .use(authGuard)
  .get("/home", (ctx) => dashboardController.getHomeDashboard(ctx), {
    isAuth: true,
  })
  .get("/dashboard/stats", (ctx) => dashboardController.getStats(ctx), {
    isAuth: true,
  })
  .get("/dashboard/hiring", (ctx) => dashboardController.getHiring(ctx), {
    isAuth: true,
  })
  .get(
    "/dashboard/recent-candidates",
    (ctx) => dashboardController.getRecentCandidates(ctx),
    { isAuth: true },
  )
  .get(
    "/dashboard/interviews",
    (ctx) => dashboardController.getInterviews(ctx),
    { isAuth: true },
  )
  .get("/dashboard/screening", (ctx) => dashboardController.getScreening(ctx), {
    isAuth: true,
  });
