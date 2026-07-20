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
    // The workspace form posts one flat settings object — real columns are
    // split out and the rest is merged into `settings` by the service.
    body: t.Optional(t.Record(t.String(), t.Any())),
  });
