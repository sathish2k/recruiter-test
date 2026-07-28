import { status } from "elysia";
import { isGeminiConfigured, ModelError, rewriteText } from "../lib/gemini";
import {
  createTemplate,
  deleteTemplate,
  type EmailTemplateInput,
  getTemplate,
  listTemplates,
  resetTemplate,
  updateTemplate,
} from "../services/email-template.service";
import { sendTemplateEmail } from "../services/transactional-email.service";

type Auth = { agencyId?: string | null; email?: string | null; name?: string | null };

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

/** Restores the copy the template shipped with. Custom templates have none. */
export async function postReset(ctx: { user: Auth; params: { id: string } }) {
  const restored = await resetTemplate(ctx.user.agencyId ?? "", ctx.params.id);
  if (!restored) return status(422, "This template has no default to restore");
  return { data: restored };
}

/**
 * Sends the template to one address with the sample values from the editor, so
 * the test lands as a real email rendered by the same pipeline as production.
 */
export async function postTest(ctx: {
  user: Auth;
  params: { id: string };
  body?: { to?: string; sample?: Record<string, string> } | null;
}) {
  const agencyId = ctx.user.agencyId ?? "";
  const template = await getTemplate(agencyId, ctx.params.id);
  if (!template) return status(404, "Template not found");

  const to = ctx.body?.to?.trim() || ctx.user.email;
  if (!to) return status(422, "No recipient");

  const result = await sendTemplateEmail({
    agencyId,
    key: template.key,
    to: { email: to },
    vars: ctx.body?.sample ?? {},
    actionUrl: ctx.body?.sample?.action_url,
    ignoreStatus: true,
  });
  if (!result.sent && result.reason === "not-configured") {
    return status(503, "Email is not configured — connect Mailjet in Integrations");
  }
  if (!result.sent) return status(422, "Could not send the test email");
  return { data: { to } };
}

const ASSIST_INSTRUCTIONS: Record<string, string> = {
  improve: "Improve the clarity and flow of this email. Keep the same length and tone.",
  shorten: "Shorten this email to its essentials. Cut at most half the words.",
  professional: "Rewrite this email in a warm but professional business tone.",
  rewrite: "Rewrite this email from scratch, keeping every fact and variable.",
};

/** Runs one of the editor's AI chips over the draft body. */
export async function postAssist(ctx: {
  user: Auth;
  body?: { action?: string; body?: string } | null;
}) {
  const instruction = ASSIST_INSTRUCTIONS[ctx.body?.action ?? ""];
  if (!instruction) return status(422, "Unknown action");
  const text = ctx.body?.body?.trim();
  if (!text) return status(422, "Nothing to rewrite");
  if (!isGeminiConfigured()) return status(503, "AI is not configured");

  try {
    return { data: { body: await rewriteText(instruction, text) } };
  } catch (error) {
    // ModelError deliberately carries no model text — never echo it.
    if (error instanceof ModelError) return status(502, "The AI could not rewrite that");
    throw error;
  }
}
