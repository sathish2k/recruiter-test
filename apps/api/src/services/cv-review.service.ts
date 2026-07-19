import { isValidObjectId } from "mongoose";
import { type CandidateDoc, CandidateModel } from "../models/candidate.model";

const MUST_HAVE = ["Go", "PostgreSQL", "Kubernetes", "AWS", "System design"];

const clampScore = (value: number) => Math.max(0, Math.min(99, value));

function summaryFor(c: CandidateDoc): string {
  const lead = c.experience?.[0];
  const base = lead
    ? `${c.name} is a ${c.role || "candidate"} currently at ${lead.company}. ${lead.blurb}`
    : `${c.name} is a ${c.role || "candidate"} with ${c.exp} years of experience.`;
  const strength = c.strengths?.[0];
  return strength ? `${base} ${strength}.` : base;
}

function mapQueueItem(c: CandidateDoc & { _id: unknown }) {
  const skills = c.skills ?? [];
  const lowered = skills.map((s) => s.toLowerCase());
  const match = c.match ?? 0;
  return {
    id: String(c._id),
    name: c.name,
    initials: c.initials,
    avatarBg: c.avatarBg,
    avatarFg: c.avatarFg,
    filename: `${c.name.replace(/\s+/g, "_")}_Resume.pdf`,
    role: c.role,
    client: c.client,
    sourcer: c.source || "Sourcing",
    title: c.role,
    contact: [c.email, c.phone, c.location].filter(Boolean).join(" · "),
    summary: summaryFor(c),
    experience: c.experience ?? [],
    skills,
    education: (c.education ?? []).map((e) => ({
      title: e.title,
      sub: e.sub,
    })),
    report: {
      score: match,
      scoredWhen: c.applied || "recently",
      jd: [c.role, c.client].filter(Boolean).join(" · "),
      musts: MUST_HAVE.map((label) => ({
        label,
        met: lowered.includes(label.toLowerCase()),
      })),
      dims: [
        { label: "JD skill match", score: clampScore(match + 2) },
        { label: "Experience depth", score: clampScore(match - 2) },
        { label: "Domain fit", score: clampScore(match - 4) },
        { label: "Comp alignment", score: clampScore(match - 6) },
      ],
      strengths: c.strengths ?? [],
      gaps: c.gaps ?? [],
    },
  };
}

export async function getReviewQueue(agencyId: string) {
  const docs = await CandidateModel.find({ agencyId, match: { $gt: 0 } })
    .sort({ match: -1 })
    .limit(12)
    .lean();
  return docs.map((c) => mapQueueItem(c as CandidateDoc & { _id: unknown }));
}

export async function decideReview(
  id: string,
  agencyId: string,
  decision: "submitted" | "returned",
) {
  if (!isValidObjectId(id)) return null;
  const stage = decision === "submitted" ? "Submitted" : "Sourced";
  const doc = await CandidateModel.findOneAndUpdate(
    { _id: id, agencyId },
    { $set: { stage } },
    { new: true },
  ).lean();
  if (!doc) return null;
  return mapQueueItem(doc as CandidateDoc & { _id: unknown });
}
