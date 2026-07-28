import { randomUUID } from "node:crypto";
import { and, asc, eq } from "drizzle-orm";
import { db } from "../db";
import {
  emailTemplate,
  type TemplateCategory,
  type TemplateStatus,
} from "../models/email-template.model";

export interface TemplateSeed {
  key: string;
  icon: string;
  name: string;
  description: string;
  category: TemplateCategory;
  subject: string;
  preheader: string;
  heading: string;
  variables: string[];
  body: string[];
  cta: string;
  ctaUrl: string;
  footer: string;
  sampleTo: string;
  status: TemplateStatus;
}

export type EmailTemplateInput = Partial<TemplateSeed>;

/**
 * The templates every agency starts with. `{token}` placeholders are filled at
 * send time; `{workspace}` is the agency name and `{action_url}` the CTA link.
 */
export const DEFAULT_TEMPLATES: TemplateSeed[] = [
  {
    key: "verify",
    icon: "mark-email-read",
    name: "Verify email",
    description: "Sent the moment an account is created",
    category: "auth",
    subject: "Verify your email to finish setting up {workspace}",
    preheader: "Your code is {code} — it expires in {expiry_minutes} minutes.",
    heading: "Confirm your email address",
    variables: ["name", "code", "workspace", "expiry_minutes"],
    body: [
      "Hi {name},",
      "One step left. Enter this code on the verification screen — or tap the button below and we'll do it for you.",
      "Verifying proves the address is yours: it's what lets you invite recruiters, email candidates and receive client replies. The code is valid for {expiry_minutes} minutes.",
    ],
    cta: "Verify my email",
    ctaUrl: "{action_url}",
    footer:
      "Didn't create a {workspace} account? Someone may have typed your address by mistake — ignore this email and nothing will be set up.",
    sampleTo: "riya@troyconsulting.com",
    status: "enabled",
  },
  {
    key: "invite",
    icon: "person-add",
    name: "Team invite",
    description: "When an admin invites a member",
    category: "auth",
    subject: "{inviter} invited you to {workspace}",
    preheader: "You'll join as {role}. The invite is good for 7 days.",
    heading: "You've been invited to {workspace}",
    variables: ["name", "inviter", "role", "workspace"],
    body: [
      "Hi {name},",
      "{inviter} has set up a seat for you on {workspace}. Accept it and you'll land straight in the right role — there's nothing to configure.",
      "As {role} you'll be able to work the requirements assigned to you: shortlist candidates, log calls and hand profiles to your profile lead for review.",
      "The invite is tied to your address and can only be accepted once.",
    ],
    cta: "Accept invite",
    ctaUrl: "{action_url}",
    footer:
      "This invite expires in 7 days and can be revoked by an admin at any time. If you weren't expecting it, ignore it — {inviter} will see it lapse.",
    sampleTo: "dev@troyconsulting.com",
    status: "enabled",
  },
  {
    key: "forgot",
    icon: "lock-reset",
    name: "Forgot password",
    description: "Password reset request",
    category: "auth",
    subject: "Reset your {workspace} password",
    preheader: "This link works for {expiry_minutes} minutes, then it stops working.",
    heading: "Set a new password",
    variables: ["name", "workspace", "expiry_minutes"],
    body: [
      "Hi {name},",
      "Someone — hopefully you — asked to reset the password for this address. Choose a new one below.",
      "The link is deliberately short-lived: it works once, for {expiry_minutes} minutes. If it's already expired, start again from the sign-in screen and we'll send a fresh one.",
      "If you didn't request this, your account is safe and nothing has changed — no change happens until the link is used.",
    ],
    cta: "Choose a new password",
    ctaUrl: "{action_url}",
    footer:
      "All other sessions are signed out after a reset. Repeated emails you didn't ask for are worth mentioning to your admin.",
    sampleTo: "riya@troyconsulting.com",
    status: "enabled",
  },
  {
    key: "jd",
    icon: "description",
    name: "JD share (candidate)",
    description: "Sent after a candidate connects",
    category: "biz",
    subject: "{role} at {client} — full job details",
    preheader: "Full description, process and team details inside.",
    heading: "{role} at {client}",
    variables: ["candidate_name", "role", "client", "salary_range", "sourcer", "workspace"],
    body: [
      "Hi {candidate_name},",
      "Great connecting! Here's the full description for the {role} role at {client} — {salary_range}, with the process and team details inside.",
      "If it looks like a fit, reply with your CV and {sourcer} will fast-track you with the hiring team.",
    ],
    cta: "View job description",
    ctaUrl: "{action_url}",
    footer:
      "{workspace} represents {client} for this search. Your details are never shared without consent.",
    sampleTo: "savannah.n@gmail.com",
    status: "draft",
  },
  {
    key: "interview",
    icon: "event",
    name: "Interview confirmation",
    description: "After a lead schedules a call",
    category: "biz",
    subject: "Confirmed: {role} interview on {date}",
    preheader: "{date} at {time} · {mode}",
    heading: "Your interview is confirmed",
    variables: ["candidate_name", "role", "client", "date", "time", "mode", "workspace"],
    body: [
      "Hi {candidate_name},",
      "Your {role} interview with {client} is confirmed for {date} at {time} ({mode}). The joining link and panel details are below.",
      "You'll get reminders 24 hours and 1 hour before. Reply here if the time doesn't work.",
    ],
    cta: "Add to calendar",
    ctaUrl: "{action_url}",
    footer:
      "Need to reschedule? Reply to this email and your {workspace} contact will sort it out.",
    sampleTo: "savannah.n@gmail.com",
    status: "enabled",
  },
  {
    key: "submission",
    icon: "fact-check",
    name: "Client submission",
    description: "New CV for client review",
    category: "biz",
    subject: "New candidate for {role}: {candidate_name}",
    preheader: "{candidate_name} · AI match {match_score} · awaiting your decision.",
    heading: "New candidate for {role}",
    variables: ["client_contact", "candidate_name", "role", "match_score", "workspace"],
    body: [
      "Hi {client_contact},",
      "{workspace} has submitted {candidate_name} for your {role} opening — AI match {match_score}, screened and recommended by our profile lead.",
      "Review the CV and approve or decline in your portal. We aim for decisions within 3 business days to keep candidates warm.",
    ],
    cta: "Review in portal",
    ctaUrl: "{action_url}",
    footer: "You're receiving this as the hiring contact for this role.",
    sampleTo: "priya.menon@nortech.com",
    status: "enabled",
  },
  {
    key: "offer",
    icon: "contract",
    name: "Offer letter (candidate)",
    description: "Generated from Placements",
    category: "biz",
    subject: "Your offer from {client} — {role}",
    preheader: "{ctc}, starting {join_date}. Offer letter attached.",
    heading: "Congratulations — your offer from {client}",
    variables: ["candidate_name", "role", "client", "ctc", "join_date", "workspace"],
    body: [
      "Hi {candidate_name},",
      "Congratulations! {client} is delighted to offer you the {role} position at {ctc}, starting {join_date}. The formal offer letter is attached as a PDF.",
      "Reply here to accept, or with any questions — we're thrilled for you.",
    ],
    cta: "View offer letter",
    ctaUrl: "{action_url}",
    footer:
      "This offer is valid for 7 days. {workspace} manages this search on behalf of {client}.",
    sampleTo: "savannah.n@gmail.com",
    status: "enabled",
  },
];

const DEFAULTS_BY_KEY = new Map(DEFAULT_TEMPLATES.map((tpl) => [tpl.key, tpl]));

type TemplateRow = typeof emailTemplate.$inferSelect;
export type EmailTemplate = ReturnType<typeof mapTemplate>;

function mapTemplate(t: TemplateRow) {
  return {
    id: t.id,
    key: t.key,
    icon: t.icon,
    name: t.name,
    description: t.description,
    category: t.category,
    subject: t.subject,
    preheader: t.preheader,
    heading: t.heading,
    variables: t.variables ?? [],
    body: t.body ?? [],
    cta: t.cta,
    ctaUrl: t.ctaUrl,
    footer: t.footer,
    sampleTo: t.sampleTo,
    status: t.status,
    /** Whether this template still matches the copy it shipped with. */
    isDefault: DEFAULTS_BY_KEY.has(t.key),
  };
}

/** Creates the starter templates for a new agency. Idempotent. */
export async function seedAgencyTemplates(agencyId: string): Promise<void> {
  if (!agencyId) return;
  await db
    .insert(emailTemplate)
    .values(DEFAULT_TEMPLATES.map((tpl) => ({ id: randomUUID(), agencyId, ...tpl })))
    .onConflictDoNothing({ target: [emailTemplate.agencyId, emailTemplate.key] });
}

async function selectAll(agencyId: string) {
  return db
    .select()
    .from(emailTemplate)
    .where(eq(emailTemplate.agencyId, agencyId))
    .orderBy(asc(emailTemplate.createdAt));
}

export async function listTemplates(agencyId: string) {
  let rows = await selectAll(agencyId);
  // Agencies created before the seed ran (or before a default was added) fill
  // in on first read, so the screen is never empty.
  if (rows.length < DEFAULT_TEMPLATES.length) {
    await seedAgencyTemplates(agencyId);
    rows = await selectAll(agencyId);
  }
  const data = rows.map(mapTemplate);
  return { data, totalCount: data.length };
}

export async function getTemplate(agencyId: string, id: string) {
  const [row] = await db
    .select()
    .from(emailTemplate)
    .where(and(eq(emailTemplate.id, id), eq(emailTemplate.agencyId, agencyId)))
    .limit(1);
  return row ? mapTemplate(row) : null;
}

/**
 * Looks a template up by its stable key, seeding first if the agency has none.
 * This is the entry point every transactional sender goes through.
 */
export async function getTemplateByKey(agencyId: string, key: string) {
  const read = async () => {
    const [row] = await db
      .select()
      .from(emailTemplate)
      .where(and(eq(emailTemplate.key, key), eq(emailTemplate.agencyId, agencyId)))
      .limit(1);
    return row ? mapTemplate(row) : null;
  };
  const found = await read();
  if (found) return found;
  await seedAgencyTemplates(agencyId);
  return read();
}

export async function createTemplate(agencyId: string, input: EmailTemplateInput) {
  const existing = await selectAll(agencyId);
  const count = existing.filter((row) => row.key.startsWith("custom")).length + 1;
  const [created] = await db
    .insert(emailTemplate)
    .values({
      id: randomUUID(),
      agencyId,
      key: input.key ?? `custom${count}`,
      icon: input.icon ?? "edit",
      name: input.name ?? "New custom template",
      description: input.description ?? "Rename me — click the title above",
      category: "custom",
      subject: input.subject ?? "A message from {workspace}",
      preheader: input.preheader ?? "",
      heading: input.heading ?? "A message from {workspace}",
      variables: input.variables ?? ["name", "workspace", "role", "client"],
      body: input.body ?? [
        "Hi {name},",
        "Write your email here — use the variables above and they'll fill automatically.",
      ],
      cta: input.cta ?? "Open {workspace}",
      ctaUrl: input.ctaUrl ?? "{action_url}",
      footer: input.footer ?? "",
      sampleTo: input.sampleTo ?? "",
      status: input.status ?? "draft",
    })
    .returning();
  return created ? mapTemplate(created) : null;
}

const EDITABLE_FIELDS = [
  "icon",
  "name",
  "description",
  "subject",
  "preheader",
  "heading",
  "variables",
  "body",
  "cta",
  "ctaUrl",
  "footer",
  "status",
] as const;

export async function updateTemplate(agencyId: string, id: string, patch: EmailTemplateInput) {
  const update: Record<string, unknown> = { updatedAt: new Date() };
  for (const field of EDITABLE_FIELDS) {
    if (patch[field] !== undefined) update[field] = patch[field];
  }
  const [updated] = await db
    .update(emailTemplate)
    .set(update)
    .where(and(eq(emailTemplate.id, id), eq(emailTemplate.agencyId, agencyId)))
    .returning();
  return updated ? mapTemplate(updated) : null;
}

/**
 * Restores the copy the template shipped with. Only the built-ins have a
 * default to go back to — a custom template has nothing to restore.
 */
export async function resetTemplate(agencyId: string, id: string) {
  const current = await getTemplate(agencyId, id);
  if (!current) return null;
  const seed = DEFAULTS_BY_KEY.get(current.key);
  if (!seed) return null;
  const [updated] = await db
    .update(emailTemplate)
    .set({ ...seed, updatedAt: new Date() })
    .where(and(eq(emailTemplate.id, id), eq(emailTemplate.agencyId, agencyId)))
    .returning();
  return updated ? mapTemplate(updated) : null;
}

export async function deleteTemplate(agencyId: string, id: string) {
  const [deleted] = await db
    .delete(emailTemplate)
    .where(and(eq(emailTemplate.id, id), eq(emailTemplate.agencyId, agencyId)))
    .returning();
  return deleted ? { id: deleted.id } : null;
}
