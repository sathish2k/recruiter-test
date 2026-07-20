import { Elysia, t } from "elysia";
import * as auditLogController from "../controllers/audit-log.controller";
import { authGuard } from "../plugins/auth-guard";

export default new Elysia({ name: "audit-log.routes" })
  .use(authGuard)
  .get("/audit-log", (ctx) => auditLogController.getAuditEvents(ctx), {
    isAuth: true,
    query: t.Object({
      search: t.Optional(t.String()),
      user: t.Optional(t.String()),
      category: t.Optional(t.String()),
      result: t.Optional(t.String()),
      range: t.Optional(t.String()),
      page: t.Optional(t.String()),
      pageSize: t.Optional(t.String()),
      sortKey: t.Optional(t.String()),
      sortDir: t.Optional(t.String()),
    }),
  })
  .get("/audit-log/actors", (ctx) => auditLogController.getAuditActors(ctx), {
    isAuth: true,
  });
