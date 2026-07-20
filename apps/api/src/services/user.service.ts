import { randomUUID } from "node:crypto";
import { and, asc, eq, ne } from "drizzle-orm";
import { db } from "../db";
import { user } from "../models/auth.model";

const ROLES = ["admin", "lead", "employee", "client"];

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

// ponytail: last-active derives from updatedAt (no activity tracking yet).
function lastActiveLabel(date?: Date | null): string {
  if (!date) return "—";
  const minutes = Math.floor((Date.now() - date.getTime()) / 60_000);
  if (minutes < 5) return "Now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

type UserRow = typeof user.$inferSelect;

function mapUser(u: UserRow, index: number) {
  const palette = AVATAR_PALETTE[index % AVATAR_PALETTE.length] ?? AVATAR_PALETTE[0];
  return {
    id: u.id,
    name: u.name,
    displayName: u.name,
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
  const rows = await db
    .select()
    .from(user)
    .where(and(eq(user.agencyId, agencyId), ne(user.status, "inactive")))
    .orderBy(asc(user.createdAt));
  const data = rows.map(mapUser);
  return { data, totalCount: data.length };
}

export async function updateUserRole(id: string, role: string) {
  if (!ROLES.includes(role)) return null;
  const [updated] = await db
    .update(user)
    .set({ role, updatedAt: new Date() })
    .where(eq(user.id, id))
    .returning();
  return updated ? { id: updated.id, role: updated.role } : null;
}

export async function deactivateUser(id: string) {
  const [updated] = await db
    .update(user)
    .set({ status: "inactive", updatedAt: new Date() })
    .where(eq(user.id, id))
    .returning();
  return updated ? { id: updated.id, status: updated.status } : null;
}

// ponytail: invited users get a user row but no credential account until they
// set a password via the reset-password flow.
export async function inviteUser(agencyId: string, email: string, role: string) {
  if (!ROLES.includes(role)) return null;
  const [created] = await db
    .insert(user)
    .values({
      id: randomUUID(),
      agencyId,
      email,
      name: email.split("@")[0] ?? email,
      role,
      status: "invited",
    })
    .returning();
  return created
    ? {
        id: created.id,
        name: created.name,
        email: created.email,
        role: created.role,
        status: created.status,
      }
    : null;
}
