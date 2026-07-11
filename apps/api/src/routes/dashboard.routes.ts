import { Elysia } from "elysia";
import { authGuard } from "../plugins/auth-guard";
import * as dashboardController from "../controllers/dashboard.controller";

export default new Elysia({ name: "dashboard.routes" })
  .use(authGuard)
  .get("/home", (ctx) => dashboardController.getHomeDashboard(ctx), {
    isAuth: true,
  });
