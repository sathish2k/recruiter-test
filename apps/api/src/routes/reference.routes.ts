import { Elysia } from "elysia";
import * as referenceController from "../controllers/reference.controller";
import { authGuard } from "../plugins/auth-guard";

export default new Elysia({ name: "reference.routes" })
  .use(authGuard)
  .get("/reference", () => referenceController.getReference(), { isAuth: true });
