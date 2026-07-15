import { Elysia } from "elysia";
import * as interviewsController from "../controllers/interviews.controller";
import { authGuard } from "../plugins/auth-guard";

export default new Elysia({ name: "interviews.routes" })
  .use(authGuard)
  .get("/interviews", (ctx) => interviewsController.getInterviews(ctx), {
    isAuth: true,
  });
