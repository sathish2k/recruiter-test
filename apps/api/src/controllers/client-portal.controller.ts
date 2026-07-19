import { status } from "elysia";
import {
  decidePortalSubmission,
  getPortal,
  issueMagicLink,
} from "../services/client-portal.service";

export async function postMagicLink(ctx: { body: { email: string } }) {
  const result = await issueMagicLink(ctx.body.email);
  return { data: result };
}

export async function getClientPortal(ctx: { params: { token: string } }) {
  const portal = await getPortal(ctx.params.token);
  if (!portal) return status(404, "Portal link is invalid or expired");
  return { data: portal };
}

export async function postPortalDecision(ctx: {
  params: { token: string };
  body: {
    submissionId: string;
    decision: "approved" | "declined";
    reason?: string;
  };
}) {
  const portal = await decidePortalSubmission(
    ctx.params.token,
    ctx.body.submissionId,
    ctx.body.decision,
    ctx.body.reason ?? "",
  );
  if (!portal) return status(404, "Portal link is invalid or expired");
  return { data: portal };
}
