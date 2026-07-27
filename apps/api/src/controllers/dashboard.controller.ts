import {
  dashboardActivity,
  dashboardActivityFeed,
  dashboardNextInterview,
  dashboardPipeline,
  dashboardPriorities,
  dashboardRecentCandidates,
  dashboardSla,
  dashboardSummary,
  dashboardUpcomingInterviews,
} from "../services/dashboard.service";

type Auth = { agencyId?: string | null };

export async function getDashboardSummary(ctx: { user: Auth }) {
  return { data: await dashboardSummary(ctx.user.agencyId ?? "") };
}

export async function getDashboardPipeline(ctx: { user: Auth }) {
  // The bottleneck rides along as `meta` so the funnel card renders its board
  // and its "work is piling up" note from one fetch.
  const { stages, ...meta } = await dashboardPipeline(ctx.user.agencyId ?? "");
  return { data: stages, meta };
}

export async function getDashboardNextInterview(ctx: { user: Auth }) {
  return { data: await dashboardNextInterview(ctx.user.agencyId ?? "") };
}

export async function getDashboardActivity(ctx: {
  user: Auth;
  query: Record<string, string | undefined>;
}) {
  const days = ctx.query.days ? Number(ctx.query.days) : undefined;
  return { data: await dashboardActivity(ctx.user.agencyId ?? "", days) };
}

export async function getDashboardSla(ctx: { user: Auth }) {
  return { data: await dashboardSla(ctx.user.agencyId ?? "") };
}

export async function getDashboardPriorities(ctx: { user: Auth }) {
  return { data: await dashboardPriorities(ctx.user.agencyId ?? "") };
}

export async function getDashboardUpcomingInterviews(ctx: {
  user: Auth;
  query: Record<string, string | undefined>;
}) {
  return { data: await dashboardUpcomingInterviews(ctx.user.agencyId ?? "", 3, ctx.query.range) };
}

export async function getDashboardActivityFeed(ctx: { user: Auth }) {
  return { data: await dashboardActivityFeed(ctx.user.agencyId ?? "") };
}

export async function getDashboardRecentCandidates(ctx: { user: Auth }) {
  const { rows, meta } = await dashboardRecentCandidates(ctx.user.agencyId ?? "");
  return { data: rows, meta };
}
