import { isValidObjectId } from "mongoose";
import {
  type EmailTemplateDoc,
  EmailTemplateModel,
} from "../models/email-template.model";

export type EmailTemplateInput = Partial<Omit<EmailTemplateDoc, "agencyId">> & {
  key?: string;
};

export const DEFAULT_TEMPLATES: Omit<EmailTemplateDoc, "agencyId">[] = [
  {
    key: "application_received",
    icon: "mail",
    name: "Application received",
    description: "Auto-reply confirming we received their application",
    subject: "We received your application for {role}",
    variables: ["candidate_name", "role", "company", "agency"],
    body: [
      "Hi {candidate_name},",
      "Thanks for applying for the {role} position at {company}. Your application is now with our team and we're excited to learn more about you.",
      "We review every application carefully. If your background is a strong match, a recruiter from {agency} will be in touch with the next steps.",
      "In the meantime, feel free to reply to this email with any questions.",
    ],
    cta: "View application status",
    footer: "Sent by {agency} on behalf of {company}.",
    enabled: true,
  },
  {
    key: "interview_invite",
    icon: "event",
    name: "Interview invitation",
    description: "Invite a candidate to an interview",
    subject: "Interview invitation for {role} at {company}",
    variables: [
      "candidate_name",
      "role",
      "company",
      "interview_date",
      "interview_time",
      "recruiter_name",
    ],
    body: [
      "Hi {candidate_name},",
      "Great news — the team at {company} would like to interview you for the {role} role.",
      "We've scheduled your conversation for {interview_date} at {interview_time}. The interview will run about 45 minutes and cover your experience and a few technical topics.",
      "Please confirm the time works for you, and let me know if you need to reschedule.",
      "Looking forward to it,\n{recruiter_name}",
    ],
    cta: "Confirm your slot",
    footer:
      "You're receiving this because you applied for a role at {company}.",
    enabled: true,
  },
  {
    key: "interview_reminder",
    icon: "schedule",
    name: "Interview reminder",
    description: "Reminder ahead of a scheduled interview",
    subject: "Reminder: your {role} interview is {interview_date}",
    variables: [
      "candidate_name",
      "role",
      "company",
      "interview_date",
      "interview_time",
    ],
    body: [
      "Hi {candidate_name},",
      "This is a friendly reminder that your interview for the {role} role at {company} is coming up on {interview_date} at {interview_time}.",
      "Please join a few minutes early and have a quiet space ready. If anything has changed, reply to this email and we'll sort it out.",
      "Good luck — we're rooting for you!",
    ],
    cta: "Join the interview",
    footer: "Need to reschedule? Just reply to this email.",
    enabled: true,
  },
  {
    key: "offer_extended",
    icon: "handshake",
    name: "Offer letter",
    description: "Extend an offer to a candidate",
    subject: "Your offer for {role} at {company}",
    variables: [
      "candidate_name",
      "role",
      "company",
      "offer_deadline",
      "recruiter_name",
    ],
    body: [
      "Hi {candidate_name},",
      "Congratulations! On behalf of {company}, I'm delighted to offer you the {role} position. The team was genuinely impressed and can't wait for you to join.",
      "You'll find the full details — compensation, start date, and benefits — in the offer document linked below. Please review everything and let me know if you have any questions.",
      "We'd love your decision by {offer_deadline}. I'm here to help however I can.",
      "Warmly,\n{recruiter_name}",
    ],
    cta: "Review your offer",
    footer:
      "This offer is confidential and intended only for {candidate_name}.",
    enabled: true,
  },
  {
    key: "application_declined",
    icon: "person",
    name: "Application update",
    description: "Let a candidate know they weren't selected",
    subject: "Update on your application to {company}",
    variables: ["candidate_name", "role", "company", "agency"],
    body: [
      "Hi {candidate_name},",
      "Thank you for taking the time to apply for the {role} role at {company} and for sharing your background with us.",
      "After careful consideration, we've decided to move forward with other candidates for this position. This was a difficult decision and reflects the strength of the applicant pool, not a lack of merit on your part.",
      "We'd love to stay in touch — {agency} works with many teams, and we'll reach out if a better-fit role opens up.",
    ],
    cta: "Browse open roles",
    footer: "Sent by {agency}. We wish you the very best in your search.",
    enabled: true,
  },
  {
    key: "onboarding_welcome",
    icon: "rocket",
    name: "Welcome & onboarding",
    description: "Kick off onboarding after a signed offer",
    subject: "Welcome to {company}, {candidate_name}!",
    variables: ["candidate_name", "role", "company", "recruiter_name"],
    body: [
      "Hi {candidate_name},",
      "Welcome aboard! We're thrilled you're joining {company} as our new {role}. The whole team is looking forward to working with you.",
      "Over the next few days you'll receive your onboarding checklist, equipment details, and first-week schedule. Everything you need to get started is in the portal below.",
      "If anything is unclear, I'm just an email away.",
      "See you soon,\n{recruiter_name}",
    ],
    cta: "Start onboarding",
    footer: "So glad to have you at {company}.",
    enabled: true,
  },
];

export async function seedAgencyTemplates(agencyId: string) {
  const docs = DEFAULT_TEMPLATES.map((template) => ({ ...template, agencyId }));
  return EmailTemplateModel.insertMany(docs);
}

type TemplateRecord = EmailTemplateDoc & { _id: unknown; createdAt?: Date };

function mapTemplate(doc: TemplateRecord) {
  return {
    id: String(doc._id),
    key: doc.key,
    icon: doc.icon,
    name: doc.name,
    description: doc.description,
    subject: doc.subject,
    variables: doc.variables ?? [],
    body: doc.body ?? [],
    cta: doc.cta,
    footer: doc.footer,
    enabled: doc.enabled,
  };
}

export async function listTemplates(agencyId: string) {
  const existing = await EmailTemplateModel.countDocuments({ agencyId });
  if (existing === 0) await seedAgencyTemplates(agencyId);
  const docs = await EmailTemplateModel.find({ agencyId })
    .sort({ createdAt: 1 })
    .lean<TemplateRecord[]>();
  const data = docs.map(mapTemplate);
  return { data, totalCount: data.length };
}

export async function createTemplate(
  agencyId: string,
  input: EmailTemplateInput,
) {
  const count = await EmailTemplateModel.countDocuments({ agencyId });
  const doc = await EmailTemplateModel.create({
    agencyId,
    key: input.key ?? `custom_${Date.now()}`,
    icon: input.icon ?? "mail",
    name: input.name ?? `Untitled template ${count + 1}`,
    description: input.description ?? "Custom email template",
    subject: input.subject ?? "",
    variables: input.variables ?? ["candidate_name", "role", "company"],
    body: input.body ?? ["Hi {candidate_name},", ""],
    cta: input.cta ?? "Open",
    footer: input.footer ?? "",
    enabled: input.enabled ?? true,
  });
  return mapTemplate(doc.toObject() as TemplateRecord);
}

const EDITABLE_FIELDS: (keyof EmailTemplateInput)[] = [
  "icon",
  "name",
  "description",
  "subject",
  "variables",
  "body",
  "cta",
  "footer",
  "enabled",
];

export async function updateTemplate(
  agencyId: string,
  id: string,
  patch: EmailTemplateInput,
) {
  if (!isValidObjectId(id)) return null;
  const update: Record<string, unknown> = {};
  for (const field of EDITABLE_FIELDS) {
    if (patch[field] !== undefined) update[field] = patch[field];
  }
  const doc = await EmailTemplateModel.findOneAndUpdate(
    { _id: id, agencyId },
    update,
    { new: true },
  ).lean<TemplateRecord>();
  return doc ? mapTemplate(doc) : null;
}

export async function deleteTemplate(agencyId: string, id: string) {
  if (!isValidObjectId(id)) return null;
  const doc = await EmailTemplateModel.findOneAndDelete({
    _id: id,
    agencyId,
  }).lean<TemplateRecord>();
  return doc ? { id: String(doc._id) } : null;
}
