import type { UserRole } from "@recruit/types";
import { type UserDoc, UserModel } from "../models/user.model";

const ROLES: UserRole[] = ["admin", "lead", "employee", "client"];

const AVATAR_PALETTE = [
  { bg: "#5B4A3A", fg: "#FFD9BC" },
  { bg: "#3A4A5B", fg: "#CFE3F5" },
  { bg: "#3A5B4A", fg: "#CFF5E0" },
  { bg: "#4A3A5B", fg: "#E3CFF5" },
] as const;

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

// ponytail: last-active derives from updatedAt (no activity tracking yet) and
// is server-rendered English — move to client-side i18n when it matters.
function lastActiveLabel(date?: Date): string {
  if (!date) return "—";
  const minutes = Math.floor((Date.now() - date.getTime()) / 60_000);
  if (minutes < 5) return "Now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

type UserRecord = UserDoc & { _id: unknown; updatedAt?: Date };

function mapUser(u: UserRecord, index: number) {
  const palette =
    AVATAR_PALETTE[index % AVATAR_PALETTE.length] ?? AVATAR_PALETTE[0];
  return {
    id: String(u._id),
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status ?? "active",
    initials: initials(u.name),
    avatarBg: palette.bg,
    avatarFg: palette.fg,
    lastActive: lastActiveLabel(u.updatedAt),
  };
}

export async function listUsers(agencyId: string) {
  const docs = await UserModel.find({ agencyId, status: { $ne: "inactive" } })
    .sort({ createdAt: 1 })
    .lean<UserRecord[]>();
  const data = docs.map((u, i) => mapUser(u, i));
  return { data, totalCount: data.length };
}

export async function updateUserRole(id: string, role: string) {
  if (!ROLES.includes(role as UserRole)) return null;
  const user = await UserModel.findByIdAndUpdate(
    id,
    { role },
    { new: true },
  ).lean<UserRecord>();
  return user ? { id: String(user._id), role: user.role } : null;
}

export async function inviteUser(
  agencyId: string,
  email: string,
  role: string,
) {
  if (!ROLES.includes(role as UserRole)) return null;
  // ponytail: invited users get an unguessable password until a real
  // invite-acceptance flow (email + set-password) exists.
  const passwordHash = await Bun.password.hash(crypto.randomUUID());
  const user = await UserModel.create({
    agencyId,
    email,
    name: email.split("@")[0],
    role: role as UserRole,
    status: "invited",
    passwordHash,
  });
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
  };
}

// ponytail: soft-delete via status (excluded from listUsers) so records and
// their history survive; no hard delete.
export async function deactivateUser(id: string) {
  const user = await UserModel.findByIdAndUpdate(
    id,
    { status: "inactive" },
    { new: true },
  ).lean<UserRecord>();
  return user ? { id: String(user._id), status: user.status } : null;
}
