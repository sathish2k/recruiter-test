import { ROLE_PERMISSIONS } from "@recruit/configurations";
import type { AccessContext } from "@recruit/sdk";
import { dashboardVariantFor, normaliseRole } from "@recruit/types";
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
  // A live session may still carry a role string this build renamed, so the
  // stored value is normalised before it is used to look up permissions —
  // otherwise those users resolve to an empty map and every gated element
  // silently disappears.
  const role = normaliseRole(user.role);
  return {
    attributes: {
      role,
      // Which dashboard to render. Presentation only — see dashboardVariantFor.
      dashboardVariant: dashboardVariantFor(user.role),
      agencyId: user.agencyId,
      userId: user.id,
    },
    permissions: ROLE_PERMISSIONS[role] ?? {},
  };
}

export function onAccessDenied(): void {
  redirect("/permission-denied");
}
