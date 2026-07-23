import { Elysia } from "elysia";
import * as industryController from "../controllers/industry.controller";
import { authGuard } from "../plugins/auth-guard";

export default new Elysia({ name: "industry.routes" })
  .use(authGuard)
  .get("/industries", () => industryController.getIndustries(), { isAuth: true });
