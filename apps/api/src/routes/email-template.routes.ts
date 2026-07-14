import { Elysia, t } from "elysia";
import * as emailTemplateController from "../controllers/email-template.controller";
import { authGuard } from "../plugins/auth-guard";

const templateBody = t.Object({
  key: t.Optional(t.String()),
  icon: t.Optional(t.String()),
  name: t.Optional(t.String()),
  description: t.Optional(t.String()),
  subject: t.Optional(t.String()),
  variables: t.Optional(t.Array(t.String())),
  body: t.Optional(t.Array(t.String())),
  cta: t.Optional(t.String()),
  footer: t.Optional(t.String()),
  enabled: t.Optional(t.Boolean()),
});

export default new Elysia({ name: "email-template.routes" })
  .use(authGuard)
  .get("/email-templates", (ctx) => emailTemplateController.getTemplates(ctx), {
    isAuth: true,
    requireAdmin: true,
  })
  .post(
    "/email-templates",
    (ctx) => emailTemplateController.postTemplate(ctx),
    {
      isAuth: true,
      requireAdmin: true,
      body: templateBody,
    },
  )
  .put(
    "/email-templates/:id",
    (ctx) => emailTemplateController.putTemplate(ctx),
    {
      isAuth: true,
      requireAdmin: true,
      params: t.Object({ id: t.String() }),
      body: templateBody,
    },
  )
  .delete(
    "/email-templates/:id",
    (ctx) => emailTemplateController.removeTemplate(ctx),
    {
      isAuth: true,
      requireAdmin: true,
      params: t.Object({ id: t.String() }),
    },
  );
