import { status } from "elysia";
import {
  onboardingChecklist,
  type SetupPatch,
  saveSetup,
  setupState,
} from "../services/onboarding.service";

type Auth = { id: string; name?: string | null; agencyId?: string | null };

function org(ctx: { user: Auth }) {
  return ctx.user.agencyId ?? "";
}

/** The Get Started checklist — five steps, each derived from real records. */
export async function getChecklist(ctx: { user: Auth }) {
  if (!org(ctx)) return status(404, "No workspace");
  const result = await onboardingChecklist(org(ctx));
  // The greeting is first-name only; the session already has the full name, so
  // the screen never needs a second call to find out who it is talking to.
  return {
    data: { ...result.data, firstName: (ctx.user.name ?? "").trim().split(/\s+/)[0] ?? "" },
  };
}

/** Everything the setup wizard renders, including where to resume. */
export async function getSetup(ctx: { user: Auth }) {
  if (!org(ctx)) return status(404, "No workspace");
  return setupState(org(ctx));
}

export async function putSetup(ctx: { user: Auth; body?: SetupPatch | null }) {
  if (!org(ctx)) return status(404, "No workspace");
  try {
    return await saveSetup(org(ctx), ctx.user.id, ctx.body ?? {});
  } catch (error) {
    return status(400, (error as Error).message);
  }
}
