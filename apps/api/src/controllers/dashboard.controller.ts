import type { AuthClaims } from "../plugins/auth-guard";
import {
  getHiring as getHiringService,
  getHomeDashboard as getHomeDashboardService,
  getInterviews as getInterviewsService,
  getRecentCandidates as getRecentCandidatesService,
  getScreening as getScreeningService,
  getStats as getStatsService,
} from "../services/dashboard.service";

export async function getHomeDashboard(ctx: { auth: AuthClaims }) {
  return getHomeDashboardService(ctx.auth.role, ctx.auth.sub);
}

export async function getStats(ctx: { auth: AuthClaims }) {
  return getStatsService(ctx.auth.agencyId);
}

export async function getHiring(ctx: { auth: AuthClaims }) {
  return getHiringService(ctx.auth.agencyId);
}

export async function getRecentCandidates(ctx: { auth: AuthClaims }) {
  return getRecentCandidatesService(ctx.auth.agencyId);
}

export async function getInterviews(ctx: { auth: AuthClaims }) {
  return getInterviewsService(ctx.auth.agencyId);
}

export async function getScreening(ctx: { auth: AuthClaims }) {
  return getScreeningService(ctx.auth.agencyId);
}
