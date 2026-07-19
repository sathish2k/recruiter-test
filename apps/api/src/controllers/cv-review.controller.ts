import { status } from "elysia";
import type { AuthClaims } from "../plugins/auth-guard";
import { decideReview, getReviewQueue } from "../services/cv-review.service";

export async function getQueue(ctx: { auth: AuthClaims }) {
  const data = await getReviewQueue(ctx.auth.agencyId);
  return { data, meta: { totalCount: data.length } };
}

export async function patchReview(ctx: {
  auth: AuthClaims;
  params: { id: string };
  body: { decision: "submitted" | "returned"; note?: string };
}) {
  const result = await decideReview(
    ctx.params.id,
    ctx.auth.agencyId,
    ctx.body.decision,
  );
  if (!result) return status(404, "Candidate not found");
  return { data: result };
}
