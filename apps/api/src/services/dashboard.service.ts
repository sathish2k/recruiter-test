import type { UserRole } from "@recruit/types";

export interface HomeDashboard {
  role: UserRole;
  greeting: string;
  stats: { openRoles: number; activeCandidates: number };
}

export async function getHomeDashboard(
  role: UserRole,
  userId: string,
): Promise<HomeDashboard> {
  return {
    role,
    greeting: `Welcome back (${userId})`,
    stats: { openRoles: 0, activeCandidates: 0 },
  };
}
