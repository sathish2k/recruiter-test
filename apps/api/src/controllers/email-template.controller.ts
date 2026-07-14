import { status } from "elysia";
import type { AuthClaims } from "../plugins/auth-guard";
import {
  createTemplate,
  deleteTemplate,
  type EmailTemplateInput,
  listTemplates,
  updateTemplate,
} from "../services/email-template.service";

export async function getTemplates(ctx: { auth: AuthClaims }) {
  const { data, totalCount } = await listTemplates(ctx.auth.agencyId);
  return { data, meta: { totalCount } };
}

export async function postTemplate(ctx: {
  auth: AuthClaims;
  body: EmailTemplateInput;
}) {
  const created = await createTemplate(ctx.auth.agencyId, ctx.body ?? {});
  return status(201, { data: created });
}

export async function putTemplate(ctx: {
  auth: AuthClaims;
  params: { id: string };
  body: EmailTemplateInput;
}) {
  const updated = await updateTemplate(
    ctx.auth.agencyId,
    ctx.params.id,
    ctx.body ?? {},
  );
  if (!updated) return status(404, "Template not found");
  return { data: updated };
}

export async function removeTemplate(ctx: {
  auth: AuthClaims;
  params: { id: string };
}) {
  const removed = await deleteTemplate(ctx.auth.agencyId, ctx.params.id);
  if (!removed) return status(404, "Template not found");
  return { data: removed };
}
