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

export async function getStats() {
  return getStatsService();
}

export async function getHiring() {
  return getHiringService();
}

export async function getRecentCandidates() {
  return getRecentCandidatesService();
}

export async function getInterviews() {
  return getInterviewsService();
}

export async function getScreening() {
  return getScreeningService();
}
