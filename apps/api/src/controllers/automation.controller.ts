import { status } from "elysia";
import type { AuthClaims } from "../plugins/auth-guard";
import {
  listAutomations,
  toggleAutomation,
} from "../services/automation.service";

export async function getAutomations(ctx: { auth: AuthClaims }) {
  const data = await listAutomations(ctx.auth.agencyId);
  return { data };
}

export async function patchAutomation(ctx: {
  auth: AuthClaims;
  params: { id: string };
  body: { enabled: boolean };
}) {
  const result = await toggleAutomation(
    ctx.auth.agencyId,
    ctx.params.id,
    ctx.body.enabled,
  );
  if ("error" in result) return status(404, "Automation not found");
  return { data: result.data };
}
