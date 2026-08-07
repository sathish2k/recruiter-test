import type { QueueCardRendererConfig } from "@recruit/shared";

/**
 * The decision queue. Every field is a data path, so the same card renders the
 * owner's commercial risks, a lead's approval queue and a recruiter's next
 * actions — `/dashboard/queue` returns whichever set belongs to the caller.
 */
export const DashboardQueueConfiguration: QueueCardRendererConfig = {
  title: "title",
  subtitle: "subtitle",
  badgeShape: "pill",
  limit: 5,
  paths: {
    badge: "badge",
    title: "title",
    subtitle: "subtitle",
    tag: "tag",
    tone: "tone",
    meta: "meta",
  },
  viewAll: {
    id: "Recruit.DashboardQueue.Component",
    linkType: "route",
    routeId: "Recruit.Jobs.Route",
    viewAllLabel: "viewAll",
    underline: "none",
  },
  action: {
    id: "Recruit.DashboardQueue.Component",
    linkType: "route",
    routeId: "Recruit.Candidates.Route",
    labelPath: "cta",
    underline: "none",
  },
  empty: {
    icon: "check-circle",
    title: "empty.title",
    description: "empty.description",
  },
};
