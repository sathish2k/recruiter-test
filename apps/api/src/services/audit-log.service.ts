import { randomUUID } from "node:crypto";
import { and, count, desc, eq, gte, ilike, inArray, or } from "drizzle-orm";
import { db } from "../db";
import { type AuditCategory, type AuditSeverity, auditLog } from "../models/audit-log.model";

type AuditRow = typeof auditLog.$inferSelect;

export interface RecordAuditInput {
  /** Nullable because some hooks fire on an unauthenticated request (a
   * password reset) where the agency may not be resolvable. `record` drops
   * those writes rather than inventing an organization. */
  organizationId: string | null | undefined;
  userId?: string | null;
  actorName?: string;
  event: string;
  category?: AuditCategory;
  severity?: AuditSeverity;
  ip?: string | null;
  objects?: Record<string, string>;
  details?: Record<string, string>;
}

/** Fire-and-forget: an audit write must never fail the action it describes. */
export async function record(input: RecordAuditInput) {
  if (!input.organizationId) return;
  try {
    await db.insert(auditLog).values({
      id: randomUUID(),
      organizationId: input.organizationId,
      userId: input.userId ?? null,
      actorName: input.actorName ?? "System",
      event: input.event,
      category: input.category ?? "system",
      severity: input.severity ?? "success",
      ip: input.ip ?? null,
      objects: input.objects ?? null,
      details: input.details ?? null,
    });
  } catch (error) {
    console.error("[audit] failed to record", input.event, error);
  }
}

function relativeTime(date: Date): string {
  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (days === 0) return `Today · ${time}`;
  if (days === 1) return `Yesterday · ${time}`;
  if (days < 30) return `${days} days ago · ${time}`;
  return `${date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} · ${time}`;
}

function mapEvent(row: AuditRow) {
  return {
    id: row.id,
    event: row.event,
    category: row.category,
    severity: row.severity,
    user: row.actorName,
    ip: row.ip ?? "—",
    when: relativeTime(row.createdAt),
    absolute: row.createdAt.toISOString(),
    objects: row.objects ?? {},
    details: row.details ?? {},
  };
}

const RANGE_DAYS: Record<string, number> = { today: 1, "7d": 7, "30d": 30 };

export interface ListAuditParams {
  search?: string;
  user?: string;
  category?: string;
  result?: string;
  range?: string;
  page?: number;
  pageSize?: number;
}

/** Multi-value filters arrive comma-joined from the table datasource. */
function split(value?: string) {
  return (value ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

export async function listAuditEvents(organizationId: string, params: ListAuditParams = {}) {
  const filters = [eq(auditLog.organizationId, organizationId)];

  if (params.search) {
    const term = `%${params.search}%`;
    const match = or(
      ilike(auditLog.event, term),
      ilike(auditLog.actorName, term),
      ilike(auditLog.ip, term),
    );
    if (match) filters.push(match);
  }

  const users = split(params.user);
  if (users.length) filters.push(inArray(auditLog.actorName, users));

  const categories = split(params.category);
  if (categories.length) filters.push(inArray(auditLog.category, categories as AuditCategory[]));

  const results = split(params.result);
  if (results.length) filters.push(inArray(auditLog.severity, results as AuditSeverity[]));

  const days = params.range ? RANGE_DAYS[params.range] : undefined;
  if (days) filters.push(gte(auditLog.createdAt, new Date(Date.now() - days * 86_400_000)));

  const where = and(...filters);
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 8));

  const [rows, countRows] = await Promise.all([
    db
      .select()
      .from(auditLog)
      .where(where)
      .orderBy(desc(auditLog.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ total: count() }).from(auditLog).where(where),
  ]);

  return { data: rows.map(mapEvent), totalCount: countRows[0]?.total ?? 0 };
}

/** Distinct actors, for the toolbar's User dropdown. */
export async function listAuditActors(organizationId: string) {
  const rows = await db
    .selectDistinct({ actorName: auditLog.actorName })
    .from(auditLog)
    .where(eq(auditLog.organizationId, organizationId));
  return rows.map((row) => row.actorName).sort();
}
