import { status } from "elysia";
import * as audit from "../services/audit-log.service";
import * as billing from "../services/billing.service";

type Auth = { id: string; name?: string | null; agencyId?: string | null };
type Ctx<Extra = unknown> = { user: Auth } & Extra;

export async function getBilling(ctx: Ctx) {
  const data = await billing.getBillingOverview(ctx.user.agencyId ?? "");
  if (!data) return status(404, "No subscription for this organization");
  return { data };
}

export async function postSeats(ctx: Ctx<{ body: { delta: number } }>) {
  const result = await billing.changeSeats(ctx.user.agencyId ?? "", ctx.body.delta);
  if (!result) return status(422, "Could not change seats");
  if (result.blocked) return status(409, "All seats are in use");
  await audit.record({
    organizationId: ctx.user.agencyId ?? "",
    userId: ctx.user.id,
    actorName: ctx.user.name ?? "Unknown",
    event: ctx.body.delta > 0 ? "Added a seat" : "Removed a seat",
    category: "billing",
    details: { "New seat count": String(result.seatTotal) },
  });
  return { data: result };
}

export async function putPlan(ctx: Ctx<{ body: { plan: string } }>) {
  const changed = await billing.changePlan(ctx.user.agencyId ?? "", ctx.body.plan);
  if (!changed) return status(422, "Unknown plan");
  await audit.record({
    organizationId: ctx.user.agencyId ?? "",
    userId: ctx.user.id,
    actorName: ctx.user.name ?? "Unknown",
    event: `Changed the plan to ${changed.name}`,
    category: "billing",
  });
  return { data: changed };
}

export async function putPayment(ctx: Ctx<{ body: billing.PaymentInput }>) {
  const updated = await billing.updatePayment(ctx.user.agencyId ?? "", ctx.body);
  if (!updated) return status(422, "Could not update payment details");
  await audit.record({
    organizationId: ctx.user.agencyId ?? "",
    userId: ctx.user.id,
    actorName: ctx.user.name ?? "Unknown",
    event: "Updated billing details",
    category: "billing",
  });
  return { data: { updated: true } };
}

export async function getInvoices(ctx: Ctx) {
  const { data, totalCount } = await billing.listInvoices(ctx.user.agencyId ?? "");
  return { data, meta: { totalCount } };
}
