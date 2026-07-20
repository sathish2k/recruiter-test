import { status } from "elysia";
import {
  createTemplate,
  deleteTemplate,
  type EmailTemplateInput,
  listTemplates,
  updateTemplate,
} from "../services/email-template.service";

type Auth = { agencyId?: string | null };

export async function getTemplates(ctx: { user: Auth }) {
  const { data, totalCount } = await listTemplates(ctx.user.agencyId ?? "");
  return { data, meta: { totalCount } };
}

export async function postTemplate(ctx: { user: Auth; body?: EmailTemplateInput | null }) {
  const created = await createTemplate(ctx.user.agencyId ?? "", ctx.body ?? {});
  if (!created) return status(422, "Could not create template");
  return status(201, { data: created });
}

export async function putTemplate(ctx: {
  user: Auth;
  params: { id: string };
  body?: EmailTemplateInput | null;
}) {
  const updated = await updateTemplate(ctx.user.agencyId ?? "", ctx.params.id, ctx.body ?? {});
  if (!updated) return status(404, "Template not found");
  return { data: updated };
}

export async function removeTemplate(ctx: { user: Auth; params: { id: string } }) {
  const deleted = await deleteTemplate(ctx.user.agencyId ?? "", ctx.params.id);
  if (!deleted) return status(404, "Template not found");
  return { data: deleted };
}
