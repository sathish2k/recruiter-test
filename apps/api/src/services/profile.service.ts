import { eq } from "drizzle-orm";
import { db } from "../db";
import { user } from "../models/auth.model";

const AVATAR_PALETTE = [
  { bg: "#5B4A3A", fg: "#FFD9BC" },
  { bg: "#3A4A5B", fg: "#CFE3F5" },
  { bg: "#3A5B4A", fg: "#CFF5E0" },
  { bg: "#4A3A5B", fg: "#E3CFF5" },
] as const;

export const DEFAULT_TIMEZONE = "Asia/Kolkata (IST)";

export const NOTIFICATION_KEYS = [
  "newApplicants",
  "interviewReminders",
  "weeklyDigest",
  "mentions",
  "productUpdates",
] as const;

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function paletteFor(name: string) {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length] ?? AVATAR_PALETTE[0];
}

function normalizePrefs(source?: Record<string, boolean> | null): Record<string, boolean> {
  const raw = source ?? {};
  const prefs: Record<string, boolean> = {};
  for (const key of NOTIFICATION_KEYS) prefs[key] = raw[key] ?? false;
  return prefs;
}

type UserRow = typeof user.$inferSelect;

function mapProfile(u: UserRow) {
  const palette = paletteFor(u.name);
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone ?? "",
    timezone: u.timezone ?? DEFAULT_TIMEZONE,
    role: u.role,
    initials: initials(u.name),
    avatarBg: palette.bg,
    avatarFg: palette.fg,
    notificationPrefs: normalizePrefs(u.notificationPrefs),
  };
}

export async function getProfile(userId: string) {
  const [row] = await db.select().from(user).where(eq(user.id, userId)).limit(1);
  return row ? mapProfile(row) : null;
}

export interface UpdateProfileInput {
  name?: string;
  phone?: string;
  timezone?: string;
  notificationPrefs?: Record<string, boolean>;
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const update: Partial<UserRow> = { updatedAt: new Date() };
  if (input.name !== undefined) update.name = input.name;
  if (input.phone !== undefined) update.phone = input.phone;
  if (input.timezone !== undefined) update.timezone = input.timezone;
  if (input.notificationPrefs !== undefined) {
    update.notificationPrefs = normalizePrefs(input.notificationPrefs);
  }
  const [row] = await db.update(user).set(update).where(eq(user.id, userId)).returning();
  return row ? mapProfile(row) : null;
}
