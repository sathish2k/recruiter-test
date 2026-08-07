import type { QueueCardRendererConfig } from "@recruit/shared";

export const OwnerQueueConfiguration: QueueCardRendererConfig = {
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
    id: "Recruit.Owner.DashboardQueue.Component",
    linkType: "route",
    routeId: "Recruit.Jobs.Route",
    viewAllLabel: "queue.viewAll",
    underline: "none",
  },
  action: {
    id: "Recruit.Owner.DashboardQueue.Component",
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
