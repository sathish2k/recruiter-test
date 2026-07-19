import { randomBytes } from "node:crypto";
import { type ClientDoc, ClientModel } from "../models/client.model";
import { decideSubmission } from "./client.service";

const PORTAL_TTL_MS = 7 * 24 * 60 * 60 * 1000;

interface SubmissionDoc {
  _id: unknown;
  name: string;
  initials: string;
  avatarBg: string;
  avatarFg: string;
  score: number;
  role: string;
  submittedWhen: string;
  sourcer: string;
  decision: "pending" | "approved" | "rejected";
  reason: string;
  exp: string;
  comp: string;
  why: string;
}

function mapSubmission(s: SubmissionDoc) {
  return {
    id: String(s._id),
    name: s.name,
    initials: s.initials,
    avatarBg: s.avatarBg,
    avatarFg: s.avatarFg,
    score: s.score,
    role: s.role,
    submittedWhen: s.submittedWhen,
    exp: s.exp,
    comp: s.comp,
    why: s.why,
    decision: s.decision,
    reason: s.reason,
  };
}

function daysLeft(expires: number): number {
  return Math.max(0, Math.ceil((expires - Date.now()) / (24 * 60 * 60 * 1000)));
}

function primaryContact(c: ClientDoc) {
  return c.contacts.find((ct) => ct.name === c.primaryContact) ?? c.contacts[0];
}

export interface MagicLinkResult {
  ok: true;
  // ponytail: real email send is stubbed — the token/link are returned in the
  // response so the demo "Open the link" works without an inbox.
  token?: string;
  contactName?: string;
}

export async function issueMagicLink(email: string): Promise<MagicLinkResult> {
  const normalized = email.trim().toLowerCase();
  const client = await ClientModel.findOne({
    "contacts.email": normalized,
  });
  if (!client) return { ok: true };

  const contact = client.contacts.find(
    (ct) => ct.email.toLowerCase() === normalized,
  );
  const valid =
    client.portalToken && client.portalExpires > Date.now()
      ? client.portalToken
      : "";
  const token = valid || randomBytes(16).toString("hex");
  if (!valid) {
    client.portalToken = token;
    client.portalExpires = Date.now() + PORTAL_TTL_MS;
    await client.save();
  }
  return {
    ok: true,
    token,
    contactName: contact?.name ?? client.primaryContact,
  };
}

async function resolveByToken(token: string) {
  if (!token) return null;
  const doc = await ClientModel.findOne({ portalToken: token }).lean();
  if (!doc) return null;
  const c = doc as ClientDoc & { _id: unknown };
  if (!c.portalExpires || c.portalExpires < Date.now()) return null;
  return c;
}

function buildPortal(c: ClientDoc & { _id: unknown }) {
  const contact = primaryContact(c);
  const submissions = ((c.submissions ?? []) as unknown as SubmissionDoc[]).map(
    mapSubmission,
  );
  return {
    client: c.name,
    clientId: String(c._id),
    clientInitial: c.name.charAt(0).toUpperCase(),
    contactName: contact?.name ?? c.primaryContact,
    contactRole: contact?.role ?? "",
    contactInitials: contact?.initials ?? "",
    contactBg: contact?.avatarBg ?? "#3A4A5B",
    contactFg: contact?.avatarFg ?? "#CFE3F5",
    expiresDays: daysLeft(c.portalExpires),
    pending: submissions.filter((s) => s.decision === "pending"),
    decided: submissions.filter((s) => s.decision !== "pending"),
  };
}

export async function getPortal(token: string) {
  const c = await resolveByToken(token);
  if (!c) return null;
  return buildPortal(c);
}

export async function decidePortalSubmission(
  token: string,
  submissionId: string,
  decision: "approved" | "declined",
  reason = "",
) {
  const c = await resolveByToken(token);
  if (!c) return null;
  const mapped = decision === "approved" ? "approved" : "rejected";
  const result = await decideSubmission(
    String(c._id),
    submissionId,
    c.agencyId,
    mapped,
    reason,
  );
  if (!result) return null;
  const refreshed = await resolveByToken(token);
  if (!refreshed) return null;
  return buildPortal(refreshed);
}
