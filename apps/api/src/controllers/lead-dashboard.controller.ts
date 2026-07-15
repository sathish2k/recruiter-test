import type { AuthClaims } from "../plugins/auth-guard";
import {
  getClientDecisions as getClientDecisionsService,
  getCvQueue as getCvQueueService,
  getFunnel as getFunnelService,
  getGreeting as getGreetingService,
  getInterviewsToday as getInterviewsTodayService,
  getKpis as getKpisService,
  getSourcers as getSourcersService,
} from "../services/lead-dashboard.service";

export async function getGreeting(ctx: { auth: AuthClaims }) {
  return getGreetingService(ctx.auth.agencyId, ctx.auth.sub);
}

export async function getKpis(ctx: { auth: AuthClaims }) {
  return getKpisService(ctx.auth.agencyId);
}

export async function getCvQueue(ctx: { auth: AuthClaims }) {
  return getCvQueueService(ctx.auth.agencyId);
}

export async function getClientDecisions(ctx: { auth: AuthClaims }) {
  return getClientDecisionsService(ctx.auth.agencyId);
}

export async function getInterviewsToday(ctx: { auth: AuthClaims }) {
  return getInterviewsTodayService(ctx.auth.agencyId);
}

export async function getFunnel(ctx: { auth: AuthClaims }) {
  return getFunnelService(ctx.auth.agencyId);
}

export async function getSourcers(ctx: { auth: AuthClaims }) {
  return getSourcersService(ctx.auth.agencyId);
}
