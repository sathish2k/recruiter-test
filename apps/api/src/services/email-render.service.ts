import { eq } from "drizzle-orm";
import { db } from "../db";
import { organization } from "../models/organization.model";
import type { EmailTemplate } from "./email-template.service";

/**
 * Turns a stored template into the email that actually leaves the building.
 * The markup mirrors the Settings live preview one-for-one — same header,
 * heading, paragraph rhythm, code block, CTA pill and footer — so what an
 * admin approves on screen is what the recipient opens.
 *
 * Email clients ignore <style> blocks and most of CSS layout, so everything is
 * inline and the structure is tables.
 */

export interface Brand {
  /** Agency name — also the {workspace} value. */
  workspace: string;
  /** Postal line in the footer; CAN-SPAM/GDPR expect a real address. */
  address: string;
  /** Product wordmark, split so the last part takes the accent colour. */
  productName: string;
  productAccent: string;
  /** Absolute URL of the brand mark. Email clients strip inline SVG, so the
   * mark ships as a PNG served by the web app. */
  logoUrl: string;
}

const PALETTE = {
  page: "#E9E6E1",
  card: "#FFFFFF",
  headerBg: "#211E1B",
  heading: "#211E1B",
  text: "#3D3A34",
  muted: "#8B8880",
  faint: "#A39E94",
  rule: "#EDE7DC",
  accent: "#0E2E5C",
  accentText: "#B4530C",
  brandAccent: "#F59E0B",
  panel: "#F7F5F2",
  panelBorder: "#D3C9B8",
  footerText: "#6E6B64",
} as const;

const FONT = "'Instrument Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif";
const BRAND_FONT = "'Manrope',ui-sans-serif,-apple-system,Segoe UI,sans-serif";
const MONO = "ui-monospace,SFMono-Regular,Menlo,Consolas,monospace";

export function fillTokens(text: string, vars: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (match, key: string) => vars[key] ?? match);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Body paragraphs keep author line breaks, so \n becomes <br>. */
function paragraphHtml(text: string): string {
  return escapeHtml(text).replace(/\n/g, "<br>");
}

/** Why this email is not spam — a transactional account note or a work one. */
function footerWhy(template: EmailTemplate, workspace: string): string {
  return template.category === "auth"
    ? `This is a transactional email about your ${workspace} account. You cannot unsubscribe from it.`
    : `You're receiving this because you're in conversation with ${workspace} about a role.`;
}

export interface RenderedEmail {
  subject: string;
  preheader: string;
  html: string;
  text: string;
}

export function renderTemplate(
  template: EmailTemplate,
  vars: Record<string, string>,
  brand: Brand,
): RenderedEmail {
  const values: Record<string, string> = { workspace: brand.workspace, ...vars };
  const fill = (text: string) => fillTokens(text, values);

  const subject = fill(template.subject);
  const preheader = fill(template.preheader);
  const heading = fill(template.heading);
  const paragraphs = template.body.map(fill).filter(Boolean);
  const footer = fill(template.footer);
  const actionUrl = fill(template.ctaUrl);
  // An unresolved token means the caller supplied no link — drop the button
  // rather than mail out a dead `{action_url}`.
  const hasAction = Boolean(actionUrl) && !actionUrl.includes("{");
  const code = values.code;

  const bodyHtml = paragraphs
    .map(
      (paragraph) =>
        `<p style="margin:0 0 13px;font-size:13.5px;line-height:1.68;color:${PALETTE.text}">${paragraphHtml(paragraph)}</p>`,
    )
    .join("");

  // Mark + wordmark, side by side. The wordmark is live text so the brand still
  // reads when a client blocks images.
  const headerHtml = `<table role="presentation" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="padding-right:9px;line-height:0" valign="middle"><img src="${escapeHtml(brand.logoUrl)}" width="21" height="21" alt="" style="display:block;border:0;width:21px;height:21px"></td>
        <td valign="middle" style="font-family:${BRAND_FONT};font-weight:700;font-size:13px;letter-spacing:-.02em;color:#FFFFFF;white-space:nowrap">${escapeHtml(brand.productName)}<span style="color:${PALETTE.brandAccent}">${escapeHtml(brand.productAccent)}</span></td>
      </tr>
    </table>`;

  const codeHtml = code
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:18px">
      <tr><td align="center" style="background:${PALETTE.panel};border:1px dashed ${PALETTE.panelBorder};border-radius:12px;padding:16px">
        <div style="font-size:10px;font-weight:700;letter-spacing:.11em;color:${PALETTE.muted}">YOUR CODE</div>
        <div style="font-family:${MONO};font-size:26px;font-weight:700;letter-spacing:.22em;color:${PALETTE.heading};margin-top:8px">${escapeHtml(code)}</div>
      </td></tr>
    </table>`
    : "";

  const ctaHtml = hasAction
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:22px">
      <tr><td align="center" bgcolor="${PALETTE.accent}" style="background:${PALETTE.accent};border-radius:999px;box-shadow:0 5px 14px rgba(14,46,92,.26)">
        <a href="${escapeHtml(actionUrl)}" style="display:inline-block;padding:13px 28px;font-family:${FONT};font-size:13.5px;font-weight:700;line-height:1;color:#FFFFFF;text-decoration:none;border-radius:999px">${escapeHtml(fill(template.cta))}</a>
      </td></tr>
    </table>
    <p style="margin:11px 0 0;font-size:11px;line-height:1.6;color:${PALETTE.faint}">Button not working? Paste this into your browser:<br><span style="color:${PALETTE.accentText};word-break:break-all">${escapeHtml(actionUrl)}</span></p>`
    : "";

  const footerNoteHtml = footer
    ? `<p style="margin:20px 0 0;padding-top:16px;border-top:1px solid ${PALETTE.rule};font-size:12px;line-height:1.6;color:${PALETTE.muted}">${paragraphHtml(footer)}</p>`
    : "";

  const html = `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:${PALETTE.page}">
<!-- Inbox preview line: shown next to the subject, never inside the email. -->
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(preheader)}</div>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${PALETTE.page};padding:24px 12px">
  <tr><td align="center">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="width:100%;max-width:560px;background:${PALETTE.card};border-radius:12px;overflow:hidden;font-family:${FONT}">
      <tr><td bgcolor="${PALETTE.headerBg}" style="background:${PALETTE.headerBg};padding:18px 28px">${headerHtml}</td></tr>
      <tr><td style="padding:26px 28px 24px">
        <h1 style="margin:0 0 16px;font-size:19px;font-weight:700;letter-spacing:-.01em;line-height:1.3;color:${PALETTE.heading}">${escapeHtml(heading)}</h1>
        ${bodyHtml}${codeHtml}${ctaHtml}${footerNoteHtml}
      </td></tr>
      <tr><td style="background:${PALETTE.panel};border-top:1px solid ${PALETTE.rule};padding:16px 28px 18px">
        <p style="margin:0;font-size:11px;line-height:1.6;color:${PALETTE.footerText}">${escapeHtml(footerWhy(template, brand.workspace))}</p>
        <p style="margin:7px 0 0;font-size:10.5px;line-height:1.6;color:${PALETTE.muted}">${escapeHtml(brand.address)}</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;

  const text = [
    heading,
    "",
    ...paragraphs,
    code ? `\nYour code: ${code}` : "",
    hasAction ? `\n${fill(template.cta)}: ${actionUrl}` : "",
    footer ? `\n${footer}` : "",
    `\n${footerWhy(template, brand.workspace)}`,
    brand.address,
  ]
    .filter((line) => line !== "")
    .join("\n");

  return { subject, preheader, html, text };
}

const FALLBACK_ADDRESS = process.env.EMAIL_POSTAL_ADDRESS ?? "";
const WEB_ORIGIN = process.env.WEB_ORIGIN ?? "http://localhost:3000";

/** Product chrome — the header lockup. Same for every agency. */
const PRODUCT = {
  productName: process.env.EMAIL_BRAND_NAME ?? "HirePilot",
  productAccent: process.env.EMAIL_BRAND_ACCENT ?? "X",
  logoUrl: process.env.EMAIL_LOGO_URL ?? `${WEB_ORIGIN}/email/logo.png`,
} as const;

/** Brand block for an agency; falls back to the product name when unknown. */
export async function getBrand(agencyId: string): Promise<Brand> {
  const fallback: Brand = {
    ...PRODUCT,
    workspace: process.env.MAILJET_FROM_NAME ?? "AI Recruiter",
    address: FALLBACK_ADDRESS,
  };
  if (!agencyId) return fallback;
  const [org] = await db.select().from(organization).where(eq(organization.id, agencyId)).limit(1);
  if (!org) return fallback;
  const settings = (org.settings ?? {}) as { address?: string };
  return {
    ...PRODUCT,
    workspace: org.name || fallback.workspace,
    address: settings.address ?? FALLBACK_ADDRESS,
  };
}
