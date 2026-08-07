import type { QueueCardRendererConfig } from "@recruit/shared";

export const HiringManagerQueueConfiguration: QueueCardRendererConfig = {
  title: "queue.title",
  subtitle: "queue.subtitle",
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
    id: "Recruit.HiringManager.DashboardQueue.Component",
    linkType: "route",
    routeId: "Recruit.Jobs.Route",
    viewAllLabel: "queue.viewAll",
    underline: "none",
  },
  action: {
    id: "Recruit.HiringManager.DashboardQueue.Component",
    linkType: "route",
    routeId: "Recruit.Candidates.Route",
    labelPath: "cta",
    underline: "none",
  },
  empty: {
    icon: "check-circle",
    title: "queue.empty.title",
    description: "queue.empty.description",
  },
};
