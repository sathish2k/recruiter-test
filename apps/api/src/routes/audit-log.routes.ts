import { Elysia, t } from "elysia";
import * as auditLogController from "../controllers/audit-log.controller";
import { authGuard } from "../plugins/auth-guard";

export default new Elysia({ name: "audit-log.routes" })
  .use(authGuard)
  .get("/audit-log", (ctx) => auditLogController.getAuditLog(ctx), {
    isAuth: true,
    requireAdmin: true,
    query: t.Object({ kind: t.Optional(t.String()) }),
  });
