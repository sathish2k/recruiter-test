import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { integration } from "../models/integration.model";

type IntegrationRow = typeof integration.$inferSelect;

function relative(date?: Date | null): string {
  if (!date) return "never";
  const minutes = Math.floor((Date.now() - date.getTime()) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return `${Math.floor(hours / 24)} days ago`;
}

/** The connected rows for an org, keyed by provider — the tab merges these onto
 * the catalogue that lives in its configuration. */
export async function listIntegrations(organizationId: string) {
  const rows = await db
    .select()
    .from(integration)
    .where(eq(integration.organizationId, organizationId));
  return { data: rows.map(mapIntegration), totalCount: rows.length };
}

function mapIntegration(row: IntegrationRow) {
  return {
    id: row.id,
    provider: row.provider,
    status: row.status,
    account: row.account ?? "",
    connectedBy: row.connectedByName ?? "",
    lastSync: relative(row.lastSyncAt),
    direction: row.direction ?? "",
    warning: row.warning ?? "",
  };
}

export interface ConnectInput {
  provider: string;
  account?: string;
  direction?: string;
}

export async function connectIntegration(
  organizationId: string,
  userId: string,
  userName: string,
  input: ConnectInput,
) {
  const now = new Date();
  const [row] = await db
    .insert(integration)
    .values({
      id: randomUUID(),
      organizationId,
      provider: input.provider,
      status: "connected",
      account: input.account ?? null,
      connectedBy: userId,
      connectedByName: userName,
      lastSyncAt: now,
      direction: input.direction ?? "two-way",
    })
    .onConflictDoUpdate({
      target: [integration.organizationId, integration.provider],
      set: {
        status: "connected",
        account: input.account ?? null,
        connectedBy: userId,
        connectedByName: userName,
        lastSyncAt: now,
        warning: null,
        updatedAt: now,
      },
    })
    .returning();
  return row ? mapIntegration(row) : null;
}

export async function disconnectIntegration(organizationId: string, provider: string) {
  const [removed] = await db
    .delete(integration)
    .where(and(eq(integration.organizationId, organizationId), eq(integration.provider, provider)))
    .returning();
  return removed ? mapIntegration(removed) : null;
}

/** Refreshes the token: clears the warning and restarts the sync clock. */
export async function reconnectIntegration(organizationId: string, provider: string) {
  const now = new Date();
  const [updated] = await db
    .update(integration)
    .set({ status: "connected", warning: null, lastSyncAt: now, updatedAt: now })
    .where(and(eq(integration.organizationId, organizationId), eq(integration.provider, provider)))
    .returning();
  return updated ? mapIntegration(updated) : null;
}
