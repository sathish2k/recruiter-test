import { randomUUID } from "node:crypto";
import { asc, eq } from "drizzle-orm";
import { db } from "../db";
import { pipelineStage, type RejectionCategory, rejectionReason } from "../models/pipeline.model";

/** The stages a new workspace starts with — the wizard renames from here. */
const DEFAULT_STAGES: {
  name: string;
  clientVisible: boolean;
  kind: "entry" | "middle" | "hire";
}[] = [
  { name: "New", clientVisible: false, kind: "entry" },
  { name: "Screening", clientVisible: false, kind: "middle" },
  { name: "Submitted", clientVisible: true, kind: "middle" },
  { name: "Interview", clientVisible: true, kind: "middle" },
  { name: "Offer", clientVisible: true, kind: "middle" },
  { name: "Placed", clientVisible: true, kind: "hire" },
];

/** The catalogue every workspace starts with, grouped as the wizard shows it. */
const DEFAULT_REASONS: { category: RejectionCategory; label: string }[] = [
  ...[
    "Skills gap",
    "Budget mismatch",
    "Wants more domain experience",
    "Position on hold",
    "Filled internally",
  ].map((label) => ({ category: "client" as const, label })),
  ...[
    "Counter-offer accepted",
    "Compensation too low",
    "Location or commute",
    "Took another offer",
    "Lost interest",
  ].map((label) => ({ category: "candidate" as const, label })),
  ...[
    "Unrealistic expectations",
    "Notice period too long",
    "Communication",
    "Off-limits / non-solicit",
  ].map((label) => ({ category: "internal" as const, label })),
];

/**
 * Reads the stages, seeding the defaults the first time a workspace asks. The
 * seed happens on read rather than at signup so organizations created before
 * this existed get theirs too.
 */
export async function listStages(organizationId: string) {
  const rows = await db
    .select()
    .from(pipelineStage)
    .where(eq(pipelineStage.organizationId, organizationId))
    .orderBy(asc(pipelineStage.position));
  if (rows.length > 0) return rows;

  await db.insert(pipelineStage).values(
    DEFAULT_STAGES.map((stage, index) => ({
      id: randomUUID(),
      organizationId,
      position: index,
      ...stage,
    })),
  );
  return db
    .select()
    .from(pipelineStage)
    .where(eq(pipelineStage.organizationId, organizationId))
    .orderBy(asc(pipelineStage.position));
}

export interface StageInput {
  name: string;
  clientVisible?: boolean;
}

/**
 * Replaces the stage list wholesale. The wizard edits the whole ordering at
 * once, and a diff would buy nothing while no application references a stage
 * yet — once one does, this becomes an upsert keyed on id.
 */
export async function replaceStages(organizationId: string, stages: StageInput[]) {
  const cleaned = stages.map((stage) => stage.name.trim()).filter(Boolean);
  if (cleaned.length < 2) throw new Error("A pipeline needs at least an entry and a hire stage");

  await db.delete(pipelineStage).where(eq(pipelineStage.organizationId, organizationId));
  await db.insert(pipelineStage).values(
    stages
      .filter((stage) => stage.name.trim())
      .map((stage, index, all) => ({
        id: randomUUID(),
        organizationId,
        name: stage.name.trim(),
        position: index,
        clientVisible: stage.clientVisible ?? false,
        kind:
          index === 0
            ? ("entry" as const)
            : index === all.length - 1
              ? ("hire" as const)
              : ("middle" as const),
      })),
  );
  return listStages(organizationId);
}

export async function listRejectionReasons(organizationId: string) {
  const rows = await db
    .select()
    .from(rejectionReason)
    .where(eq(rejectionReason.organizationId, organizationId))
    .orderBy(asc(rejectionReason.sortOrder));
  if (rows.length > 0) return rows;

  await db.insert(rejectionReason).values(
    DEFAULT_REASONS.map((reason, index) => ({
      id: randomUUID(),
      organizationId,
      sortOrder: index,
      ...reason,
    })),
  );
  return db
    .select()
    .from(rejectionReason)
    .where(eq(rejectionReason.organizationId, organizationId))
    .orderBy(asc(rejectionReason.sortOrder));
}

export interface ReasonInput {
  category: RejectionCategory;
  label: string;
  active?: boolean;
}

export async function replaceRejectionReasons(organizationId: string, reasons: ReasonInput[]) {
  await db.delete(rejectionReason).where(eq(rejectionReason.organizationId, organizationId));
  const rows = reasons.filter((reason) => reason.label.trim());
  if (rows.length > 0) {
    await db.insert(rejectionReason).values(
      rows.map((reason, index) => ({
        id: randomUUID(),
        organizationId,
        category: reason.category,
        label: reason.label.trim(),
        active: reason.active ?? true,
        sortOrder: index,
      })),
    );
  }
  // Read back directly rather than through the seeding reader — an org that
  // deliberately cleared the list must not have the defaults handed back.
  return db
    .select()
    .from(rejectionReason)
    .where(eq(rejectionReason.organizationId, organizationId))
    .orderBy(asc(rejectionReason.sortOrder));
}
