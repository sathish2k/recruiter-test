import { type UserDoc, UserModel } from "../models/user.model";

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

type PrefSource = Record<string, boolean> | Map<string, boolean> | undefined;

function normalizePrefs(source: PrefSource): Record<string, boolean> {
  const raw =
    source instanceof Map ? Object.fromEntries(source) : (source ?? {});
  const prefs: Record<string, boolean> = {};
  for (const key of NOTIFICATION_KEYS) prefs[key] = raw[key] ?? false;
  return prefs;
}

type UserRecord = UserDoc & { _id: unknown };

function mapProfile(u: UserRecord) {
  const palette = paletteFor(u.name);
  return {
    id: String(u._id),
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
  const user = await UserModel.findById(userId).lean<UserRecord>();
  return user ? mapProfile(user) : null;
}

export interface UpdateProfileInput {
  name?: string;
  phone?: string;
  timezone?: string;
  notificationPrefs?: Record<string, boolean>;
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const update: Record<string, unknown> = {};
  if (input.name !== undefined) update.name = input.name;
  if (input.phone !== undefined) update.phone = input.phone;
  if (input.timezone !== undefined) update.timezone = input.timezone;
  if (input.notificationPrefs !== undefined) {
    update.notificationPrefs = normalizePrefs(input.notificationPrefs);
  }
  const user = await UserModel.findByIdAndUpdate(userId, update, {
    new: true,
  }).lean<UserRecord>();
  return user ? mapProfile(user) : null;
}

export type ChangePasswordResult = "ok" | "wrong-current" | "not-found";

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<ChangePasswordResult> {
  const user = await UserModel.findById(userId);
  if (!user) return "not-found";
  const ok = await Bun.password.verify(currentPassword, user.passwordHash);
  if (!ok) return "wrong-current";
  user.passwordHash = await Bun.password.hash(newPassword);
  await user.save();
  return "ok";
}
