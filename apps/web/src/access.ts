import { ROLE_PERMISSIONS } from "@recruit/configurations";
import type { AccessContext } from "@recruit/sdk";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./app/api/auth/[...nextauth]/route";

const API_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3001";

async function fetchPermissions(
  token: string,
  role: string,
): Promise<AccessContext["permissions"]> {
  try {
    const res = await fetch(`${API_URL}/permissions/mine`, {
      headers: { authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`permissions ${res.status}`);
    const body = (await res.json()) as {
      data?: { permissions?: AccessContext["permissions"] };
    };
    return body.data?.permissions ?? ROLE_PERMISSIONS[role] ?? {};
  } catch {
    return ROLE_PERMISSIONS[role] ?? {};
  }
}

export async function accessResolver(): Promise<AccessContext | null> {
  const session = await getServerSession(authOptions);
  const user = session?.user as
    | { role?: string; agencyId?: string; id?: string }
    | undefined;
  if (!user) return null;
  const role = user.role ?? "employee";
  const token = (session as { accessToken?: string } | null)?.accessToken;
  const permissions = token
    ? await fetchPermissions(token, role)
    : (ROLE_PERMISSIONS[role] ?? {});
  return {
    attributes: { role, agencyId: user.agencyId, userId: user.id },
    permissions,
  };
}

export function onAccessDenied(): void {
  redirect("/permission-denied");
}
