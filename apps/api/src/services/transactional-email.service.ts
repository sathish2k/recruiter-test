import { isEmailConfigured, sendEmail } from "../lib/mailjet";
import { getBrand, renderTemplate } from "./email-render.service";
import { getTemplateByKey } from "./email-template.service";

/**
 * The one way the app sends mail. Every transactional email is a stored
 * template rendered with the caller's variables, so what an admin edits in
 * Settings → Email templates is literally what recipients receive.
 */

export interface SendTemplateInput {
  agencyId: string;
  /** Template key — `verify`, `invite`, `forgot`, … */
  key: string;
  to: { email: string; name?: string };
  /** Values for the template's `{tokens}`. `workspace` is filled from the agency. */
  vars?: Record<string, string>;
  /** The CTA link. Omitted templates render without a button. */
  actionUrl?: string;
  /** Test sends ignore the status toggle so a draft can be previewed by mail. */
  ignoreStatus?: boolean;
}

/**
 * Account emails always send. They are user-initiated and account-critical —
 * an admin flipping "Verify email" to Disabled would otherwise lock every new
 * signup out silently. Settings reflects this by locking their status control.
 */
const ALWAYS_SEND = new Set(["auth"]);

export type SendTemplateResult =
  | { sent: true }
  | { sent: false; reason: "missing-template" | "disabled" | "not-configured" };

export async function sendTemplateEmail(input: SendTemplateInput): Promise<SendTemplateResult> {
  const template = await getTemplateByKey(input.agencyId, input.key);
  if (!template) return { sent: false, reason: "missing-template" };
  const optional = !ALWAYS_SEND.has(template.category);
  if (optional && !input.ignoreStatus && template.status !== "enabled") {
    return { sent: false, reason: "disabled" };
  }

  const brand = await getBrand(input.agencyId);
  const vars = { ...input.vars };
  if (input.actionUrl) vars.action_url = input.actionUrl;

  const email = renderTemplate(template, vars, brand);

  if (!isEmailConfigured()) {
    console.warn(`[email:${input.key}] mail not configured — would send to ${input.to.email}`);
    console.warn(`[email:${input.key}] ${email.subject}\n${email.text}`);
    return { sent: false, reason: "not-configured" };
  }

  await sendEmail({
    to: input.to,
    subject: email.subject,
    html: email.html,
    text: email.text,
  });
  return { sent: true };
}
