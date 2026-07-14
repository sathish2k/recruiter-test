import { Elysia } from "elysia";
import * as dashboardController from "../controllers/dashboard.controller";
import { authGuard } from "../plugins/auth-guard";

export default new Elysia({ name: "dashboard.routes" })
  .use(authGuard)
  .get("/home", (ctx) => dashboardController.getHomeDashboard(ctx), {
    isAuth: true,
  })
  .get("/dashboard/stats", () => dashboardController.getStats(), {
    isAuth: true,
  })
  .get("/dashboard/hiring", () => dashboardController.getHiring(), {
    isAuth: true,
  })
  .get(
    "/dashboard/recent-candidates",
    () => dashboardController.getRecentCandidates(),
    { isAuth: true },
  )
  .get("/dashboard/interviews", () => dashboardController.getInterviews(), {
    isAuth: true,
  })
  .get("/dashboard/screening", () => dashboardController.getScreening(), {
    isAuth: true,
  });
