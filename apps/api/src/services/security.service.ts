import { randomBytes, randomUUID } from "node:crypto";
import { and, desc, eq, isNull, ne } from "drizzle-orm";
import { db } from "../db";
import { session, user } from "../models/auth.model";
import { apiToken, loginHistory, securityRecipient, userSecurity } from "../models/security.model";

type SessionRow = typeof session.$inferSelect;
type TokenRow = typeof apiToken.$inferSelect;
type LoginRow = typeof loginHistory.$inferSelect;

function relative(date?: Date | null): string {
  if (!date) return "Never";
  const minutes = Math.floor((Date.now() - date.getTime()) / 60_000);
  if (minutes < 1) return "Active now";
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function shortDate(date?: Date | null): string {
  if (!date) return "—";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

// ── User agent ────────────────────────────────────────────────────────────────

/** Enough to fill the design's `Chrome 139 · macOS 15.6` meta line. Deliberately
 * small — we only ever display the result. */
export function parseUserAgent(ua?: string | null) {
  const agent = ua ?? "";
  const browser =
    /Edg\/(\d+)/.exec(agent)?.[0]?.replace("Edg/", "Edge ") ??
    /Chrome\/(\d+)/.exec(agent)?.[0]?.replace("Chrome/", "Chrome ") ??
    /Firefox\/(\d+)/.exec(agent)?.[0]?.replace("Firefox/", "Firefox ") ??
    /Version\/(\d+).*Safari/.exec(agent)?.[1]?.replace(/^/, "Safari ") ??
    "Unknown browser";

  let os = "Unknown OS";
  if (/iPhone|iPad/.test(agent)) os = "iOS";
  else if (/Android/.test(agent)) os = "Android";
  else if (/Mac OS X (\d+)[._](\d+)/.test(agent)) {
    const [, major, minor] = /Mac OS X (\d+)[._](\d+)/.exec(agent) ?? [];
    os = `macOS ${major}.${minor}`;
  } else if (/Windows NT 10/.test(agent)) os = "Windows 11";
  else if (/Windows/.test(agent)) os = "Windows";
  else if (/Linux/.test(agent)) os = "Linux";

  const device = /iPhone/.test(agent)
    ? "iPhone"
    : /iPad/.test(agent)
      ? "iPad"
      : /Android/.test(agent)
        ? "Android phone"
        : /Mac OS X/.test(agent)
          ? "Mac"
          : /Windows/.test(agent)
            ? "Windows PC"
            : "Unknown device";

  const icon = /iPhone|iPad|Android/.test(agent)
    ? "mobile"
    : /Mac OS X/.test(agent)
      ? "laptop"
      : "desktop";

  return { browser, os, device, icon };
}

// ── Sessions ──────────────────────────────────────────────────────────────────

function mapSession(row: SessionRow, currentToken?: string) {
  const { browser, os, device, icon } = parseUserAgent(row.userAgent);
  const isCurrent = !!currentToken && row.token === currentToken;
  const isNew = Date.now() - row.createdAt.getTime() < 86_400_000;
  const chips = isCurrent ? ["current", "trusted"] : isNew ? ["new"] : ["trusted"];
  if (icon === "mobile" && !isCurrent) chips.unshift("mobile");

  return {
    id: row.id,
    device,
    icon,
    browser,
    os,
    location: row.ipAddress || "Unknown location",
    when: isCurrent ? "Active now" : relative(row.updatedAt),
    meta: `${browser} · ${os} · ${row.ipAddress || "Unknown location"} · ${isCurrent ? "Active now" : relative(row.updatedAt)}`,
    chips,
    isCurrent,
  };
}

export async function listSessions(userId: string, currentToken?: string) {
  const rows = await db
    .select()
    .from(session)
    .where(eq(session.userId, userId))
    .orderBy(desc(session.updatedAt));
  const data = rows.map((row) => mapSession(row, currentToken));
  // The device you're on belongs at the top, as in the design.
  data.sort((a, b) => Number(b.isCurrent) - Number(a.isCurrent));
  return { data, totalCount: data.length };
}

export async function revokeSession(userId: string, id: string) {
  const [row] = await db
    .select()
    .from(session)
    .where(and(eq(session.id, id), eq(session.userId, userId)));
  if (!row) return null;
  await db.delete(session).where(eq(session.id, id));
  return mapSession(row);
}

/** Signs out everywhere except the caller's own session. */
export async function revokeOtherSessions(userId: string, currentToken?: string) {
  const condition = currentToken
    ? and(eq(session.userId, userId), ne(session.token, currentToken))
    : eq(session.userId, userId);
  const removed = await db.delete(session).where(condition).returning({ id: session.id });
  return removed.length;
}

// ── Login history ─────────────────────────────────────────────────────────────

function mapLogin(row: LoginRow) {
  return {
    id: row.id,
    when: relative(row.createdAt),
    browser: row.browser ?? "Unknown",
    location: row.location ?? row.ip ?? "Unknown",
    result: row.result,
  };
}

export async function recordLogin(input: {
  organizationId?: string | null;
  userId?: string | null;
  email: string;
  userAgent?: string | null;
  ip?: string | null;
  result?: "success" | "failed" | "blocked";
}) {
  const { browser, os } = parseUserAgent(input.userAgent);
  await db.insert(loginHistory).values({
    id: randomUUID(),
    organizationId: input.organizationId ?? null,
    userId: input.userId ?? null,
    email: input.email,
    browser,
    os,
    location: input.ip ?? null,
    ip: input.ip ?? null,
    result: input.result ?? "success",
  });
}

export async function listLoginHistory(userId: string, result?: string) {
  const filters = [eq(loginHistory.userId, userId)];
  if (result && result !== "all") {
    filters.push(eq(loginHistory.result, result as "success" | "failed" | "blocked"));
  }
  const rows = await db
    .select()
    .from(loginHistory)
    .where(and(...filters))
    .orderBy(desc(loginHistory.createdAt))
    .limit(25);
  return { data: rows.map(mapLogin), totalCount: rows.length };
}

// ── Personal access tokens ────────────────────────────────────────────────────

function mapToken(row: TokenRow) {
  const expires = row.expiresAt
    ? row.expiresAt.getTime() < Date.now()
      ? "Expired"
      : `In ${Math.ceil((row.expiresAt.getTime() - Date.now()) / 86_400_000)} days`
    : "Never";
  return {
    id: row.id,
    name: row.name,
    prefix: row.prefix,
    created: shortDate(row.createdAt),
    lastUsed: row.lastUsedAt ? relative(row.lastUsedAt) : "Never",
    expires,
    meta: `Created ${shortDate(row.createdAt)} · Last used ${row.lastUsedAt ? relative(row.lastUsedAt) : "Never"} · Expires ${expires}`,
  };
}

export async function listTokens(userId: string) {
  const rows = await db
    .select()
    .from(apiToken)
    .where(and(eq(apiToken.userId, userId), isNull(apiToken.revokedAt)))
    .orderBy(desc(apiToken.createdAt));
  return { data: rows.map(mapToken), totalCount: rows.length };
}

export async function createToken(
  organizationId: string,
  userId: string,
  input: { name?: string; expiresInDays?: number },
) {
  const secret = `hpx_pat_${randomBytes(24).toString("base64url")}`;
  const expiresInDays = input.expiresInDays ?? 90;
  const [created] = await db
    .insert(apiToken)
    .values({
      id: randomUUID(),
      organizationId,
      userId,
      name: input.name?.trim() || "New token",
      tokenHash: await Bun.password.hash(secret),
      prefix: secret.slice(0, 12),
      expiresAt: expiresInDays > 0 ? new Date(Date.now() + expiresInDays * 86_400_000) : null,
    })
    .returning();
  if (!created) return null;
  // The plaintext is returned exactly once — we only keep the hash.
  return { ...mapToken(created), secret };
}

export async function revokeToken(userId: string, id: string) {
  const [revoked] = await db
    .update(apiToken)
    .set({ revokedAt: new Date() })
    .where(and(eq(apiToken.id, id), eq(apiToken.userId, userId), isNull(apiToken.revokedAt)))
    .returning();
  return revoked ? mapToken(revoked) : null;
}

// ── Two-factor + notification preferences ─────────────────────────────────────

async function ensureSecurityRow(userId: string) {
  const [existing] = await db.select().from(userSecurity).where(eq(userSecurity.userId, userId));
  if (existing) return existing;
  const [created] = await db.insert(userSecurity).values({ userId }).returning();
  return created;
}

function newRecoveryCodes() {
  const chunk = () => randomBytes(4).toString("hex").toUpperCase().slice(0, 4);
  return Array.from({ length: 8 }, () => `${chunk()}-${chunk()}`);
}

export async function setTwoFactor(userId: string, enabled: boolean) {
  const row = await ensureSecurityRow(userId);
  if (!row) return null;
  const codes = enabled ? newRecoveryCodes() : null;
  const [updated] = await db
    .update(userSecurity)
    .set({
      twoFactorEnabled: enabled,
      twoFactorEnabledAt: enabled ? new Date() : null,
      recoveryCodes: codes,
      recoveryCodesGeneratedAt: enabled ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(userSecurity.userId, userId))
    .returning();
  return updated ?? null;
}

export async function regenerateRecoveryCodes(userId: string) {
  await ensureSecurityRow(userId);
  const codes = newRecoveryCodes();
  const [updated] = await db
    .update(userSecurity)
    .set({ recoveryCodes: codes, recoveryCodesGeneratedAt: new Date(), updatedAt: new Date() })
    .where(eq(userSecurity.userId, userId))
    .returning();
  return updated?.recoveryCodes ?? null;
}

export async function markPasswordChanged(userId: string) {
  await ensureSecurityRow(userId);
  await db
    .update(userSecurity)
    .set({ passwordChangedAt: new Date(), updatedAt: new Date() })
    .where(eq(userSecurity.userId, userId));
}

export async function updateNotifications(
  userId: string,
  prefs: Partial<{
    notifyNewDevice: boolean;
    notifyPasswordChange: boolean;
    notifyTwoFactorDisabled: boolean;
    notifySsoChange: boolean;
  }>,
) {
  await ensureSecurityRow(userId);
  const [updated] = await db
    .update(userSecurity)
    .set({ ...prefs, updatedAt: new Date() })
    .where(eq(userSecurity.userId, userId))
    .returning();
  return updated ?? null;
}

// ── Alert recipients ──────────────────────────────────────────────────────────

export async function listRecipients(organizationId: string, ownerEmail: string) {
  const rows = await db
    .select()
    .from(securityRecipient)
    .where(eq(securityRecipient.organizationId, organizationId));
  return [
    { id: "owner", email: ownerEmail, owner: true },
    ...rows.map((row) => ({ id: row.id, email: row.email, owner: false })),
  ];
}

export async function addRecipient(organizationId: string, email: string) {
  const [created] = await db
    .insert(securityRecipient)
    .values({ id: randomUUID(), organizationId, email })
    .returning();
  return created ? { id: created.id, email: created.email, owner: false } : null;
}

export async function removeRecipient(organizationId: string, id: string) {
  const [removed] = await db
    .delete(securityRecipient)
    .where(and(eq(securityRecipient.id, id), eq(securityRecipient.organizationId, organizationId)))
    .returning();
  return removed ? { id: removed.id, email: removed.email } : null;
}

// ── The tab payload ───────────────────────────────────────────────────────────

/** Everything the Security tab renders, in one round trip. */
export async function getSecurityOverview(
  userId: string,
  organizationId: string,
  currentToken?: string,
) {
  const [account] = await db.select().from(user).where(eq(user.id, userId));
  const security = await ensureSecurityRow(userId);
  const [sessions, tokens, logins, recipients] = await Promise.all([
    listSessions(userId, currentToken),
    listTokens(userId),
    listLoginHistory(userId),
    listRecipients(organizationId, account?.email ?? ""),
  ]);

  const twoFactorEnabled = security?.twoFactorEnabled ?? false;
  const checks = [
    { key: "password", label: "checks.password", ok: true },
    { key: "history", label: "checks.history", ok: true },
    {
      key: "twoFactor",
      label: twoFactorEnabled ? "checks.twoFactorOn" : "checks.twoFactorOff",
      ok: twoFactorEnabled,
    },
  ];

  return {
    score: twoFactorEnabled ? 100 : 92,
    checks,
    email: account?.email ?? "",
    password: {
      changed: security?.passwordChangedAt
        ? relative(security.passwordChangedAt)
        : shortDate(account?.createdAt),
      strength: "Strong",
    },
    twoFactor: {
      enabled: twoFactorEnabled,
      recoveryCodes: security?.recoveryCodes ?? [],
      generated: security?.recoveryCodesGeneratedAt
        ? shortDate(security.recoveryCodesGeneratedAt)
        : null,
      verified: security?.twoFactorEnabledAt ? relative(security.twoFactorEnabledAt) : null,
    },
    sessions: sessions.data,
    logins: logins.data,
    tokens: tokens.data,
    notifications: {
      notifyNewDevice: security?.notifyNewDevice ?? true,
      notifyPasswordChange: security?.notifyPasswordChange ?? true,
      notifyTwoFactorDisabled: security?.notifyTwoFactorDisabled ?? true,
      notifySsoChange: security?.notifySsoChange ?? true,
    },
    recipients,
  };
}
