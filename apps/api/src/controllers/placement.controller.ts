import type { AuthClaims } from "../plugins/auth-guard";
import {
  createPlacement,
  type InvoiceStatus,
  listPlacements,
  type PlacementStatus,
  updateInvoiceStatus,
  updateStatus,
} from "../services/placement.service";

export async function getPlacements(ctx: { auth: AuthClaims }) {
  return listPlacements(ctx.auth.agencyId);
}

export async function postPlacement(ctx: {
  auth: AuthClaims;
  body: { candidateName: string; ctc: number; role?: string; client?: string };
}) {
  return { data: await createPlacement(ctx.auth.agencyId, ctx.body) };
}

export async function patchInvoice(ctx: {
  auth: AuthClaims;
  params: { id: string };
  body: { invoiceStatus: InvoiceStatus };
}) {
  return {
    data: await updateInvoiceStatus(
      ctx.auth.agencyId,
      ctx.params.id,
      ctx.body.invoiceStatus,
    ),
  };
}

export async function patchStatus(ctx: {
  auth: AuthClaims;
  params: { id: string };
  body: { status: PlacementStatus };
}) {
  return {
    data: await updateStatus(ctx.auth.agencyId, ctx.params.id, ctx.body.status),
  };
}
