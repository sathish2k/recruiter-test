import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { client } from "../models/client.model";
import { integration } from "../models/integration.model";
import { invitation } from "../models/invitation.model";
import { job } from "../models/job.model";
import { organizationMember } from "../models/organization.model";
import { createInvitations } from "./invitation.service";
import { getOrganization, updateOrganization } from "./organization.service";
import {
  listRejectionReasons,
  listStages,
  type ReasonInput,
  replaceRejectionReasons,
  replaceStages,
  type StageInput,
} from "./pipeline.service";

/** Providers that count as "calendar connected" for the checklist. */
const CALENDAR_PROVIDERS = ["google-calendar", "outlook-calendar", "google", "outlook"];
/** The browser extension registers itself as an integration when installed. */
const EXTENSION_PROVIDER = "sourcer-extension";

async function exists(rows: Promise<{ id: string }[]>) {
  return (await rows).length > 0;
}

/**
 * The Get Started checklist. Completion is derived from the workspace's actual
 * contents, never from a stored flag — a step the user completed elsewhere
 * (adding a client from the clients screen, say) has to tick itself.
 */
export async function onboardingChecklist(organizationId: string) {
  const [hasClient, hasRole, invites, members, integrations] = await Promise.all([
    exists(
      db
        .select({ id: client.id })
        .from(client)
        .where(eq(client.organizationId, organizationId))
        .limit(1),
    ),
    exists(
      db.select({ id: job.id }).from(job).where(eq(job.organizationId, organizationId)).limit(1),
    ),
    db
      .select({ id: invitation.id })
      .from(invitation)
      .where(eq(invitation.organizationId, organizationId)),
    db
      .select({ id: organizationMember.id })
      .from(organizationMember)
      .where(eq(organizationMember.organizationId, organizationId)),
    db
      .select({ id: integration.id, provider: integration.provider })
      .from(integration)
      .where(eq(integration.organizationId, organizationId)),
  ]);

  const providers = integrations.map((row) => row.provider);
  const steps = [
    { key: "client", done: hasClient },
    { key: "role", done: hasRole },
    // Either an invite is out or somebody else already joined.
    { key: "team", done: invites.length > 0 || members.length > 1 },
    { key: "extension", done: providers.includes(EXTENSION_PROVIDER) },
    { key: "calendar", done: providers.some((provider) => CALENDAR_PROVIDERS.includes(provider)) },
  ];

  const doneCount = steps.filter((step) => step.done).length;
  const org = await getOrganization(organizationId);
  return {
    data: {
      steps,
      doneCount,
      total: steps.length,
      allDone: doneCount === steps.length,
      /** Drives the "Configure your workspace first" card's done state. */
      configured: Boolean((org as { setupCompletedAt?: string } | null)?.setupCompletedAt),
      workspaceName: (org as { name?: string } | null)?.name ?? "",
    },
  };
}

/** Everything the wizard needs to render, in one read. */
export async function setupState(organizationId: string) {
  const [org, stages, reasons, invites] = await Promise.all([
    getOrganization(organizationId),
    listStages(organizationId),
    listRejectionReasons(organizationId),
    db
      .select()
      .from(invitation)
      .where(and(eq(invitation.organizationId, organizationId), eq(invitation.status, "pending"))),
  ]);
  const settings = (org ?? {}) as Record<string, unknown>;
  return {
    data: {
      timezone: settings.timezone ?? "",
      currency: settings.currency ?? "",
      dateFormat: settings.dateFormat ?? "",
      setupCompletedAt: settings.setupCompletedAt ?? null,
      /** The step the user was last on, so a reopened wizard resumes (flow §1.4). */
      setupStep: typeof settings.setupStep === "number" ? settings.setupStep : 0,
      stages: stages.map((stage) => ({
        name: stage.name,
        clientVisible: stage.clientVisible,
        kind: stage.kind,
      })),
      reasons: reasons.map((reason) => ({
        category: reason.category,
        label: reason.label,
        active: reason.active,
      })),
      invites: invites.map((row) => ({ email: row.email, role: row.role })),
    },
  };
}

export interface SetupPatch {
  timezone?: string;
  currency?: string;
  dateFormat?: string;
  stages?: StageInput[];
  reasons?: ReasonInput[];
  /** Which step to resume on. Saved on every step so closing the tab is safe. */
  setupStep?: number;
  /** Set on the final step; the checklist reads it. */
  completed?: boolean;
  /** Team step — sent as invites, one call per distinct role. */
  invites?: { email: string; role: string }[];
}

/**
 * Saves whatever the wizard has so far. Every field is optional because each
 * step posts only its own slice — the wizard autosaves rather than submitting
 * once at the end.
 */
export async function saveSetup(organizationId: string, userId: string, patch: SetupPatch) {
  const settings: Record<string, unknown> = {};
  if (patch.timezone) settings.timezone = patch.timezone;
  if (patch.currency) settings.currency = patch.currency;
  if (patch.dateFormat) settings.dateFormat = patch.dateFormat;
  if (typeof patch.setupStep === "number") settings.setupStep = patch.setupStep;
  if (patch.completed) settings.setupCompletedAt = new Date().toISOString();
  if (Object.keys(settings).length > 0) await updateOrganization(organizationId, settings);

  if (patch.stages) await replaceStages(organizationId, patch.stages);
  if (patch.reasons) await replaceRejectionReasons(organizationId, patch.reasons);

  if (patch.invites?.length) {
    // One call per role — createInvitations applies a single role to a batch,
    // and it already skips addresses that are members or invited.
    const byRole = new Map<string, string[]>();
    for (const invite of patch.invites) {
      if (!invite.email.trim()) continue;
      const bucket = byRole.get(invite.role) ?? [];
      bucket.push(invite.email.trim());
      byRole.set(invite.role, bucket);
    }
    for (const [role, emails] of byRole) {
      await createInvitations(organizationId, userId, { emails, role });
    }
  }

  return setupState(organizationId);
}
