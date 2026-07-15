import { isValidObjectId } from "mongoose";
import {
  type AutomationDoc,
  AutomationModel,
} from "../models/automation.model";

export interface AutomationSeed {
  key: string;
  icon: string;
  title: string;
  description: string;
  enabled: boolean;
  runs: number;
  meta: string;
}

export const DEFAULT_AUTOMATIONS: AutomationSeed[] = [
  {
    key: "score",
    icon: "sparkle",
    title: "Score CVs on upload",
    description:
      "Every CV that lands is parsed and matched against the role's JD, so a score is ready before anyone opens it.",
    enabled: true,
    runs: 142,
    meta: "Runs on every upload",
  },
  {
    key: "fwd",
    icon: "move-up",
    title: "Forward strong CVs to lead",
    description:
      "Candidates scoring at or above the role threshold are routed straight to the profile lead's review queue.",
    enabled: true,
    runs: 38,
    meta: "Threshold 80%",
  },
  {
    key: "nudge",
    icon: "schedule",
    title: "CV follow-up nudge",
    description:
      "If a sourced candidate hasn't sent a CV, a gentle reminder goes out automatically to keep the pipeline moving.",
    enabled: true,
    runs: 21,
    meta: "After 3 days",
  },
  {
    key: "digest",
    icon: "mail",
    title: "Daily digest to leads",
    description:
      "Each morning every profile lead gets a summary of new matches, pending reviews and interviews for the day.",
    enabled: true,
    runs: 14,
    meta: "7:30 AM daily",
  },
  {
    key: "remind",
    icon: "notifications",
    title: "Interview reminders",
    description:
      "Candidates and interviewers get a reminder before each scheduled interview to cut no-shows.",
    enabled: false,
    runs: 0,
    meta: "1 hour before",
  },
  {
    key: "clientPing",
    icon: "domain",
    title: "Client decision reminder",
    description:
      "When a submitted candidate is awaiting a client decision, the client is reminded so feedback doesn't stall.",
    enabled: true,
    runs: 9,
    meta: "After 3 days",
  },
];

/** Creates the default automation recipes for an agency. Idempotent — existing
 * recipes are left untouched (only missing keys are inserted). */
export async function seedAgencyAutomations(agencyId: string): Promise<void> {
  await Promise.all(
    DEFAULT_AUTOMATIONS.map((recipe) =>
      AutomationModel.updateOne(
        { agencyId, key: recipe.key },
        { $setOnInsert: { agencyId, ...recipe } },
        { upsert: true },
      ),
    ),
  );
}

export interface AutomationView {
  id: string;
  key: string;
  icon: string;
  title: string;
  description: string;
  enabled: boolean;
  runs: number;
  meta: string;
}

export interface AutomationRun {
  icon: string;
  color: string;
  text: string;
  when: string;
  failed: boolean;
}

export interface AutomationListResult {
  automations: AutomationView[];
  stats: { activeCount: number; totalCount: number; runsWeek: number };
  recentRuns: AutomationRun[];
  impact: { label: string; value: string }[];
}

function mapAutomation(doc: AutomationDoc & { _id: unknown }): AutomationView {
  return {
    id: String(doc._id),
    key: doc.key,
    icon: doc.icon,
    title: doc.title,
    description: doc.description,
    enabled: doc.enabled,
    runs: doc.runs,
    meta: doc.meta,
  };
}

// ponytail: the run feed and impact tiles are a seeded illustration — there is
// no per-run event log yet, so these summarize typical activity.
const RECENT_RUNS: AutomationRun[] = [
  {
    icon: "check-circle",
    color: "#8FD6AC",
    text: "Scored CV — Savannah Nguyen · 94% match",
    when: "2 min ago",
    failed: false,
  },
  {
    icon: "check-circle",
    color: "#8FD6AC",
    text: "Forwarded strong CV to Ana Novak",
    when: "18 min ago",
    failed: false,
  },
  {
    icon: "check-circle",
    color: "#8FD6AC",
    text: "Sent CV follow-up nudge to 3 candidates",
    when: "1 hr ago",
    failed: false,
  },
  {
    icon: "error",
    color: "#E89A9A",
    text: "Daily digest failed — mailbox unreachable",
    when: "3 hrs ago",
    failed: true,
  },
  {
    icon: "check-circle",
    color: "#8FD6AC",
    text: "Reminded Corely about pending decision",
    when: "5 hrs ago",
    failed: false,
  },
];

const IMPACT = [
  { label: "Manual steps removed", value: "1,240" },
  { label: "Hours saved", value: "38h" },
  { label: "Faster CV → submit", value: "2.4×" },
];

export async function listAutomations(
  agencyId: string,
): Promise<AutomationListResult> {
  let docs = await AutomationModel.find({ agencyId }).sort({ _id: 1 }).lean();
  if (docs.length === 0) {
    await seedAgencyAutomations(agencyId);
    docs = await AutomationModel.find({ agencyId }).sort({ _id: 1 }).lean();
  }
  const automations = docs.map((d) =>
    mapAutomation(d as AutomationDoc & { _id: unknown }),
  );
  const active = automations.filter((a) => a.enabled);
  const runsWeek = active.reduce((sum, a) => sum + a.runs, 0);
  return {
    automations,
    stats: {
      activeCount: active.length,
      totalCount: automations.length,
      runsWeek,
    },
    recentRuns: RECENT_RUNS,
    impact: IMPACT,
  };
}

export async function toggleAutomation(
  agencyId: string,
  id: string,
  enabled: boolean,
): Promise<{ data: AutomationView } | { error: "not-found" }> {
  if (!isValidObjectId(id)) return { error: "not-found" };
  const doc = await AutomationModel.findOneAndUpdate(
    { _id: id, agencyId },
    { $set: { enabled } },
    { new: true },
  ).lean();
  if (!doc) return { error: "not-found" };
  return { data: mapAutomation(doc as AutomationDoc & { _id: unknown }) };
}
