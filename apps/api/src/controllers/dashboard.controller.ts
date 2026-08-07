import { DEFAULT_ROLE_PERMISSIONS, normaliseRole } from "@recruit/types";
import {
  dashboardActivity,
  dashboardActivityFeed,
  dashboardAiFindings,
  dashboardAlert,
  dashboardAssignedJobs,
  dashboardClientHealth,
  dashboardKpis,
  dashboardMyPipeline,
  dashboardNextInterview,
  dashboardOpenRoles,
  dashboardPipeline,
  dashboardPriorities,
  dashboardQueue,
  dashboardRecentCandidates,
  dashboardRejectionReasons,
  dashboardRevenueByQuarter,
  dashboardSecurityEvents,
  dashboardSla,
  dashboardStatus,
  dashboardSummary,
  dashboardSystemStatus,
  dashboardTeamHealth,
  dashboardTeamPerformance,
  dashboardTodayWork,
  dashboardTopClients,
  dashboardUpcomingInterviews,
  dashboardWeekGoals,
} from "../services/dashboard.service";

type Auth = { id?: string | null; agencyId?: string | null; role?: string | null };

/** The caller's permissions. Read from the seed map for now — once
 * `role_permission` is read here, an agency's own edits will drive it. */
function permissionsFor(user: Auth): Record<string, string[]> {
  return (DEFAULT_ROLE_PERMISSIONS[normaliseRole(user.role)] ?? {}) as Record<string, string[]>;
}

export async function getDashboardAlert(ctx: { user: Auth }) {
  return {
    data: await dashboardAlert(ctx.user.agencyId ?? "", permissionsFor(ctx.user)),
  };
}

export async function getDashboardKpis(ctx: { user: Auth }) {
  return {
    data: await dashboardKpis(ctx.user.agencyId ?? "", permissionsFor(ctx.user)),
  };
}

export async function getDashboardStatus(ctx: { user: Auth }) {
  return { data: await dashboardStatus(ctx.user.agencyId ?? "", permissionsFor(ctx.user)) };
}

export async function getDashboardTodayWork(ctx: { user: Auth }) {
  return { data: await dashboardTodayWork(ctx.user.agencyId ?? "", permissionsFor(ctx.user)) };
}

export async function getDashboardTopClients(ctx: { user: Auth }) {
  return { data: await dashboardTopClients(ctx.user.agencyId ?? "") };
}

export async function getDashboardAiFindings(ctx: { user: Auth }) {
  return { data: await dashboardAiFindings(ctx.user.agencyId ?? "", permissionsFor(ctx.user)) };
}

export async function getDashboardRevenueByQuarter(ctx: { user: Auth }) {
  return {
    data: await dashboardRevenueByQuarter(ctx.user.agencyId ?? "", permissionsFor(ctx.user)),
  };
}

export async function getDashboardTeamPerformance(ctx: { user: Auth }) {
  return {
    data: await dashboardTeamPerformance(ctx.user.agencyId ?? "", permissionsFor(ctx.user)),
  };
}

export async function getDashboardClientHealth(ctx: { user: Auth }) {
  return { data: await dashboardClientHealth(ctx.user.agencyId ?? "", permissionsFor(ctx.user)) };
}

export async function getDashboardSecurityEvents(ctx: { user: Auth }) {
  return {
    data: await dashboardSecurityEvents(ctx.user.agencyId ?? "", permissionsFor(ctx.user)),
  };
}

export async function getDashboardAssignedJobs(ctx: { user: Auth }) {
  return {
    data: await dashboardAssignedJobs(ctx.user.agencyId ?? "", ctx.user.id ?? ""),
  };
}

export async function getDashboardRejectionReasons(ctx: { user: Auth }) {
  return {
    data: await dashboardRejectionReasons(ctx.user.agencyId ?? "", permissionsFor(ctx.user)),
  };
}

export async function getDashboardOpenRoles(ctx: { user: Auth }) {
  return { data: await dashboardOpenRoles(ctx.user.agencyId ?? "") };
}

export async function getDashboardSystemStatus(ctx: { user: Auth }) {
  return {
    data: await dashboardSystemStatus(ctx.user.agencyId ?? "", permissionsFor(ctx.user)),
  };
}

export async function getDashboardTeamHealth(ctx: { user: Auth }) {
  return { data: await dashboardTeamHealth(ctx.user.agencyId ?? "", permissionsFor(ctx.user)) };
}

export async function getDashboardMyPipeline(ctx: { user: Auth }) {
  return { data: await dashboardMyPipeline(ctx.user.agencyId ?? "", ctx.user.id ?? "") };
}

export async function getDashboardWeekGoals(ctx: { user: Auth }) {
  return { data: await dashboardWeekGoals(ctx.user.agencyId ?? "", ctx.user.id ?? "") };
}

export async function getDashboardQueue(ctx: { user: Auth }) {
  return {
    data: await dashboardQueue(ctx.user.agencyId ?? "", permissionsFor(ctx.user)),
  };
}

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
