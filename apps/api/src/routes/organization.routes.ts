import { Elysia, t } from "elysia";
import * as organizationController from "../controllers/organization.controller";
import { authGuard } from "../plugins/auth-guard";

export default new Elysia({ name: "organization.routes" })
  .use(authGuard)
  .get("/organization", (ctx) => organizationController.getMyOrganization(ctx), {
    isAuth: true,
  })
  .put("/organization", (ctx) => organizationController.putMyOrganization(ctx), {
    isAuth: true,
    body: t.Optional(t.Object({ name: t.Optional(t.String({ minLength: 1 })) })),
  });
