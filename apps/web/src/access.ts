import { ROLE_PERMISSIONS } from "@recruit/configurations";
import type { AccessContext } from "@recruit/sdk";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

interface BetterAuthSession {
  user?: { id?: string; role?: string; agencyId?: string };
}

// Reads the Better Auth session server-side by forwarding the request cookies
// to the API's session endpoint. Returns null when unauthenticated.
export async function getServerSession(): Promise<BetterAuthSession | null> {
  const cookie = (await headers()).get("cookie");
  if (!cookie) return null;
  try {
    const res = await fetch(`${API_URL}/api/auth/get-session`, {
      headers: { cookie },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const session = (await res.json()) as BetterAuthSession | null;
    return session?.user ? session : null;
  } catch {
    return null;
  }
}

export async function accessResolver(): Promise<AccessContext | null> {
  const session = await getServerSession();
  const user = session?.user;
  if (!user) return null;
  const role = user.role ?? "employee";
  return {
    attributes: { role, agencyId: user.agencyId, userId: user.id },
    permissions: ROLE_PERMISSIONS[role] ?? {},
  };
}

export function onAccessDenied(): void {
  redirect("/permission-denied");
}
