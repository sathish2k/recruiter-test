import { status } from "elysia";
import { getOrganization, updateOrganization } from "../services/organization.service";

type Auth = { agencyId?: string | null };

export async function getMyOrganization(ctx: { user: Auth }) {
  const org = await getOrganization(ctx.user.agencyId ?? "");
  if (!org) return status(404, "Organization not found");
  return org;
}

export async function putMyOrganization(ctx: { user: Auth; body?: { name?: string } | null }) {
  const updated = await updateOrganization(ctx.user.agencyId ?? "", ctx.body ?? {});
  if (!updated) return status(404, "Organization not found");
  return updated;
}
