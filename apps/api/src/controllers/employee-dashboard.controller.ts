import type { AuthClaims } from "../plugins/auth-guard";
import {
  getAiActivity as getAiActivityService,
  getFollowups as getFollowupsService,
  getFunnel as getFunnelService,
  getGreeting as getGreetingService,
  getInvitesWeek as getInvitesWeekService,
  getKpis as getKpisService,
  getRoles as getRolesService,
} from "../services/employee-dashboard.service";

export async function getGreeting(ctx: { auth: AuthClaims }) {
  return getGreetingService(ctx.auth.agencyId, ctx.auth.sub);
}

export async function getKpis(ctx: { auth: AuthClaims }) {
  return getKpisService(ctx.auth.agencyId);
}

export async function getRoles(ctx: { auth: AuthClaims }) {
  return getRolesService(ctx.auth.agencyId);
}

export async function getFollowups(ctx: { auth: AuthClaims }) {
  return getFollowupsService(ctx.auth.agencyId);
}

export async function getAiActivity(ctx: { auth: AuthClaims }) {
  return getAiActivityService(ctx.auth.agencyId);
}

export async function getFunnel(ctx: { auth: AuthClaims }) {
  return getFunnelService(ctx.auth.agencyId);
}

export async function getInvitesWeek(ctx: { auth: AuthClaims }) {
  return getInvitesWeekService(ctx.auth.agencyId);
}
