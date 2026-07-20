import { status } from "elysia";
import * as audit from "../services/audit-log.service";
import * as integrations from "../services/integration.service";

type Auth = { id: string; name?: string | null; agencyId?: string | null };
type Ctx<Extra = unknown> = { user: Auth } & Extra;

export async function getIntegrations(ctx: Ctx) {
  const { data, totalCount } = await integrations.listIntegrations(ctx.user.agencyId ?? "");
  return { data, meta: { totalCount } };
}

export async function postConnect(ctx: Ctx<{ body: integrations.ConnectInput }>) {
  const connected = await integrations.connectIntegration(
    ctx.user.agencyId ?? "",
    ctx.user.id,
    ctx.user.name ?? "Unknown",
    ctx.body,
  );
  if (!connected) return status(422, "Could not connect integration");
  await audit.record({
    organizationId: ctx.user.agencyId ?? "",
    userId: ctx.user.id,
    actorName: ctx.user.name ?? "Unknown",
    event: `Connected ${ctx.body.provider}`,
    category: "integrations",
    objects: { Integration: ctx.body.provider },
  });
  return status(201, { data: connected });
}

export async function postReconnect(ctx: Ctx<{ params: { provider: string } }>) {
  const updated = await integrations.reconnectIntegration(
    ctx.user.agencyId ?? "",
    ctx.params.provider,
  );
  if (!updated) return status(404, "Integration not connected");
  await audit.record({
    organizationId: ctx.user.agencyId ?? "",
    userId: ctx.user.id,
    actorName: ctx.user.name ?? "Unknown",
    event: `Reconnected ${ctx.params.provider}`,
    category: "integrations",
    objects: { Integration: ctx.params.provider },
  });
  return { data: updated };
}

export async function deleteIntegration(ctx: Ctx<{ params: { provider: string } }>) {
  const removed = await integrations.disconnectIntegration(
    ctx.user.agencyId ?? "",
    ctx.params.provider,
  );
  if (!removed) return status(404, "Integration not connected");
  await audit.record({
    organizationId: ctx.user.agencyId ?? "",
    userId: ctx.user.id,
    actorName: ctx.user.name ?? "Unknown",
    event: `Disconnected ${ctx.params.provider}`,
    category: "integrations",
    severity: "warning",
    objects: { Integration: ctx.params.provider },
  });
  return { data: removed };
}
