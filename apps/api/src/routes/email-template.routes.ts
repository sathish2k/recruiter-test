import { Elysia, t } from "elysia";
import * as emailTemplateController from "../controllers/email-template.controller";
import { authGuard } from "../plugins/auth-guard";

const templateBody = t.Object({
  key: t.Optional(t.String()),
  icon: t.Optional(t.String()),
  name: t.Optional(t.String()),
  description: t.Optional(t.String()),
  subject: t.Optional(t.String()),
  preheader: t.Optional(t.String()),
  heading: t.Optional(t.String()),
  variables: t.Optional(t.Array(t.String())),
  body: t.Optional(t.Array(t.String())),
  cta: t.Optional(t.String()),
  ctaUrl: t.Optional(t.String()),
  footer: t.Optional(t.String()),
  status: t.Optional(t.Union([t.Literal("enabled"), t.Literal("draft"), t.Literal("disabled")])),
});

export default new Elysia({ name: "email-template.routes" })
  .use(authGuard)
  .get("/email-templates", (ctx) => emailTemplateController.getTemplates(ctx), {
    isAuth: true,
  })
  .post("/email-templates", (ctx) => emailTemplateController.postTemplate(ctx), {
    isAuth: true,
    body: t.Optional(templateBody),
  })
  .put("/email-templates/:id", (ctx) => emailTemplateController.putTemplate(ctx), {
    isAuth: true,
    body: t.Optional(templateBody),
  })
  .delete("/email-templates/:id", (ctx) => emailTemplateController.removeTemplate(ctx), {
    isAuth: true,
  })
  .post("/email-templates/:id/reset", (ctx) => emailTemplateController.postReset(ctx), {
    isAuth: true,
  })
  .post("/email-templates/:id/test", (ctx) => emailTemplateController.postTest(ctx), {
    isAuth: true,
    body: t.Optional(
      t.Object({
        to: t.Optional(t.String()),
        sample: t.Optional(t.Record(t.String(), t.String())),
      }),
    ),
  })
  .post("/email-templates/assist", (ctx) => emailTemplateController.postAssist(ctx), {
    isAuth: true,
    body: t.Object({ action: t.String(), body: t.String() }),
  });
